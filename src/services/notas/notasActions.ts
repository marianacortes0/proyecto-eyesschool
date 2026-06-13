'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import type { Nota } from './notasService'

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

export async function createNotaAction(
  payload: Pick<Nota, 'idEstudiante' | 'idMateria' | 'idPeriodo' | 'nota' | 'observacion' | 'registradoPor'>
) {
  await apiFetch('/notas', {
    method: 'POST',
    body: JSON.stringify({
      id_estudiante:  payload.idEstudiante,
      id_materia:     payload.idMateria,
      id_periodo:     payload.idPeriodo,
      nota:           payload.nota,
      observacion:    payload.observacion ?? null,
      registrado_por: payload.registradoPor,
    }),
  })
  revalidatePath('/notas')
}

export async function getNotasAction(): Promise<Nota[]> {
  type Raw = Record<string, unknown>
  const data = await apiFetch<Raw[]>('/notas?limit=500')
  return data.map(r => {
    const c = toCamel(r) as Raw
    return {
      idNota:          c.idNota as number,
      nota:            Number(c.nota),
      observacion:     c.observacion as string | null,
      fechaRegistro:   c.fechaRegistro as string,
      idEstudiante:    c.idEstudiante as number,
      idMateria:       c.idMateria as number,
      idPeriodo:       c.idPeriodo as number,
      registradoPor:   c.registradoPor as number,
      codigoEstudiante: `EST${String(c.idEstudiante).padStart(3, '0')}`,
      nombreEstudiante: `Estudiante #${c.idEstudiante}`,
      nombreMateria:    `Materia #${c.idMateria}`,
    } satisfies Nota
  })
}

export async function getEstudiantesAction() {
  type Raw = Record<string, unknown>
  const data = await apiFetch<Raw[]>('/estudiantes?estado=Activo&limit=500')
  return data.map(r => {
    const c = toCamel(r) as Raw
    return {
      idEstudiante:     c.idEstudiante as number,
      codigoEstudiante: c.codigoEstudiante as string,
      idCursoActual:    (c.idCursoActual as number | null) ?? null,
      nombre:           `Estudiante #${c.idEstudiante}`,
    }
  })
}

export async function getMateriasAction() {
  type Raw = Record<string, unknown>
  const data = await apiFetch<Raw[]>('/materias?activa=true&limit=200')
  return data.map(r => {
    const c = toCamel(r) as Raw
    return {
      idMateria:    c.idMateria as number,
      nombreMateria: c.nombreMateria as string,
    }
  })
}

export async function getCursosAction() {
  type Raw = Record<string, unknown>
  const data = await apiFetch<Raw[]>('/cursos?activo=true&limit=200')
  return data.map(r => {
    const c = toCamel(r) as Raw
    return {
      idCurso:     c.idCurso as number,
      nombreCurso: c.nombreCurso as string,
      grado:       c.grado as string,
      jornada:     c.jornada as string,
    }
  })
}
