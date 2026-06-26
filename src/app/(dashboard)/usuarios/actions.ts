'use server'

import { cookies } from 'next/headers'
import { ROL_NOMBRES, type UsuarioConRol } from '@/services/usuarios/usuariosService'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

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
    // Surfacing real: el 500 del backend a veces NO viene como JSON (página de
    // error de Azure / traceback), así que leemos texto y extraemos `detail` si
    // lo hay. Incluimos método + path para saber QUÉ llamada falló.
    const raw = await res.text().catch(() => '')
    let detail = raw
    try {
      const parsed = JSON.parse(raw) as Record<string, unknown>
      if (typeof parsed.detail === 'string') detail = parsed.detail
    } catch {
      /* no era JSON: usamos el texto crudo */
    }
    const snippet = detail ? ` — ${detail.slice(0, 300)}` : ''
    throw new Error(`HTTP ${res.status}${snippet} (${options.method ?? 'GET'} ${path})`)
  }
  if (res.status === 204) return null as T
  return res.json() as Promise<T>
}

function rawToUsuarioConRol(u: Record<string, unknown>): UsuarioConRol {
  const idRol = (u.idRol ?? u.id_rol) as number
  return {
    idUsuario:       (u.idUsuario ?? u.id_usuario) as number,
    tipoDocumento:   (u.tipoDocumento ?? u.tipo_documento) as string,
    numeroDocumento: (u.numeroDocumento ?? u.numero_documento) as string,
    primerNombre:    (u.primerNombre ?? u.primer_nombre) as string,
    segundoNombre:   (u.segundoNombre ?? u.segundo_nombre) as string | null,
    primerApellido:  (u.primerApellido ?? u.primer_apellido) as string,
    segundoApellido: (u.segundoApellido ?? u.segundo_apellido) as string | null,
    genero:          u.genero as string | null,
    direccion:       u.direccion as string | null,
    correo:          u.correo as string | null,
    telefono:        u.telefono as string | null,
    estado:          u.estado as boolean,
    fechaRegistro:   (u.fechaRegistro ?? u.fecha_registro) as string,
    ultimoAcceso:    (u.ultimoAcceso ?? u.ultimo_acceso) as string | null,
    idRol,
    rolNombre: ROL_NOMBRES[idRol] ?? 'Desconocido',
  }
}

export type CreateUsuarioConAuthData = {
  primerNombre: string
  segundoNombre?: string
  primerApellido: string
  segundoApellido?: string
  tipoDocumento: 'CC' | 'CE' | 'TI' | 'PAS'
  numeroDocumento: string
  correo: string
  password: string
  telefono?: string
  genero?: 'M' | 'F' | 'O'
  direccion?: string
  idRol: number
  idCursoActual?: number | null
  idEstudianteRelacionado?: number | null
  parentesco?: string | null
  // Nombre de la especialización del profesor (se crea en el catálogo si no existe).
  especializacion?: string | null
  institucion?: string | null
  cargo?: string | null
  nivelAcceso?: string | null
  fechaAsignacion?: string | null
  fechaFin?: string | null
}

const ID_ROL_ESTUDIANTE = 2
const ID_ROL_PROFESOR   = 1
const ID_ROL_PADRE      = 4
const ID_ROL_ADMIN      = 3

