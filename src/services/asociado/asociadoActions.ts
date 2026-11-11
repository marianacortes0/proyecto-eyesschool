'use server'

import { getServerToken, getServerUser, userToRole } from '@/lib/auth/server'
import { elegirHijoActivo, type Hijo } from '@/lib/utils/hijoActivo'
import { ApiError, toCamel } from '@/services/api/client'
import { serverFetch } from '@/services/api/serverFetch'
import { MSG_HORARIO_ERROR } from '@/services/asociado/mensajes'
import { PERIODOS } from '@/services/notas/notasService'

/**
 * Capa de datos para el "estudiante asociado": lo que un padre (su hijo activo) o
 * un estudiante (él mismo) puede VISUALIZAR en modo solo-lectura. Todo se pide a
 * los endpoints acotados /estudiantes/{id}/notas|novedades, que el backend
 * autoriza por propiedad (un padre solo accede a sus hijos). El directorio global
 * de estudiantes/notas/novedades sigue siendo solo de gestión (docente/admin).
 */

type Raw = Record<string, unknown>

const DIA_ORDER: Record<string, number> = {
  Lunes: 0, Martes: 1, Miercoles: 2, 'Miércoles': 2, Jueves: 3,
  Viernes: 4, 'Sábado': 5, Sabado: 5, Domingo: 6,
}

async function apiFetch<T>(path: string): Promise<T> {
  return serverFetch<T>(path, { token: await getServerToken() })
}

export type AsociadoInfo = {
  idEstudiante: number
  nombre: string
  codigo: string
}

// GET /padres/me/hijos (BE-07, `HijoOut`) envía `nombre_estudiante` y
// `documento_estudiante`, igual que /padres/me. Se aceptan también `nombre` y
// `documento` sin sufijo (DEF-WEB-03).
function aHijo(r: Raw): Hijo {
  const c = toCamel(r) as Raw
  return {
    idEstudiante: c.idEstudiante as number,
    nombre: ((c.nombreEstudiante ?? c.nombre) as string | undefined) || `Estudiante #${c.idEstudiante}`,
    documento: ((c.documentoEstudiante ?? c.documento) as string | undefined) ?? '',
    parentesco: (c.parentesco as string) ?? '',
    idCursoActual: (c.idCursoActual as number | null) ?? null,
    codigoEstudiante: (c.codigoEstudiante as string | undefined) ?? undefined,
  }
}

/**
 * Respaldo mientras BE-07 no esté desplegado. Quitar cuando /padres/me/hijos exista en producción.
 * Arma una lista de un solo hijo con el vínculo de GET /padres/me.
 */
async function hijoDesdePadresMe(): Promise<Hijo[]> {
  const c = toCamel(await apiFetch<Raw>('/padres/me')) as Raw
  const id = c.idEstudiante as number | undefined
  if (id == null) return []
  // /padres/me no trae el curso: hay que pedir el estudiante. Si esa consulta
  // falla no se puede afirmar que el estudiante no tenga curso, así que se marca
  // para que la pantalla muestre un error con reintento (ver `cursoNoDisponible`).
  const est = await apiFetch<Raw>(`/estudiantes/${id}`).catch(() => null)
  const e = est ? (toCamel(est) as Raw) : {}
  const hijo = aHijo({
    id_estudiante: id,
    nombre: c.nombreEstudiante,
    documento: c.documentoEstudiante,
    parentesco: c.parentesco,
    id_curso_actual: e.idCursoActual ?? null,
    codigo_estudiante: e.codigoEstudiante,
  })
  return [est ? hijo : { ...hijo, cursoNoDisponible: true }]
}

/** Hijos vinculados al padre actual (GET /padres/me/hijos, BE-07). */
export async function getHijosAction(): Promise<Hijo[]> {
  try {
    return (await apiFetch<Raw[]>('/padres/me/hijos')).map(aHijo)
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 405)) return hijoDesdePadresMe()
    throw error
  }
}

type Asociado = {
  info: AsociadoInfo | null
  hijos: Hijo[]
  idCursoActual: number | null
  /** El curso no se pudo leer (la consulta falló); no es que no tenga curso. */
  cursoNoDisponible: boolean
}

/**
 * Resuelve el estudiante asociado al usuario actual:
 *   - padre      → el hijo pedido en `?hijo=` (o el primero) entre los que tiene
 *                  vinculados (GET /padres/me/hijos).
 *   - estudiante → él mismo (vía /estudiantes/me; el nombre sale de la cookie de usuario).
 * Devuelve `info: null` para cualquier otro rol o si no hay vínculo.
 */
