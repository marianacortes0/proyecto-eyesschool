import { getDashboardPadre, type PadreStats } from '@/services/dashboard/dashboardService'
import { useCargaInicio } from './useCargaInicio'

// Si ya hay datos del servidor no se vuelven a pedir (useCargaInicio).
export function usePadreDashboard(initialData?: PadreStats) {
  return useCargaInicio(getDashboardPadre, initialData)
}
