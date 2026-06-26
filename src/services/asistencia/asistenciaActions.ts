'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import type {
  CreateRegistroData,
  RegistroAsistencia,
  EstudianteSelector,
  CursoOption,
  FiltrosAsistencia,
  EstadoAsistencia,
  TipoAsistencia,
} from './asistenciaService'
import { normalizeEstado, normalizeTipo } from './asistenciaService'

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

export type RegistroMasivoItem = { idEstudiante: number; estado: EstadoAsistencia }

export type RegistroMasivoResult = { ok: number; fail: number; errores: string[] }

/**
 * Registro de asistencia POR LOTES (un curso completo). Postea cada estudiante a
 * /asistencia de forma concurrente y devuelve un resumen — un fallo individual NO
 * aborta el resto del lote. Revalida una sola vez al final.
 */
export async function crearRegistrosMasivoAction(params: {
  items: RegistroMasivoItem[]
  fecha: string
  tipo: TipoAsistencia
  registradoPor: number
  observacion?: string | null
}): Promise<RegistroMasivoResult> {
  const { items, fecha, tipo, registradoPor, observacion } = params

  const resultados = await Promise.allSettled(
    items.map((it) =>
      apiFetch('/asistencia', {
        method: 'POST',
        body: JSON.stringify({
          id_estudiante:  it.idEstudiante,
          estado:         it.estado,
          fecha,
          observacion:    observacion ?? `Registro masivo (${tipo})`,
          registrado_por: registradoPor,
          tipo,
        }),
      })
    )
  )

  const errores = resultados
    .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
    .map((r) => (r.reason instanceof Error ? r.reason.message : 'Error desconocido'))

  revalidatePath('/qr/escanear')
  revalidatePath('/asistencia')

  return { ok: items.length - errores.length, fail: errores.length, errores }
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
      estado:           normalizeEstado(c.estado),
      fecha:            c.fecha as string,
      fechaRegistro:    c.fechaRegistro as string,
      observacion:      c.observacion as string | null,
      registradoPor:    c.registradoPor as number,
      nombreEstudiante: '—',
      codigoEstudiante: '—',
      curso:            null,
      jornada:          null,
      codigo_qr:        c.codigoQr as string | null ?? c.codigo_qr as string | null ?? null,
      tipo:             normalizeTipo(c.tipo),
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

function nombreDeUsuario(u: Record<string, unknown>): string {
  const nombre = [u.primerNombre, u.segundoNombre, u.primerApellido, u.segundoApellido]
    .filter(Boolean)
    .join(' ')
  return nombre || '—'
}

export async function getEstudiantesSelectorAction(): Promise<EstudianteSelector[]> {
  type Raw = Record<string, unknown>
  // El nombre viene embebido en /estudiantes (join con usuario en el backend);
  // ya no se consulta /usuarios (directorio completo = solo-admin).
  const estData = await apiFetch<Raw[]>('/estudiantes?estado=Activo&limit=500')

  return estData.map(e => {
    const c = toCamel(e) as Raw
    return {
      idEstudiante:     c.idEstudiante as number,
      codigoEstudiante: c.codigoEstudiante as string,
      nombreCompleto:   nombreDeUsuario(c),
      curso:            null,
      jornada:          null,
      idCurso:          (c.idCursoActual as number | null) ?? null,
    } satisfies EstudianteSelector
  })
}

export async function getCursosAction(): Promise<CursoOption[]> {
  type Raw = Record<string, unknown>
  const data = await apiFetch<Raw[]>('/cursos?activo=true&limit=200')
  return data.map(c => {
    const x = toCamel(c) as Raw
    return {
      idCurso:     x.idCurso as number,
      nombreCurso: x.nombreCurso as string,
      jornada:     (x.jornada as string | null) ?? null,
    } satisfies CursoOption
  })
}

export type AsistenciaBootstrap = {
  registros: RegistroAsistencia[]
  estudiantes: EstudianteSelector[]
  cursos: CursoOption[]
}

/**
 * Carga inicial de la página de asistencia en UNA sola llamada (en vez de 3 server
 * actions separadas desde el cliente). Recibe los filtros iniciales (la fecha de
 * hoy se calcula en el servidor) para traer los registros del día.
 */
export async function getAsistenciaBootstrapAction(
  filtros: FiltrosAsistencia = {}
): Promise<AsistenciaBootstrap> {
  // Los registros son lo esencial; estudiantes y cursos solo enriquecen (nombre,
  // curso, jornada). Si un catálogo falla por permisos no debe tumbar la página:
  // se degrada a lista vacía y la tabla muestra los registros igualmente.
  const [registrosRes, estudiantesRes, cursosRes] = await Promise.allSettled([
    getRegistrosAction(filtros),
    getEstudiantesSelectorAction(),
    getCursosAction(),
  ])
  if (registrosRes.status === 'rejected') throw registrosRes.reason
  return {
    registros:   registrosRes.value,
    estudiantes: estudiantesRes.status === 'fulfilled' ? estudiantesRes.value : [],
    cursos:      cursosRes.status === 'fulfilled' ? cursosRes.value : [],
  }
}
