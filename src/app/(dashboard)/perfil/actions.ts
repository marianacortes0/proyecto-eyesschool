'use server'

import { cookies } from 'next/headers'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

async function getToken(): Promise<string | null> {
  const store = await cookies()
  return store.get('eys_access')?.value ?? null
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken()
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers as Record<string, string> | undefined),
    },
    cache: 'no-store',
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error((body as Record<string, unknown>).detail as string ?? `HTTP ${res.status}`)
  }
  if (res.status === 204) return null as T
  return res.json() as Promise<T>
}

export async function serverEnsureEstudiante(idUsuario: number): Promise<number> {
  const existing = await apiFetch<Array<Record<string, unknown>>>(`/estudiantes?id_usuario=${idUsuario}&limit=1`)
  if (existing.length > 0) return existing[0].idEstudiante as number

  const hoy = new Date().toISOString().slice(0, 10)
  const codigo = `EST${String(idUsuario).padStart(3, '0')}`
  const created = await apiFetch<Record<string, unknown>>('/estudiantes', {
    method: 'POST',
    body: JSON.stringify({
      id_usuario:        idUsuario,
      codigo_estudiante: codigo,
      fecha_ingreso:     hoy,
      estado:            'Activo',
    }),
  })
  return created.idEstudiante as number
}

export async function serverUpdateEstudianteCurso(idEstudiante: number, idCurso: number): Promise<void> {
  await apiFetch(`/estudiantes/${idEstudiante}`, {
    method: 'PUT',
    body: JSON.stringify({ id_curso_actual: idCurso }),
  })
}

export async function serverUpsertEPS(
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

export async function serverUpdateUsuario(
  idUsuario: number,
  payload: Record<string, string | null>
): Promise<void> {
  // Convert camelCase keys to snake_case
  const body: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(payload)) {
    const snake = k.replace(/([A-Z])/g, '_$1').toLowerCase()
    body[snake] = v
  }
  await apiFetch(`/usuarios/${idUsuario}`, { method: 'PUT', body: JSON.stringify(body) })
}

export async function serverUpdateAdministrador(
  idAdministrador: number,
  payload: { cargo?: string; nivelAcceso?: string }
): Promise<void> {
  const body: Record<string, unknown> = {}
  if (payload.cargo        !== undefined) body.cargo        = payload.cargo
  if (payload.nivelAcceso  !== undefined) body.nivel_acceso = payload.nivelAcceso
  await apiFetch(`/administradores/${idAdministrador}`, { method: 'PUT', body: JSON.stringify(body) })
}

export async function serverInsertAdministrador(
  idUsuario: number,
  payload: { cargo: string; nivelAcceso: string }
): Promise<{ idAdministrador: number; cargo: string; nivelAcceso: string; estado: string; fechaAsignacion: string }> {
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

export async function serverUpdateProfesor(
  idProfesor: number,
  payload: { titulo?: string; nivelEstudios?: string }
): Promise<void> {
  const body: Record<string, unknown> = {}
  if (payload.titulo        !== undefined) body.titulo         = payload.titulo
  if (payload.nivelEstudios !== undefined) body.nivel_estudios = payload.nivelEstudios
  await apiFetch(`/profesores/${idProfesor}`, { method: 'PUT', body: JSON.stringify(body) })
}

export async function serverEnsureProfesor(idUsuario: number): Promise<number> {
  const existing = await apiFetch<Array<Record<string, unknown>>>(`/profesores?id_usuario=${idUsuario}&limit=1`)
  if (existing.length > 0) return existing[0].idProfesor as number

  const hoy = new Date().toISOString().slice(0, 10)
  const codigo = `PROF${String(idUsuario).padStart(3, '0')}`
  const created = await apiFetch<Record<string, unknown>>('/profesores', {
    method: 'POST',
    body: JSON.stringify({
      id_usuario:        idUsuario,
      codigo_profesor:   codigo,
      titulo:            'Pendiente',
      nivel_estudios:    'Pendiente',
      fecha_vinculacion: hoy,
      estado:            'Activo',
    }),
  })
  return created.idProfesor as number
}

export async function serverAddEspecializacion(
  idProfesor: number,
  idEspecializacion: number,
  institucion: string
): Promise<void> {
  await apiFetch(`/profesores/${idProfesor}/especializaciones`, {
    method: 'POST',
    body: JSON.stringify({ id_especializacion: idEspecializacion, institucion }),
  })
}

export async function serverRemoveEspecializacion(
  idProfesor: number,
  idEspecializacion: number
): Promise<void> {
  await apiFetch(`/profesores/${idProfesor}/especializaciones/${idEspecializacion}`, {
    method: 'DELETE',
  })
}

export async function serverBuscarEstudiantePorDocumento(
  numeroDocumento: string
): Promise<{ idEstudiante: number; nombre: string; documento: string } | null> {
  try {
    const usuarios = await apiFetch<Array<Record<string, unknown>>>(`/usuarios?numero_documento=${encodeURIComponent(numeroDocumento)}&limit=1`)
    if (!usuarios.length) return null
    const u = usuarios[0]
    const students = await apiFetch<Array<Record<string, unknown>>>(`/estudiantes?id_usuario=${u.idUsuario}&limit=1`)
    if (!students.length) return null
    return {
      idEstudiante: students[0].idEstudiante as number,
      nombre: `${u.primerNombre} ${u.primerApellido}`,
      documento: u.numeroDocumento as string,
    }
  } catch {
    return null
  }
}

export async function serverUpsertPadre(
  idUsuario: number,
  idEstudiante: number,
  parentesco: string,
  ocupacion: string | null
): Promise<void> {
  const existing = await apiFetch<Array<Record<string, unknown>>>(`/padres?id_usuario=${idUsuario}&limit=1`).catch(() => [])
  if (existing.length > 0) {
    await apiFetch(`/padres/${existing[0].idPadre}`, {
      method: 'PUT',
      body: JSON.stringify({ id_estudiante: idEstudiante, parentesco, ocupacion }),
    })
  } else {
    await apiFetch('/padres', {
      method: 'POST',
      body: JSON.stringify({ id_usuario: idUsuario, id_estudiante: idEstudiante, parentesco, ocupacion }),
    })
  }
}