async function resolveAsociado(idEstudiante?: number | string | null): Promise<Asociado> {
  const user = await getServerUser()
  if (!user) return { info: null, hijos: [], idCursoActual: null, cursoNoDisponible: false }
  const role = userToRole(user)

  if (role === 'padre') {
    const hijos = await getHijosAction()
    const hijo = elegirHijoActivo(hijos, idEstudiante)
    if (!hijo) return { info: null, hijos, idCursoActual: null, cursoNoDisponible: false }
    return {
      info: { idEstudiante: hijo.idEstudiante, nombre: hijo.nombre, codigo: hijo.codigoEstudiante ?? '' },
      hijos,
      idCursoActual: hijo.idCursoActual,
      cursoNoDisponible: hijo.cursoNoDisponible === true,
    }
  }

  if (role === 'estudiante') {
    const e = toCamel(await apiFetch<Raw>('/estudiantes/me')) as Raw
    const id = e.idEstudiante as number | undefined
    if (id == null) return { info: null, hijos: [], idCursoActual: null, cursoNoDisponible: false }
    const nombre = [user.primerNombre, user.primerApellido].filter(Boolean).join(' ') || `Estudiante #${id}`
    return {
      info: { idEstudiante: id, nombre, codigo: (e.codigoEstudiante as string) ?? '' },
      hijos: [],
      idCursoActual: (e.idCursoActual as number | null) ?? null,
      cursoNoDisponible: false,
    }
  }

  return { info: null, hijos: [], idCursoActual: null, cursoNoDisponible: false }
}

/** Estudiante asociado y lista de hijos, para páginas que arman sus propios datos (asistencia). */
export async function getAsociadoAction(idEstudiante?: number | string | null): Promise<{ info: AsociadoInfo | null; hijos: Hijo[] }> {
  const { info, hijos } = await resolveAsociado(idEstudiante)
  return { info, hijos }
}

// ── Notas del estudiante asociado ───────────────────────────────────────────

export type NotaViewer = {
  idNota: number
  nota: number
  observacion: string | null
  fechaRegistro: string
  idMateria: number
  idPeriodo: number
  nombreMateria: string
  periodoLabel: string
}

export type MateriaOpt = { idMateria: number; nombreMateria: string }

export type NotasAsociadoBootstrap = {
  info: AsociadoInfo | null
  hijos: Hijo[]
  notas: NotaViewer[]
  materias: MateriaOpt[]
}

export async function getNotasAsociadoAction(idEstudiante?: number | string | null): Promise<NotasAsociadoBootstrap> {
  const { info, hijos } = await resolveAsociado(idEstudiante)
  if (!info) return { info: null, hijos, notas: [], materias: [] }

  const [notasRaw, materiasRaw] = await Promise.all([
    apiFetch<Raw[]>(`/estudiantes/${info.idEstudiante}/notas`),
    apiFetch<Raw[]>('/materias?activa=true&limit=200'),
  ])

  const materias: MateriaOpt[] = materiasRaw.map(r => {
    const c = toCamel(r) as Raw
    return { idMateria: c.idMateria as number, nombreMateria: c.nombreMateria as string }
  })
  const materiaById = new Map(materias.map(m => [m.idMateria, m.nombreMateria]))

  const notas: NotaViewer[] = notasRaw.map(r => {
    const c = toCamel(r) as Raw
    const idMateria = c.idMateria as number
    const idPeriodo = c.idPeriodo as number
    return {
      idNota: c.idNota as number,
      nota: Number(c.nota),
      observacion: (c.observacion as string | null) ?? null,
      fechaRegistro: c.fechaRegistro as string,
      idMateria,
      idPeriodo,
      nombreMateria: materiaById.get(idMateria) ?? `Materia #${idMateria}`,
      periodoLabel: PERIODOS[idPeriodo] ?? `Periodo ${idPeriodo}`,
    }
  })

  return { info, hijos, notas, materias }
}

// ── Novedades del estudiante asociado ───────────────────────────────────────

export type NovedadViewer = {
  idNovedad: number
  fecha: string
  descripcion: string
  estado: string
  accionTomada: string | null
  fechaResolucion: string | null
  nombreTipo: string
  nivelGravedad: string
}

export type NovedadesAsociadoBootstrap = {
  info: AsociadoInfo | null
  hijos: Hijo[]
  novedades: NovedadViewer[]
}

