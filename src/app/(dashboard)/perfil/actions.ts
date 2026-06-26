'use server'

import { cookies } from 'next/headers'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

async function getToken(): Promise<string | null> {
  const store = await cookies()
  return store.get('eys_access')?.value ?? null
}

/**
 * Convierte el `detail` de un error del backend en un texto legible. FastAPI
 * devuelve `detail` como string (errores de negocio) o como ARRAY de objetos
 * `{loc, msg, type}` en los 422 de validación; sin esto, `new Error(array)`
 * producía "[object Object],[object Object]" en la UI.
 */
function formatDetail(detail: unknown, status: number): string {
  if (typeof detail === 'string' && detail) return detail
  if (Array.isArray(detail)) {
    const msgs = detail
      .map(d => (d && typeof d === 'object' && 'msg' in d ? String((d as { msg: unknown }).msg) : ''))
      .filter(Boolean)
    if (msgs.length) return msgs.join('. ')
  }
  return `HTTP ${status}`
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
    throw new Error(formatDetail((body as Record<string, unknown>).detail, res.status))
  }
  if (res.status === 204) return null as T
  return res.json() as Promise<T>
}

export async function serverEnsureEstudiante(idUsuario: number): Promise<number> {
  // El estudiante NO puede listar /estudiantes (admin/docente); su fila propia se
  // obtiene con /estudiantes/me. Si aún no existe (404), se crea abajo.
  try {
    const me = await apiFetch<Record<string, unknown>>(`/estudiantes/me`)
    if (me?.idEstudiante) return me.idEstudiante as number
  } catch {
    /* sin fila de estudiante todavía → se crea a continuación */
  }

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

export async function serverUpdatePassword(
  idUsuario: number,
  password: string
): Promise<void> {
  await apiFetch(`/usuarios/${idUsuario}`, {
    method: 'PUT',
    body: JSON.stringify({ password }),
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
  payload: { idUsuario: number; cargo: string; nivelAcceso: string; fechaAsignacion: string }
): Promise<void> {
  // El PUT del backend usa el schema de creación (todos los campos requeridos),
  // por eso se reenvían id_usuario y fecha_asignacion además de cargo/nivel.
  await apiFetch(`/administradores/${idAdministrador}`, {
    method: 'PUT',
    body: JSON.stringify({
      id_usuario:       payload.idUsuario,
      cargo:            payload.cargo,
      nivel_acceso:     payload.nivelAcceso,
      fecha_asignacion: (payload.fechaAsignacion || new Date().toISOString()).slice(0, 10),
    }),
  })
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
  // GET /profesores ignora ?id_usuario (devuelve el primero) → se busca en la lista.
  const lista = await apiFetch<Array<Record<string, unknown>>>(`/profesores?limit=500`)
  const existing = lista.find(p => p.idUsuario === idUsuario)
  if (existing) return existing.idProfesor as number

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
