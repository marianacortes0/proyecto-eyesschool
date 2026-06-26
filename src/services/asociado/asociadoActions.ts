'use server'

import { cookies } from 'next/headers'
import { getServerUser, userToRole } from '@/lib/auth/server'
import { PERIODOS } from '@/services/notas/notasService'

/**
 * Capa de datos para el "estudiante asociado": lo que un padre (su hijo) o un
 * estudiante (él mismo) puede VISUALIZAR en modo solo-lectura. Todo se pide a los
 * endpoints acotados /estudiantes/{id}/notas|novedades, que el backend autoriza
 * por propiedad (un padre solo accede a su hijo). El directorio global de
 * estudiantes/notas/novedades sigue siendo solo de gestión (docente/admin).
 */

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

type Raw = Record<string, unknown>

const DIA_ORDER: Record<string, number> = {
  Lunes: 0, Martes: 1, Miercoles: 2, 'Miércoles': 2, Jueves: 3,
  Viernes: 4, 'Sábado': 5, Sabado: 5, Domingo: 6,
}

async function getToken(): Promise<string | null> {
  const store = await cookies()
  return store.get('eys_access')?.value ?? null
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken()
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers as Record<string, string> | undefined),
    },
    cache: 'no-store',
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error((body as Record<string, unknown>).detail as string ?? `HTTP ${res.status}`)
  }
  if (res.status === 204) return null as T
  return res.json() as Promise<T>
}

function toCamelKey(k: string): string {
  return k.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase())
}

function toCamel(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(toCamel)
  if (v !== null && typeof v === 'object') {
    return Object.fromEntries(
      Object.entries(v as Record<string, unknown>).map(([k, val]) => [toCamelKey(k), toCamel(val)])
    )
  }
  return v
}

export type AsociadoInfo = {
  idEstudiante: number
  nombre: string
  codigo: string
}

/**
 * Resuelve el estudiante asociado al usuario actual:
 *   - padre      → el hijo vinculado (vía /dashboard/padre, que devuelve id + nombre).
 *   - estudiante → él mismo (vía /estudiantes/me; el nombre sale de la cookie de usuario).
 * Devuelve null para cualquier otro rol o si no hay vínculo.
 */
async function resolveAsociado(): Promise<AsociadoInfo | null> {
  const user = await getServerUser()
  if (!user) return null
  const role = userToRole(user)

  if (role === 'padre') {
    const d = toCamel(await apiFetch<Raw>('/dashboard/padre')) as Raw
    const id = d.idEstudiante as number | undefined
    if (id == null) return null
    return {
      idEstudiante: id,
      nombre: (d.nombreEstudiante as string) || `Estudiante #${id}`,
      codigo: (d.codigoEstudiante as string) ?? '',
    }
  }

  if (role === 'estudiante') {
    const e = toCamel(await apiFetch<Raw>('/estudiantes/me')) as Raw
    const id = e.idEstudiante as number | undefined
    if (id == null) return null
    const nombre = [user.primerNombre, user.primerApellido].filter(Boolean).join(' ') || `Estudiante #${id}`
    return { idEstudiante: id, nombre, codigo: (e.codigoEstudiante as string) ?? '' }
  }

  return null
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
  notas: NotaViewer[]
  materias: MateriaOpt[]
}

export async function getNotasAsociadoAction(): Promise<NotasAsociadoBootstrap> {
  const info = await resolveAsociado()
  if (!info) return { info: null, notas: [], materias: [] }

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

  return { info, notas, materias }
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
  novedades: NovedadViewer[]
}

export async function getNovedadesAsociadoAction(): Promise<NovedadesAsociadoBootstrap> {
  const info = await resolveAsociado()
  if (!info) return { info: null, novedades: [] }

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

  return { info, novedades }
}

// ── Horario del estudiante asociado ─────────────────────────────────────────

/** Igual que el asociado, pero resolviendo además su curso actual. */
async function resolveAsociadoConCurso(): Promise<(AsociadoInfo & { idCursoActual: number | null }) | null> {
  const user = await getServerUser()
  if (!user) return null
  const role = userToRole(user)

  if (role === 'padre') {
    const d = toCamel(await apiFetch<Raw>('/dashboard/padre')) as Raw
    const id = d.idEstudiante as number | undefined
    if (id == null) return null
    let idCursoActual: number | null = null
    let codigo = (d.codigoEstudiante as string) ?? ''
    // El curso actual no viene en el dashboard: se lee del expediente del hijo
    // (el backend autoriza por propiedad en /estudiantes/{id}).
    try {
      const e = toCamel(await apiFetch<Raw>(`/estudiantes/${id}`)) as Raw
      idCursoActual = (e.idCursoActual as number | null) ?? null
      codigo = (e.codigoEstudiante as string) ?? codigo
    } catch {
      // sin curso → se mostrará el vacío
    }
    return {
      idEstudiante: id,
      nombre: (d.nombreEstudiante as string) || `Estudiante #${id}`,
      codigo,
      idCursoActual,
    }
  }

  if (role === 'estudiante') {
    const e = toCamel(await apiFetch<Raw>('/estudiantes/me')) as Raw
    const id = e.idEstudiante as number | undefined
    if (id == null) return null
    const nombre = [user.primerNombre, user.primerApellido].filter(Boolean).join(' ') || `Estudiante #${id}`
    return {
      idEstudiante: id,
      nombre,
      codigo: (e.codigoEstudiante as string) ?? '',
      idCursoActual: (e.idCursoActual as number | null) ?? null,
    }
  }

  return null
}

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
  curso: CursoInfo | null
  horarios: HorarioViewer[]
}

export async function getHorarioAsociadoAction(): Promise<HorarioAsociadoBootstrap> {
  const resolved = await resolveAsociadoConCurso()
  if (!resolved) return { info: null, curso: null, horarios: [] }

  const info: AsociadoInfo = { idEstudiante: resolved.idEstudiante, nombre: resolved.nombre, codigo: resolved.codigo }
  if (resolved.idCursoActual == null) return { info, curso: null, horarios: [] }

  // /horarios?id_curso= ya está protegido para los 4 roles: no expone más que el
  // horario de ESE curso (el del estudiante asociado).
  const [horariosRaw, materiasRaw, cursoRaw] = await Promise.all([
    apiFetch<Raw[]>(`/horarios?id_curso=${resolved.idCursoActual}&limit=500`),
    apiFetch<Raw[]>('/materias?activa=true&limit=200'),
    apiFetch<Raw>(`/cursos/${resolved.idCursoActual}`).catch(() => null),
  ])

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

  return { info, curso, horarios }
}