export async function createUsuarioConAuth(data: CreateUsuarioConAuthData): Promise<void> {
  const usuario = await apiFetch<Record<string, unknown>>('/usuarios', {
    method: 'POST',
    body: JSON.stringify({
      correo:           data.correo,
      password:         data.password,
      primer_nombre:    data.primerNombre,
      primer_apellido:  data.primerApellido,
      segundo_nombre:   data.segundoNombre   ?? null,
      segundo_apellido: data.segundoApellido ?? null,
      tipo_documento:   data.tipoDocumento,
      numero_documento: data.numeroDocumento,
      telefono:         data.telefono  ?? null,
      genero:           data.genero    ?? null,
      direccion:        data.direccion ?? null,
      id_rol:           data.idRol,
    }),
  })

  const idUsuario = (usuario.id_usuario ?? usuario.idUsuario) as number
  const hoy = new Date().toISOString().slice(0, 10)
  const fechaAsignacion = data.fechaAsignacion || hoy
  const fechaFin = data.fechaFin || hoy

  if (data.idRol === ID_ROL_ESTUDIANTE) {
    const codigo = `EST${String(idUsuario).padStart(3, '0')}`
    await apiFetch('/estudiantes', {
      method: 'POST',
      body: JSON.stringify({
        id_usuario:        idUsuario,
        codigo_estudiante: codigo,
        fecha_ingreso:     fechaAsignacion,
        estado:            'Activo',
        id_curso_actual:   data.idCursoActual ?? null,
      }),
    }).catch(() => null)
  }

  if (data.idRol === ID_ROL_PROFESOR) {
    const codigo = `PROF${String(idUsuario).padStart(3, '0')}`
    const profe = await apiFetch<Record<string, unknown>>('/profesores', {
      method: 'POST',
      body: JSON.stringify({
        id_usuario:        idUsuario,
        codigo_profesor:   codigo,
        titulo:            'Pendiente',
        nivel_estudios:    'Pendiente',
        fecha_vinculacion: fechaAsignacion,
        estado:            'Activo',
      }),
    }).catch(() => null)

    const idProfesor = profe ? (profe.id_profesor ?? profe.idProfesor) as number : null
    if (idProfesor && data.especializacion?.trim()) {
      const idEspecializacion = await resolveEspecializacionId(data.especializacion)
      if (idEspecializacion != null) {
        await apiFetch(`/profesores/${idProfesor}/especializaciones`, {
          method: 'POST',
          body: JSON.stringify({
            id_especializacion: idEspecializacion,
            institucion:        data.institucion ?? '',
          }),
        }).catch(() => null)
      }
    }
  }

  if (
    data.idRol === ID_ROL_PADRE &&
    data.idEstudianteRelacionado != null &&
    data.parentesco
  ) {
    await apiFetch('/padres', {
      method: 'POST',
      body: JSON.stringify({
        id_usuario:    idUsuario,
        id_estudiante: data.idEstudianteRelacionado,
        parentesco:    data.parentesco,
        ocupacion:     null,
      }),
    }).catch(() => null)
  }

  if (data.idRol === ID_ROL_ADMIN) {
    await apiFetch('/administradores', {
      method: 'POST',
      body: JSON.stringify({
        id_usuario:       idUsuario,
        cargo:            data.cargo || 'Administrador',
        nivel_acceso:     data.nivelAcceso || 'Bajo',
        fecha_asignacion: fechaAsignacion,
        fecha_fin:        fechaFin,
      }),
    }).catch(() => null)
  }
}

function cursoLabel(c: Record<string, unknown>): string {
  const nombre = (c.nombreCurso ?? c.nombre_curso) as string
  const grado  = (c.grado as string | null) ?? null
  return grado ? `${nombre} · ${grado}` : nombre
}

function nombreCompleto(u: Record<string, unknown>): string {
  return [
    (u.primerNombre   ?? u.primer_nombre),
    (u.segundoNombre  ?? u.segundo_nombre),
    (u.primerApellido ?? u.primer_apellido),
    (u.segundoApellido ?? u.segundo_apellido),
  ].filter(Boolean).join(' ')
}

type EstudianteRaw = {
  idEstudiante: number
  idUsuario: number
  idCursoActual: number | null
  fechaIngreso: string | null
  fechaEgreso: string | null
}

/** Lista cruda de estudiantes normalizada a camelCase. */
async function fetchEstudiantes(): Promise<EstudianteRaw[]> {
  const data = await apiFetch<Record<string, unknown>[]>('/estudiantes?limit=500').catch(() => [])
  return data.map((e) => ({
    idEstudiante:  (e.idEstudiante ?? e.id_estudiante) as number,
    idUsuario:     (e.idUsuario ?? e.id_usuario) as number,
    idCursoActual: ((e.idCursoActual ?? e.id_curso_actual) as number | null) ?? null,
    fechaIngreso:  (e.fechaIngreso ?? e.fecha_ingreso) as string | null ?? null,
    fechaEgreso:   (e.fechaEgreso ?? e.fecha_egreso) as string | null ?? null,
  }))
}

/** Mapa id_usuario → { idEstudiante, idCursoActual } a partir de /estudiantes. */
async function fetchEstudiantesPorUsuario(): Promise<
  Map<number, { idEstudiante: number; idCursoActual: number | null }>
> {
  const data = await fetchEstudiantes()
  const map = new Map<number, { idEstudiante: number; idCursoActual: number | null }>()
  for (const e of data) {
    map.set(e.idUsuario, { idEstudiante: e.idEstudiante, idCursoActual: e.idCursoActual })
  }
  return map
}

type PadreRaw = { idPadre: number; idUsuario: number; idEstudiante: number; parentesco: string | null; ocupacion: string | null }

