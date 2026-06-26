'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { mapRolToKey } from '@/lib/utils/permissions'
import { isPasswordValid } from '@/lib/utils/password'

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
  const email = (formData.get('email') as string)?.trim().toLowerCase()
  if (!email) return { error: 'Por favor, ingresa tu correo electrónico.' }

  // El backend nunca revela si el correo existe; si existe, envía el enlace por correo.
  // Ignoramos errores de red para no filtrar información ni romper el mensaje neutro.
  try {
    await fetch(`${API}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo: email }),
      cache: 'no-store',
    })
  } catch {
    // no-op
  }

  return { success: 'Si tu correo está registrado, recibirás un enlace para restablecer tu contraseña.' }
}

// ── Reset password ────────────────────────────────────────────────────────────

export async function resetPassword(prevState: unknown, formData: FormData) {
  const token = (formData.get('token') as string) ?? ''
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!token) return { error: 'Enlace inválido o incompleto. Solicita uno nuevo.' }
  if (!password || !confirmPassword) return { error: 'Por favor completa todos los campos.' }
  if (password.length < 8) return { error: 'La contraseña debe tener al menos 8 caracteres.' }
  if (password !== confirmPassword) return { error: 'Las contraseñas no coinciden.' }

  const res = await fetch(`${API}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, new_password: password }),
    cache: 'no-store',
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    return {
      error: (body as Record<string, unknown>).detail as string
        ?? 'No se pudo restablecer la contraseña. El enlace pudo expirar.',
    }
  }

  return { success: 'Tu contraseña fue actualizada. Ya puedes iniciar sesión.' }
}

// ── Register ──────────────────────────────────────────────────────────────────

const ROL_LABEL: Record<number, string> = {
  1: 'Profesor', 2: 'Estudiante', 3: 'Administrador', 4: 'Padre / Acudiente',
}

export async function register(prevState: unknown, formData: FormData) {
  const email = (formData.get('email') as string)?.trim().toLowerCase() ?? ''
  const password = formData.get('password') as string
  const firstName = (formData.get('firstName') as string)?.trim() ?? ''
  const secondName = (formData.get('secondName') as string)?.trim() ?? ''
  const lastName = (formData.get('lastName') as string)?.trim() ?? ''
  const secondLastName = (formData.get('secondLastName') as string)?.trim() ?? ''
  const docType = formData.get('docType') as string
  const docNumber = (formData.get('docNumber') as string)?.trim() ?? ''
  const genero = (formData.get('genero') as string) || null
  const direccion = (formData.get('direccion') as string)?.trim() || null
  const telefono = (formData.get('telefono') as string)?.trim() || null
  const roleId = parseInt(formData.get('roleId') as string)
  const courseId = formData.get('courseId') as string | null
  const especializacionId = formData.get('especializacionId') as string | null
  const institucion = (formData.get('institucion') as string)?.trim() || null
  const parentesco = (formData.get('parentesco') as string) || null
  const idEstudianteVinculado = formData.get('idEstudianteVinculado') as string | null
  const cargo = (formData.get('cargo') as string) || null

  // Validaciones comunes
  if (!email || !password || !firstName || !lastName || !docType || !docNumber || isNaN(roleId)) {
    return { error: 'Por favor, completa todos los campos' }
  }
  if (!isPasswordValid(password)) {
    return { error: 'La contraseña debe tener mínimo 8 caracteres, mayúscula, minúscula, número y carácter especial.' }
  }

  // Validaciones por rol + campos específicos
  const especifico: Record<string, unknown> = {}
  if (roleId === 2) {
    if (!courseId) return { error: 'Selecciona el curso al que perteneces' }
    especifico.id_curso_actual = parseInt(courseId)
  } else if (roleId === 4) {
    if (!idEstudianteVinculado) return { error: 'Ingresa el ID del estudiante vinculado' }
    if (!parentesco) return { error: 'Selecciona el parentesco' }
    especifico.id_estudiante_vinculado = parseInt(idEstudianteVinculado)
    especifico.parentesco = parentesco
  } else if (roleId === 1) {
    if (!especializacionId) return { error: 'Selecciona tu especialización' }
    especifico.id_especializacion = parseInt(especializacionId)
    if (institucion) especifico.institucion = institucion
  } else if (roleId === 3) {
    if (!cargo) return { error: 'Selecciona tu cargo' }
    especifico.cargo = cargo
  } else {
    return { error: 'Rol inválido.' }
  }

  const res = await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      correo: email,
      password,
      primer_nombre: firstName,
      segundo_nombre: secondName || null,
      primer_apellido: lastName,
      segundo_apellido: secondLastName || null,
      tipo_documento: docType,
      numero_documento: docNumber,
      genero,
      direccion,
      telefono,
      id_rol: roleId,
      ...especifico,
    }),
    cache: 'no-store',
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const detail = (body as Record<string, unknown>).detail
    const motivo = typeof detail === 'string' ? detail : 'No se pudo completar el registro.'
    return { error: `Error al registrar el usuario: ${motivo}` }
  }

  // Admin (3) y Profesor (1) requieren aprobación; Estudiante (2) y Padre (4) no.
  const requiereAprobacion = roleId === 1 || roleId === 3
  const rolLabel = ROL_LABEL[roleId] ?? 'usuario'
  if (requiereAprobacion) {
    redirect(`/?login=1&registered=pending&rol=${encodeURIComponent(rolLabel)}`)
  }
  redirect(`/?login=1&registered=true&rol=${encodeURIComponent(rolLabel)}`)
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
