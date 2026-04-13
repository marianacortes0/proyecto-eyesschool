'use server'

import { createAdminClient } from '../supabase/admin'
import type {
  Horario,
  Curso,
  Materia,
  Especializacion,
  ProfesorOpt,
  AsignacionProfesor,
} from './horariosService'

// ── Horarios (bypass RLS) ────────────────────────────────────────────────────

const DIA_ORDER: Record<string, number> = {
  Lunes: 0, Martes: 1, 'Miércoles': 2, Jueves: 3,
  Viernes: 4, Sábado: 5, Domingo: 6,
}

export async function getHorariosAction(): Promise<Horario[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('Horario')
    .select(`
      *,
      cursos ( nombreCurso, grado ),
      materias ( nombreMateria )
    `)
    .order('dia')
    .order('horaInicio')

  if (error) throw new Error(error.message)

  return ((data ?? []) as any[])
    .map(row => ({
      idHorario: row.idHorario,
      dia: row.dia,
      horaInicio: row.horaInicio,
      horaFin: row.horaFin,
      salon: row.salon,
      activo: row.activo,
      idCurso: row.idCurso,
      idMateria: row.idMateria,
      nombreCurso: row.cursos?.nombreCurso ?? '',
      gradoCurso: row.cursos?.grado ?? '',
      nombreMateria: row.materias?.nombreMateria ?? '',
    }))
    .sort((a, b) => {
      const dA = DIA_ORDER[a.dia] ?? 99
      const dB = DIA_ORDER[b.dia] ?? 99
      if (dA !== dB) return dA - dB
      return a.horaInicio.localeCompare(b.horaInicio)
    })
}

// ── Cursos (bypass RLS) ──────────────────────────────────────────────────────

export async function getCursosAction(): Promise<Curso[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('cursos')
    .select('idCurso, nombreCurso, grado, jornada, ano, activo')
    .eq('activo', true)
    .order('grado')
  if (error) throw new Error(error.message)
  return (data ?? []) as Curso[]
}

export async function getAllCursosAction(): Promise<Curso[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('cursos')
    .select('idCurso, nombreCurso, grado, jornada, ano, activo')
    .order('grado')
  if (error) throw new Error(error.message)
  return (data ?? []) as Curso[]
}

// ── Materias (bypass RLS) ────────────────────────────────────────────────────

export async function getMateriasAction(): Promise<Materia[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('materias')
    .select('idMateria, nombreMateria, codigoMateria, activa')
    .eq('activa', true)
    .order('nombreMateria')
  if (error) throw new Error(error.message)
  return (data ?? []) as Materia[]
}

export async function getAllMateriasAction(): Promise<Materia[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('materias')
    .select('idMateria, nombreMateria, codigoMateria, activa')
    .order('nombreMateria')
  if (error) throw new Error(error.message)
  return (data ?? []) as Materia[]
}

// ── Especializaciones (bypass RLS) ───────────────────────────────────────────

export async function getEspecializacionesAction(): Promise<Especializacion[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('especializaciones')
    .select('idEspecializacion, nombreEspecializacion, activo')
    .order('nombreEspecializacion')
  if (error) throw new Error(error.message)
  return (data ?? []) as Especializacion[]
}

// ── Profesores (bypass RLS) ──────────────────────────────────────────────────

export async function getProfesoresAction(): Promise<ProfesorOpt[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('profesores')
    .select('idProfesor, usuario ( primerNombre, primerApellido )')
  if (error) throw new Error(error.message)
  return ((data ?? []) as any[]).map(row => ({
    idProfesor: row.idProfesor,
    nombre: row.usuario
      ? `${row.usuario.primerNombre} ${row.usuario.primerApellido}`
      : `Profesor #${row.idProfesor}`,
  })).sort((a, b) => a.nombre.localeCompare(b.nombre))
}

// ── Asignaciones profesor-horario (bypass RLS) ───────────────────────────────

export async function getAsignacionesProfesoresAction(): Promise<AsignacionProfesor[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('profesores_horario')
    .select('idHorario, idProfesor, activo, profesores ( idProfesor, usuario ( primerNombre, primerApellido ) )')
    .eq('activo', true)
  if (error) throw new Error(error.message)
  return ((data ?? []) as any[]).map(row => ({
    idHorario: row.idHorario,
    idProfesor: row.idProfesor,
    nombreProfesor: row.profesores?.usuario
      ? `${row.profesores.usuario.primerNombre} ${row.profesores.usuario.primerApellido}`
      : `Profesor #${row.idProfesor}`,
  }))
}
