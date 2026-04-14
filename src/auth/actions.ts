'use server'

import { createClient } from '../services/supabase/server'
import { createAdminClient } from '../services/supabase/admin'
import { redirect } from 'next/navigation'
import { mapRolToKey } from '@/lib/utils/permissions'
import { hashPassword } from '@/lib/utils/hash'

// ── Lookup tables (public) ────────────────────────────────────────────────────

export async function getCursos(): Promise<{ idCurso: number; nombreCurso: string; grado: string; jornada: string }[]> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('cursos')
    .select('idCurso, nombreCurso, grado, jornada')
    .eq('activo', true)
    .order('nombreCurso')
  return (data ?? []) as { idCurso: number; nombreCurso: string; grado: string; jornada: string }[]
}

export async function getEspecializaciones(): Promise<{ idEspecializacion: number; nombreEspecializacion: string }[]> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('especializaciones')
    .select('idEspecializacion, nombreEspecializacion')
    .eq('activo', true)
    .order('nombreEspecializacion')
  return (data ?? []) as { idEspecializacion: number; nombreEspecializacion: string }[]
}

// ── Asignar QR (crear entrada en estudiantes) ─────────────────────────────────

export async function asignarQR(
  idUsuario: number,
  idCursoActual: number | null
): Promise<{ codigo: string } | { error: string }> {
  const admin = createAdminClient()

  // Verificar que no tiene ya un registro
  const { data: existing } = await admin
    .from('estudiantes')
    .select('idEstudiante')
    .eq('idUsuario', idUsuario)
    .maybeSingle()

  if (existing) return { error: 'Este usuario ya tiene un código QR asignado.' }

  // Generar siguiente código
  const { data: all } = await admin.from('estudiantes').select('codigoEstudiante')
  const nums = (all ?? []).map((e) => {
    const m = e.codigoEstudiante.match(/\d+/)
    return m ? parseInt(m[0]) : 0
  })
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1
  const codigo = `EST${String(next).padStart(2, '0')}`

  const { error } = await admin.from('estudiantes').insert({
    idUsuario,
    codigoEstudiante: codigo,
    idCursoActual: idCursoActual ?? null,
    fechaIngreso: new Date().toISOString().split('T')[0],
    estado: 'Activo',
  })

  if (error) return { error: error.message }
  return { codigo }
}

export async function login(prevState: any, formData: FormData) {
  const email = (formData.get('email') as string).trim().toLowerCase()
  const password = formData.get('password') as string
  if (!email || !password) {
    return { error: 'Por favor, ingresa el correo y la contraseña' }
  }

  const supabase = await createClient()

  // 1. Iniciar sesión — Supabase escribe el JWT en las cookies de la respuesta
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (authError || !authData.user) {
    return { error: authError?.message ?? 'Credenciales inválidas, intenta nuevamente.' }
  }

  // 2. Verificar estado y obtener rol desde la BD
  const { data: userData } = await supabase
    .from('usuario')
    .select('idRol, estado')
    .eq('correo', email)
    .single()

  if (!userData) {
    // El registro en public.usuario no existe aún (edge case)
    await supabase.auth.signOut()
    return { error: 'No se encontró el perfil del usuario. Contacta al administrador.' }
  }

  if (!userData.estado) {
    // Cuenta pendiente de validación — cerrar sesión para no dejar el JWT activo
    await supabase.auth.signOut()
    return {
      error: 'Tu cuenta está pendiente de validación por el administrador. Te notificaremos cuando sea aprobada.',
    }
  }

  // 3. Determinar rol: JWT tiene prioridad; BD es la fuente de verdad como respaldo
  const nombreRol =
    (authData.user.app_metadata?.rol as string | undefined) ??
    (authData.user.user_metadata?.rol as string | undefined)

  let role = mapRolToKey(nombreRol, userData.idRol as number | undefined)

  // 4. Redirección basada en rol
  if (role === 'admin') redirect('/admin')
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

// Roles válidos para el formulario público de registro
const ROL_TEXT: Record<number, string> = {
  1: 'Profesor',
  2: 'Estudiante',
  4: 'Padre',
}

// Roles de alto privilegio: requieren validación del administrador
const ROLES_REQUIEREN_VALIDACION = new Set([1]) // Profesor (el admin decide si es Profesor o Administrador)

// Roles de bajo privilegio: se auto-validan al registrarse
const ROLES_AUTO_VALIDADOS = new Set([2, 4]) // Estudiante, Padre

export async function register(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string
  const docType = formData.get('docType') as string
  const docNumber = formData.get('docNumber') as string
  const roleId = parseInt(formData.get('roleId') as string)
  const courseId = formData.get('courseId') as string | null
  const especializacionId = formData.get('especializacionId') as string | null

  if (!email || !password || !firstName || !lastName || !docType || !docNumber || isNaN(roleId)) {
    return { error: 'Por favor, completa todos los campos' }
  }

  if (roleId === 2 && !courseId) {
    return { error: 'Selecciona el curso al que perteneces' }
  }
  if (roleId === 1 && !especializacionId) {
    return { error: 'Selecciona tu especialización' }
  }

  const rolText = ROL_TEXT[roleId]
  if (!rolText) {
    return { error: 'Rol inválido.' }
  }

  // Determinar si necesita validación del admin
  const needsValidation = ROLES_REQUIEREN_VALIDACION.has(roleId)
  const autoValidado = ROLES_AUTO_VALIDADOS.has(roleId)

  if (!needsValidation && !autoValidado) {
    return { error: 'Rol inválido.' }
  }

  const supabase = await createClient()

  const headersList = await (await import('next/headers')).headers()
  const currentOrigin = headersList.get('origin')

  // 1. Registrar en Supabase Auth
  //    Para roles auto-validados, guardamos el rol real en metadata.
  //    Para roles que necesitan validación, guardamos Padre temporalmente.
  const idRolAuth = autoValidado ? roleId : 4
  const rolTextAuth = autoValidado ? rolText : 'Padre'

  const emailNorm = email.trim().toLowerCase()
  const hashedPassword = await hashPassword(password)

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: emailNorm,
    password,
    options: {
      emailRedirectTo: `${currentOrigin}/auth/confirm`,
      data: {
        primerNombre: firstName,
        primerApellido: lastName,
        idRol: idRolAuth,
        rol: rolTextAuth,
        tipoDocumento: docType,
        numeroDocumento: docNumber,
        rolSolicitado: rolText,
        idRolSolicitado: roleId,
        idCursoActual: courseId ? parseInt(courseId) : null,
        idEspecializacion: especializacionId ? parseInt(especializacionId) : null,
      }
    }
  })

  if (authError) {
    return { error: `Error en el registro: ${authError.message}` }
  }

  // 2. Insertar en public.usuario usando cliente admin (bypasea RLS)
  const adminSupabase = createAdminClient()
  const { error: dbError } = await adminSupabase
    .from('usuario')
    .insert({
      correo: emailNorm,
      primerNombre: firstName,
      primerApellido: lastName,
      numeroDocumento: docNumber,
      tipoDocumento: docType,
      idRol: idRolAuth,        // rol real (auto-validados) o Padre temporal (pendientes)
      password: hashedPassword,
      auth_id: authData.user?.id ?? null,
      estado: !needsValidation, // true = activo de inmediato · false = espera validación admin
    })

  if (dbError) {
    console.error('Error insertando en tabla usuario:', dbError)
    return { error: `Error al guardar el usuario: ${dbError.message}` }
  }

  // 3. Redirigir con mensaje apropiado según el tipo de registro
  if (needsValidation) {
    redirect('/login?registered=pending')
  }
  redirect('/login?registered=true')
}
