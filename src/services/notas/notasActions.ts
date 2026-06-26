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

function nombreCompleto(c: Record<string, unknown>): string {
  return [c.primerNombre, c.segundoNombre, c.primerApellido, c.segundoApellido]
    .filter(Boolean)
    .join(' ')
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
  // Sin filtro `estado`: el backend lo compara de forma exacta y sensible a
  // mayúsculas (== "Activo"), y el campo no es confiable (puede venir null,
  // "activo", etc.). Usuarios tampoco lo filtra, así que lo pedimos parejo para
  // que todo estudiante visible en Usuarios aparezca también en Notas.
  // El nombre viene embebido en /estudiantes (join con usuario en el backend);
  // ya no se consulta /usuarios (directorio completo = solo-admin).
  const estData = await apiFetch<Raw[]>('/estudiantes?limit=500')

  return estData.map(r => {
    const c = toCamel(r) as Raw
    const idEstudiante = c.idEstudiante as number
    const nombre = nombreCompleto(c)
    return {
      idEstudiante,
      codigoEstudiante: c.codigoEstudiante as string,
      idCursoActual:    (c.idCursoActual as number | null) ?? null,
      nombre:           nombre || `Estudiante #${idEstudiante}`,
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
  // Sin filtro `activo`: un estudiante puede estar asignado a un curso marcado
  // inactivo; si no lo listamos, su curso no aparece en el desplegable y el
  // estudiante queda inaccesible. Usuarios tampoco lo filtra (paridad total).
  const data = await apiFetch<Raw[]>('/cursos?limit=200')
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

export type NotasBootstrap = {
  notas: Awaited<ReturnType<typeof getNotasAction>>
  estudiantes: Awaited<ReturnType<typeof getEstudiantesAction>>
  materias: Awaited<ReturnType<typeof getMateriasAction>>
  cursos: Awaited<ReturnType<typeof getCursosAction>>
}

/**
 * Carga inicial de la página de notas en UNA sola llamada (en vez de 4 server
 * actions separadas desde el cliente). Internamente las cuatro consultas al
 * backend siguen yendo en paralelo.
 */
export async function getNotasBootstrapAction(): Promise<NotasBootstrap> {
  const [notas, estudiantes, materias, cursos] = await Promise.all([
    getNotasAction(),
    getEstudiantesAction(),
    getMateriasAction(),
    getCursosAction(),
  ])
  return { notas, estudiantes, materias, cursos }
}
