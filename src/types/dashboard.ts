export type EstudianteDashboardData = {
  promedio: number
  asistencia: number
  novedades: number
}

export type ProfesorDashboardData = {
  totalEstudiantes: number
}

export type DashboardData =
  | EstudianteDashboardData
  | ProfesorDashboardData