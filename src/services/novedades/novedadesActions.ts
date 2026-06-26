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

// El nombre del estudiante viene embebido en /estudiantes (join con usuario).
async function fetchEstudiantesConNombre(): Promise<EstudianteOpt[]> {
  type Raw = Record<string, unknown>
  // El nombre viene embebido en /estudiantes (join con usuario en el backend);
  // ya no se consulta /usuarios (directorio completo = solo-admin).
  const estData = await apiFetch<Raw[]>('/estudiantes?limit=500')

  return estData.map(r => {
    const c = toCamel(r) as Raw
    const nombre = [c.primerNombre, c.primerApellido].filter(Boolean).join(' ')
    return {
      idEstudiante:  c.idEstudiante as number,
      nombre:        nombre || `Estudiante #${c.idEstudiante}`,
      codigo:        c.codigoEstudiante as string,
      idCursoActual: (c.idCursoActual as number | null) ?? null,
    } satisfies EstudianteOpt
  })
}

export async function getEstudiantesParaNovedadesAction(): Promise<EstudianteOpt[]> {
  return fetchEstudiantesConNombre()
}

export async function getNovedadesAction(): Promise<Novedad[]> {
  type Raw = Record<string, unknown>
  const [data, estudiantes] = await Promise.all([
    apiFetch<Raw[]>('/novedades?limit=500'),
    fetchEstudiantesConNombre(),
  ])
  const estudiantePorId = new Map(estudiantes.map(e => [e.idEstudiante, e]))
  return data.map(r => {
    const c = toCamel(r) as Raw
    const idEstudiante = c.idEstudiante as number
    const est = estudiantePorId.get(idEstudiante)
    return {
      idNovedad:       c.idNovedad as number,
      fecha:           c.fecha as string,
      descripcion:     c.descripcion as string,
      estado:          c.estado as string,
      accionTomada:    c.accionTomada as string | null,
      fechaResolucion: c.fechaResolucion as string | null,
      idEstudiante,
      idTipoNovedad:   c.idTipoNovedad as number,
      registradoPor:   c.registradoPor as number,
      codigoEstudiante: est?.codigo ?? `EST${String(idEstudiante).padStart(3, '0')}`,
      nombreEstudiante: est?.nombre ?? `Estudiante #${idEstudiante}`,
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
      fecha:           new Date().toISOString().slice(0, 10),
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

export type NovedadesBootstrap = {
  novedades: Novedad[]
  tiposNovedad: TipoNovedad[]
  cursos: CursoOpt[]
  estudiantes: EstudianteOpt[]
}

/**
 * Carga inicial de la página de novedades en UNA sola llamada (en vez de 4 server
 * actions separadas desde el cliente). Internamente las consultas al backend
 * siguen yendo en paralelo.
 */
export async function getNovedadesBootstrapAction(): Promise<NovedadesBootstrap> {
  const [novedades, tiposNovedad, cursos, estudiantes] = await Promise.all([
    getNovedadesAction(),
    getTiposNovedadAction(),
    getCursosParaNovedadesAction(),
    getEstudiantesParaNovedadesAction(),
  ])
  // /novedades no trae el nombre ni la gravedad del tipo: se resuelven contra el
  // catálogo de tipos por idTipoNovedad (si no, las columnas Tipo/Gravedad salen vacías).
  const tipoPorId = new Map(tiposNovedad.map(t => [t.idTipoNovedad, t]))
  const novedadesConTipo = novedades.map(n => {
    const t = tipoPorId.get(n.idTipoNovedad)
    return {
      ...n,
      nombreTipo:    t?.nombreTipo ?? n.nombreTipo,
      nivelGravedad: t?.nivelGravedad ?? n.nivelGravedad,
    }
  })
  return { novedades: novedadesConTipo, tiposNovedad, cursos, estudiantes }
}
