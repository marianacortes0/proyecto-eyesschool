import { apiFetch } from '@/services/api/client'

export type Horario = {
  idHorario: number
  dia: string
  horaInicio: string
  horaFin: string
  salon: string
  activo: boolean
  idCurso: number
  idMateria: number
  nombreCurso?: string
  gradoCurso?: string
  nombreMateria?: string
  codigoMateria?: string
  idProfesor?: number
  nombreProfesor?: string
}

export type ProfesorOpt = { idProfesor: number; nombre: string }
export type AsignacionProfesor = { idHorario: number; idProfesor: number; nombreProfesor: string }

export type Asignacion = {
  idAsignacion: number
  idProfesor: number
  idCurso: number
  idMateria: number
  fechaAsignacion: string
  fechaFinalizacion: string | null
  activo: boolean
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

export const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'] as const

const DIA_ORDER: Record<string, number> = {
  Lunes: 0, Martes: 1, 'Miércoles': 2, Jueves: 3, Viernes: 4, Sábado: 5, Domingo: 6,
}

export async function getHorarios(): Promise<Horario[]> {
  const data = await apiFetch<Record<string, unknown>[]>('/horarios?limit=500')
  return data
    .map(r => ({
      idHorario:    r.idHorario as number,
      dia:          r.dia as string,
      horaInicio:   r.horaInicio as string,
      horaFin:      r.horaFin as string,
      salon:        r.salon as string,
      activo:       r.activo as boolean,
      idCurso:      r.idCurso as number,
      idMateria:    r.idMateria as number,
    }))
    .sort((a, b) => {
      const dA = DIA_ORDER[a.dia] ?? 99
      const dB = DIA_ORDER[b.dia] ?? 99
      if (dA !== dB) return dA - dB
      return a.horaInicio.localeCompare(b.horaInicio)
    })
}

export async function getCursos(): Promise<Curso[]> {
  const data = await apiFetch<Record<string, unknown>[]>('/cursos?activo=true&limit=200')
  return data.map(c => ({
    idCurso:     c.idCurso as number,
    nombreCurso: c.nombreCurso as string,
    grado:       c.grado as string,
    jornada:     c.jornada as string,
    ano:         (c.ano as number) ?? new Date().getFullYear(),
    activo:      c.activo as boolean,
  }))
}

export async function getAllCursos(): Promise<Curso[]> {
  const data = await apiFetch<Record<string, unknown>[]>('/cursos?limit=200')
  return data.map(c => ({
    idCurso:     c.idCurso as number,
    nombreCurso: c.nombreCurso as string,
    grado:       c.grado as string,
    jornada:     c.jornada as string,
    ano:         (c.ano as number) ?? new Date().getFullYear(),
    activo:      c.activo as boolean,
  }))
}

export async function createCurso(payload: Omit<Curso, 'idCurso'>): Promise<void> {
  await apiFetch('/cursos', {
    method: 'POST',
    body: JSON.stringify({
      nombre_curso: payload.nombreCurso,
      grado:        payload.grado,
      jornada:      payload.jornada,
      ano:          payload.ano,
      activo:       payload.activo,
    }),
  })
}

export async function updateCurso(idCurso: number, payload: Partial<Omit<Curso, 'idCurso'>>): Promise<void> {
  const body: Record<string, unknown> = {}
  if (payload.nombreCurso !== undefined) body.nombre_curso = payload.nombreCurso
  if (payload.grado       !== undefined) body.grado        = payload.grado
  if (payload.jornada     !== undefined) body.jornada      = payload.jornada
  if (payload.ano         !== undefined) body.ano          = payload.ano
  if (payload.activo      !== undefined) body.activo       = payload.activo
  await apiFetch(`/cursos/${idCurso}`, { method: 'PUT', body: JSON.stringify(body) })
}

export async function deleteCurso(idCurso: number): Promise<void> {
  await apiFetch(`/cursos/${idCurso}`, { method: 'PUT', body: JSON.stringify({ activo: false }) })
}

export async function getMaterias(): Promise<Materia[]> {
  const data = await apiFetch<Record<string, unknown>[]>('/materias?activa=true&limit=200')
  return data.map(m => ({
    idMateria:     m.idMateria as number,
    nombreMateria: m.nombreMateria as string,
    codigoMateria: m.codigoMateria as string,
    activa:        m.activa as boolean,
  }))
}

export async function getAllMaterias(): Promise<Materia[]> {
  const data = await apiFetch<Record<string, unknown>[]>('/materias?limit=200')
  return data.map(m => ({
    idMateria:     m.idMateria as number,
    nombreMateria: m.nombreMateria as string,
    codigoMateria: m.codigoMateria as string,
    activa:        m.activa as boolean,
  }))
}

export async function createMateria(payload: Omit<Materia, 'idMateria'>): Promise<void> {
  await apiFetch('/materias', {
    method: 'POST',
    body: JSON.stringify({
      nombre_materia: payload.nombreMateria,
      codigo_materia: payload.codigoMateria,
      activa: payload.activa,
    }),
  })
}

export async function updateMateria(idMateria: number, payload: Partial<Omit<Materia, 'idMateria'>>): Promise<void> {
  const body: Record<string, unknown> = {}
  if (payload.nombreMateria !== undefined) body.nombre_materia = payload.nombreMateria
  if (payload.codigoMateria !== undefined) body.codigo_materia = payload.codigoMateria
  if (payload.activa        !== undefined) body.activa         = payload.activa
  await apiFetch(`/materias/${idMateria}`, { method: 'PUT', body: JSON.stringify(body) })
}

export async function deleteMateria(idMateria: number): Promise<void> {
  await apiFetch(`/materias/${idMateria}`, { method: 'PUT', body: JSON.stringify({ activa: false }) })
}

export async function getEspecializaciones(): Promise<Especializacion[]> {
  const data = await apiFetch<Record<string, unknown>[]>('/especializaciones?limit=200')
  return data.map(e => ({
    idEspecializacion:     e.idEspecializacion as number,
    nombreEspecializacion: e.nombreEspecializacion as string,
    activo:                e.activo as boolean,
  }))
}

export async function createEspecializacion(payload: Omit<Especializacion, 'idEspecializacion'>): Promise<void> {
  await apiFetch('/especializaciones', {
    method: 'POST',
    body: JSON.stringify({
      nombre_especializacion: payload.nombreEspecializacion,
      activo: payload.activo,
    }),
  })
}

export async function updateEspecializacion(id: number, payload: Partial<Omit<Especializacion, 'idEspecializacion'>>): Promise<void> {
  const body: Record<string, unknown> = {}
  if (payload.nombreEspecializacion !== undefined) body.nombre_especializacion = payload.nombreEspecializacion
  if (payload.activo !== undefined) body.activo = payload.activo
  await apiFetch(`/especializaciones/${id}`, { method: 'PUT', body: JSON.stringify(body) })
}

export async function deleteEspecializacion(id: number): Promise<void> {
  await apiFetch(`/especializaciones/${id}`, { method: 'PUT', body: JSON.stringify({ activo: false }) })
}

export async function createHorario(
  payload: Omit<Horario, 'idHorario' | 'nombreCurso' | 'gradoCurso' | 'nombreMateria'>
): Promise<{ idHorario: number }> {
  const data = await apiFetch<Record<string, unknown>>('/horarios', {
    method: 'POST',
    body: JSON.stringify({
      dia:        payload.dia,
      hora_inicio: payload.horaInicio,
      hora_fin:    payload.horaFin,
      salon:      payload.salon,
      activo:     payload.activo,
      id_curso:   payload.idCurso,
      id_materia: payload.idMateria,
    }),
  })
  return { idHorario: data.idHorario as number }
}

export async function asignarProfesorHorario(idProfesor: number, idHorario: number): Promise<void> {
  await apiFetch(`/horarios/${idHorario}/profesores`, {
    method: 'POST',
    body: JSON.stringify({ id_profesor: idProfesor }),
  })
}

export async function updateHorario(
  idHorario: number,
  payload: Partial<Omit<Horario, 'idHorario' | 'nombreCurso' | 'gradoCurso' | 'nombreMateria'>>
): Promise<void> {
  const body: Record<string, unknown> = {}
  if (payload.dia       !== undefined) body.dia        = payload.dia
  if (payload.horaInicio !== undefined) body.hora_inicio = payload.horaInicio
  if (payload.horaFin   !== undefined) body.hora_fin   = payload.horaFin
  if (payload.salon     !== undefined) body.salon      = payload.salon
  if (payload.activo    !== undefined) body.activo     = payload.activo
  if (payload.idCurso   !== undefined) body.id_curso   = payload.idCurso
  if (payload.idMateria !== undefined) body.id_materia = payload.idMateria
  await apiFetch(`/horarios/${idHorario}`, { method: 'PUT', body: JSON.stringify(body) })
}

export async function deleteHorario(idHorario: number): Promise<void> {
  await apiFetch(`/horarios/${idHorario}`, { method: 'PUT', body: JSON.stringify({ activo: false }) })
}

export async function getProfesores(): Promise<ProfesorOpt[]> {
  const data = await apiFetch<Record<string, unknown>[]>('/profesores?limit=500')
  return data.map(p => {
    const u = p.usuario as Record<string, unknown> | undefined
    return {
      idProfesor: p.idProfesor as number,
      nombre: u ? `${u.primerNombre} ${u.primerApellido}` : `Profesor #${p.idProfesor}`,
    }
  }).sort((a, b) => a.nombre.localeCompare(b.nombre))
}

export async function getAsignacionesProfesores(): Promise<AsignacionProfesor[]> {
  return []
}

export async function getAsignaciones(): Promise<Asignacion[]> {
  const data = await apiFetch<Record<string, unknown>[]>('/asignaciones?limit=500')
  return data.map(r => ({
    idAsignacion:     r.idAsignacion as number,
    idProfesor:       r.idProfesor as number,
    idCurso:          r.idCurso as number,
    idMateria:        r.idMateria as number,
    fechaAsignacion:  r.fechaAsignacion as string,
    fechaFinalizacion:r.fechaFinalizacion as string | null,
    activo:           r.activo as boolean,
  }))
}

export async function createAsignacion(
  payload: Omit<Asignacion, 'idAsignacion' | 'nombreProfesor' | 'nombreCurso' | 'nombreMateria'>
): Promise<void> {
  await apiFetch('/asignaciones', {
    method: 'POST',
    body: JSON.stringify({
      id_profesor:        payload.idProfesor,
      id_curso:           payload.idCurso,
      id_materia:         payload.idMateria,
      fecha_asignacion:   payload.fechaAsignacion,
      fecha_finalizacion: payload.fechaFinalizacion ?? null,
      activo:             payload.activo,
    }),
  })
}

export async function updateAsignacion(id: number, payload: Partial<Omit<Asignacion, 'idAsignacion'>>): Promise<void> {
  const body: Record<string, unknown> = {}
  if (payload.idProfesor       !== undefined) body.id_profesor       = payload.idProfesor
  if (payload.idCurso          !== undefined) body.id_curso          = payload.idCurso
  if (payload.idMateria        !== undefined) body.id_materia        = payload.idMateria
  if (payload.fechaFinalizacion !== undefined) body.fecha_finalizacion = payload.fechaFinalizacion
  if (payload.activo           !== undefined) body.activo            = payload.activo
  await apiFetch(`/asignaciones/${id}`, { method: 'PUT', body: JSON.stringify(body) })
}

export async function deleteAsignacion(id: number): Promise<void> {
  await apiFetch(`/asignaciones/${id}`, { method: 'PUT', body: JSON.stringify({ activo: false }) })
}
