'use server'

import { createAdminClient } from '@/services/supabase/admin'

export async function getProfesoresAdmin() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('profesores')
    .select('idProfesor, usuario ( primerNombre, primerApellido )')
  
  if (error) {
    console.error('Error fetching profesores (admin):', error)
    throw error
  }
  return data
}

export async function getHorariosAdmin() {
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

  if (error) {
    console.error('Error fetching horarios (admin):', error)
    throw error
  }
  return data
}

export async function getAsignacionesProfesoresAdmin() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('profesores_horario')
    .select('idHorario, idProfesor, activo, profesores ( idProfesor, usuario ( primerNombre, primerApellido ) )')
    .eq('activo', true)

  if (error) {
    console.error('Error fetching asignaciones (admin):', error)
    throw error
  }
  return data
}