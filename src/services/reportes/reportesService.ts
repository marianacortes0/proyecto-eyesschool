import { apiFetch } from '@/services/api/client'

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
  await apiFetch(`/reportes/${idReporte}/estado`, {
    method: 'PATCH',
    body: JSON.stringify({ estado: 'Error' }),
  })
}

// File upload no longer uses Supabase Storage — returns a placeholder URL
export async function uploadArchivoReporte(_file: File): Promise<string> {
  throw new Error('La carga de archivos no está disponible en esta versión.')
}