/** Mapa id_usuario → vínculo de padre a partir de /padres. */
async function fetchPadresPorUsuario(): Promise<Map<number, PadreRaw>> {
  const data = await apiFetch<Record<string, unknown>[]>('/padres?limit=500').catch(() => [])
  const map = new Map<number, PadreRaw>()
  for (const p of data) {
    const padre: PadreRaw = {
      idPadre:      (p.idPadre ?? p.id_padre) as number,
      idUsuario:    (p.idUsuario ?? p.id_usuario) as number,
      idEstudiante: (p.idEstudiante ?? p.id_estudiante) as number,
      parentesco:   (p.parentesco as string | null) ?? null,
      ocupacion:    (p.ocupacion as string | null) ?? null,
    }
    map.set(padre.idUsuario, padre)
  }
  return map
}

type ProfesorEsp = {
  idProfesor: number
  fechaVinculacion: string | null
  especializaciones: { id: number; nombre: string; institucion: string | null }[]
}

/** Mapa id_usuario → { idProfesor, especializaciones } (relación M:N por sub-recurso). */
async function fetchProfesoresPorUsuario(): Promise<Map<number, ProfesorEsp>> {
  const profesores = await apiFetch<Record<string, unknown>[]>('/profesores?limit=500').catch(() => [])
  const entries = await Promise.all(
    profesores.map(async (p) => {
      const idProfesor = (p.idProfesor ?? p.id_profesor) as number
      const idUsuario  = (p.idUsuario ?? p.id_usuario) as number
      const fechaVinculacion = (p.fechaVinculacion ?? p.fecha_vinculacion) as string | null ?? null
      const esp = await apiFetch<Record<string, unknown>[]>(
        `/profesores/${idProfesor}/especializaciones`,
      ).catch(() => [])
      const especializaciones = esp.map((x) => {
        const e = (x.especializacion ?? null) as Record<string, unknown> | null
        const id = (x.idEspecializacion ?? x.id_especializacion) as number
        const nombre = e
          ? ((e.nombreEspecializacion ?? e.nombre_especializacion) as string)
          : `Especialización #${id}`
        return { id, nombre, institucion: (x.institucion as string | null) ?? null }
      })
      return [idUsuario, { idProfesor, fechaVinculacion, especializaciones }] as const
    }),
  )
  return new Map(entries)
}

type AdminRaw = {
  idAdministrador: number
  cargo: string | null
  nivelAcceso: string | null
  fechaAsignacion: string | null
  fechaFin: string | null
}

/** Mapa id_usuario → datos de administrador a partir de /administradores. */
async function fetchAdministradoresPorUsuario(): Promise<Map<number, AdminRaw>> {
  const data = await apiFetch<Record<string, unknown>[]>('/administradores?limit=500').catch(() => [])
  const map = new Map<number, AdminRaw>()
  for (const a of data) {
    const idUsuario = (a.idUsuario ?? a.id_usuario) as number
    map.set(idUsuario, {
      idAdministrador: (a.idAdministrador ?? a.id_administrador) as number,
      cargo:           (a.cargo as string | null) ?? null,
      nivelAcceso:     (a.nivelAcceso ?? a.nivel_acceso) as string | null ?? null,
      fechaAsignacion: (a.fechaAsignacion ?? a.fecha_asignacion) as string | null ?? null,
      fechaFin:        (a.fechaFin ?? a.fecha_fin) as string | null ?? null,
    })
  }
  return map
}

// Índices compartidos para enriquecer cada usuario con sus datos de rol.
type EnrichMaps = {
  cursoNombrePorId: Map<number, string>
  estudiantePorUsuario: Map<number, EstudianteRaw>
  estudiantePorId: Map<number, EstudianteRaw>
  nombrePorUsuario: Map<number, string>
  padresPorUsuario: Map<number, PadreRaw>
  profesoresPorUsuario: Map<number, ProfesorEsp>
  adminsPorUsuario: Map<number, AdminRaw>
}