export async function getNovedadesAsociadoAction(idEstudiante?: number | string | null): Promise<NovedadesAsociadoBootstrap> {
  const { info, hijos } = await resolveAsociado(idEstudiante)
  if (!info) return { info: null, hijos, novedades: [] }

  const [novedadesRaw, tiposRaw] = await Promise.all([
    apiFetch<Raw[]>(`/estudiantes/${info.idEstudiante}/novedades`),
    apiFetch<Raw[]>('/tipos-novedad?limit=200'),
  ])

  const tipoById = new Map<number, { nombre: string; gravedad: string }>()
  for (const r of tiposRaw) {
    const c = toCamel(r) as Raw
    tipoById.set(c.idTipoNovedad as number, {
      nombre: c.nombreTipo as string,
      gravedad: c.nivelGravedad as string,
    })
  }

  const novedades: NovedadViewer[] = novedadesRaw.map(r => {
    const c = toCamel(r) as Raw
    const tipo = tipoById.get(c.idTipoNovedad as number)
    return {
      idNovedad: c.idNovedad as number,
      fecha: c.fecha as string,
      descripcion: c.descripcion as string,
      estado: c.estado as string,
      accionTomada: (c.accionTomada as string | null) ?? null,
      fechaResolucion: (c.fechaResolucion as string | null) ?? null,
      nombreTipo: tipo?.nombre ?? `Tipo #${c.idTipoNovedad}`,
      nivelGravedad: tipo?.gravedad ?? '',
    }
  })

  return { info, hijos, novedades }
}

// ── Horario del estudiante asociado ─────────────────────────────────────────

export type HorarioViewer = {
  idHorario: number
  dia: string
  horaInicio: string
  horaFin: string
  salon: string
  idMateria: number
  nombreMateria: string
}

export type CursoInfo = { idCurso: number; nombreCurso: string; grado: string; jornada: string }

export type HorarioAsociadoBootstrap = {
  info: AsociadoInfo | null
  hijos: Hijo[]
  curso: CursoInfo | null
  horarios: HorarioViewer[]
  /** Mensaje para el usuario cuando el horario no se pudo cargar (con reintento). */
  error?: string
}

export async function getHorarioAsociadoAction(idEstudiante?: number | string | null): Promise<HorarioAsociadoBootstrap> {
  const { info, hijos, idCursoActual, cursoNoDisponible } = await resolveAsociado(idEstudiante)
  if (!info) return { info: null, hijos, curso: null, horarios: [] }
  // Sin curso puede ser «no tiene curso» o «no se pudo consultar»: solo el
  // segundo caso es un error, y se muestra como tal en vez de un horario vacío.
  if (cursoNoDisponible) return { info, hijos, curso: null, horarios: [], error: MSG_HORARIO_ERROR }
  if (idCursoActual == null) return { info, hijos, curso: null, horarios: [] }

  // /horarios?id_curso= ya está protegido para los 4 roles: no expone más que el
  // horario de ESE curso (el del estudiante asociado).
  let horariosRaw: Raw[]
  let materiasRaw: Raw[]
  let cursoRaw: Raw | null
  try {
    ;[horariosRaw, materiasRaw, cursoRaw] = await Promise.all([
      apiFetch<Raw[]>(`/horarios?id_curso=${idCursoActual}&limit=500`),
      apiFetch<Raw[]>('/materias?activa=true&limit=200'),
      apiFetch<Raw>(`/cursos/${idCursoActual}`).catch(() => null),
    ])
  } catch {
    return { info, hijos, curso: null, horarios: [], error: MSG_HORARIO_ERROR }
  }

  const materiaById = new Map<number, string>()
  for (const r of materiasRaw) {
    const c = toCamel(r) as Raw
    materiaById.set(c.idMateria as number, c.nombreMateria as string)
  }

  const horarios: HorarioViewer[] = horariosRaw
    .map(r => {
      const c = toCamel(r) as Raw
      const idMateria = c.idMateria as number
      return {
        idHorario: c.idHorario as number,
        dia: c.dia as string,
        horaInicio: c.horaInicio as string,
        horaFin: c.horaFin as string,
        salon: (c.salon as string) ?? '',
        idMateria,
        nombreMateria: materiaById.get(idMateria) ?? `Materia #${idMateria}`,
      }
    })
    .sort((a, b) => {
      const dA = DIA_ORDER[a.dia] ?? 99
      const dB = DIA_ORDER[b.dia] ?? 99
      if (dA !== dB) return dA - dB
      return a.horaInicio.localeCompare(b.horaInicio)
    })

  let curso: CursoInfo | null = null
  if (cursoRaw) {
    const c = toCamel(cursoRaw) as Raw
    curso = {
      idCurso: c.idCurso as number,
      nombreCurso: c.nombreCurso as string,
      grado: c.grado as string,
      jornada: c.jornada as string,
    }
  }

  return { info, hijos, curso, horarios }
}
