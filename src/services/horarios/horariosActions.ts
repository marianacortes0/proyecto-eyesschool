'use server'

import { cookies } from 'next/headers'
import type {
  Horario,
  Curso,
  Materia,
  Especializacion,
  ProfesorOpt,
  AsignacionProfesor,
  Asignacion,
} from './horariosService'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

const DIA_ORDER: Record<string, number> = {
  Lunes: 0, Martes: 1, 'Miercoles': 2, 'Miércoles': 2, Jueves: 3,
  Viernes: 4, Sábado: 5, Domingo: 6,
}

async function getToken(): Promise<string | null> {
  const store = await cookies()
  return store.get('eys_access')?.value ?? null
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken()
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers as Record<string, string> | undefined),
    },
    cache: 'no-store',
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error((body as Record<string, unknown>).detail as string ?? `HTTP ${res.status}`)
  }
  if (res.status === 204) return null as T
  return res.json() as Promise<T>
}

function toCamelKey(k: string): string {
  return k.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase())
}

function toCamel(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(toCamel)
  if (v !== null && typeof v === 'object') {
    return Object.fromEntries(
      Object.entries(v as Record<string, unknown>).map(([k, val]) => [toCamelKey(k), toCamel(val)])
    )
  }
  return v
}

export async function getHorariosAction(): Promise<Horario[]> {
  type Raw = Record<string, unknown>
  const data = await apiFetch<Raw[]>('/horarios?limit=500')
  return (data.map(r => {
    const c = toCamel(r) as Raw
    return {
      idHorario:  c.idHorario as number,
      dia:        c.dia as string,
      horaInicio: c.horaInicio as string,
      horaFin:    c.horaFin as string,
      salon:      c.salon as string,
      activo:     c.activo as boolean,
      idCurso:    c.idCurso as number,
      idMateria:  c.idMateria as number,
    } satisfies Horario
  })).sort((a, b) => {
    const dA = DIA_ORDER[a.dia] ?? 99
    const dB = DIA_ORDER[b.dia] ?? 99
    if (dA !== dB) return dA - dB
    return a.horaInicio.localeCompare(b.horaInicio)
  })
}

export async function getCursosAction(): Promise<Curso[]> {
  type Raw = Record<string, unknown>
  const data = await apiFetch<Raw[]>('/cursos?activo=true&limit=200')
  return data.map(r => {
    const c = toCamel(r) as Raw
    return {
      idCurso:     c.idCurso as number,
      nombreCurso: c.nombreCurso as string,
      grado:       c.grado as string,
      jornada:     c.jornada as string,
      ano:         c.ano as number,
      activo:      c.activo as boolean,
    } satisfies Curso
  })
}

export async function getAllCursosAction(): Promise<Curso[]> {
  type Raw = Record<string, unknown>
  const data = await apiFetch<Raw[]>('/cursos?limit=200')
  return data.map(r => {
    const c = toCamel(r) as Raw
    return {
      idCurso:     c.idCurso as number,
      nombreCurso: c.nombreCurso as string,
      grado:       c.grado as string,
      jornada:     c.jornada as string,
      ano:         c.ano as number,
      activo:      c.activo as boolean,
    } satisfies Curso
  })
}

export async function getMateriasAction(): Promise<Materia[]> {
  type Raw = Record<string, unknown>
  const data = await apiFetch<Raw[]>('/materias?activa=true&limit=200')
  return data.map(r => {
    const c = toCamel(r) as Raw
    return {
      idMateria:    c.idMateria as number,
      nombreMateria: c.nombreMateria as string,
      codigoMateria: c.codigoMateria as string,
      activa:        c.activa as boolean,
    } satisfies Materia
  })
}

export async function getAllMateriasAction(): Promise<Materia[]> {
  type Raw = Record<string, unknown>
  const data = await apiFetch<Raw[]>('/materias?limit=200')
  return data.map(r => {
    const c = toCamel(r) as Raw
    return {
      idMateria:    c.idMateria as number,
      nombreMateria: c.nombreMateria as string,
      codigoMateria: c.codigoMateria as string,
      activa:        c.activa as boolean,
    } satisfies Materia
  })
}

export async function getEspecializacionesAction(): Promise<Especializacion[]> {
  type Raw = Record<string, unknown>
  const data = await apiFetch<Raw[]>('/especializaciones?limit=200')
  return data.map(r => {
    const c = toCamel(r) as Raw
    return {
      idEspecializacion:     c.idEspecializacion as number,
      nombreEspecializacion: c.nombreEspecializacion as string,
      activo:                c.activo as boolean,
    } satisfies Especializacion
  })
}