/** Convierte un usuario crudo a UsuarioConRol y le añade los datos de su rol. */
function enrichUsuario(u: Record<string, unknown>, m: EnrichMaps): UsuarioConRol {
  const usuario = rawToUsuarioConRol(u)

  // Estudiante: su propio curso
  const est = m.estudiantePorUsuario.get(usuario.idUsuario)
  if (est) {
    usuario.idEstudiante  = est.idEstudiante
    usuario.idCursoActual = est.idCursoActual
    usuario.cursoNombre   =
      est.idCursoActual != null ? m.cursoNombrePorId.get(est.idCursoActual) ?? null : null
    usuario.fechaAsignacion = est.fechaIngreso
    usuario.fechaFin        = est.fechaEgreso
  }

  // Padre: estudiante vinculado (nombre + curso) y parentesco
  const padre = m.padresPorUsuario.get(usuario.idUsuario)
  if (padre) {
    usuario.idPadre                 = padre.idPadre
    usuario.idEstudianteRelacionado = padre.idEstudiante
    usuario.parentesco              = padre.parentesco
    const hijo = m.estudiantePorId.get(padre.idEstudiante)
    usuario.estudianteNombre = hijo
      ? m.nombrePorUsuario.get(hijo.idUsuario) ?? `Estudiante #${padre.idEstudiante}`
      : `Estudiante #${padre.idEstudiante}`
    usuario.estudianteCurso = hijo && hijo.idCursoActual != null
      ? m.cursoNombrePorId.get(hijo.idCursoActual) ?? null
      : null
  }

  // Profesor: especialización(es) relacionadas
  const profe = m.profesoresPorUsuario.get(usuario.idUsuario)
  if (profe) {
    usuario.idProfesor        = profe.idProfesor
    usuario.especializaciones = profe.especializaciones
    usuario.fechaAsignacion   = profe.fechaVinculacion
  }

  // Administrador: cargo, nivel de acceso y vigencia
  const admin = m.adminsPorUsuario.get(usuario.idUsuario)
  if (admin) {
    usuario.idAdministrador = admin.idAdministrador
    usuario.cargo           = admin.cargo
    usuario.nivelAcceso     = admin.nivelAcceso
    usuario.fechaAsignacion = admin.fechaAsignacion
    usuario.fechaFin        = admin.fechaFin
  }

  return usuario
}

function buildCursoNombrePorId(cursos: Record<string, unknown>[]): Map<number, string> {
  const map = new Map<number, string>()
  for (const c of cursos) map.set((c.idCurso ?? c.id_curso) as number, cursoLabel(c))
  return map
}

function indexEstudiantes(estudiantes: EstudianteRaw[]) {
  const porUsuario = new Map<number, EstudianteRaw>()
  const porId      = new Map<number, EstudianteRaw>()
  for (const e of estudiantes) {
    porUsuario.set(e.idUsuario, e)
    porId.set(e.idEstudiante, e)
  }
  return { porUsuario, porId }
}

function toEstudianteOpt(
  estudiantes: EstudianteRaw[],
  nombrePorUsuario: Map<number, string>,
  cursoNombrePorId: Map<number, string>,
) {
  return estudiantes
    .map((e) => {
      const nombre = nombrePorUsuario.get(e.idUsuario) ?? `Estudiante #${e.idEstudiante}`
      const cursoLbl = e.idCursoActual != null ? cursoNombrePorId.get(e.idCursoActual) ?? null : null
      return {
        idEstudiante: e.idEstudiante,
        nombre,
        idCurso: e.idCursoActual,
        cursoLabel: cursoLbl,
        label: cursoLbl ? `${nombre} · ${cursoLbl}` : nombre,
      }
    })
    .sort((a, b) => a.nombre.localeCompare(b.nombre))
}

function toCursoOpt(cursos: Record<string, unknown>[]) {
  return cursos
    .filter((c) => (c.activo ?? true) !== false)
    .map((c) => ({ idCurso: (c.idCurso ?? c.id_curso) as number, label: cursoLabel(c) }))
    .sort((a, b) => a.label.localeCompare(b.label))
}

function toEspecializacionOpt(data: Record<string, unknown>[]) {
  return data
    .filter((e) => (e.activo ?? true) !== false)
    .map((e) => ({
      idEspecializacion: (e.idEspecializacion ?? e.id_especializacion) as number,
      label: (e.nombreEspecializacion ?? e.nombre_especializacion) as string,
    }))
    .sort((a, b) => a.label.localeCompare(b.label))
}

export async function getUsuariosAction(): Promise<UsuarioConRol[]> {
  const [data, estudiantes, cursos, padresPorUsuario, profesoresPorUsuario, adminsPorUsuario] = await Promise.all([
    apiFetch<Record<string, unknown>[]>('/usuarios?estado=true&limit=500'),
    fetchEstudiantes(),
    apiFetch<Record<string, unknown>[]>('/cursos?limit=200').catch(() => []),
    fetchPadresPorUsuario(),
    fetchProfesoresPorUsuario(),
    fetchAdministradoresPorUsuario(),
  ])

  const cursoNombrePorId = buildCursoNombrePorId(cursos)
  const { porUsuario: estudiantePorUsuario, porId: estudiantePorId } = indexEstudiantes(estudiantes)

  const nombrePorUsuario = new Map<number, string>()
  for (const u of data) {
    nombrePorUsuario.set((u.idUsuario ?? u.id_usuario) as number, nombreCompleto(u))
  }

  const maps: EnrichMaps = {
    cursoNombrePorId, estudiantePorUsuario, estudiantePorId,
    nombrePorUsuario, padresPorUsuario, profesoresPorUsuario, adminsPorUsuario,
  }
  return data.map((u) => enrichUsuario(u, maps))
}

