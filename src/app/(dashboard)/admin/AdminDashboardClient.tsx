'use client'

import { useDashboard } from '@/hooks/useDashboard'
import { useAuth } from '@/hooks/useAuth'
import MinimalDashboard, { type DashboardKpi } from '@/components/panel/MinimalDashboard'

const dec = (n: number | null | undefined) => (n == null ? '—' : n.toFixed(1))
const pct = (n: number | null | undefined) => (n == null ? '—' : `${Math.round(n)}%`)
const num = (n: number | null | undefined) => (n == null ? '—' : String(n))

export default function AdminDashboardClient() {
  const { stats, loading } = useDashboard()
  const { user } = useAuth()
  const name = user?.primerNombre || 'de nuevo'

  const kpis: DashboardKpi[] = [
    { label: 'Promedio general', value: dec(stats.promedio), icon: 'school', accent: 'primary' },
    { label: 'Tasa de aprobación', value: pct(stats.aprobacion), icon: 'verified', accent: 'purple', percent: stats.aprobacion },
    { label: 'Asistencia media', value: pct(stats.asistencia), icon: 'fact_check', accent: 'teal', percent: stats.asistencia },
  ]

  return (
    <MinimalDashboard
      greetingName={name}
      subtitle="Resumen académico de la institución."
      primary={{ label: 'Estudiantes activos', value: num(stats.estudiantes), caption: 'Matrícula total registrada' }}
      kpis={kpis}
      loading={loading}
    />
  )
}
