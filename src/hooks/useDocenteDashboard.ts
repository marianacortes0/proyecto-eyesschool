import { getDashboardDocente, type DocenteStats } from '@/services/dashboard/dashboardService'
import { useCargaInicio } from './useCargaInicio'

export function useDocenteDashboard(initialData?: DocenteStats) {
  return useCargaInicio(getDashboardDocente, initialData)
}
