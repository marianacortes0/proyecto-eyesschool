import { apiFetch, getClientToken } from '@/services/api/client'

// Origen del backend (sin /api/v1) para construir URLs de archivos estáticos.
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'
const API_ROOT = API_BASE.replace(/\/api\/v1\/?$/, '')

/** Convierte una ruta relativa del backend (/static/...) en URL absoluta. */
export function fileUrl(path: string | null | undefined): string {
  if (!path) return ''
  if (/^(https?:|data:)/i.test(path)) return path
  return `${API_ROOT}${path.startsWith('/') ? '' : '/'}${path}`
}

export type Reporte = {
  idReporte: number
  nombreReporte: string
  tipoReporte: string
  estado: string
  fechaInicio: string
  fechaFin: string
  fechaGeneracion: string
  parametros: string
  archivoGenerado: string | null
  idAdministrador: number
}

export const TIPOS_REPORTE = [
  'Academico', 'Disciplinario', 'Medico', 'Asistencia', 'Estadistico',
] as const

export const ESTADOS_REPORTE = ['Pendiente', 'Generando', 'Completado', 'Error'] as const

export async function getReportes(): Promise<Reporte[]> {
  const data = await apiFetch<Record<string, unknown>[]>('/reportes?limit=200')
  return data.map(r => ({
    idReporte:       r.idReporte as number,
    nombreReporte:   r.nombreReporte as string,
    tipoReporte:     r.tipoReporte as string,
    estado:          r.estado as string,
    fechaInicio:     r.fechaInicio as string,
    fechaFin:        r.fechaFin as string,
    fechaGeneracion: r.fechaGeneracion as string,
    parametros:      r.parametros as string,
    archivoGenerado: r.archivoGenerado as string | null,
    idAdministrador: r.idAdministrador as number,
  }))
}

export async function createReporte(
  payload: Pick<Reporte, 'nombreReporte' | 'tipoReporte' | 'fechaInicio' | 'fechaFin' | 'parametros' | 'idAdministrador'> & { archivoGenerado?: string | null }
): Promise<void> {
  await apiFetch('/reportes', {
    method: 'POST',
    body: JSON.stringify({
      nombre_reporte:   payload.nombreReporte,
      tipo_reporte:     payload.tipoReporte,
      fecha_inicio:     payload.fechaInicio,
      fecha_fin:        payload.fechaFin,
      parametros:       payload.parametros,
      id_administrador: payload.idAdministrador,
      archivo_generado: payload.archivoGenerado ?? null,
    }),
  })
}

export async function updateReporte(
  idReporte: number,
  payload: Partial<Pick<Reporte, 'nombreReporte' | 'tipoReporte' | 'estado' | 'fechaInicio' | 'fechaFin' | 'parametros' | 'archivoGenerado'>>
): Promise<void> {
  const body: Record<string, unknown> = {}
  if (payload.nombreReporte   !== undefined) body.nombre_reporte   = payload.nombreReporte
  if (payload.tipoReporte     !== undefined) body.tipo_reporte     = payload.tipoReporte
  if (payload.estado          !== undefined) body.estado           = payload.estado
  if (payload.fechaInicio     !== undefined) body.fecha_inicio     = payload.fechaInicio
  if (payload.fechaFin        !== undefined) body.fecha_fin        = payload.fechaFin
  if (payload.parametros      !== undefined) body.parametros       = payload.parametros
  if (payload.archivoGenerado !== undefined) body.archivo_generado = payload.archivoGenerado
  await apiFetch(`/reportes/${idReporte}`, { method: 'PATCH', body: JSON.stringify(body) })
}

export async function deleteReporte(idReporte: number): Promise<void> {
  await apiFetch(`/reportes/${idReporte}`, { method: 'DELETE' })
}

// Formatos y tamaño permitidos para los archivos de reporte.
export const FORMATOS_REPORTE = ['.pdf', '.xlsx', '.xls', '.doc', '.docx'] as const
export const MAX_TAMANO_REPORTE = 10 * 1024 * 1024 // 10 MB

export function validarArchivoReporte(file: File): { ok: true } | { ok: false; motivo: string } {
  const ext = '.' + (file.name.split('.').pop() ?? '').toLowerCase()
  if (!FORMATOS_REPORTE.includes(ext as (typeof FORMATOS_REPORTE)[number])) {
    return { ok: false, motivo: 'Formato de archivo no válido' }
  }
  if (file.size > MAX_TAMANO_REPORTE) {
    return { ok: false, motivo: 'El archivo excede el tamaño máximo permitido' }
  }
  return { ok: true }
}

/**
 * Sube el archivo del reporte al backend (multipart) y devuelve la ruta relativa
 * `/static/reportes/...` que se persiste en `archivo_generado`. Usa XHR para
 * reportar progreso real de carga.
 */
export function uploadArchivoReporte(
  file: File,
  onProgress?: (pct: number) => void,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const form = new FormData()
    form.append('file', file)

    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${API_BASE}/reportes/archivo`)
    const token = getClientToken()
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`)

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100))
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(100)
        // El backend (response_model=str) responde el string JSON-encoded.
        try { resolve(JSON.parse(xhr.responseText) as string) }
        catch { resolve(xhr.responseText) }
        return
      }
      let msg = `HTTP ${xhr.status}`
      try { msg = (JSON.parse(xhr.responseText).detail as string) ?? msg } catch {}
      reject(new Error(msg))
    }
    xhr.onerror = () => reject(new Error('Error al subir el archivo'))
    xhr.send(form)
  })
}

/**
 * Descarga el archivo del reporte como PDF (u otro formato) forzando la descarga
 * con el nombre que entrega el backend. Va autenticado con el token de acceso.
 */
export async function downloadReporteArchivo(idReporte: number, nombreReporte: string): Promise<void> {
  const token = getClientToken()
  const res = await fetch(`${API_BASE}/reportes/${idReporte}/archivo`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!res.ok) {
    let msg = `HTTP ${res.status}`
    try { msg = ((await res.json()) as { detail?: string }).detail ?? msg } catch {}
    throw new Error(msg)
  }

  const blob = await res.blob()
  const dispo = res.headers.get('Content-Disposition') ?? ''
  const match = /filename="?([^"]+)"?/.exec(dispo)
  const filename = match?.[1] ?? `${nombreReporte}.pdf`

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
