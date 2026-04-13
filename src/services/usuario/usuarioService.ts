import { createClient } from '@/services/supabase/client'

const AVATAR_BUCKET = 'Perfil'

export async function uploadAvatar(file: File): Promise<string> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${user.id}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type })

  if (uploadError) throw new Error(uploadError.message)

  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path)
  const publicUrl = `${data.publicUrl}?t=${Date.now()}`

  // Guardar URL en metadata del usuario auth
  await supabase.auth.updateUser({ data: { avatarUrl: publicUrl } })

  return publicUrl
}

export function getAvatarUrl(authUser: { user_metadata?: { avatarUrl?: string } } | null): string | null {
  return authUser?.user_metadata?.avatarUrl ?? null
}

export type PerfilUsuario = {
  idUsuario: number
  primerNombre: string
  segundoNombre: string | null
  primerApellido: string
  segundoApellido: string | null
  correo: string | null
  tipoDocumento: string | null
  numeroDocumento: string | null
  telefono: string | null
  direccion: string | null
  genero: string | null
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

export async function getMiPerfil(): Promise<PerfilUsuario | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('usuario')
    .select('idUsuario, primerNombre, segundoNombre, primerApellido, segundoApellido, correo, tipoDocumento, numeroDocumento, telefono, direccion, genero')
    .eq('auth_id', user.id)
    .maybeSingle()

  if (error || !data) return null
  return data as PerfilUsuario
}

export async function updateMiPerfil(
  idUsuario: number,
  payload: Partial<Pick<PerfilUsuario, 'primerNombre' | 'segundoNombre' | 'primerApellido' | 'segundoApellido' | 'tipoDocumento' | 'numeroDocumento' | 'telefono' | 'direccion' | 'genero'>>
): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('usuario').update(payload).eq('idUsuario', idUsuario)
  if (error) throw new Error(error.message)
}

export async function getMiPerfilProfesor(idUsuario: number): Promise<ProfesorPerfil | null> {
  const supabase = createClient()
  const { data: prof, error } = await supabase
    .from('profesores')
    .select('idProfesor, titulo, nivelEstudios, codigoProfesor, fechaVinculacion')
    .eq('idUsuario', idUsuario)
    .maybeSingle()

  if (error || !prof) return null

  const { data: esps } = await supabase
    .from('profesorespecializacion')
    .select('institucion, idEspecializacion, especializaciones ( nombreEspecializacion )')
    .eq('idProfesor', prof.idProfesor)

  return {
    ...prof,
    especializaciones: ((esps ?? []) as any[]).map(e => ({
      idEspecializacion: e.idEspecializacion,
      nombreEspecializacion: e.especializaciones?.nombreEspecializacion ?? '',
      institucion: e.institucion,
    })),
  }
}

export async function updateMiPerfilProfesor(
  idProfesor: number,
  payload: { titulo?: string; nivelEstudios?: string }
): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('profesores').update(payload).eq('idProfesor', idProfesor)
  if (error) throw new Error(error.message)
}

export type AdminPerfil = {
  idAdministrador: number
  cargo: string
  nivelAcceso: string
  estado: string
  fechaAsignacion: string
}

export async function getMiPerfilAdmin(idUsuario: number): Promise<AdminPerfil | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('administrador')
    .select('idAdministrador, cargo, nivelAcceso, estado, fechaAsignacion')
    .eq('idUsuario', idUsuario)
    .maybeSingle()
  if (error || !data) return null
  return data as AdminPerfil
}

export async function updateMiPerfilAdmin(
  idAdministrador: number,
  payload: { cargo?: string; nivelAcceso?: string }
): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('administrador')
    .update(payload)
    .eq('idAdministrador', idAdministrador)
  if (error) throw new Error(error.message)
}

export async function insertAdminPerfil(
  idUsuario: number,
  payload: { cargo: string; nivelAcceso: string }
): Promise<AdminPerfil> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('administrador')
    .insert({
      idUsuario,
      cargo: payload.cargo,
      nivelAcceso: payload.nivelAcceso,
      estado: 'Activo',
      fechaAsignacion: new Date().toISOString().slice(0, 10),
    })
    .select('idAdministrador, cargo, nivelAcceso, estado, fechaAsignacion')
    .single()
  if (error) throw new Error(error.message)
  return data as AdminPerfil
}

export type CursoPerfil = {
  idCurso: number
  nombreCurso: string
  grado: string
  jornada: string
}

export const EPS_OPTIONS = [
  { idIPS: 101, nombre: 'SURA' },
  { idIPS: 102, nombre: 'SANITAS' },
  { idIPS: 103, nombre: 'COMPENSAR' },
  { idIPS: 104, nombre: 'NUEVA EPS' },
  { idIPS: 105, nombre: 'SALUD TOTAL' },
] as const

export const TIPO_AFILIACION_OPTIONS = ['Contributivo', 'Subsidiado', 'Especial'] as const

export async function getMiEPS(idUsuario: number): Promise<EPSPerfil[]> {
  const supabase = createClient()
  const { data: est } = await supabase
    .from('estudiantes')
    .select('idEstudiante')
    .eq('idUsuario', idUsuario)
    .maybeSingle()

  if (!est) return []

  const { data } = await supabase
    .from('estudianteips')
    .select('idIPS, nombreIPS, tipoAfiliacion, fechaAfiliacion, fechaVencimiento, activo')
    .eq('idEstudiante', est.idEstudiante)
    .eq('activo', true)

  return (data ?? []) as EPSPerfil[]
}

export async function upsertMiEPS(
  idEstudiante: number,
  payload: { idIPS: number; nombreIPS: string; tipoAfiliacion: string }
): Promise<void> {
  const supabase = createClient()
  const { data: existing } = await supabase
    .from('estudianteips')
    .select('idIPS')
    .eq('idEstudiante', idEstudiante)
    .eq('activo', true)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase
      .from('estudianteips')
      .update({ nombreIPS: payload.nombreIPS, tipoAfiliacion: payload.tipoAfiliacion })
      .eq('idEstudiante', idEstudiante)
      .eq('idIPS', existing.idIPS)
    if (error) throw new Error(error.message)
  } else {
    const { error } = await supabase
      .from('estudianteips')
      .insert({
        idEstudiante,
        idIPS: payload.idIPS,
        nombreIPS: payload.nombreIPS,
        tipoAfiliacion: payload.tipoAfiliacion,
        fechaAfiliacion: new Date().toISOString().slice(0, 10),
        activo: true,
      })
    if (error) throw new Error(error.message)
  }
}

export async function getMiEstudianteInfo(idUsuario: number): Promise<{ idEstudiante: number; idCursoActual: number | null } | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from('estudiantes')
    .select('idEstudiante, idCursoActual')
    .eq('idUsuario', idUsuario)
    .maybeSingle()
  return data ?? null
}

export async function updateEstudianteCurso(idEstudiante: number, idCurso: number): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('estudiantes')
    .update({ idCursoActual: idCurso })
    .eq('idEstudiante', idEstudiante)
  if (error) throw new Error(error.message)
}

export async function getCursosParaPerfil(): Promise<CursoPerfil[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('cursos')
    .select('idCurso, nombreCurso, grado, jornada')
    .order('jornada')
    .order('grado')
  return (data ?? []) as CursoPerfil[]
}
