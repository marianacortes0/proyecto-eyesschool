import { useState, useEffect } from 'react'
import { getDashboardPadre, type PadreStats } from '@/services/dashboard/dashboardService'

export function usePadreDashboard(initialData?: PadreStats) {
  const [data, setData]       = useState<PadreStats | null>(initialData ?? null)
  const [loading, setLoading] = useState(!initialData)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    // Si ya tenemos datos del servidor, no volvemos a hacer fetch
    if (initialData) return

    getDashboardPadre()
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error }
}

