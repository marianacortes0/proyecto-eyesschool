'use server'

import { cookies } from 'next/headers'
import type { CursoOpt, EstudianteOpt, Novedad, TipoNovedad } from './novedadesService'

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

export async function getCursosParaNovedadesAction(): Promise<CursoOpt[]> {
  type Raw = Record<string, unknown>
  const data = await apiFetch<Raw[]>('/cursos?activo=true&limit=200')
  return data.map(r => {
    const c = toCamel(r) as Raw
    return {
      idCurso:     c.idCurso as number,
      nombreCurso: c.nombreCurso as string,
      grado:       c.grado as string,
      jornada:     c.jornada as string,
    } satisfies CursoOpt
  })
}

export async function getEstudiantesParaNovedadesAction(): Promise<EstudianteOpt[]> {
  type Raw = Record<string, unknown>
  const data = await apiFetch<Raw[]>('/estudiantes?limit=500')
  return data.map(r => {
    const c = toCamel(r) as Raw
    return {
      idEstudiante:  c.idEstudiante as number,
      nombre:        `Estudiante #${c.idEstudiante}`,
      codigo:        c.codigoEstudiante as string,
      idCursoActual: (c.idCursoActual as number | null) ?? null,
    } satisfies EstudianteOpt
  })
}

export async function getNovedadesAction(): Promise<Novedad[]> {
  type Raw = Record<string, unknown>
  const data = await apiFetch<Raw[]>('/novedades?limit=500')
  return data.map(r => {
    const c = toCamel(r) as Raw
    return {
      idNovedad:       c.idNovedad as number,
      fecha:           c.fecha as string,
      descripcion:     c.descripcion as string,
      estado:          c.estado as string,
      accionTomada:    c.accionTomada as string | null,
      fechaResolucion: c.fechaResolucion as string | null,
      idEstudiante:    c.idEstudiante as number,
      idTipoNovedad:   c.idTipoNovedad as number,
      registradoPor:   c.registradoPor as number,
      codigoEstudiante: `EST${String(c.idEstudiante).padStart(3, '0')}`,
      nombreEstudiante: `Estudiante #${c.idEstudiante}`,
      nombreTipo:       '',
      nivelGravedad:    '',
    } satisfies Novedad
  })
}

export async function getTiposNovedadAction(): Promise<TipoNovedad[]> {
  type Raw = Record<string, unknown>
  const data = await apiFetch<Raw[]>('/tipos-novedad?limit=200')
  return data.map(r => {
    const c = toCamel(r) as Raw
    return {
      idTipoNovedad:   c.idTipoNovedad as number,
      nombreTipo:      c.nombreTipo as string,
      nivelGravedad:   c.nivelGravedad as string,
      requiereAccion:  c.requiereAccion as boolean,
      activo:          c.activo as boolean,
    } satisfies TipoNovedad
  })
}

export async function createNovedadAction(
  payload: Pick<Novedad, 'descripcion' | 'idEstudiante' | 'idTipoNovedad' | 'registradoPor'>
) {
  await apiFetch('/novedades', {
    method: 'POST',
    body: JSON.stringify({
      descripcion:     payload.descripcion,
      id_estudiante:   payload.idEstudiante,
      id_tipo_novedad: payload.idTipoNovedad,
      registrado_por:  payload.registradoPor,
      estado:          'Pendiente',
    }),
  })
}

export async function updateNovedadAction(
  idNovedad: number,
  payload: Partial<Pick<Novedad, 'descripcion' | 'estado' | 'accionTomada' | 'fechaResolucion' | 'idTipoNovedad'>>
) {
  const body: Record<string, unknown> = {}
  if (payload.descripcion     !== undefined) body.descripcion      = payload.descripcion
  if (payload.estado          !== undefined) body.estado           = payload.estado
  if (payload.accionTomada    !== undefined) body.accion_tomada    = payload.accionTomada
  if (payload.fechaResolucion !== undefined) body.fecha_resolucion = payload.fechaResolucion
  if (payload.idTipoNovedad   !== undefined) body.id_tipo_novedad  = payload.idTipoNovedad
  await apiFetch(`/novedades/${idNovedad}`, { method: 'PUT', body: JSON.stringify(body) })
}

export async function deleteNovedadAction(idNovedad: number) {
  await apiFetch(`/novedades/${idNovedad}`, { method: 'DELETE' })
}
