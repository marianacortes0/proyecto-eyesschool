'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import type {
  CreateRegistroData,
  RegistroAsistencia,
  EstudianteSelector,
  FiltrosAsistencia,
} from './asistenciaService'

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

function toCamelKey(k: string): string {
  return k.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase())
}

function toCamel(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(toCamel)
  if (v !== null && typeof v === 'object') {
    return Object.fromEntries(
      Object.entries(v as Record<string, unknown>).map(([k, val]) => [toCamelKey(k), toCamel(val)])
    )
  }
  return v
}

export async function crearRegistroAction(data: CreateRegistroData): Promise<void> {
  await apiFetch('/asistencia', {
    method: 'POST',
    body: JSON.stringify({
      id_estudiante:  data.idEstudiante,
      estado:         data.estado,
      fecha:          data.fecha,
      observacion:    data.observacion ?? null,
      registrado_por: data.registradoPor,
      tipo:           data.tipo ?? null,
    }),
  })
  revalidatePath('/qr/escanear')
  revalidatePath('/asistencia')
}

export async function getRegistrosAction(filtros: FiltrosAsistencia = {}): Promise<RegistroAsistencia[]> {
  type Raw = Record<string, unknown>
  let data: Raw[]

  if (filtros.idEstudiante) {
    const params = new URLSearchParams({ limit: '200' })
    if (filtros.fecha) params.set('fecha', filtros.fecha)
    data = await apiFetch<Raw[]>(`/estudiantes/${filtros.idEstudiante}/asistencia?${params}`)
  } else {
    const params = new URLSearchParams({ limit: '200' })
    if (filtros.fecha) params.set('fecha', filtros.fecha)
    if (filtros.estado && filtros.estado !== 'todos') params.set('estado', filtros.estado)
    data = await apiFetch<Raw[]>(`/asistencia?${params}`)
  }

  const result = (data as Raw[]).map(r => {
    const c = toCamel(r) as Raw
    return {
      idAsistencia:     c.idAsistencia as number,
      idEstudiante:     c.idEstudiante as number,
      estado:           c.estado as RegistroAsistencia['estado'],
      fecha:            c.fecha as string,
      fechaRegistro:    c.fechaRegistro as string,
      observacion:      c.observacion as string | null,
      registradoPor:    c.registradoPor as number,
      nombreEstudiante: '—',
      codigoEstudiante: '—',
      curso:            null,
      codigo_qr:        c.codigoQr as string | null ?? c.codigo_qr as string | null ?? null,
      tipo:             c.tipo as string | null,
    } satisfies RegistroAsistencia
  })

  if (filtros.search) {
    const q = filtros.search.toLowerCase()
    return result.filter(r =>
      r.nombreEstudiante.toLowerCase().includes(q) ||
      r.codigoEstudiante.toLowerCase().includes(q)
    )
  }
  return result
}

export async function getEstudiantesSelectorAction(): Promise<EstudianteSelector[]> {
  type Raw = Record<string, unknown>
  const data = await apiFetch<Raw[]>('/estudiantes?estado=Activo&limit=500')
  return data.map(e => {
    const c = toCamel(e) as Raw
    return {
      idEstudiante:     c.idEstudiante as number,
      codigoEstudiante: c.codigoEstudiante as string,
      nombreCompleto:   '—',
      curso:            null,
      jornada:          null,
    } satisfies EstudianteSelector
  })
}
