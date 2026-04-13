import { createClient } from '@/services/supabase/client'

export type Nota = {
  idNota: number
  nota: number
  observacion: string | null
  fechaRegistro: string
  idEstudiante: number
  idMateria: number
  idPeriodo: number
  registradoPor: number
  // joined
  nombreEstudiante?: string
  codigoEstudiante?: string
  nombreMateria?: string
}

export const PERIODOS: Record<number, string> = {
  1: 'Periodo 1',
  2: 'Periodo 2',
  3: 'Periodo 3',
  4: 'Periodo 4',
}

export const NOTA_MIN = 0
export const NOTA_MAX = 5
export const NOTA_APROBACION = 3

export function notaColor(nota: number): string {
  if (nota >= 4.5) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
  if (nota >= NOTA_APROBACION) return 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300'
  if (nota >= 2) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300'
  return 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300'
}

export async function getNotas(): Promise<Nota[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('notas')
    .select(`
      *,
      estudiantes (
        codigoEstudiante,
        usuario ( primerNombre, primerApellido )
      ),
      materias ( nombreMateria )
    `)
    .order('fechaRegistro', { ascending: false })
    .order('idPeriodo', { ascending: true })

  if (error) throw error

  return ((data ?? []) as any[]).map(row => ({
    idNota: row.idNota,
    nota: Number(row.nota),
    observacion: row.observacion,
    fechaRegistro: row.fechaRegistro,
    idEstudiante: row.idEstudiante,
    idMateria: row.idMateria,
    idPeriodo: row.idPeriodo,
    registradoPor: row.registradoPor,
    codigoEstudiante: row.estudiantes?.codigoEstudiante ?? '',
    nombreEstudiante: row.estudiantes?.usuario
      ? `${row.estudiantes.usuario.primerNombre} ${row.estudiantes.usuario.primerApellido}`
      : `Estudiante #${row.idEstudiante}`,
    nombreMateria: row.materias?.nombreMateria ?? `Materia #${row.idMateria}`,
  }))
}

export async function getCursosParaNotas() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('cursos')
    .select('idCurso, nombreCurso, grado, jornada')
    .eq('activo', true)
    .order('nombreCurso')
  if (error) throw error
  return (data ?? []) as { idCurso: number; nombreCurso: string; grado: string; jornada: string }[]
}

export async function getEstudiantesParaNotas() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('estudiantes')
    .select(`
      idEstudiante,
      codigoEstudiante,
      idCursoActual,
      usuario ( primerNombre, primerApellido )
    `)
    .eq('estado', 'Activo')
    .order('idEstudiante')
  if (error) throw error
  return ((data ?? []) as any[]).map(e => ({
    idEstudiante: e.idEstudiante,
    codigoEstudiante: e.codigoEstudiante,
    idCursoActual: e.idCursoActual ?? null,
    nombre: e.usuario
      ? `${e.usuario.primerNombre} ${e.usuario.primerApellido}`
      : `Estudiante #${e.idEstudiante}`,
  }))
}

export async function getMateriasParaNotas() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('materias')
    .select('idMateria, nombreMateria')
    .eq('activa', true)
    .order('nombreMateria')
  if (error) throw error
  return (data ?? []) as { idMateria: number; nombreMateria: string }[]
}

export async function createNota(
  payload: Pick<Nota, 'idEstudiante' | 'idMateria' | 'idPeriodo' | 'nota' | 'observacion' | 'registradoPor'>
) {
  const supabase = createClient()
  const { error } = await supabase.from('notas').insert(payload)
  if (error) throw error
}

export async function updateNota(
  idNota: number,
  payload: Partial<Pick<Nota, 'nota' | 'observacion' | 'idPeriodo' | 'idMateria'>>
) {
  const supabase = createClient()
  const { error } = await supabase.from('notas').update(payload).eq('idNota', idNota)
  if (error) throw error
}

export async function deleteNota(idNota: number) {
  const supabase = createClient()
  const { error } = await supabase.from('notas').delete().eq('idNota', idNota)
  if (error) throw error
}
