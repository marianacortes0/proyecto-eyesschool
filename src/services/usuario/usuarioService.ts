import { apiFetch } from '@/services/api/client'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'
const API_ORIGIN = API.replace(/\/api\/v1\/?$/, '')

export type PerfilUsuario = {
  idUsuario: number
  primerNombre: string
  segundoNombre: string | null
  primerApellido: string
  segundoApellido: string | null
  correo: string | null
  tipoDocumento: string
  numeroDocumento: string
  telefono: string | null
  direccion: string | null
  genero: string | null
  rolNombre: string | null
  fechaRegistro: string | null
  ultimoAcceso: string | null
  fotoPerfil: string | null
}

export type ProfesorPerfil = {
  idProfesor: number
  titulo: string
  nivelEstudios: string
  codigoProfesor: string
  fechaVinculacion: string
  especializaciones: { idEspecializacion: number; nombreEspecializacion: string; institucion: string }[]
}

export type EPSPerfil = {
  idIPS: number
  nombreIPS: string
  tipoAfiliacion: string
  fechaAfiliacion: string
  fechaVencimiento: string | null
  activo: boolean
}

export type AdminPerfil = {
  idAdministrador: number
  cargo: string
  nivelAcceso: string
  estado: string
  fechaAsignacion: string
}

export type CursoPerfil = { idCurso: number; nombreCurso: string; grado: string; jornada: string }

export const EPS_OPTIONS = [
  { idIPS: 101, nombre: 'SURA' },
  { idIPS: 102, nombre: 'SANITAS' },
  { idIPS: 103, nombre: 'COMPENSAR' },
  { idIPS: 104, nombre: 'NUEVA EPS' },
  { idIPS: 105, nombre: 'SALUD TOTAL' },
] as const

export const TIPO_AFILIACION_OPTIONS = ['Contributivo', 'Subsidiado', 'Especial'] as const

