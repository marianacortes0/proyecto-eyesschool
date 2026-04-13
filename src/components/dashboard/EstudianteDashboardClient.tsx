'use client'

import dynamic from 'next/dynamic'
import { useEstudianteDashboard } from '@/hooks/useEstudianteDashboard'
import { StatsCard } from './StastCard'
import type { NovedadResumen, EstudianteStats } from '@/services/dashboard/dashboardService'

const BarChart     = dynamic(() => import('recharts').then(m => m.BarChart),     { ssr: false })
const Bar          = dynamic(() => import('recharts').then(m => m.Bar),          { ssr: false })
const LineChart    = dynamic(() => import('recharts').then(m => m.LineChart),    { ssr: false })
const Line         = dynamic(() => import('recharts').then(m => m.Line),         { ssr: false })
const XAxis        = dynamic(() => import('recharts').then(m => m.XAxis),        { ssr: false })
const YAxis        = dynamic(() => import('recharts').then(m => m.YAxis),        { ssr: false })
const Tooltip      = dynamic(() => import('recharts').then(m => m.Tooltip),      { ssr: false })
const Cell         = dynamic(() => import('recharts').then(m => m.Cell),         { ssr: false })
const ResponsiveContainer = dynamic(() => import('recharts').then(m => m.ResponsiveContainer), { ssr: false })

// ── Colores ───────────────────────────────────────────────────────────────────

const ESTADO_COLORES: Record<string, string> = {
  Presente:    '#22c55e',
  Tarde:       '#eab308',
  Ausente:     '#ef4444',
  Excusa:      '#3b82f6',
  'Suspensión': '#a855f7',
}

const NOVEDAD_ESTADO_BADGE: Record<string, string> = {
  Pendiente:    'bg-yellow-100 text-yellow-700',
  'En Proceso': 'bg-blue-100 text-blue-700',
  Resuelta:     'bg-green-100 text-green-700',
  Cerrada:      'bg-gray-100 text-gray-500',
}

function barColor(promedio: number) {
  if (promedio >= 7) return '#22c55e'
  if (promedio >= 5) return '#eab308'
  if (promedio >= 3) return '#f97316'
  return '#ef4444'
}

// ── Sub-componentes ───────────────────────────────────────────────────────────

function NovedadesList({ novedades }: { novedades: NovedadResumen[] }) {
  if (!novedades.length) {
    return <p className="text-gray-400 text-sm mt-2">Sin novedades registradas.</p>
  }
  return (
    <ul className="divide-y divide-gray-100 mt-2">
      {novedades.map(n => (
        <li key={n.idNovedad} className="py-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 mb-0.5">{n.nombreTipo}</p>
              <p className="text-sm text-gray-700 truncate">{n.descripcion}</p>
              <p className="text-xs text-gray-400 mt-0.5">{new Date(n.fecha + 'T00:00:00').toLocaleDateString('es-CO')}</p>
            </div>
            <span className={`text-xs font-medium rounded-full px-2 py-0.5 shrink-0 ${NOVEDAD_ESTADO_BADGE[n.estado] ?? 'bg-gray-100 text-gray-500'}`}>
              {n.estado}
            </span>
          </div>
        </li>
      ))}
    </ul>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function EstudianteDashboardClient({ initialData }: { initialData?: EstudianteStats }) {
  const { data, loading, error } = useEstudianteDashboard(initialData)

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
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
        <h1 className="text-2xl font-bold text-gray-800">Mi Rendimiento Académico</h1>
        <p className="text-gray-500 text-sm mt-1 capitalize">{diaActual}</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard title="Promedio general"    value={data.promedioGeneral} />
        <StatsCard title="Asistencia"           value={`${data.porcentajeAsistencia}%`} />
        <StatsCard title="Novedades activas"    value={data.novedadesActivas} />
      </div>

      {/* Notas por materia + Notas por período */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-md">
          <h2 className="font-semibold text-gray-700 mb-4">Promedio por materia</h2>
          {data.notasPorMateria.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.notasPorMateria} layout="vertical" margin={{ left: 8 }}>
                <XAxis type="number" domain={[0, 10]} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="nombreMateria" width={110} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: any) => [v, 'Promedio']} />
                <Bar dataKey="promedio" radius={[0, 4, 4, 0]}>
                  {data.notasPorMateria.map((entry, i) => (
                    <Cell key={i} fill={barColor(entry.promedio)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm mt-8 text-center">Sin notas registradas aún.</p>
          )}
        </div>

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
      </div>

      {/* Asistencia por estado + Novedades recientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-md">
          <h2 className="font-semibold text-gray-700 mb-4">
            Asistencia por estado
            <span className="ml-2 text-xs font-normal text-gray-400">({data.totalAsistencias} registros)</span>
          </h2>
          {data.asistenciaEstados.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.asistenciaEstados}>
                <XAxis dataKey="estado" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="cantidad" radius={[4, 4, 0, 0]}>
                  {data.asistenciaEstados.map((entry, i) => (
                    <Cell key={i} fill={ESTADO_COLORES[entry.estado] ?? '#94a3b8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm mt-8 text-center">Sin registros de asistencia.</p>
          )}
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-md">
          <h2 className="font-semibold text-gray-700 mb-1">Novedades recientes</h2>
          <NovedadesList novedades={data.novedadesRecientes} />
        </div>
      </div>
    </div>
  )
}