export type UsuariosBootstrap = {
  usuarios: UsuarioConRol[]
  pendientes: UsuarioConRol[]
  cursos: { idCurso: number; label: string }[]
  estudiantes: { idEstudiante: number; nombre: string; idCurso: number | null; cursoLabel: string | null; label: string }[]
  especializaciones: { idEspecializacion: number; label: string }[]
}

/**
 * Carga inicial completa de la página de usuarios en UNA sola llamada.
 * Trae cada lista del backend una única vez (sin los duplicados que tenían
 * getUsuariosAction + getPending + getCursos + getEstudiantesOpt + getEspecializacionesOpt)
 * y deriva de ellas los cinco datasets que necesita la UI.
 */
export async function getUsuariosBootstrapAction(): Promise<UsuariosBootstrap> {
  const [activos, pendientesRaw, estudiantes, cursos, padresPorUsuario, profesoresPorUsuario, adminsPorUsuario, especializacionesRaw] =
    await Promise.all([
      apiFetch<Record<string, unknown>[]>('/usuarios?estado=true&limit=500'),
      apiFetch<Record<string, unknown>[]>('/usuarios?estado=false&limit=500').catch(() => []),
      fetchEstudiantes(),
      apiFetch<Record<string, unknown>[]>('/cursos?limit=200').catch(() => []),
      fetchPadresPorUsuario(),
      fetchProfesoresPorUsuario(),
      fetchAdministradoresPorUsuario(),
      apiFetch<Record<string, unknown>[]>('/especializaciones?limit=200').catch(() => []),
    ])

  const cursoNombrePorId = buildCursoNombrePorId(cursos)
  const { porUsuario: estudiantePorUsuario, porId: estudiantePorId } = indexEstudiantes(estudiantes)

  // Nombre por id_usuario a partir de activos + pendientes (cubre todos los usuarios
  // sin una tercera llamada a /usuarios; resuelve el nombre del hijo vinculado a un padre).
  const nombrePorUsuario = new Map<number, string>()
  for (const u of activos) nombrePorUsuario.set((u.idUsuario ?? u.id_usuario) as number, nombreCompleto(u))
  for (const u of pendientesRaw) nombrePorUsuario.set((u.idUsuario ?? u.id_usuario) as number, nombreCompleto(u))

  const maps: EnrichMaps = {
    cursoNombrePorId, estudiantePorUsuario, estudiantePorId,
    nombrePorUsuario, padresPorUsuario, profesoresPorUsuario, adminsPorUsuario,
  }

  return {
    usuarios: activos.map((u) => enrichUsuario(u, maps)),
    pendientes: pendientesRaw.map((u) => enrichUsuario(u, maps)),
    cursos: toCursoOpt(cursos),
    estudiantes: toEstudianteOpt(estudiantes, nombrePorUsuario, cursoNombrePorId),
    especializaciones: toEspecializacionOpt(especializacionesRaw),
  }
}

export async function getCursosAction(): Promise<{ idCurso: number; label: string }[]> {
  const data = await apiFetch<Record<string, unknown>[]>('/cursos?activo=true&limit=200').catch(() => [])
  return data
    .map((c) => ({ idCurso: (c.idCurso ?? c.id_curso) as number, label: cursoLabel(c) }))
    .sort((a, b) => a.label.localeCompare(b.label))
}

/** Opciones de estudiante (nombre + curso) para vincular a un padre. */
export async function getEstudiantesOptAction(): Promise<
  { idEstudiante: number; nombre: string; idCurso: number | null; cursoLabel: string | null; label: string }[]
