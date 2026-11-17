import { getDashboardEstudiante, type EstudianteStats } from '@/services/dashboard/dashboardService'
import { useCargaInicio } from './useCargaInicio'

export function useEstudianteDashboard(initialData?: EstudianteStats) {
  return useCargaInicio(getDashboardEstudiante, initialData)
}
