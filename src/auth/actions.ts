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
    return { error: 'Credenciales inválidas, intenta nuevamente.' }
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

  // 3. Redirección basada en idRol
  switch (userData.idRol) {
    case 1:
      redirect('/admin')
    case 2:
      redirect('/teacher')
    case 3:
      redirect('/student')
    case 4:
      redirect('/parents')
    default:
      redirect('/dashboard')
  }
}

export async function forgotPassword(prevState: any, formData: FormData) {
  const email = formData.get('email') as string

  if (!email) {
    return { error: 'Por favor, ingresa tu correo electrónico.' }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/pages/reset-password`,
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
        idRol: roleId,
        tipoDocumento: docType,
        numeroDocumento: docNumber
      }
    }
  })

  if (authError) {
    return { error: `Error en el registro: ${authError.message}` }
  }

  // 2. Insertar en la tabla "usuario" manualmente 
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
      estado: true
    })

  if (dbError) {
    console.error("Error insertando en tabla usuario:", dbError)
  }

  redirect('/login?registered=true')
}