> {
  const [estudiantes, usuarios, cursos] = await Promise.all([
    fetchEstudiantes(),
    apiFetch<Record<string, unknown>[]>('/usuarios?limit=500').catch(() => []),
    apiFetch<Record<string, unknown>[]>('/cursos?limit=200').catch(() => []),
  ])

  const nombrePorUsuario = new Map<number, string>()
  for (const u of usuarios) {
    nombrePorUsuario.set((u.idUsuario ?? u.id_usuario) as number, nombreCompleto(u))
  }
  const cursoNombrePorId = new Map<number, string>()
  for (const c of cursos) {
    cursoNombrePorId.set((c.idCurso ?? c.id_curso) as number, cursoLabel(c))
  }

  return estudiantes
    .map((e) => {
      const nombre = nombrePorUsuario.get(e.idUsuario) ?? `Estudiante #${e.idEstudiante}`
      const cursoLbl = e.idCursoActual != null ? cursoNombrePorId.get(e.idCursoActual) ?? null : null
      return {
        idEstudiante: e.idEstudiante,
        nombre,
        idCurso: e.idCursoActual,
        cursoLabel: cursoLbl,
        label: cursoLbl ? `${nombre} · ${cursoLbl}` : nombre,
      }
    })
    .sort((a, b) => a.nombre.localeCompare(b.nombre))
}

/** Opciones de especialización para asignar a un profesor. */
export async function getEspecializacionesOptAction(): Promise<
  { idEspecializacion: number; label: string }[]
> {
  const data = await apiFetch<Record<string, unknown>[]>('/especializaciones?limit=200').catch(() => [])
  return data
    .filter((e) => (e.activo ?? true) !== false)
    .map((e) => ({
      idEspecializacion: (e.idEspecializacion ?? e.id_especializacion) as number,
      label: (e.nombreEspecializacion ?? e.nombre_especializacion) as string,
    }))
    .sort((a, b) => a.label.localeCompare(b.label))
}

/** Catálogo de especializaciones indexado por nombre normalizado (minúsculas, sin espacios extremos). */
async function fetchEspecializacionIdPorNombre(): Promise<Map<string, number>> {
  const data = await apiFetch<Record<string, unknown>[]>('/especializaciones?limit=200').catch(() => [])
  const map = new Map<string, number>()
  for (const e of data) {
    const id = (e.idEspecializacion ?? e.id_especializacion) as number
    const nombre = (e.nombreEspecializacion ?? e.nombre_especializacion) as string | undefined
    if (nombre) map.set(nombre.trim().toLowerCase(), id)
  }
  return map
}

/**
 * Resuelve el id de una especialización por su nombre. Si no existe en el
 * catálogo la crea (`POST /especializaciones`) y devuelve el nuevo id.
 */
async function resolveEspecializacionId(nombre: string): Promise<number | null> {
  const limpio = nombre.trim()
  if (!limpio) return null
  const porNombre = await fetchEspecializacionIdPorNombre()
  const existente = porNombre.get(limpio.toLowerCase())
  if (existente != null) return existente
  const creada = await apiFetch<Record<string, unknown>>('/especializaciones', {
    method: 'POST',
    body: JSON.stringify({ nombre_especializacion: limpio, descripcion: null }),
  })
  return (creada.id_especializacion ?? creada.idEspecializacion) as number
}

/**
 * id_profesor a partir del id_usuario (búsqueda puntual: NO trae las
 * especializaciones de todos los profesores como `fetchProfesoresPorUsuario`).
 * `/profesores` no acepta filtro por id_usuario, así que se busca en la lista.
 */
async function findProfesorIdByUsuario(idUsuario: number): Promise<number | null> {
  const profesores = await apiFetch<Record<string, unknown>[]>('/profesores?limit=500').catch(() => [])
  const p = profesores.find((x) => ((x.idUsuario ?? x.id_usuario) as number) === idUsuario)
  return p ? (p.idProfesor ?? p.id_profesor) as number : null
}

/**
 * Igual que `findProfesorIdByUsuario` pero crea la fila de profesor si no
 * existe (caso de profesores cargados directamente como usuario, sin su fila
 * en `/profesores`) — sin ella no se le pueden asignar especializaciones.
 */
async function ensureProfesorIdByUsuario(idUsuario: number): Promise<number | null> {
  const existente = await findProfesorIdByUsuario(idUsuario)
  if (existente != null) return existente
  const hoy = new Date().toISOString().slice(0, 10)
  const creado = await apiFetch<Record<string, unknown>>('/profesores', {
    method: 'POST',
    body: JSON.stringify({
      id_usuario:        idUsuario,
      codigo_profesor:   `PROF${String(idUsuario).padStart(3, '0')}`,
      titulo:            'Pendiente',
      nivel_estudios:    'Pendiente',
      fecha_vinculacion: hoy,
      estado:            'Activo',
    }),
  })
  return (creado.id_profesor ?? creado.idProfesor) as number
}

/**
 * Asigna a un profesor la especialización indicada por NOMBRE (la crea en el
 * catálogo si no existe; crea la fila de profesor si falta). Deja al profesor
 * con esa única especialización. Nombre vacío → lo deja sin especialización.
 */
