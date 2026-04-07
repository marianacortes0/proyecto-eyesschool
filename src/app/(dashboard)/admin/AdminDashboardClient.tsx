'use client'

import { useDashboard } from '../../../hooks/useDashboard'
import { StatsCard } from '../../../components/dashboard/StastCard'
import { DashboardCharts } from '../../../components/dashboard/DashboardCharts'

export default function AdminDashboardClient() {
  const { stats, charts, loading } = useDashboard()

  if (loading) return <p>Cargando...</p>

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard title="Promedio General" value={stats.promedio} />
        <StatsCard title="Aprobación" value={`${stats.aprobacion}%`} />
        <StatsCard title="Estudiantes Activos" value={stats.estudiantes} />
        <StatsCard title="Asistencia Promedio" value={`${stats.asistencia}%`} />
      </div>
      <DashboardCharts data={charts} />
    </div>
  )
}
