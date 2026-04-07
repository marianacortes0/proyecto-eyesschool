'use server'

import { createClient } from '../services/supabase/server'
import { redirect } from 'next/navigation'

export async function login(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  if (!email || !password) {
    return { error: 'Por favor, ingresa el correo y la contraseña' }
  }

  const supabase = await createClient()

  // 1. Iniciar sesión usando Supabase Auth (verifica contraseñas)
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  // Revisar si hubo error en las credenciales
  if (authError || !authData.user) {
    return { error: authError?.message ?? 'Credenciales inválidas, intenta nuevamente.' }
  }

  // 2. Consultar la tabla "usuario" usando el email
  const { data: userData, error: userError } = await supabase
    .from('usuario')
    .select('idRol')
    .eq('correo', email)
    .single()

  if (userError || !userData) {
    console.error("Error obteniendo idRol:", userError)
    redirect('/admin')
  }
  // 2. Leer idRol directo del JWT — ya fue guardado en user_metadata al registrarse
  const idRol = authData.user.user_metadata?.idRol as number | undefined

  // 3. Redirección basada en idRol: admin → /admin, resto → /general
  if (idRol === 1) {
    redirect('/admin')
  }
  redirect('/general')
}

export async function forgotPassword(prevState: any, formData: FormData) {
  const email = formData.get('email') as string

  if (!email) {
    return { error: 'Por favor, ingresa tu correo electrónico.' }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
  })

  if (error) {
    console.error('Error enviando correo de recuperación:', error)
    return { error: 'No se pudo enviar el correo. Verifica que el correo esté registrado.' }
  }

  return { success: 'Correo enviado. Revisa tu bandeja de entrada para restablecer tu contraseña.' }
}

export async function resetPassword(prevState: any, formData: FormData) {
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!password || !confirmPassword) {
    return { error: 'Por favor completa todos los campos.' }
  }

  if (password.length < 8) {
    return { error: 'La contraseña debe tener al menos 8 caracteres.' }
  }

  if (password !== confirmPassword) {
    return { error: 'Las contraseñas no coinciden.' }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return { error: 'No se pudo actualizar la contraseña. El enlace puede haber expirado.' }
  }

  return { success: 'Contraseña actualizada correctamente. Ahora puedes iniciar sesión.' }
}

const ROL_TEXT: Record<number, string> = {
  1: 'Administrador',
  2: 'Profesor',
  3: 'Estudiante',
  4: 'Padre',
}

export async function register(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string
  const docType = formData.get('docType') as string
  const docNumber = formData.get('docNumber') as string
  const roleId = parseInt(formData.get('roleId') as string)

  if (!email || !password || !firstName || !lastName || !docType || !docNumber || !roleId) {
    return { error: 'Por favor, completa todos los campos' }
  }

  const rolText = ROL_TEXT[roleId]
  if (!rolText) {
    return { error: 'Rol inválido.' }
  }

  const supabase = await createClient()

  const headersList = await (await import('next/headers')).headers()
  const currentOrigin = headersList.get('origin')

  // 1. Registrar en Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${currentOrigin}/auth/confirm`,
      data: {
        primerNombre: firstName,
        primerApellido: lastName,
        // Almacenar tanto el número (idRol) como el texto (rol) para que el
        // custom_access_token_hook y mapRolToKey() tengan ambas fuentes
        idRol: roleId,
        rol: rolText,
        tipoDocumento: docType,
        numeroDocumento: docNumber
      }
    }
  })

  if (authError) {
    return { error: `Error en el registro: ${authError.message}` }
  }

  // 2. Insertar en la tabla "usuario" con auth_id para que el custom_access_token_hook
  //    pueda relacionar el JWT con el rol del usuario
  const { error: dbError } = await supabase
    .from('usuario')
    .insert({
      correo: email,
      password: password,
      primerNombre: firstName,
      primerApellido: lastName,
      numeroDocumento: docNumber,
      tipoDocumento: docType,
      idRol: roleId,
      auth_id: authData.user?.id ?? null,
      estado: true
    })

  if (dbError) {
    console.error("Error insertando en tabla usuario:", dbError)
  }

  redirect('/login?registered=true')
}