export async function getProfesoresAction(): Promise<ProfesorOpt[]> {
  type Raw = Record<string, unknown>
  const data = await apiFetch<Raw[]>('/profesores?limit=500')
  return (data.map(r => {
    const c = toCamel(r) as Raw
    return {
      idProfesor: c.idProfesor as number,
      nombre:     `Profesor #${c.idProfesor}`,
    } satisfies ProfesorOpt
  })).sort((a, b) => a.nombre.localeCompare(b.nombre))
}

export async function getAsignacionesProfesoresAction(): Promise<AsignacionProfesor[]> {
  return []
}

export async function createHorarioAction(
  payload: Omit<Horario, 'idHorario' | 'nombreCurso' | 'gradoCurso' | 'nombreMateria'>
): Promise<{ idHorario: number }> {
  const data = await apiFetch<Record<string, unknown>>('/horarios', {
    method: 'POST',
    body: JSON.stringify({
      id_curso:   payload.idCurso,
      id_materia: payload.idMateria,
      dia:        payload.dia,
      hora_inicio: payload.horaInicio,
      hora_fin:    payload.horaFin,
      salon:       payload.salon,
    }),
  })
  return { idHorario: (data.id_horario ?? data.idHorario) as number }
}

export async function asignarProfesorHorarioAction(idProfesor: number, idHorario: number) {
  await apiFetch(`/horarios/${idHorario}/profesores`, {
    method: 'POST',
    body: JSON.stringify({ id_profesor: idProfesor }),
  })
}

export async function updateHorarioAction(
  idHorario: number,
  payload: Partial<Omit<Horario, 'idHorario' | 'nombreCurso' | 'gradoCurso' | 'nombreMateria'>>
) {
  const body: Record<string, unknown> = {}
  if (payload.dia        !== undefined) body.dia        = payload.dia
  if (payload.horaInicio !== undefined) body.hora_inicio = payload.horaInicio
  if (payload.horaFin    !== undefined) body.hora_fin   = payload.horaFin
  if (payload.salon      !== undefined) body.salon      = payload.salon
  if (payload.activo     !== undefined) body.activo     = payload.activo
  await apiFetch(`/horarios/${idHorario}`, { method: 'PUT', body: JSON.stringify(body) })
}

export async function deleteHorarioAction(idHorario: number) {
  await apiFetch(`/horarios/${idHorario}`, { method: 'DELETE' })
}

export async function getAsignacionesAction(): Promise<Asignacion[]> {
  type Raw = Record<string, unknown>
  const data = await apiFetch<Raw[]>('/asignaciones?limit=500')
  return data.map(r => {
    const c = toCamel(r) as Raw
    return {
      idAsignacion:       c.idAsignacion as number,
      idProfesor:         c.idProfesor as number,
      idCurso:            c.idCurso as number,
      idMateria:          c.idMateria as number,
      fechaAsignacion:    c.fechaAsignacion as string,
      fechaFinalizacion:  c.fechaFinalizacion as string | null,
      activo:             c.activo as boolean,
      nombreProfesor:     `Profesor #${c.idProfesor}`,
      nombreCurso:        `Curso #${c.idCurso}`,
      nombreMateria:      `Materia #${c.idMateria}`,
    } satisfies Asignacion
  })
}

export async function createAsignacionAction(
  payload: Omit<Asignacion, 'idAsignacion' | 'nombreProfesor' | 'nombreCurso' | 'nombreMateria'>
) {
  await apiFetch('/asignaciones', {
    method: 'POST',
    body: JSON.stringify({
      id_profesor:       payload.idProfesor,
      id_curso:          payload.idCurso,
      id_materia:        payload.idMateria,
      fecha_asignacion:  payload.fechaAsignacion,
      fecha_finalizacion: payload.fechaFinalizacion ?? null,
      activo:            payload.activo,
    }),
  })
}

export async function updateAsignacionAction(
  idAsignacion: number,
  payload: Partial<Omit<Asignacion, 'idAsignacion'>>
) {
  const body: Record<string, unknown> = {}
  if (payload.idProfesor        !== undefined) body.id_profesor        = payload.idProfesor
  if (payload.idCurso           !== undefined) body.id_curso           = payload.idCurso
  if (payload.idMateria         !== undefined) body.id_materia         = payload.idMateria
  if (payload.fechaAsignacion   !== undefined) body.fecha_asignacion   = payload.fechaAsignacion
  if (payload.fechaFinalizacion !== undefined) body.fecha_finalizacion = payload.fechaFinalizacion
  if (payload.activo            !== undefined) body.activo             = payload.activo
  await apiFetch(`/asignaciones/${idAsignacion}`, { method: 'PUT', body: JSON.stringify(body) })
}

export async function deleteAsignacionAction(idAsignacion: number) {
  await apiFetch(`/asignaciones/${idAsignacion}`, { method: 'DELETE' })
}
