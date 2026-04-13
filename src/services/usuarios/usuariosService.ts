import { createClient } from '../supabase/client'
import { Tables } from '@/types/supabase'

type Usuario = Tables<'usuario'>

export type UsuarioConRol = Usuario & {
  rolNombre: string
}

export type CreateUsuarioData = {
  primerNombre: string
  primerApellido: string
  segundoNombre?: string
  segundoApellido?: string
  tipoDocumento: 'CC' | 'CE' | 'TI' | 'PAS'
  numeroDocumento: string
  correo: string
  password: string
  telefono?: string
  genero?: 'M' | 'F' | 'O'
  direccion?: string
  idRol: number
}

export type UpdateUsuarioData = Partial<Omit<CreateUsuarioData, 'correo'>>

// Roles reales en la tabla public.roles:
// 1 = Profesor | 2 = Estudiante | 3 = Administrador | 4 = Padre (default)
export const ROL_NOMBRES: Record<number, string> = {
  1: 'Profesor',
  2: 'Estudiante',
  3: 'Administrador',
  4: 'Padre',
}

// ── Script SQL para asignar el primer Administrador ──────────────────────────
// Ejecutar una sola vez en Supabase SQL Editor reemplazando el email:
//
//   UPDATE public.usuario
//   SET "idRol" = 3
//   WHERE auth_id = (
//     SELECT id FROM auth.users WHERE email = 'correo@ejemplo.com'
//   );
// ─────────────────────────────────────────────────────────────────────────────

/** Usuarios validados (estado = true) */
export const getUsuarios = async (): Promise<UsuarioConRol[]> => {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('usuario')
    .select('*')
    .eq('estado', true)
    .order('primerApellido', { ascending: true })

  if (error) throw new Error(error.message)
  if (!data) return []

  return data.map((u) => ({
    ...u,
    rolNombre: ROL_NOMBRES[u.idRol] ?? 'Desconocido',
  }))
}

/** Usuarios pendientes de validación (estado = false) */
export const getPendingUsuarios = async (): Promise<UsuarioConRol[]> => {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('usuario')
    .select('*')
    .eq('estado', false)
    .order('fechaRegistro', { ascending: true })

  if (error) throw new Error(error.message)
  if (!data) return []

  return data.map((u) => ({
    ...u,
    rolNombre: ROL_NOMBRES[u.idRol] ?? 'Desconocido',
  }))
}

/**
 * Valida un usuario: activa su cuenta y asigna el rol definitivo.
 * idRol: 3 = Administrador | 1 = Profesor | 4 = Padre (confirma sin cambio de rol)
 */
export const validarUsuario = async (id: number, idRol: number): Promise<void> => {
  const supabase = createClient()

  const { error } = await supabase
    .from('usuario')
    .update({ estado: true, idRol })
    .eq('idUsuario', id)

  if (error) throw new Error(error.message)
}

/** Rechaza y elimina un usuario pendiente */
export const rechazarUsuario = async (id: number): Promise<void> => {
  const supabase = createClient()

  const { error } = await supabase
    .from('usuario')
    .delete()
    .eq('idUsuario', id)

  if (error) throw new Error(error.message)
}

export const getUsuarioById = async (id: number): Promise<UsuarioConRol | null> => {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('usuario')
    .select('*')
    .eq('idUsuario', id)
    .single()

  if (error) throw new Error(error.message)
  if (!data) return null

  return { ...data, rolNombre: ROL_NOMBRES[data.idRol] ?? 'Desconocido' }
}

export const createUsuario = async (usuario: CreateUsuarioData): Promise<void> => {
  const supabase = createClient()

  const { error } = await supabase.from('usuario').insert({
    primerNombre: usuario.primerNombre,
    primerApellido: usuario.primerApellido,
    segundoNombre: usuario.segundoNombre ?? null,
    segundoApellido: usuario.segundoApellido ?? null,
    tipoDocumento: usuario.tipoDocumento,
    numeroDocumento: usuario.numeroDocumento,
    correo: usuario.correo,
    telefono: usuario.telefono ?? null,
    genero: usuario.genero ?? null,
    direccion: usuario.direccion ?? null,
    idRol: usuario.idRol,
    estado: false, // pendiente de validación por el administrador
  })

  if (error) throw new Error(error.message)
}

export const updateUsuario = async (id: number, data: UpdateUsuarioData): Promise<void> => {
  const supabase = createClient()

  const payload: Record<string, unknown> = {
    primerNombre: data.primerNombre,
    primerApellido: data.primerApellido,
    segundoNombre: data.segundoNombre ?? null,
    segundoApellido: data.segundoApellido ?? null,
    tipoDocumento: data.tipoDocumento,
    numeroDocumento: data.numeroDocumento,
    telefono: data.telefono ?? null,
    genero: data.genero ?? null,
    direccion: data.direccion ?? null,
  }
  if (data.idRol !== undefined) payload.idRol = data.idRol

  const { error } = await supabase
    .from('usuario')
    .update(payload)
    .eq('idUsuario', id)

  if (error) throw new Error(error.message)
}

export const toggleUsuarioEstado = async (id: number, nuevoEstado: boolean): Promise<void> => {
  const supabase = createClient()

  const { error } = await supabase
    .from('usuario')
    .update({ estado: nuevoEstado })
    .eq('idUsuario', id)

  if (error) throw new Error(error.message)
}

export const deleteUsuario = async (id: number): Promise<void> => {
  const supabase = createClient()

  const { error } = await supabase
    .from('usuario')
    .delete()
    .eq('idUsuario', id)

  if (error) throw new Error(error.message)
}
