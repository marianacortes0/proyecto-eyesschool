'use server'

import { createClient } from '../../../utils/supabase/server'
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
    // Redirección por defecto si ocurre un error y no podemos determinar el rol
    redirect('/dashboard')
  }

  // 3. Redirección basada en idRol
  // IMPORTANTE: Ajusta qué número de idRol representa a cada usuario exactamente
  switch (userData.idRol) {
    case 1: // Asumiendo que 1 es Administrador
      redirect('/admin')
    case 2: // Asumiendo que 2 es Profesor
      redirect('/teacher')
    case 3: // Asumiendo que 3 es Estudiante
      redirect('/student')
    case 4: // Asumiendo que 4 es Padres
      redirect('/parents')
    default:
      redirect('/dashboard') // Fallback
  }
}
