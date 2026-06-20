'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { mapRolToKey } from '@/lib/utils/permissions'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

async function setAuthCookies(accessToken: string, refreshToken: string) {
  // Decode JWT payload to get user info (no crypto verification needed here)
  const part = accessToken.split('.')[1]
  const padded = part + '='.repeat((4 - (part.length % 4)) % 4)
  const payload = JSON.parse(
    Buffer.from(padded.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8')
  ) as Record<string, unknown>

  // Fetch full user profile
  const meRes = await fetch(`${API}/auth/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  })
  const me = meRes.ok ? (await meRes.json()) : {}

  const store = await cookies()

  store.set('eys_access', accessToken, {
    path: '/',
    maxAge: 30 * 60,
    sameSite: 'lax',
    httpOnly: false,
  })
  store.set('eys_refresh', refreshToken, {
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
    sameSite: 'lax',
    httpOnly: true,
  })
  store.set(
    'eys_user',
    JSON.stringify({
      idUsuario: me.id_usuario ?? payload.sub,
      idRol: me.id_rol ?? payload.id_rol,
      nombreRol: me.nombre_rol ?? payload.nombre_rol,
      primerNombre: me.primer_nombre ?? '',
      primerApellido: me.primer_apellido ?? '',
    }),
    { path: '/', maxAge: 7 * 24 * 60 * 60, sameSite: 'lax', httpOnly: false }
  )

  return me
}

// ── Login ─────────────────────────────────────────────────────────────────────

export async function login(prevState: unknown, formData: FormData) {
  const correo = (formData.get('email') as string).trim().toLowerCase()
  const password = formData.get('password') as string

  if (!correo || !password) {
    return { error: 'Por favor, ingresa el correo y la contraseña' }
  }

  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ correo, password }),
    cache: 'no-store',
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    return {
      error: (body as Record<string, unknown>).detail as string
        ?? 'Credenciales inválidas, intenta nuevamente.',
    }
  }

  const { access_token, refresh_token } = (await res.json()) as {
    access_token: string
    refresh_token: string
  }

  const me = await setAuthCookies(access_token, refresh_token)
  const role = mapRolToKey(me.nombre_rol as string, me.id_rol as number)

  if (role === 'admin') redirect('/admin')
  redirect('/general')
}

// ── Logout ────────────────────────────────────────────────────────────────────

export async function logout() {
  const store = await cookies()
  const refresh = store.get('eys_refresh')?.value
  const access = store.get('eys_access')?.value

  if (refresh && access) {
    await fetch(`${API}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${access}`,
      },
      body: JSON.stringify({ refresh_token: refresh }),
      cache: 'no-store',
    }).catch(() => null)
  }

  store.delete('eys_access')
  store.delete('eys_refresh')
  store.delete('eys_user')
  redirect('/')
}

// ── Forgot password ───────────────────────────────────────────────────────────

export async function forgotPassword(prevState: unknown, formData: FormData) {
  const email = formData.get('email') as string
  if (!email) return { error: 'Por favor, ingresa tu correo electrónico.' }
  // Without Supabase, password reset requires backend support (not yet implemented)
  return { success: 'Si tu correo está registrado, recibirás instrucciones pronto.' }
}

// ── Reset password ────────────────────────────────────────────────────────────

export async function resetPassword(prevState: unknown, formData: FormData) {
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!password || !confirmPassword) return { error: 'Por favor completa todos los campos.' }
  if (password.length < 8) return { error: 'La contraseña debe tener al menos 8 caracteres.' }
  if (password !== confirmPassword) return { error: 'Las contraseñas no coinciden.' }

  return { success: 'Operación no disponible en este momento.' }
}

// ── Register ──────────────────────────────────────────────────────────────────

export async function register(prevState: unknown, formData: FormData) {
  const email = (formData.get('email') as string).trim().toLowerCase()
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
  if (roleId === 2 && !courseId) return { error: 'Selecciona el curso al que perteneces' }
  if (roleId === 1 && !especializacionId) return { error: 'Selecciona tu especialización' }

  const ROLES_REQUIEREN_VALIDACION = new Set([1])
  const ROLES_AUTO_VALIDADOS = new Set([2, 4])

  if (!ROLES_REQUIEREN_VALIDACION.has(roleId) && !ROLES_AUTO_VALIDADOS.has(roleId)) {
    return { error: 'Rol inválido.' }
  }

  const idRolFinal = ROLES_AUTO_VALIDADOS.has(roleId) ? roleId : 4
  const estadoFinal = !ROLES_REQUIEREN_VALIDACION.has(roleId)

  const res = await fetch(`${API}/usuarios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      correo: email,
      password,
      primer_nombre: firstName,
      primer_apellido: lastName,
      tipo_documento: docType,
      numero_documento: docNumber,
      id_rol: idRolFinal,
    }),
    cache: 'no-store',
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    return {
      error: (body as Record<string, unknown>).detail as string ?? 'Error al registrar el usuario.',
    }
  }

  const usuario = await res.json()
  const idUsuario: number = usuario.id_usuario

  const hoy = new Date().toISOString().slice(0, 10)

  // Create role-specific record
  if (idRolFinal === 2 && estadoFinal) {
    const codigo = `EST${String(idUsuario).padStart(3, '0')}`
    await fetch(`${API}/estudiantes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_usuario: idUsuario,
        codigo_estudiante: codigo,
        fecha_ingreso: hoy,
        estado: 'Activo',
        id_curso_actual: courseId ? parseInt(courseId) : null,
      }),
      cache: 'no-store',
    }).catch(() => null)
  }

  if (ROLES_REQUIEREN_VALIDACION.has(roleId)) {
    redirect('/?login=1&registered=pending')
  }
  redirect('/?login=1&registered=true')
}

// ── Lookup tables ─────────────────────────────────────────────────────────────

export async function getCursos(): Promise<{ idCurso: number; nombreCurso: string; grado: string; jornada: string }[]> {
  const res = await fetch(`${API}/cursos?activo=true&limit=200`, { cache: 'no-store' })
  if (!res.ok) return []
  const data = await res.json() as Array<Record<string, unknown>>
  return data.map(c => ({
    idCurso: c.id_curso as number,
    nombreCurso: c.nombre_curso as string,
    grado: c.grado as string,
    jornada: c.jornada as string,
  }))
}

export async function getEspecializaciones(): Promise<{ idEspecializacion: number; nombreEspecializacion: string }[]> {
  const res = await fetch(`${API}/especializaciones?activo=true&limit=200`, { cache: 'no-store' })
  if (!res.ok) return []
  const data = await res.json() as Array<Record<string, unknown>>
  return data.map(e => ({
    idEspecializacion: e.id_especializacion as number,
    nombreEspecializacion: e.nombre_especializacion as string,
  }))
}

// ── Assign QR (legacy compat) ─────────────────────────────────────────────────

export async function asignarQR(
  idUsuario: number,
  idCursoActual: number | null
): Promise<{ codigo: string } | { error: string }> {
  const store = await cookies()
  const token = store.get('eys_access')?.value

  // Check if student already exists
  const chkRes = await fetch(`${API}/estudiantes?id_usuario=${idUsuario}&limit=1`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    cache: 'no-store',
  })
  if (chkRes.ok) {
    const existing = await chkRes.json() as unknown[]
    if (existing.length > 0) return { error: 'Este usuario ya tiene un código QR asignado.' }
  }

  const hoy = new Date().toISOString().slice(0, 10)
  const codigo = `EST${String(idUsuario).padStart(3, '0')}`

  const res = await fetch(`${API}/estudiantes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      id_usuario: idUsuario,
      codigo_estudiante: codigo,
      fecha_ingreso: hoy,
      estado: 'Activo',
      id_curso_actual: idCursoActual ?? null,
    }),
    cache: 'no-store',
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    return { error: (body as Record<string, unknown>).detail as string ?? 'Error al asignar QR.' }
  }

  return { codigo }
}
