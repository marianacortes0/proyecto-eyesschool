import { getClientToken } from '@/services/api/client'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

async function apiFetchClient<T>(path: string): Promise<T | null> {
  const token = getClientToken()
  if (!token) return null
  try {
    const res = await fetch(`${API}${path}`, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    })
    if (!res.ok) return null
    return res.json() as Promise<T>
  } catch {
    return null
  }
}

async function apiFetchServer<T>(path: string, token: string): Promise<T | null> {
  try {
    const res = await fetch(`${API}${path}`, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      cache: 'no-store',
    })
    if (!res.ok) return null
    return res.json() as Promise<T>
  } catch {
    return null
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type HorarioHoy = {
  idHorario: number
  horaInicio: string
  horaFin: string
  salon: string
  nombreMateria: string
  nombreCurso: string
}

export type TopEstudiante = {
  idEstudiante: number
  nombre: string
  codigoEstudiante: string
  promedio: number
}

export type DocenteStats = {
  promedioNotas: number
  aprobacion: number
  estudiantesCount: number
  novedadesPendientes: number
  notasPorPeriodo: { periodo: string; promedio: number }[]
  horariosHoy: HorarioHoy[]
  topEstudiantes: TopEstudiante[]
  distribucionNotas: { name: string; value: number }[]
}

export type NotaMateria = {
  idMateria: number
  nombreMateria: string
  promedio: number
}

export type NovedadResumen = {
  idNovedad: number
  descripcion: string
  estado: string
  fecha: string
  nombreTipo: string
}

export type EstudianteStats = {
  promedioGeneral: number
  aprobacion: number
  porcentajeAsistencia: number
  totalAsistencias: number
  novedadesActivas: number
  notasPorMateria: NotaMateria[]
  notasPorPeriodo: { periodo: string; promedio: number }[]
  asistenciaEstados: { estado: string; cantidad: number }[]
  novedadesRecientes: NovedadResumen[]
}

export type RegistroAsistenciaSimple = {
  idAsistencia: number
  fecha: string
  estado: string
  tipo: string | null
  observacion: string | null
}

export type HijoStats = {
  idEstudiante: number
  nombreCompleto: string
  codigoEstudiante: string
  curso: string
  promedioGeneral: number
  aprobacion: number
  porcentajeAsistencia: number
  novedadesActivas: number
  notasPorMateria: NotaMateria[]
  notasPorPeriodo: { periodo: string; promedio: number }[]
  asistenciaEstados: { estado: string; cantidad: number }[]
  novedadesRecientes: NovedadResumen[]
  registrosAsistencia: RegistroAsistenciaSimple[]
}

export type PadreStats = {
  hijos: HijoStats[]
}

// ─── FastAPI response types ───────────────────────────────────────────────────

type DocenteAPI = {
  total_cursos_asignados: number
  total_estudiantes: number
  notas_registradas_hoy: number
  asistencias_registradas_hoy: number
}

type EstudianteAPI = {
  promedio_general: number | null
  porcentaje_asistencia: number | null
  novedades_pendientes: number
  periodo_actual: number
}

type PadreAPI = {
  id_estudiante: number
  nombre_estudiante: string
  promedio_general: number | null
  porcentaje_asistencia: number | null
  novedades_pendientes: number
}

// ─── Empty state helpers ──────────────────────────────────────────────────────

function emptyDocenteStats(): DocenteStats {
  return {
    promedioNotas: 0, aprobacion: 0, estudiantesCount: 0, novedadesPendientes: 0,
    notasPorPeriodo: [], horariosHoy: [], topEstudiantes: [], distribucionNotas: [],
  }
}

function emptyEstudianteStats(): EstudianteStats {
  return {
    promedioGeneral: 0, aprobacion: 0, porcentajeAsistencia: 0, totalAsistencias: 0,
    novedadesActivas: 0, notasPorMateria: [], notasPorPeriodo: [],
    asistenciaEstados: [], novedadesRecientes: [],
  }
}

// ─── Client-side functions ────────────────────────────────────────────────────

export const getDashboardDocente = async (): Promise<DocenteStats> => {
  const raw = await apiFetchClient<DocenteAPI>('/dashboard/docente')
  if (!raw) return emptyDocenteStats()
  return {
    promedioNotas:       0,
    aprobacion:          0,
    estudiantesCount:    raw.total_estudiantes,
    novedadesPendientes: 0,
    notasPorPeriodo:     [],
    horariosHoy:         [],
    topEstudiantes:      [],
    distribucionNotas:   [],
  }
}

export const getDashboardEstudiante = async (): Promise<EstudianteStats> => {
  const raw = await apiFetchClient<EstudianteAPI>('/dashboard/estudiante')
  if (!raw) return emptyEstudianteStats()
  return {
    promedioGeneral:      raw.promedio_general ?? 0,
    aprobacion:           0,
    porcentajeAsistencia: raw.porcentaje_asistencia ?? 0,
    totalAsistencias:     0,
    novedadesActivas:     raw.novedades_pendientes,
    notasPorMateria:      [],
    notasPorPeriodo:      [],
    asistenciaEstados:    [],
    novedadesRecientes:   [],
  }
}

export const getDashboardPadre = async (): Promise<PadreStats> => {
  const raw = await apiFetchClient<PadreAPI>('/dashboard/padre')
  if (!raw) return { hijos: [] }
  return {
    hijos: [{
      idEstudiante:        raw.id_estudiante,
      nombreCompleto:      raw.nombre_estudiante,
      codigoEstudiante:    '—',
      curso:               '—',
      promedioGeneral:     raw.promedio_general ?? 0,
      aprobacion:          0,
      porcentajeAsistencia: raw.porcentaje_asistencia ?? 0,
      novedadesActivas:    raw.novedades_pendientes,
      notasPorMateria:     [],
      notasPorPeriodo:     [],
      asistenciaEstados:   [],
      novedadesRecientes:  [],
      registrosAsistencia: [],
    }],
  }
}

// ─── Server-side functions (token-based) ─────────────────────────────────────

export async function getDashboardDocenteServer(token: string): Promise<DocenteStats> {
  const raw = await apiFetchServer<DocenteAPI>('/dashboard/docente', token)
  if (!raw) return emptyDocenteStats()
  return {
    promedioNotas:       0,
    aprobacion:          0,
    estudiantesCount:    raw.total_estudiantes,
    novedadesPendientes: 0,
    notasPorPeriodo:     [],
    horariosHoy:         [],
    topEstudiantes:      [],
    distribucionNotas:   [],
  }
}

export async function getDashboardEstudianteServer(token: string): Promise<EstudianteStats> {
  const raw = await apiFetchServer<EstudianteAPI>('/dashboard/estudiante', token)
  if (!raw) return emptyEstudianteStats()
  return {
    promedioGeneral:      raw.promedio_general ?? 0,
    aprobacion:           0,
    porcentajeAsistencia: raw.porcentaje_asistencia ?? 0,
    totalAsistencias:     0,
    novedadesActivas:     raw.novedades_pendientes,
    notasPorMateria:      [],
    notasPorPeriodo:      [],
    asistenciaEstados:    [],
    novedadesRecientes:   [],
  }
}

export async function getDashboardPadreServer(token: string): Promise<PadreStats> {
  const raw = await apiFetchServer<PadreAPI>('/dashboard/padre', token)
  if (!raw) return { hijos: [] }
  return {
    hijos: [{
      idEstudiante:        raw.id_estudiante,
      nombreCompleto:      raw.nombre_estudiante,
      codigoEstudiante:    '—',
      curso:               '—',
      promedioGeneral:     raw.promedio_general ?? 0,
      aprobacion:          0,
      porcentajeAsistencia: raw.porcentaje_asistencia ?? 0,
      novedadesActivas:    raw.novedades_pendientes,
      notasPorMateria:     [],
      notasPorPeriodo:     [],
      asistenciaEstados:   [],
      novedadesRecientes:  [],
      registrosAsistencia: [],
    }],
  }
}

// ─── Legacy admin helpers (unused — AdminDashboardClient uses dashboardActions) ─

export const getPromedioGeneral     = async () => 0
export const getAprobacion          = async () => 0
export const getEstudiantesActivos  = async () => 0
export const getAsistenciaPromedio  = async () => 0
export const getNotasPorPeriodo     = async () => []
export const getDistribucionUsuarios = async () => []
