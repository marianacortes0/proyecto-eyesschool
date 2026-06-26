'use server'

import { cookies } from 'next/headers'
import type { Reporte } from './reportesService'

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

export async function getReportesAction(): Promise<Reporte[]> {
  type Raw = Record<string, unknown>
  const data = await apiFetch<Raw[]>('/reportes?limit=500')
  return data.map(r => {
    const c = toCamel(r) as Raw
    return {
      idReporte:       c.idReporte as number,
      nombreReporte:   c.nombreReporte as string,
      tipoReporte:     c.tipoReporte as string,
      estado:          c.estado as string,
      fechaInicio:     c.fechaInicio as string,
      fechaFin:        c.fechaFin as string,
      fechaGeneracion: c.fechaGeneracion as string,
      parametros:      (c.parametros as string) ?? '',
      archivoGenerado: c.archivoGenerado as string | null,
      idAdministrador: c.idAdministrador as number,
    } satisfies Reporte
  })
}

export async function createReporteAction(
  payload: Pick<Reporte, 'nombreReporte' | 'tipoReporte' | 'fechaInicio' | 'fechaFin' | 'parametros' | 'idAdministrador'> & { archivoGenerado?: string | null }
) {
  await apiFetch('/reportes', {
    method: 'POST',
    body: JSON.stringify({
      nombre_reporte:   payload.nombreReporte,
      tipo_reporte:     payload.tipoReporte,
      fecha_inicio:     payload.fechaInicio,
      fecha_fin:        payload.fechaFin,
      id_administrador: payload.idAdministrador,
      parametros:       payload.parametros ?? ' ',
      // archivo_generado es la ruta /static/reportes/... que devolvió POST /reportes/archivo.
      archivo_generado: payload.archivoGenerado ?? null,
    }),
  })
}

export async function updateReporteAction(
  idReporte: number,
  payload: Partial<Pick<Reporte, 'estado' | 'archivoGenerado'>>
) {
  await apiFetch(`/reportes/${idReporte}/estado`, {
    method: 'PATCH',
    body: JSON.stringify({
      estado:           payload.estado ?? 'Pendiente',
      archivo_generado: payload.archivoGenerado ?? null,
    }),
  })
}

export async function deleteReporteAction(idReporte: number) {
  await apiFetch(`/reportes/${idReporte}`, { method: 'DELETE' })
}