export async function setProfesorEspecializacionByNameAction(
  idUsuario: number,
  nombreEspecializacion: string,
  institucion: string,
): Promise<void> {
  const idProfesor = await ensureProfesorIdByUsuario(idUsuario)
  if (idProfesor == null) throw new Error('No se pudo crear u obtener el profesor para asignar la especialización')

  const nombre = nombreEspecializacion.trim()
  const idEspecializacion = nombre ? await resolveEspecializacionId(nombre) : null
  if (nombre && idEspecializacion == null) {
    throw new Error(`No se pudo resolver la especialización "${nombre}"`)
  }

  // Especializaciones actuales de ESTE profesor (una sola llamada).
  const actualesRaw = await apiFetch<Record<string, unknown>[]>(
    `/profesores/${idProfesor}/especializaciones`,
  ).catch(() => [])
  const actuales = actualesRaw.map((x) => (x.idEspecializacion ?? x.id_especializacion) as number)

  // Agregar la seleccionada si aún no la tiene (sin tragar el error: si el
  // backend rechaza el POST, la UI debe mostrar el motivo en vez de quedar muda).
  if (idEspecializacion != null && !actuales.includes(idEspecializacion)) {
    await apiFetch(`/profesores/${idProfesor}/especializaciones`, {
      method: 'POST',
      body: JSON.stringify({ id_especializacion: idEspecializacion, institucion }),
    })
  }

  // Quitar las que ya no correspondan
  for (const id of actuales) {
    if (id !== idEspecializacion) {
      await apiFetch(`/profesores/${idProfesor}/especializaciones/${id}`, {
        method: 'DELETE',
      }).catch(() => null)
    }
  }
}

/** Crea o actualiza los datos de administrador (cargo, nivel, vigencia). Resuelve el id por id_usuario. */
export async function updateAdministradorAction(
  idUsuario: number,
  data: { cargo: string; nivelAcceso: string; fechaAsignacion: string; fechaFin: string },
): Promise<void> {
  const admins = await fetchAdministradoresPorUsuario()
  const existing = admins.get(idUsuario)
  const body = JSON.stringify({
    id_usuario:       idUsuario,
    cargo:            data.cargo || 'Administrador',
    nivel_acceso:     data.nivelAcceso || 'Bajo',
    fecha_asignacion: data.fechaAsignacion,
    fecha_fin:        data.fechaFin,
  })
  if (existing) {
    await apiFetch(`/administradores/${existing.idAdministrador}`, { method: 'PUT', body })
  } else {
    await apiFetch('/administradores', { method: 'POST', body })
  }
}

/** Actualiza la fecha de vinculación de un profesor. Resuelve el id_profesor por id_usuario. */
export async function updateProfesorFechaAction(
  idUsuario: number,
  fechaVinculacion: string,
): Promise<void> {
  if (!fechaVinculacion) return
  const idProfesor = await ensureProfesorIdByUsuario(idUsuario)
  if (idProfesor == null) return
  await apiFetch(`/profesores/${idProfesor}`, {
    method: 'PUT',
    body: JSON.stringify({ fecha_vinculacion: fechaVinculacion }),
  }).catch(() => null)
}

/** Crea o actualiza el vínculo padre↔estudiante. Resuelve el id_padre por id_usuario. */
export async function updatePadreRelacionAction(
  idUsuario: number,
  idEstudiante: number,
  parentesco: string,
): Promise<void> {
  const padres = await fetchPadresPorUsuario()
  const existing = padres.get(idUsuario)
  const body = JSON.stringify({
    id_usuario:    idUsuario,
    id_estudiante: idEstudiante,
    parentesco,
    ocupacion:     existing?.ocupacion ?? null,
  })
  if (existing) {
    await apiFetch(`/padres/${existing.idPadre}`, { method: 'PUT', body })
  } else {
    await apiFetch('/padres', { method: 'POST', body })
  }
}

