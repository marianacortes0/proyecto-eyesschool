'use client'

import dynamic from 'next/dynamic'
import { useEstudianteDashboard } from '@/hooks/useEstudianteDashboard'
import { StatsCard } from './StatsCard'
import type { NovedadResumen, EstudianteStats } from '@/services/dashboard/dashboardService'
import { motion } from 'framer-motion'
import { GraduationCap, Calendar, Bell, BarChart3, Clock, AlertCircle } from 'lucide-react'

const BarChart     = dynamic(() => import('recharts').then(m => m.BarChart),     { ssr: false })
const Bar          = dynamic(() => import('recharts').then(m => m.Bar),          { ssr: false })
const XAxis        = dynamic(() => import('recharts').then(m => m.XAxis),        { ssr: false })
const YAxis        = dynamic(() => import('recharts').then(m => m.YAxis),        { ssr: false })
const Tooltip      = dynamic(() => import('recharts').then(m => m.Tooltip),      { ssr: false })
const Cell         = dynamic(() => import('recharts').then(m => m.Cell),         { ssr: false })
const ResponsiveContainer = dynamic(() => import('recharts').then(m => m.ResponsiveContainer), { ssr: false })

const DashboardCharts = dynamic(
  () => import('./DashboardCharts').then((mod) => mod.DashboardCharts),
  { ssr: false, loading: () => <div className="h-[300px] bg-slate-100 dark:bg-slate-800 animate-pulse rounded-[2rem] w-full" /> }
)

const CircularChart = dynamic(
  () => import('./CircularChart').then((mod) => mod.CircularChart),
  { ssr: false, loading: () => <div className="h-[300px] bg-slate-100 dark:bg-slate-800 animate-pulse rounded-[2rem] w-full" /> }
)

const ESTADO_COLORES: Record<string, string> = {
  Presente:    '#22c55e',
  Tarde:       '#eab308',
  Ausente:     '#ef4444',
  Excusa:      '#3b82f6',
  'Suspensión': '#a855f7',
}

const NOVEDAD_ESTADO_BADGE: Record<string, string> = {
  Pendiente:    'bg-yellow-50 text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-400',
  'En Proceso': 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
  Resuelta:     'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
  Cerrada:      'bg-slate-50 text-slate-500 dark:bg-white/10 dark:text-slate-400',
}

function barColor(promedio: number) {
  if (promedio >= 7) return '#10b981'
  if (promedio >= 5) return '#f59e0b'
  if (promedio >= 3) return '#f97316'
  return '#ef4444'
}

function NovedadesList({ novedades }: { novedades: NovedadResumen[] }) {
  if (!novedades.length) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-slate-400">
        <Bell size={40} className="mb-2 opacity-50" />
        <p className="text-sm font-medium">No updates reported</p>
      </div>
    )
  }
  return (
    <ul className="space-y-4 mt-6">
      {novedades.map(n => (
        <li key={n.idNovedad} className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl flex flex-col gap-2 border border-transparent hover:border-blue-100 dark:hover:border-white/10 transition-all group">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">{n.nombreTipo}</p>
              <p className="text-sm font-bold text-slate-800 dark:text-white leading-tight uppercase tracking-tight">{n.descripcion}</p>
            </div>
            <span className={`text-[10px] font-black uppercase rounded-lg px-2 py-1 shrink-0 shadow-sm ${NOVEDAD_ESTADO_BADGE[n.estado] ?? 'bg-slate-100 text-slate-500'}`}>
              {n.estado}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Clock size={12} className="text-slate-400" />
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(n.fecha + 'T00:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}

export default function EstudianteDashboardClient({ initialData }: { initialData?: EstudianteStats }) {
  const { data, loading, error } = useEstudianteDashboard(initialData)

  if (loading) {
     return (
        <div className="p-8 space-y-8 animate-pulse">
           <div className="h-40 bg-slate-100 dark:bg-slate-800 rounded-[2rem]" />
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => <div key={i} className="h-40 bg-slate-100 dark:bg-slate-800 rounded-[2rem]" />)}
           </div>
        </div>
     )
  }

  if (error) {
     return (
        <div className="p-8">
           <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 rounded-[2.5rem] p-8 flex items-center gap-4 text-rose-700 dark:text-rose-400">
              <AlertCircle size={32} />
              <div>
                 <p className="font-black uppercase tracking-widest text-xs">Access Error</p>
                 <p className="font-medium">{error}</p>
              </div>
           </div>
        </div>
     )
  }

  if (!data) return null

  const diaActual = new Intl.DateTimeFormat('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(new Date())

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight leading-tight">Student Performance<br/><span className="text-blue-600">Overview</span></h1>
          <p className="text-slate-500 dark:text-slate-400 font-semibold capitalize mt-1">{diaActual}</p>
        </motion.div>
        
        <div className="px-6 py-4 bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-[1.5rem] flex items-center gap-4">
           <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <GraduationCap size={24} />
           </div>
           <div>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Target Average</p>
              <p className="text-lg font-black text-slate-800 dark:text-white tracking-tighter">8.5 / 10</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        <StatsCard title="General GPA"    value={data.promedioGeneral.toFixed(2)} progress={(data.promedioGeneral / 10) * 100} color="#8b5cf6" trend={{ value: 0.5, type: 'up', label: 'vs last period' }} />
        <StatsCard title="Attendance"     value={`${data.porcentajeAsistencia}%`} progress={data.porcentajeAsistencia} color="#3b82f6" trend={{ value: 95, type: 'neutral', label: 'School Minimum' }} />
        <StatsCard title="Active Updates"  value={data.novedadesActivas} progress={data.novedadesActivas > 0 ? 100 : 0} color="#f59e0b" trend={{ value: 0, type: 'neutral', label: 'Recent reports' }} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-premium border border-slate-100 dark:border-white/5"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Average by Subject</h2>
              <p className="text-xs text-slate-400 font-medium tracking-tight">Academic results per registered materia</p>
            </div>
            <BarChart3 className="text-slate-200" size={32} />
          </div>
          {data.notasPorMateria.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.notasPorMateria} layout="vertical" margin={{ left: 0, right: 30 }}>
                <XAxis type="number" domain={[0, 10]} hide />
                <YAxis 
                   type="category" 
                   dataKey="nombreMateria" 
                   width={120} 
                   axisLine={false} 
                   tickLine={false}
                   tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }}
                />
                <Tooltip 
                   cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                   contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                 />
                <Bar dataKey="promedio" radius={[0, 10, 10, 0]} barSize={20}>
                  {data.notasPorMateria.map((entry, i) => (
                    <Cell key={i} fill={barColor(entry.promedio)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-slate-300">
               <p className="text-sm font-bold uppercase tracking-widest">No grades yet</p>
            </div>
          )}
        </motion.div>

        <DashboardCharts data={data.notasPorPeriodo} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-1">
           <CircularChart 
             data={data.asistenciaEstados.map(e => ({ name: e.estado, value: e.cantidad }))} 
             title="Attendance Status"
             colors={Object.values(ESTADO_COLORES)}
           />
        </div>

        <motion.div 
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           className="xl:col-span-2 bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-premium border border-slate-100 dark:border-white/5"
        >
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Recent Updates</h2>
              <p className="text-xs text-slate-400 font-medium tracking-tight">System and teacher notifications</p>
            </div>
            <div className="px-3 py-1 bg-slate-100 dark:bg-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500 rounded-lg border border-slate-200/50 dark:border-white/5">
               Latest
            </div>
          </div>
          <NovedadesList novedades={data.novedadesRecientes} />
        </motion.div>
      </div>
    </div>
  )
}
