'use client'

import { useDashboard } from '@/hooks/useDashboard'
import { useAuth } from '@/hooks/useAuth'
import MinimalDashboard, { type DashboardKpi } from '@/components/panel/MinimalDashboard'
import DashboardCharts from '@/components/panel/DashboardCharts'

const dec = (n: number | null | undefined) => (n == null ? '—' : n.toFixed(1))
const pct = (n: number | null | undefined) => (n == null ? '—' : `${Math.round(n)}%`)
const num = (n: number | null | undefined) => (n == null ? '—' : String(n))

export default function AdminDashboardClient() {
  const { stats, estudiantesPorCurso, usuariosPorRol, promedioPorMateria, loading } = useDashboard()
  const { user } = useAuth()
  const name = user?.primerNombre || 'de nuevo'

  const kpis: DashboardKpi[] = [
    { label: 'Promedio general', value: dec(stats.promedio), icon: 'school', accent: 'primary' },
    { label: 'Tasa de aprobación', value: pct(stats.aprobacion), icon: 'verified', accent: 'purple', percent: stats.aprobacion },
    { label: 'Asistencia media', value: pct(stats.asistencia), icon: 'fact_check', accent: 'teal', percent: stats.asistencia },
    { label: 'Profesores', value: num(stats.profesores), icon: 'groups', accent: 'primary', caption: 'Docentes registrados' },
    { label: 'Cursos activos', value: num(stats.cursos), icon: 'menu_book', accent: 'purple', caption: 'Grupos abiertos' },
    { label: 'Novedades activas', value: num(stats.novedades), icon: 'notifications_active', accent: 'teal', caption: 'Pendientes por resolver' },
  ]

  return (
    <MinimalDashboard
      greetingName={name}
      subtitle="Resumen académico de la institución."
      primary={{ label: 'Matrícula total', value: num(stats.estudiantes), caption: 'Estudiantes registrados' }}
      kpis={kpis}
      loading={loading}
      extra={
        <DashboardCharts
          estudiantesPorCurso={estudiantesPorCurso}
          usuariosPorRol={usuariosPorRol}
          promedioPorMateria={promedioPorMateria}
        />
      }
    />
  )
}
