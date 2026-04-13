'use server'

import { createAdminClient } from '@/services/supabase/admin'
import { ROL_NOMBRES, type UsuarioConRol } from '@/services/usuarios/usuariosService'

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
}

// Roles reales en la BD: 1=Profesor | 2=Estudiante | 3=Administrador | 4=Padre
const ID_ROL_ESTUDIANTE = 2

/**
 * Crea un usuario en Supabase Auth Y en public.usuario.
 * El admin asigna el rol directamente — todos los usuarios creados por admin
 * quedan activos (estado=true) con el rol elegido.
 */
export async function createUsuarioConAuth(data: CreateUsuarioConAuthData): Promise<void> {
  const supabase = createAdminClient()

  const rolText = ROL_NOMBRES[data.idRol] ?? 'Profesor'

  // 1. Crear cuenta en Supabase Auth con el rol real
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: data.correo,
    password: data.password,
    email_confirm: true,
    app_metadata: { rol: rolText, idRol: data.idRol },
    user_metadata: {
      primerNombre: data.primerNombre,
      primerApellido: data.primerApellido,
      idRol: data.idRol,
      rol: rolText,
      tipoDocumento: data.tipoDocumento,
      numeroDocumento: data.numeroDocumento,
    },
  })

  if (authError || !authData.user) {
    throw new Error(authError?.message ?? 'No se pudo crear la cuenta de autenticación')
  }

  // 2. Insertar en public.usuario con rol y estado definitivos
  const { error: dbError } = await supabase.from('usuario').insert({
    correo: data.correo,
    primerNombre: data.primerNombre,
    primerApellido: data.primerApellido,
    segundoNombre: data.segundoNombre ?? null,
    segundoApellido: data.segundoApellido ?? null,
    tipoDocumento: data.tipoDocumento,
    numeroDocumento: data.numeroDocumento,
    telefono: data.telefono ?? null,
    genero: data.genero ?? null,
    direccion: data.direccion ?? null,
    idRol: data.idRol,
    auth_id: authData.user.id,
    estado: true,   // el admin crea con acceso inmediato
  })

  if (dbError) {
    await supabase.auth.admin.deleteUser(authData.user.id)
    throw new Error(`Error al guardar el usuario: ${dbError.message}`)
  }

  // Si el rol es Estudiante, crear fila en public.estudiantes automáticamente
  if (data.idRol === ID_ROL_ESTUDIANTE) {
    const { data: usuarioCreado } = await supabase
      .from('usuario')
      .select('idUsuario')
      .eq('auth_id', authData.user.id)
      .single()

    if (usuarioCreado) {
      const codigo = `EST${String(usuarioCreado.idUsuario).padStart(3, '0')}`
      const hoy = new Date().toISOString().slice(0, 10)
      await supabase.from('estudiantes').insert({
        idUsuario: usuarioCreado.idUsuario,
        codigoEstudiante: codigo,
        fechaIngreso: hoy,
        estado: 'Activo',
      })
    }
  }
}

/**
 * Usuarios pendientes de validación (estado=false).
 * Usa cliente admin para bypassear RLS y que el admin pueda verlos siempre.
 */
export async function getPendingUsuariosAction(): Promise<UsuarioConRol[]> {
  const supabase = createAdminClient()

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
 * Usa cliente admin para bypassear RLS.
 */
export async function validarUsuarioAction(id: number, idRol: number): Promise<void> {
  const supabase = createAdminClient()

  // 1. Obtener el auth_id del usuario para actualizar user_metadata en Auth
  const { data: usuario } = await supabase
    .from('usuario')
    .select('auth_id, correo')
    .eq('idUsuario', id)
    .single()

  // 2. Actualizar en public.usuario
  const { error } = await supabase
    .from('usuario')
    .update({ estado: true, idRol })
    .eq('idUsuario', id)

  if (error) throw new Error(error.message)

  // 3. Actualizar app_metadata Y user_metadata en Auth
  if (usuario?.auth_id) {
    const rolText = ROL_NOMBRES[idRol] ?? 'Desconocido'
    await supabase.auth.admin.updateUserById(usuario.auth_id, {
      app_metadata: { rol: rolText, idRol },
      user_metadata: { rol: rolText, idRol },
    })
  }

  // 4. Si el rol asignado es Estudiante, crear fila en public.estudiantes
  if (idRol === ID_ROL_ESTUDIANTE) {
    // Verificar que no exista ya
    const { count } = await supabase
      .from('estudiantes')
      .select('*', { count: 'exact', head: true })
      .eq('idUsuario', id)

    if (!count) {
      const codigo = `EST${String(id).padStart(3, '0')}`
      const hoy = new Date().toISOString().slice(0, 10)
      await supabase.from('estudiantes').insert({
        idUsuario: id,
        codigoEstudiante: codigo,
        fechaIngreso: hoy,
        estado: 'Activo',
      })
    }
  }
}

/**
 * Rechaza y elimina un usuario pendiente de la tabla public.usuario.
 * Usa cliente admin para bypassear RLS.
 */
export async function rechazarUsuarioAction(id: number): Promise<void> {
  return deleteUsuarioAction(id)
}

/**
 * Elimina un usuario de public.usuario Y de Supabase Auth.
 * Usa cliente admin para bypassear RLS y poder borrar de auth.users.
 */
export async function deleteUsuarioAction(id: number): Promise<void> {
  const supabase = createAdminClient()

  // 1. Obtener auth_id antes de borrar
  const { data: usuario } = await supabase
    .from('usuario')
    .select('auth_id')
    .eq('idUsuario', id)
    .single()

  // 2. Eliminar de public.usuario
  const { error } = await supabase
    .from('usuario')
    .delete()
    .eq('idUsuario', id)

  if (error) throw new Error(error.message)

  // 3. Eliminar de Supabase Auth si tiene cuenta vinculada
  if (usuario?.auth_id) {
    await supabase.auth.admin.deleteUser(usuario.auth_id)
  }
}
