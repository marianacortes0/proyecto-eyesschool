import { createClient } from '@/services/supabase/client'

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
  'Academico',
  'Disciplinario',
  'Medico',
  'Asistencia',
  'Estadistico',
] as const

export const ESTADOS_REPORTE = ['Pendiente', 'Generando', 'Completado', 'Error'] as const

export async function getReportes(): Promise<Reporte[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('Reportes')
    .select('*')
    .order('fechaGeneracion', { ascending: false })
  if (error) throw error
  return (data ?? []) as Reporte[]
}

export async function createReporte(
  payload: Pick<Reporte, 'nombreReporte' | 'tipoReporte' | 'fechaInicio' | 'fechaFin' | 'parametros' | 'idAdministrador'> & { archivoGenerado?: string | null }
) {
  const supabase = createClient()
  const { error } = await supabase.from('Reportes').insert({
    ...payload,
    estado: 'Pendiente',
  })
  if (error) throw error
}

export async function updateReporte(
  idReporte: number,
  payload: Partial<Pick<Reporte, 'nombreReporte' | 'tipoReporte' | 'estado' | 'fechaInicio' | 'fechaFin' | 'parametros' | 'archivoGenerado'>>
) {
  const supabase = createClient()
  const { error } = await supabase
    .from('Reportes')
    .update(payload)
    .eq('idReporte', idReporte)
  if (error) throw error
}

export async function deleteReporte(idReporte: number) {
  const supabase = createClient()
  const { error } = await supabase
    .from('Reportes')
    .delete()
    .eq('idReporte', idReporte)
  if (error) throw error
}

export async function uploadArchivoReporte(file: File): Promise<string> {
  const supabase = createClient()
  const ext = file.name.split('.').pop() ?? 'bin'
  const path = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`

  const { error } = await supabase.storage
    .from('Reportes')
    .upload(path, file, { upsert: false, contentType: file.type })

  if (error) throw new Error(error.message)

  const { data } = supabase.storage.from('Reportes').getPublicUrl(path)
  return data.publicUrl
}
