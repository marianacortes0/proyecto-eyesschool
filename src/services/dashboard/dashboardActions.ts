'use server'

import { cookies } from 'next/headers'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

async function getToken(): Promise<string | null> {
  const store = await cookies()
  return store.get('eys_access')?.value ?? null
}

type AdminDashboard = {
  totalEstudiantes: number
  totalProfesores: number
  totalCursos: number
  promedioGeneral: number | null
  tasaAprobacion: number | null
  porcentajeAsistencia: number | null
  totalNovedadesActivas: number
}

export async function getAdminDashboardAction(): Promise<AdminDashboard | null> {
  return getAdminDashboard()
}

async function getAdminDashboard(): Promise<AdminDashboard | null> {
  const token = await getToken()
  const res = await fetch(`${API}/dashboard/admin`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })
  if (!res.ok) return null
  const data = await res.json() as Record<string, unknown>
  return {
    totalEstudiantes:    (data.total_estudiantes as number) ?? 0,
    totalProfesores:     (data.total_profesores as number) ?? 0,
    totalCursos:         (data.total_cursos as number) ?? 0,
    promedioGeneral:     (data.promedio_general as number | null) ?? null,
    tasaAprobacion:      (data.tasa_aprobacion as number | null) ?? null,
    porcentajeAsistencia:(data.porcentaje_asistencia as number | null) ?? null,
    totalNovedadesActivas:(data.total_novedades_activas as number) ?? 0,
  }
}

export async function getPromedioGeneralAction(): Promise<number> {
  const d = await getAdminDashboard()
  return d?.promedioGeneral ?? 0
}

export async function getAprobacionAction(): Promise<number> {
  const d = await getAdminDashboard()
  return d?.tasaAprobacion ?? 0
}

export async function getEstudiantesActivosAction(): Promise<number> {
  const d = await getAdminDashboard()
  return d?.totalEstudiantes ?? 0
}

export async function getAsistenciaPromedioAction(): Promise<number> {
  const d = await getAdminDashboard()
  return d?.porcentajeAsistencia ?? 0
}

export async function getNotasPorPeriodoAction(): Promise<{ periodo: string; promedio: number }[]> {
  // Returns empty until a dedicated endpoint is added to the backend
  return []
}

export async function getDistribucionUsuariosAction(): Promise<{ name: string; value: number }[]> {
  // Returns empty until a dedicated endpoint is added to the backend
  return []
}
