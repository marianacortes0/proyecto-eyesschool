import { useState, useEffect } from 'react'
import { getDashboardEstudiante, type EstudianteStats } from '@/services/dashboard/dashboardService'

export function useEstudianteDashboard(initialData?: EstudianteStats) {
  const [data, setData]       = useState<EstudianteStats | null>(initialData ?? null)
  const [loading, setLoading] = useState(!initialData)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    if (initialData) return

    getDashboardEstudiante()
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error }
}

