'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { usePadreDashboard } from '@/hooks/usePadreDashboard'
import { StatsCard } from './StastCard'
import type { HijoStats, NovedadResumen, PadreStats } from '@/services/dashboard/dashboardService'

const BarChart     = dynamic(() => import('recharts').then(m => m.BarChart),     { ssr: false })
const Bar          = dynamic(() => import('recharts').then(m => m.Bar),          { ssr: false })
const XAxis        = dynamic(() => import('recharts').then(m => m.XAxis),        { ssr: false })
const YAxis        = dynamic(() => import('recharts').then(m => m.YAxis),        { ssr: false })
const Tooltip      = dynamic(() => import('recharts').then(m => m.Tooltip),      { ssr: false })
const Cell         = dynamic(() => import('recharts').then(m => m.Cell),         { ssr: false })
const ResponsiveContainer = dynamic(() => import('recharts').then(m => m.ResponsiveContainer), { ssr: false })

// ── Helpers ───────────────────────────────────────────────────────────────────

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

function notaColor(nota: number) {
  if (nota >= 7) return 'text-emerald-600'
  if (nota >= 5) return 'text-yellow-600'
  if (nota >= 3) return 'text-orange-500'
  return 'text-red-500'
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

function HijoPanel({ hijo }: { hijo: HijoStats }) {
  return (
    <div className="space-y-4">
      {/* KPIs del hijo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-md p-5">
          <p className="text-gray-500 text-sm">Promedio general</p>
          <h2 className={`text-2xl font-bold mt-1 ${notaColor(hijo.promedioGeneral)}`}>{hijo.promedioGeneral}</h2>
          <p className="text-xs text-gray-400 mt-1">{hijo.aprobacion}% de aprobación</p>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-5">
          <p className="text-gray-500 text-sm">Asistencia</p>
          <h2 className="text-2xl font-bold mt-1 text-blue-600">{hijo.porcentajeAsistencia}%</h2>
          <p className="text-xs text-gray-400 mt-1">de los registros</p>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-5">
          <p className="text-gray-500 text-sm">Novedades activas</p>
          <h2 className={`text-2xl font-bold mt-1 ${hijo.novedadesActivas > 0 ? 'text-amber-500' : 'text-gray-700'}`}>
            {hijo.novedadesActivas}
          </h2>
          <p className="text-xs text-gray-400 mt-1">pendientes o en proceso</p>
        </div>
      </div>

      {/* Notas por materia + Novedades */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-md">
          <h3 className="font-semibold text-gray-700 mb-4">Promedio por materia</h3>
          {hijo.notasPorMateria.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={hijo.notasPorMateria} layout="vertical" margin={{ left: 8 }}>
                <XAxis type="number" domain={[0, 10]} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="nombreMateria" width={110} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: any) => [v, 'Promedio']} />
                <Bar dataKey="promedio" radius={[0, 4, 4, 0]}>
                  {hijo.notasPorMateria.map((entry, i) => (
                    <Cell key={i} fill={barColor(entry.promedio)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm mt-8 text-center">Sin notas registradas.</p>
          )}
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-md">
          <h3 className="font-semibold text-gray-700 mb-1">Novedades recientes</h3>
          <NovedadesList novedades={hijo.novedadesRecientes} />
        </div>
      </div>
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function PadreDashboardClient({ initialData }: { initialData?: PadreStats }) {
  const { data, loading, error } = usePadreDashboard(initialData)
  const [hijoActivo, setHijoActivo] = useState(0)

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

  if (!data || data.hijos.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Dashboard Familiar</h1>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
          <p className="text-blue-700 font-medium">No hay estudiantes vinculados a tu cuenta.</p>
          <p className="text-blue-500 text-sm mt-1">Contacta al administrador para vincular a tus hijos.</p>
        </div>
      </div>
    )
  }

  const diaActual = new Intl.DateTimeFormat('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(new Date())
  const hijo = data.hijos[hijoActivo]

  return (
    <div className="p-6 space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Seguimiento Académico</h1>
        <p className="text-gray-500 text-sm mt-1 capitalize">{diaActual}</p>
      </div>

      {/* Selector de hijo (si hay más de uno) */}
      {data.hijos.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {data.hijos.map((h, i) => (
            <button
              key={h.idEstudiante}
              onClick={() => setHijoActivo(i)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                hijoActivo === i
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {h.nombreCompleto}
            </button>
          ))}
        </div>
      )}

      {/* Info del hijo */}
      <div className="bg-white rounded-2xl shadow-md px-5 py-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg shrink-0">
          {hijo.nombreCompleto.charAt(0)}
        </div>
        <div>
          <p className="font-semibold text-gray-800">{hijo.nombreCompleto}</p>
          <p className="text-xs text-gray-500">{hijo.curso} · Código: {hijo.codigoEstudiante}</p>
        </div>
      </div>

      {/* Panel del hijo seleccionado */}
      <HijoPanel hijo={hijo} />
    </div>
  )
}
