import { useState, useEffect } from 'react'
import { getDashboardDocente, type DocenteStats } from '@/services/dashboard/dashboardService'

export function useDocenteDashboard(initialData?: DocenteStats) {
  const [data, setData]       = useState<DocenteStats | null>(initialData ?? null)
  const [loading, setLoading] = useState(!initialData)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    if (initialData) return

    getDashboardDocente()
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error }
}

