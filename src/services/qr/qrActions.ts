'use server'

import { cookies } from 'next/headers'
import type {
  RegistroAsistencia,
  EstudianteQR,
  CodigoQRConEstudiante,
  CreateAsistenciaData,
  TipoQR,
} from './qrService'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

async function getToken(): Promise<string | null> {
  const store = await cookies()
  return store.get('eys_access')?.value ?? null
}

// El backend responde en snake_case (p. ej. id_estudiante, id_usuario,
// primer_nombre). Convertimos a camelCase como hace el cliente compartido, para
// que el resto de este módulo pueda leer las claves en camelCase.
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
  return toCamel(await res.json()) as T
}

type Raw = Record<string, unknown>

// El nombre del estudiante viene embebido en /estudiantes (join con usuario en el
// backend); ya no se consulta /usuarios (directorio completo = solo-admin). Así el
// escaneo (rol docente) funciona sin acceso al directorio de usuarios.
function nombreDeEstudiante(e: Raw): string {
  return [e.primerNombre, e.segundoNombre, e.primerApellido, e.segundoApellido]
    .filter(Boolean).join(' ')
}

async function infoPorEstudianteMap(): Promise<Map<number, { nombre: string; codigo: string }>> {
  const estData = await apiFetch<Raw[]>('/estudiantes?limit=500')
  const map = new Map<number, { nombre: string; codigo: string }>()
  for (const e of estData) {
    const id = e.idEstudiante as number
    map.set(id, {
      nombre: nombreDeEstudiante(e) || `Estudiante #${id}`,
      codigo: (e.codigoEstudiante as string) ?? `EST${String(id).padStart(3, '0')}`,
    })
  }
  return map
}

export async function getRegistrosAsistenciaAction(fecha?: string): Promise<RegistroAsistencia[]> {
  const params = new URLSearchParams({ limit: '200' })
  if (fecha) params.set('fecha', fecha)
  const [data, infoPorEstudiante] = await Promise.all([
    apiFetch<Raw[]>(`/asistencia?${params}`),
    infoPorEstudianteMap(),
  ])
  return data.map(r => {
    const info = infoPorEstudiante.get(r.idEstudiante as number)
    return {
      idAsistencia:     r.idAsistencia as number,
      idEstudiante:     r.idEstudiante as number,
      estado:           r.estado as RegistroAsistencia['estado'],
      fecha:            r.fecha as string,
      fechaRegistro:    r.fechaRegistro as string,
      observacion:      r.observacion as string | null,
      registradoPor:    r.registradoPor as number,
      nombreEstudiante: info?.nombre ?? '—',
      codigoEstudiante: info?.codigo ?? '—',
      codigo_qr:        (r.codigoQr ?? r.codigo_qr) as string | null,
      tipo:             r.tipo as string | null,
    }
  })
}

export async function getEstudiantesConQRAction(): Promise<EstudianteQR[]> {
  // Todo usuario con rol estudiante tiene su código QR (su codigoEstudiante). Se
  // listan TODOS los estudiantes, sin filtrar por estado, para que no falte ninguno.
  const data = await apiFetch<Raw[]>('/estudiantes?limit=500')
  return data.map(e => ({
    idEstudiante:     e.idEstudiante as number,
    codigoEstudiante: e.codigoEstudiante as string,
    nombreCompleto:   nombreDeEstudiante(e) || `Estudiante #${e.idEstudiante}`,
    curso:            null,
  }))
}

export async function getCodigoQRByValueAction(
  codigoTexto: string
): Promise<CodigoQRConEstudiante | null> {
  const data = await apiFetch<Raw[]>(`/estudiantes?codigo_estudiante=${encodeURIComponent(codigoTexto)}&estado=Activo&limit=1`)
  if (!data.length) return null
  const est = data[0]
  return {
    idCodigo:         est.idEstudiante as number,
    idEstudiante:     est.idEstudiante as number,
    tipo:             'ambos' as TipoQR,
    codigo:           est.codigoEstudiante as string,
    activo:           true,
    fechaCreacion:    new Date().toISOString(),
    fechaVencimiento: null,
    creadoPor:        null,
    nombreCompleto:   '—',
    codigoEstudiante: est.codigoEstudiante as string,
    curso:            null,
  }
}

export async function createAsistenciaAction(data: CreateAsistenciaData): Promise<void> {
  await apiFetch('/asistencia', {
    method: 'POST',
    body: JSON.stringify({
      id_estudiante:  data.idEstudiante,
      estado:         data.estado,
      fecha:          data.fecha,
      observacion:    data.observacion ?? null,
      registrado_por: data.registradoPor,
      codigo_qr:      data.codigo_qr ?? null,
      tipo:           data.tipo      ?? null,
    }),
  })
}

export async function getUsuariosSinEstudianteAction(): Promise<{ idUsuario: number; primerNombre: string; primerApellido: string; correo: string | null; numeroDocumento: string }[]> {
  const [usuarios, estudiantes] = await Promise.all([
    apiFetch<Raw[]>('/usuarios?id_rol=2&estado=true&limit=500'),
    apiFetch<Raw[]>('/estudiantes?limit=500'),
  ])
  const asignados = new Set(estudiantes.map(e => e.idUsuario as number))
  return (usuarios as Raw[])
    .filter(u => !asignados.has(u.idUsuario as number))
    .map(u => ({
      idUsuario:       u.idUsuario as number,
      primerNombre:    u.primerNombre as string,
      primerApellido:  u.primerApellido as string,
      correo:          u.correo as string | null,
      numeroDocumento: u.numeroDocumento as string,
    }))
}

export async function getCursosActivosAction(): Promise<{ idCurso: number; nombreCurso: string }[]> {
  const data = await apiFetch<Raw[]>('/cursos?activo=true&limit=200')
  return data.map(c => ({
    idCurso:     c.idCurso as number,
    nombreCurso: c.nombreCurso as string,
  }))
}

export type QRBootstrap = {
  estudiantes: Awaited<ReturnType<typeof getEstudiantesConQRAction>>
  asistencia: Awaited<ReturnType<typeof getRegistrosAsistenciaAction>>
  sinAsignar: Awaited<ReturnType<typeof getUsuariosSinEstudianteAction>>
  cursos: Awaited<ReturnType<typeof getCursosActivosAction>>
}

/**
 * Carga inicial de la vista admin de QR en UNA sola llamada (en vez de 4 server
 * actions separadas desde el cliente). Recibe la fecha (calculada en el servidor)
 * para los registros de asistencia del día.
 */
export async function getQRBootstrapAction(fecha?: string): Promise<QRBootstrap> {
  const [estudiantes, asistencia, sinAsignar, cursos] = await Promise.all([
    getEstudiantesConQRAction(),
    getRegistrosAsistenciaAction(fecha),
    getUsuariosSinEstudianteAction(),
    getCursosActivosAction(),
  ])
  return { estudiantes, asistencia, sinAsignar, cursos }
}
