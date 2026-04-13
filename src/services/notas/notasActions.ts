'use server'

import { createAdminClient } from '../supabase/admin'
import { revalidatePath } from 'next/cache'
import { type Nota } from './notasService'

/**
 * Registra una nota usando el Admin Client para bypass de RLS.
 */
export async function createNotaAction(
  payload: Pick<Nota, 'idEstudiante' | 'idMateria' | 'idPeriodo' | 'nota' | 'observacion' | 'registradoPor'>
) {
  const supabase = createAdminClient()

  const { error } = await supabase.from('notas').insert(payload)

  if (error) {
    console.error('Error en createNotaAction:', error)
    throw new Error(error.message)
  }

  revalidatePath('/notas')
}

/**
 * Obtiene todas las notas usando el Admin Client para bypass de RLS.
 */
export async function getNotasAction(): Promise<Nota[]> {
  const supabase = createAdminClient()

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

  if (error) throw new Error(error.message)

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

/**
 * Obtiene estudiantes para el selector de notas (bypass RLS).
 */
export async function getEstudiantesAction() {
  const supabase = createAdminClient()

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

  if (error) throw new Error(error.message)

  return ((data ?? []) as any[]).map(e => ({
    idEstudiante: e.idEstudiante,
    codigoEstudiante: e.codigoEstudiante,
    idCursoActual: e.idCursoActual ?? null,
    nombre: e.usuario
      ? `${e.usuario.primerNombre} ${e.usuario.primerApellido}`
      : `Estudiante #${e.idEstudiante}`,
  }))
}

/**
 * Obtiene materias para el selector de notas (bypass RLS).
 */
export async function getMateriasAction() {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('materias')
    .select('idMateria, nombreMateria')
    .eq('activa', true)
    .order('nombreMateria')

  if (error) throw new Error(error.message)
  return (data ?? []) as { idMateria: number; nombreMateria: string }[]
}

/**
 * Obtiene cursos para el selector de notas (bypass RLS).
 */
export async function getCursosAction() {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('cursos')
    .select('idCurso, nombreCurso, grado, jornada')
    .eq('activo', true)
    .order('nombreCurso')

  if (error) throw new Error(error.message)
  return (data ?? []) as { idCurso: number; nombreCurso: string; grado: string; jornada: string }[]
}
