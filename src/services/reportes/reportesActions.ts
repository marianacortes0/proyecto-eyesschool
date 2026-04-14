'use server'

import { createAdminClient } from '@/services/supabase/admin'
import { type Reporte } from './reportesService'

export async function getReportesAction(): Promise<Reporte[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('Reportes')
    .select('*')
    .order('fechaGeneracion', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []) as Reporte[]
}

export async function createReporteAction(
  payload: Pick<Reporte, 'nombreReporte' | 'tipoReporte' | 'fechaInicio' | 'fechaFin' | 'parametros' | 'idAdministrador'> & { archivoGenerado?: string | null }
) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('Reportes').insert({
    ...payload,
    estado: 'Pendiente',
  })
  if (error) throw new Error(error.message)
}

export async function updateReporteAction(
  idReporte: number,
  payload: Partial<Pick<Reporte, 'nombreReporte' | 'tipoReporte' | 'estado' | 'fechaInicio' | 'fechaFin' | 'parametros' | 'archivoGenerado'>>
) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('Reportes')
    .update(payload)
    .eq('idReporte', idReporte)
  if (error) throw new Error(error.message)
}

export async function deleteReporteAction(idReporte: number) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('Reportes')
    .delete()
    .eq('idReporte', idReporte)
  if (error) throw new Error(error.message)
}