/** Actualiza curso y vigencia de un estudiante. Resuelve el id_estudiante por id_usuario. */
export async function updateEstudianteCursoAction(
  idUsuario: number,
  idCursoActual: number | null,
  fechaIngreso?: string | null,
  fechaEgreso?: string | null,
): Promise<void> {
  const estudiantes = await fetchEstudiantesPorUsuario()
  const est = estudiantes.get(idUsuario)
  if (!est) return
  const body: Record<string, unknown> = { id_curso_actual: idCursoActual }
  if (fechaIngreso) body.fecha_ingreso = fechaIngreso
  if (fechaEgreso)  body.fecha_egreso  = fechaEgreso
  await apiFetch(`/estudiantes/${est.idEstudiante}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

export async function updateUsuarioAction(
  id: number,
  data: Partial<{
    primerNombre: string; primerApellido: string
    segundoNombre: string | null; segundoApellido: string | null
    tipoDocumento: string; numeroDocumento: string
    telefono: string | null; genero: string | null; direccion: string | null
    idRol: number
  }>
): Promise<void> {
  const body: Record<string, unknown> = {}
  if (data.primerNombre    !== undefined) body.primer_nombre    = data.primerNombre
  if (data.primerApellido  !== undefined) body.primer_apellido  = data.primerApellido
  if (data.segundoNombre   !== undefined) body.segundo_nombre   = data.segundoNombre
  if (data.segundoApellido !== undefined) body.segundo_apellido = data.segundoApellido
  if (data.tipoDocumento   !== undefined) body.tipo_documento   = data.tipoDocumento
  if (data.numeroDocumento !== undefined) body.numero_documento = data.numeroDocumento
  if (data.telefono        !== undefined) body.telefono         = data.telefono
  if (data.genero          !== undefined) body.genero           = data.genero
  if (data.direccion       !== undefined) body.direccion        = data.direccion
  if (data.idRol           !== undefined) body.id_rol           = data.idRol
  await apiFetch(`/usuarios/${id}`, { method: 'PUT', body: JSON.stringify(body) })
}

export async function toggleUsuarioEstadoAction(id: number, nuevoEstado: boolean): Promise<void> {
  // `estado` va como query param (el backend NO lo lee del body).
  await apiFetch(`/usuarios/${id}/estado?estado=${nuevoEstado}`, { method: 'PATCH' })
}

export async function getPendingUsuariosAction(): Promise<UsuarioConRol[]> {
  const data = await apiFetch<Record<string, unknown>[]>('/usuarios?estado=false&limit=500')
  return data.map(rawToUsuarioConRol)
}

export async function validarUsuarioAction(id: number, idRol: number): Promise<void> {
  await apiFetch(`/usuarios/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ id_rol: idRol }),
  })
  // `estado` va como query param (el backend NO lo lee del body).
  await apiFetch(`/usuarios/${id}/estado?estado=true`, { method: 'PATCH' })

  const hoy = new Date().toISOString().slice(0, 10)

  // OJO: ni /estudiantes ni /profesores aceptan filtro ?id_usuario (lo ignoran y
  // devuelven la primera fila), así que la existencia se comprueba escaneando la lista.
  if (idRol === ID_ROL_ESTUDIANTE) {
    const estudiantes = await fetchEstudiantesPorUsuario()
    if (!estudiantes.has(id)) {
      const codigo = `EST${String(id).padStart(3, '0')}`
      await apiFetch('/estudiantes', {
        method: 'POST',
        body: JSON.stringify({ id_usuario: id, codigo_estudiante: codigo, fecha_ingreso: hoy, estado: 'Activo' }),
      }).catch(() => null)
    }
  }

  if (idRol === ID_ROL_PROFESOR) {
    const idProfesor = await findProfesorIdByUsuario(id)
    if (idProfesor == null) {
      const codigo = `PROF${String(id).padStart(3, '0')}`
      await apiFetch('/profesores', {
        method: 'POST',
        body: JSON.stringify({
          id_usuario: id, codigo_profesor: codigo,
          titulo: 'Pendiente', nivel_estudios: 'Pendiente',
          fecha_vinculacion: hoy, estado: 'Activo',
        }),
      }).catch(() => null)
    }
  }
}

// Rechazar una solicitud = eliminar al usuario (igual que la papelera). No sirve la
// baja lógica porque un pendiente ya está en estado=false y no se quitaría de la lista.
export async function rechazarUsuarioAction(id: number): Promise<void> {
  return deleteUsuarioAction(id)
}

/**
 * Borrado físico del usuario. El backend (`DELETE /usuarios/{id}`) ahora elimina
 * en cascada — dentro de una sola transacción — sus filas de rol y todos los
 * registros asociados (asistencia/notas/novedades/reportes/asignaciones/IPS/...),
 * así que basta una única llamada. Si el backend lo rechaza, `apiFetch` propaga el
 * motivo real (constraint + método + ruta) a la UI.
 */
export async function deleteUsuarioAction(id: number): Promise<void> {
  await apiFetch(`/usuarios/${id}`, { method: 'DELETE' })
}

export async function repararFilasRolAction(): Promise<void> {
  // Handled automatically by validarUsuarioAction — no separate repair needed
}
