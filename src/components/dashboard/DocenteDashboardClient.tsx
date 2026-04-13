'use client'

import dynamic from 'next/dynamic'
import { useDocenteDashboard } from '@/hooks/useDocenteDashboard'
import { StatsCard } from './StastCard'
import type { HorarioHoy, TopEstudiante, DocenteStats } from '@/services/dashboard/dashboardService'

const LineChart    = dynamic(() => import('recharts').then(m => m.LineChart),    { ssr: false })
const Line         = dynamic(() => import('recharts').then(m => m.Line),         { ssr: false })
const XAxis        = dynamic(() => import('recharts').then(m => m.XAxis),        { ssr: false })
const YAxis        = dynamic(() => import('recharts').then(m => m.YAxis),        { ssr: false })
const Tooltip      = dynamic(() => import('recharts').then(m => m.Tooltip),      { ssr: false })
const ResponsiveContainer = dynamic(() => import('recharts').then(m => m.ResponsiveContainer), { ssr: false })

// ── Colores por nota ─────────────────────────────────────────────────────────

function notaColor(nota: number) {
  if (nota >= 7) return 'text-emerald-600'
  if (nota >= 5) return 'text-yellow-600'
  if (nota >= 3) return 'text-orange-500'
  return 'text-red-500'
}

// ── Sub-componentes ───────────────────────────────────────────────────────────

function HorarioList({ horarios }: { horarios: HorarioHoy[] }) {
  if (!horarios.length) {
    return <p className="text-gray-400 text-sm mt-2">Sin clases programadas para hoy.</p>
  }
  return (
    <ul className="divide-y divide-gray-100 mt-2">
      {horarios.map(h => (
        <li key={h.idHorario} className="py-3 flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-800 text-sm">{h.nombreMateria}</p>
            <p className="text-xs text-gray-500">{h.nombreCurso} · Salón {h.salon}</p>
          </div>
          <span className="text-xs font-semibold bg-blue-50 text-blue-700 rounded-full px-3 py-1">
            {h.horaInicio.slice(0, 5)} – {h.horaFin.slice(0, 5)}
          </span>
        </li>
      ))}
    </ul>
  )
}

function TopEstudiantesTable({ estudiantes }: { estudiantes: TopEstudiante[] }) {
  if (!estudiantes.length) {
    return <p className="text-gray-400 text-sm mt-2">Sin datos de estudiantes.</p>
  }
  return (
    <div className="overflow-x-auto mt-2">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500 text-xs uppercase tracking-wide border-b border-gray-100">
            <th className="pb-2 pr-4">#</th>
            <th className="pb-2 pr-4">Estudiante</th>
            <th className="pb-2 pr-4">Código</th>
            <th className="pb-2 text-right">Promedio</th>
          </tr>
        </thead>
        <tbody>
          {estudiantes.map((e, i) => (
            <tr key={e.idEstudiante} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
              <td className="py-2 pr-4 text-gray-400 font-medium">{i + 1}</td>
              <td className="py-2 pr-4 font-medium text-gray-800">{e.nombre}</td>
              <td className="py-2 pr-4 text-gray-500">{e.codigoEstudiante}</td>
              <td className={`py-2 text-right font-bold ${notaColor(e.promedio)}`}>{e.promedio}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function DocenteDashboardClient({ initialData }: { initialData?: DocenteStats }) {
  const { data, loading, error } = useDocenteDashboard(initialData)

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-md p-5 animate-pulse h-24" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl shadow-md p-5 animate-pulse h-64" />
          <div className="bg-white rounded-2xl shadow-md p-5 animate-pulse h-64" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
          Error al cargar el dashboard: {error}
        </div>
      </div>
    )
  }

  if (!data) return null

  const diaActual = new Intl.DateTimeFormat('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(new Date())

  return (
    <div className="p-6 space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Mi Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1 capitalize">{diaActual}</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard title="Promedio de notas" value={data.promedioNotas} />
        <StatsCard title="Aprobación"         value={`${data.aprobacion}%`} />
        <StatsCard title="Estudiantes activos" value={data.estudiantesCount} />
        <StatsCard title="Novedades pendientes" value={data.novedadesPendientes} />
      </div>

      {/* Gráfica + Top Estudiantes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-md">
          <h2 className="font-semibold text-gray-700 mb-4">Rendimiento por período</h2>
          {data.notasPorPeriodo.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={data.notasPorPeriodo}>
                <XAxis dataKey="periodo" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="promedio" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm mt-8 text-center">Sin notas registradas aún.</p>
          )}
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-md">
          <h2 className="font-semibold text-gray-700 mb-1">Top 5 estudiantes</h2>
          <TopEstudiantesTable estudiantes={data.topEstudiantes} />
        </div>
      </div>

      {/* Horario de hoy */}
      <div className="bg-white p-5 rounded-2xl shadow-md">
        <h2 className="font-semibold text-gray-700">Clases de hoy</h2>
        <HorarioList horarios={data.horariosHoy} />
      </div>
    </div>
  )
}