/** Resuelve una ruta de avatar relativa contra el origen del backend. */
function resolveAvatarUrl(url: string): string {
  if (!url) return ''
  if (/^https?:\/\//.test(url) || url.startsWith('data:')) return url
  return `${API_ORIGIN}${url.startsWith('/') ? '' : '/'}${url}`
}

/** Sube la foto de perfil a POST /auth/me/avatar (multipart, campo `file`). */
export async function uploadAvatar(file: File): Promise<string> {
  const fd = new FormData()
  fd.append('file', file)
  const data = await apiFetch<unknown>('/auth/me/avatar', { method: 'POST', body: fd })
  if (typeof data === 'string') return resolveAvatarUrl(data)
  const obj = (data ?? {}) as Record<string, unknown>
  const url = (obj.url ?? obj.avatar ?? obj.avatarUrl ?? obj.ruta ?? obj.rutaAvatar ?? '') as string
  return resolveAvatarUrl(url)
}

export function getAvatarUrl(_user: unknown): string | null {
  return null
}

export async function getMiPerfil(idUsuario: number): Promise<PerfilUsuario | null> {
  try {
    const u = await apiFetch<Record<string, unknown>>(`/usuarios/${idUsuario}`)
    return {
      idUsuario:       u.idUsuario as number,
      primerNombre:    u.primerNombre as string,
      segundoNombre:   u.segundoNombre as string | null,
      primerApellido:  u.primerApellido as string,
      segundoApellido: u.segundoApellido as string | null,
      correo:          u.correo as string | null,
      tipoDocumento:   u.tipoDocumento as string,
      numeroDocumento: u.numeroDocumento as string,
      telefono:        u.telefono as string | null,
      direccion:       u.direccion as string | null,
      genero:          u.genero as string | null,
      rolNombre:       (u.nombreRol ?? u.rolNombre) as string | null ?? null,
      fechaRegistro:   (u.fechaRegistro as string | null) ?? null,
      ultimoAcceso:    (u.ultimoAcceso as string | null) ?? null,
      fotoPerfil:      u.fotoPerfil ? resolveAvatarUrl(u.fotoPerfil as string) : null,
    }
  } catch {
    return null
  }
}

export async function updateMiPerfil(
  idUsuario: number,
  payload: Partial<Pick<PerfilUsuario, 'primerNombre' | 'segundoNombre' | 'primerApellido' | 'segundoApellido' | 'tipoDocumento' | 'numeroDocumento' | 'telefono' | 'direccion' | 'genero'>>
): Promise<void> {
  const body: Record<string, unknown> = {}
  if (payload.primerNombre    !== undefined) body.primer_nombre    = payload.primerNombre
  if (payload.segundoNombre   !== undefined) body.segundo_nombre   = payload.segundoNombre
  if (payload.primerApellido  !== undefined) body.primer_apellido  = payload.primerApellido
  if (payload.segundoApellido !== undefined) body.segundo_apellido = payload.segundoApellido
  if (payload.tipoDocumento   !== undefined) body.tipo_documento   = payload.tipoDocumento
  if (payload.numeroDocumento !== undefined) body.numero_documento = payload.numeroDocumento
  if (payload.telefono        !== undefined) body.telefono         = payload.telefono
  if (payload.direccion       !== undefined) body.direccion        = payload.direccion
  if (payload.genero          !== undefined) body.genero           = payload.genero
  await apiFetch(`/usuarios/${idUsuario}`, { method: 'PUT', body: JSON.stringify(body) })
}

export async function getMiPerfilProfesor(idUsuario: number): Promise<ProfesorPerfil | null> {
  try {
    // OJO: GET /profesores IGNORA el filtro ?id_usuario (solo acepta skip/limit),
    // así que NO se puede pedir limit=1: hay que traer la lista y buscar la fila
    // cuyo idUsuario coincide. Si no, se cargaría el perfil del PRIMER profesor.
    const data = await apiFetch<Record<string, unknown>[]>(`/profesores?limit=500`)
    const p = data.find(x => x.idUsuario === idUsuario)
    if (!p) return null
    const esps = await apiFetch<Record<string, unknown>[]>(`/profesores/${p.idProfesor}/especializaciones`).catch(() => [])
    return {
      idProfesor:       p.idProfesor as number,
      titulo:           p.titulo as string,
      nivelEstudios:    p.nivelEstudios as string,
      codigoProfesor:   p.codigoProfesor as string,
      fechaVinculacion: p.fechaVinculacion as string,
      especializaciones: esps.map(e => ({
        idEspecializacion:     e.idEspecializacion as number,
        // El nombre viene ANIDADO en `especializacion` (join del backend).
        nombreEspecializacion: ((e.especializacion as Record<string, unknown> | null)?.nombreEspecializacion as string) ?? '',
        institucion:           (e.institucion as string) ?? '',
      })),
    }
  } catch {
    return null
  }
}

export async function updateMiPerfilProfesor(
  idProfesor: number,
  payload: { titulo?: string; nivelEstudios?: string }
): Promise<void> {
  const body: Record<string, unknown> = {}
  if (payload.titulo        !== undefined) body.titulo         = payload.titulo
  if (payload.nivelEstudios !== undefined) body.nivel_estudios = payload.nivelEstudios
  await apiFetch(`/profesores/${idProfesor}`, { method: 'PUT', body: JSON.stringify(body) })
}

export async function getMiPerfilAdmin(idUsuario: number): Promise<AdminPerfil | null> {
  try {
    // GET /administradores ignora ?id_usuario (solo skip/limit) → se busca en la
    // lista. Con limit=1 se cargaría el PRIMER administrador, no el del usuario.
    const data = await apiFetch<Record<string, unknown>[]>(`/administradores?limit=500`)
    const a = data.find(x => x.idUsuario === idUsuario)
    if (!a) return null
    return {
      idAdministrador: a.idAdministrador as number,
      cargo:           a.cargo as string,
      nivelAcceso:     a.nivelAcceso as string,
      estado:          a.estado as string,
      fechaAsignacion: a.fechaAsignacion as string,
    }
  } catch {
    return null
  }
}

export async function updateMiPerfilAdmin(
  idAdministrador: number,
  payload: { cargo?: string; nivelAcceso?: string }
): Promise<void> {
  const body: Record<string, unknown> = {}
  if (payload.cargo        !== undefined) body.cargo         = payload.cargo
  if (payload.nivelAcceso  !== undefined) body.nivel_acceso  = payload.nivelAcceso
  await apiFetch(`/administradores/${idAdministrador}`, { method: 'PUT', body: JSON.stringify(body) })
}

export async function insertAdminPerfil(
  idUsuario: number,
  payload: { cargo: string; nivelAcceso: string }
): Promise<AdminPerfil> {
  const hoy = new Date().toISOString().slice(0, 10)
  const data = await apiFetch<Record<string, unknown>>('/administradores', {
    method: 'POST',
    body: JSON.stringify({
      id_usuario:       idUsuario,
      cargo:            payload.cargo,
      nivel_acceso:     payload.nivelAcceso,
      estado:           'Activo',
      fecha_asignacion: hoy,
    }),
  })
  return {
    idAdministrador: data.idAdministrador as number,
    cargo:           data.cargo as string,
    nivelAcceso:     data.nivelAcceso as string,
    estado:          data.estado as string,
    fechaAsignacion: data.fechaAsignacion as string,
  }
}

export async function getMiEPS(_idUsuario: number): Promise<EPSPerfil[]> {
  try {
    // El estudiante NO puede listar /estudiantes (es admin/docente); su propia
    // fila se obtiene con /estudiantes/me (antes /estudiantes?id_usuario daba 403
    // o traía al primer estudiante).
    const me = await apiFetch<Record<string, unknown>>(`/estudiantes/me`)
    const idEstudiante = me?.idEstudiante as number | undefined
    if (!idEstudiante) return []
    const data = await apiFetch<Record<string, unknown>[]>(`/estudiantes/${idEstudiante}/ips`)
    return data.map(e => ({
      idIPS:            e.idIps as number,
      nombreIPS:        e.nombreIps as string,
      tipoAfiliacion:   e.tipoAfiliacion as string,
      fechaAfiliacion:  e.fechaAfiliacion as string,
      fechaVencimiento: e.fechaVencimiento as string | null,
      activo:           e.activo as boolean,
    }))
  } catch {
    return []
  }
}

export async function upsertMiEPS(
  idEstudiante: number,
  payload: { idIPS: number; nombreIPS: string; tipoAfiliacion: string }
): Promise<void> {
  await apiFetch(`/estudiantes/${idEstudiante}/ips`, {
    method: 'POST',
    body: JSON.stringify({
      id_ips:          payload.idIPS,
      nombre_ips:      payload.nombreIPS,
      tipo_afiliacion: payload.tipoAfiliacion,
      fecha_afiliacion: new Date().toISOString().slice(0, 10),
      activo: true,
    }),
  })
}

export async function getMiEstudianteInfo(
  idUsuario: number
): Promise<{ idEstudiante: number; idCursoActual: number | null } | null> {
  try {
    const data = await apiFetch<Record<string, unknown>[]>(`/estudiantes?id_usuario=${idUsuario}&limit=1`)
    if (!data.length) return null
    return {
      idEstudiante:  data[0].idEstudiante as number,
      idCursoActual: (data[0].idCursoActual as number | null) ?? null,
    }
  } catch {
    return null
  }
}

export async function updateEstudianteCurso(idEstudiante: number, idCurso: number): Promise<void> {
  await apiFetch(`/estudiantes/${idEstudiante}`, {
    method: 'PUT',
    body: JSON.stringify({ id_curso_actual: idCurso }),
  })
}

export async function getCursosParaPerfil(): Promise<CursoPerfil[]> {
  const data = await apiFetch<Record<string, unknown>[]>('/cursos?limit=200')
  return data.map(c => ({
    idCurso:     c.idCurso as number,
    nombreCurso: c.nombreCurso as string,
    grado:       c.grado as string,
    jornada:     c.jornada as string,
  }))
}
