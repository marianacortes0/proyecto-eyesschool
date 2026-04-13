import { createClient } from '@/services/supabase/client'

export type CursoOpt = {
  idCurso: number
  nombreCurso: string
  grado: string
  jornada: string
}

export type EstudianteOpt = {
  idEstudiante: number
  nombre: string
  codigo: string
  idCursoActual: number | null
}

export type Novedad = {
  idNovedad: number
  fecha: string
  descripcion: string
  estado: string
  accionTomada: string | null
  fechaResolucion: string | null
  idEstudiante: number
  idTipoNovedad: number
  registradoPor: number
  // joined
  nombreEstudiante?: string
  codigoEstudiante?: string
  nombreTipo?: string
  nivelGravedad?: string
}

export type TipoNovedad = {
  idTipoNovedad: number
  nombreTipo: string
  nivelGravedad: string
  requiereAccion: boolean
  activo: boolean
}

export const ESTADOS_NOVEDAD = ['Pendiente', 'Completado'] as const

export async function getCursosParaNovedades(): Promise<CursoOpt[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('cursos')
    .select('idCurso, nombreCurso, grado, jornada')
    .eq('activo', true)
    .order('nombreCurso')
  if (error) throw error
  return (data ?? []) as CursoOpt[]
}

export async function getEstudiantesParaNovedades(): Promise<EstudianteOpt[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('estudiantes')
    .select('idEstudiante, codigoEstudiante, idCursoActual, usuario ( primerNombre, primerApellido )')
  if (error) throw error
  return ((data ?? []) as any[]).map(row => ({
    idEstudiante: row.idEstudiante,
    nombre: row.usuario ? `${row.usuario.primerNombre} ${row.usuario.primerApellido}` : `Estudiante #${row.idEstudiante}`,
    codigo: row.codigoEstudiante,
    idCursoActual: row.idCursoActual ?? null,
  }))
}

export async function getNovedades(): Promise<Novedad[]> {
  const supabase = createClient()
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

  if (error) throw error

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

export async function getTiposNovedad(): Promise<TipoNovedad[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('tiposnovedad')
    .select('*')
    .eq('activo', true)
    .order('nombreTipo')

  if (error) throw error
  return data ?? []
}

export async function createNovedad(
  payload: Pick<Novedad, 'descripcion' | 'idEstudiante' | 'idTipoNovedad' | 'registradoPor'>
) {
  const supabase = createClient()
  const { error } = await supabase.from('novedades').insert({
    ...payload,
    estado: 'Pendiente',
  })
  if (error) throw error
}

export async function updateNovedad(
  idNovedad: number,
  payload: Partial<Pick<Novedad, 'descripcion' | 'estado' | 'accionTomada' | 'fechaResolucion' | 'idTipoNovedad'>>
) {
  const supabase = createClient()
  const { error } = await supabase
    .from('novedades')
    .update(payload)
    .eq('idNovedad', idNovedad)
  if (error) throw error
}

export async function deleteNovedad(idNovedad: number) {
  const supabase = createClient()
  const { error } = await supabase
    .from('novedades')
    .delete()
    .eq('idNovedad', idNovedad)
  if (error) throw error
}
