import { createClient } from '@/services/supabase/client'

export type Horario = {
  idHorario: number
  dia: string
  horaInicio: string
  horaFin: string
  salon: string
  activo: boolean
  idCurso: number
  idMateria: number
  // joined
  nombreCurso?: string
  gradoCurso?: string
  nombreMateria?: string
  nombreProfesor?: string
}

export type ProfesorOpt = {
  idProfesor: number
  nombre: string
}

export type AsignacionProfesor = {
  idHorario: number
  idProfesor: number
  nombreProfesor: string
}

export type Asignacion = {
  idAsignacion: number
  idProfesor: number
  idCurso: number
  idMateria: number
  fechaAsignacion: string
  fechaFinalizacion: string | null
  activo: boolean
  // joined
  nombreProfesor?: string
  nombreCurso?: string
  nombreMateria?: string
}

export type Curso = {
  idCurso: number
  nombreCurso: string
  grado: string
  jornada: string
  ano: number
  activo: boolean
}

export type Materia = {
  idMateria: number
  nombreMateria: string
  codigoMateria: string
  activa: boolean
}

export type Especializacion = {
  idEspecializacion: number
  nombreEspecializacion: string
  activo: boolean
}

export const DIAS_SEMANA = [
  'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado',
] as const

export async function getHorarios(): Promise<Horario[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('Horario')
    .select(`
      *,
      cursos ( nombreCurso, grado ),
      materias ( nombreMateria )
    `)
    .order('dia')
    .order('horaInicio')

  if (error) throw error

  const DIA_ORDER: Record<string, number> = {
    Lunes: 0, Martes: 1, 'Miércoles': 2, Jueves: 3,
    Viernes: 4, Sábado: 5, Domingo: 6,
  }

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

export async function getCursos(): Promise<Curso[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('cursos')
    .select('idCurso, nombreCurso, grado, jornada, ano, activo')
    .eq('activo', true)
    .order('grado')
  if (error) throw error
  return (data ?? []) as Curso[]
}

export async function getAllCursos(): Promise<Curso[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('cursos')
    .select('idCurso, nombreCurso, grado, jornada, ano, activo')
    .order('grado')
  if (error) throw error
  return (data ?? []) as Curso[]
}

export async function createCurso(
  payload: Omit<Curso, 'idCurso'>
) {
  const supabase = createClient()
  const { error } = await supabase.from('cursos').insert(payload)
  if (error) throw error
}

export async function updateCurso(
  idCurso: number,
  payload: Partial<Omit<Curso, 'idCurso'>>
) {
  const supabase = createClient()
  const { error } = await supabase.from('cursos').update(payload).eq('idCurso', idCurso)
  if (error) throw error
}

export async function deleteCurso(idCurso: number) {
  const supabase = createClient()
  const { error } = await supabase.from('cursos').delete().eq('idCurso', idCurso)
  if (error) throw error
}

export async function getMaterias(): Promise<Materia[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('materias')
    .select('idMateria, nombreMateria, codigoMateria, activa')
    .eq('activa', true)
    .order('nombreMateria')
  if (error) throw error
  return (data ?? []) as Materia[]
}

export async function getAllMaterias(): Promise<Materia[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('materias')
    .select('idMateria, nombreMateria, codigoMateria, activa')
    .order('nombreMateria')
  if (error) throw error
  return (data ?? []) as Materia[]
}

export async function createMateria(payload: Omit<Materia, 'idMateria'>) {
  const supabase = createClient()
  const { error } = await supabase.from('materias').insert(payload)
  if (error) throw error
}

export async function updateMateria(idMateria: number, payload: Partial<Omit<Materia, 'idMateria'>>) {
  const supabase = createClient()
  const { error } = await supabase.from('materias').update(payload).eq('idMateria', idMateria)
  if (error) throw error
}

export async function deleteMateria(idMateria: number) {
  const supabase = createClient()
  const { error } = await supabase.from('materias').delete().eq('idMateria', idMateria)
  if (error) throw error
}

export async function getEspecializaciones(): Promise<Especializacion[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('especializaciones')
    .select('idEspecializacion, nombreEspecializacion, activo')
    .order('nombreEspecializacion')
  if (error) throw error
  return (data ?? []) as Especializacion[]
}

export async function createEspecializacion(payload: Omit<Especializacion, 'idEspecializacion'>) {
  const supabase = createClient()
  const { error } = await supabase.from('especializaciones').insert(payload)
  if (error) throw error
}

export async function updateEspecializacion(idEspecializacion: number, payload: Partial<Omit<Especializacion, 'idEspecializacion'>>) {
  const supabase = createClient()
  const { error } = await supabase.from('especializaciones').update(payload).eq('idEspecializacion', idEspecializacion)
  if (error) throw error
}

export async function deleteEspecializacion(idEspecializacion: number) {
  const supabase = createClient()
  const { error } = await supabase.from('especializaciones').delete().eq('idEspecializacion', idEspecializacion)
  if (error) throw error
}

export async function createHorario(
  payload: Omit<Horario, 'idHorario' | 'nombreCurso' | 'gradoCurso' | 'nombreMateria'>
): Promise<{ idHorario: number }> {
  const supabase = createClient()
  const { data, error } = await supabase.from('Horario').insert(payload).select('idHorario').single()
  if (error) throw error
  return data as { idHorario: number }
}

export async function asignarProfesorHorario(idProfesor: number, idHorario: number) {
  const supabase = createClient()
  const { error } = await supabase
    .from('profesores_horario')
    .insert({ idProfesor, idHorario, fechaAsignacion: new Date().toISOString().slice(0, 10), activo: true })
  if (error) throw error
}

export async function updateHorario(
  idHorario: number,
  payload: Partial<Omit<Horario, 'idHorario' | 'nombreCurso' | 'gradoCurso' | 'nombreMateria'>>
) {
  const supabase = createClient()
  const { error } = await supabase.from('Horario').update(payload).eq('idHorario', idHorario)
  if (error) throw error
}

export async function deleteHorario(idHorario: number) {
  const supabase = createClient()
  // Primero eliminar asignaciones de profesores para evitar FK constraint
  await supabase.from('profesores_horario').delete().eq('idHorario', idHorario)
  const { error } = await supabase.from('Horario').delete().eq('idHorario', idHorario)
  if (error) throw error
}

export async function getProfesores(): Promise<ProfesorOpt[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('profesores')
    .select('idProfesor, usuario ( primerNombre, primerApellido )')
  if (error) throw error
  return ((data ?? []) as any[]).map(row => ({
    idProfesor: row.idProfesor,
    nombre: row.usuario
      ? `${row.usuario.primerNombre} ${row.usuario.primerApellido}`
      : `Profesor #${row.idProfesor}`,
  })).sort((a, b) => a.nombre.localeCompare(b.nombre))
}

export async function getAsignacionesProfesores(): Promise<AsignacionProfesor[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('profesores_horario')
    .select('idHorario, idProfesor, activo, profesores ( idProfesor, usuario ( primerNombre, primerApellido ) )')
    .eq('activo', true)
  if (error) throw error
  return ((data ?? []) as any[]).map(row => ({
    idHorario: row.idHorario,
    idProfesor: row.idProfesor,
    nombreProfesor: row.profesores?.usuario
      ? `${row.profesores.usuario.primerNombre} ${row.profesores.usuario.primerApellido}`
      : `Profesor #${row.idProfesor}`,
  }))
}

// ── ASIGNACIONES ─────────────────────────────────────────────────────────────

export async function getAsignaciones(): Promise<Asignacion[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('asignaciones')
    .select(`
      *,
      profesores ( usuario ( primerNombre, primerApellido ) ),
      cursos ( nombreCurso ),
      materias ( nombreMateria )
    `)
    .order('fechaAsignacion', { ascending: false })

  if (error) throw error

  return ((data ?? []) as any[]).map(row => ({
    ...row,
    nombreProfesor: row.profesores?.usuario
      ? `${row.profesores.usuario.primerNombre} ${row.profesores.usuario.primerApellido}`
      : `Profesor #${row.idProfesor}`,
    nombreCurso: row.cursos?.nombreCurso ?? '',
    nombreMateria: row.materias?.nombreMateria ?? '',
  }))
}

export async function createAsignacion(payload: Omit<Asignacion, 'idAsignacion' | 'nombreProfesor' | 'nombreCurso' | 'nombreMateria'>) {
  const supabase = createClient()
  const { error } = await supabase.from('asignaciones').insert(payload)
  if (error) throw error
}

export async function updateAsignacion(idAsignacion: number, payload: Partial<Omit<Asignacion, 'idAsignacion'>>) {
  const supabase = createClient()
  const { error } = await supabase.from('asignaciones').update(payload).eq('idAsignacion', idAsignacion)
  if (error) throw error
}

export async function deleteAsignacion(idAsignacion: number) {
  const supabase = createClient()
  const { error } = await supabase.from('asignaciones').delete().eq('idAsignacion', idAsignacion)
  if (error) throw error
}
