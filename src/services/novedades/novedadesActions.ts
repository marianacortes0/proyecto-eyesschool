'use server'

import { createAdminClient } from '@/services/supabase/admin'
import type { CursoOpt, EstudianteOpt, Novedad, TipoNovedad } from './novedadesService'

export async function getCursosParaNovedadesAction(): Promise<CursoOpt[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('cursos')
    .select('idCurso, nombreCurso, grado, jornada')
    .eq('activo', true)
    .order('nombreCurso')
  if (error) throw new Error(error.message)
  return (data ?? []) as CursoOpt[]
}

export async function getEstudiantesParaNovedadesAction(): Promise<EstudianteOpt[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('estudiantes')
    .select('idEstudiante, codigoEstudiante, idCursoActual, usuario ( primerNombre, primerApellido )')
  if (error) throw new Error(error.message)
  return ((data ?? []) as any[]).map(row => ({
    idEstudiante: row.idEstudiante,
    nombre: row.usuario
      ? `${row.usuario.primerNombre} ${row.usuario.primerApellido}`
      : `Estudiante #${row.idEstudiante}`,
    codigo: row.codigoEstudiante,
    idCursoActual: row.idCursoActual ?? null,
  }))
}

export async function getNovedadesAction(): Promise<Novedad[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('novedades')
    .select(`
      *,
      estudiantes ( idEstudiante, codigoEstudiante, idUsuario,
        usuario ( primerNombre, primerApellido )
      ),
      tiposnovedad ( nombreTipo, nivelGravedad )
    `)
    .order('fecha', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []).map((row: any) => ({
    idNovedad: row.idNovedad,
    fecha: row.fecha,
    descripcion: row.descripcion,
    estado: row.estado,
    accionTomada: row.accionTomada,
    fechaResolucion: row.fechaResolucion,
    idEstudiante: row.idEstudiante,
    idTipoNovedad: row.idTipoNovedad,
    registradoPor: row.registradoPor,
    codigoEstudiante: row.estudiantes?.codigoEstudiante ?? '',
    nombreEstudiante: row.estudiantes?.usuario
      ? `${row.estudiantes.usuario.primerNombre} ${row.estudiantes.usuario.primerApellido}`
      : `Estudiante #${row.idEstudiante}`,
    nombreTipo: row.tiposnovedad?.nombreTipo ?? '',
    nivelGravedad: row.tiposnovedad?.nivelGravedad ?? '',
  }))
}

export async function getTiposNovedadAction(): Promise<TipoNovedad[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('tiposnovedad')
    .select('*')
    .eq('activo', true)
    .order('nombreTipo')
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function createNovedadAction(
  payload: Pick<Novedad, 'descripcion' | 'idEstudiante' | 'idTipoNovedad' | 'registradoPor'>
) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('novedades').insert({
    ...payload,
    estado: 'Pendiente',
  })
  if (error) throw new Error(error.message)
}

export async function updateNovedadAction(
  idNovedad: number,
  payload: Partial<Pick<Novedad, 'descripcion' | 'estado' | 'accionTomada' | 'fechaResolucion' | 'idTipoNovedad'>>
) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('novedades')
    .update(payload)
    .eq('idNovedad', idNovedad)
  if (error) throw new Error(error.message)
}

export async function deleteNovedadAction(idNovedad: number) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('novedades')
    .delete()
    .eq('idNovedad', idNovedad)
  if (error) throw new Error(error.message)
}
