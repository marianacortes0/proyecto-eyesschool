'use client'

import { useAuth } from '@/hooks/useAuth'
import { useDocenteDashboard } from '@/hooks/useDocenteDashboard'
import { useEstudianteDashboard } from '@/hooks/useEstudianteDashboard'
import { usePadreDashboard } from '@/hooks/usePadreDashboard'
import type { DocenteStats, EstudianteStats, PadreStats } from '@/services/dashboard/dashboardService'
import MinimalDashboard, { type DashboardKpi } from './MinimalDashboard'

const num = (n: number | null | undefined) => (n == null ? '—' : String(n))
const dec = (n: number | null | undefined) => (n == null ? '—' : n.toFixed(1))
const pct = (n: number | null | undefined) => (n == null ? '—' : `${Math.round(n)}%`)

function DocenteDashboard({ name, initial }: { name: string; initial?: DocenteStats }) {
  const { data, loading, error } = useDocenteDashboard(initial)
  const kpis: DashboardKpi[] = [
    { label: 'Cursos asignados', value: num(data?.cursosAsignados), icon: 'menu_book', accent: 'primary' },
    { label: 'Notas registradas hoy', value: num(data?.notasHoy), icon: 'edit_note', accent: 'purple' },
    { label: 'Asistencias hoy', value: num(data?.asistenciasHoy), icon: 'fact_check', accent: 'teal' },
  ]
  return (
    <MinimalDashboard
      greetingName={name}
      subtitle="Resumen de tus cursos y actividad de hoy."
      primary={{ label: 'Estudiantes a tu cargo', value: num(data?.estudiantesCount), caption: 'Total en tus cursos asignados' }}
      kpis={kpis}
      loading={loading}
      error={error}
    />
  )
}

function EstudianteDashboard({ name, initial }: { name: string; initial?: EstudianteStats }) {
  const { data, loading, error } = useEstudianteDashboard(initial)
  const kpis: DashboardKpi[] = [
    { label: 'Asistencia', value: pct(data?.porcentajeAsistencia), icon: 'fact_check', accent: 'teal', percent: data?.porcentajeAsistencia ?? undefined },
    { label: 'Novedades activas', value: num(data?.novedadesActivas), icon: 'campaign', accent: 'purple' },
    { label: 'Periodo actual', value: num(data?.periodoActual), icon: 'calendar_month', accent: 'primary' },
  ]
  return (
    <MinimalDashboard
      greetingName={name}
      subtitle="Tu progreso académico de un vistazo."
      primary={{ label: 'Tu promedio general', value: dec(data?.promedioGeneral), caption: `Periodo actual: ${num(data?.periodoActual)}` }}
      kpis={kpis}
      loading={loading}
      error={error}
    />
  )
}

function PadreDashboard({ name, initial }: { name: string; initial?: PadreStats }) {
  const { data, loading, error } = usePadreDashboard(initial)
  const hijo = data?.hijos?.[0]
  const kpis: DashboardKpi[] = [
    { label: 'Asistencia', value: pct(hijo?.porcentajeAsistencia), icon: 'fact_check', accent: 'teal', percent: hijo?.porcentajeAsistencia ?? undefined },
    { label: 'Novedades activas', value: num(hijo?.novedadesActivas), icon: 'campaign', accent: 'purple' },
    { label: 'Estudiante', value: hijo ? '1' : '0', caption: hijo?.nombreCompleto ?? 'Sin asociar', icon: 'face', accent: 'primary' },
  ]
  return (
    <MinimalDashboard
      greetingName={name}
      subtitle={hijo ? `Seguimiento de ${hijo.nombreCompleto}.` : 'Aún no tienes un estudiante asociado.'}
      primary={{ label: 'Promedio de tu hijo/a', value: dec(hijo?.promedioGeneral), caption: hijo?.nombreCompleto ?? '—' }}
      kpis={kpis}
      loading={loading}
      error={error}
    />
  )
}

export default function GeneralDashboardClient({
  initialDocente,
  initialEstudiante,
  initialPadre,
}: {
  initialDocente?: DocenteStats
  initialEstudiante?: EstudianteStats
  initialPadre?: PadreStats
}) {
  const { user, role } = useAuth()
  const name = user?.primerNombre || 'de nuevo'
  if (role === 'docente') return <DocenteDashboard name={name} initial={initialDocente} />
  if (role === 'estudiante') return <EstudianteDashboard name={name} initial={initialEstudiante} />
  if (role === 'padre') return <PadreDashboard name={name} initial={initialPadre} />
  return <EstudianteDashboard name={name} initial={initialEstudiante} />
}
