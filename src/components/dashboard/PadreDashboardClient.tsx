'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { usePadreDashboard } from '@/hooks/usePadreDashboard'
import { StatsCard } from './StatsCard'
import type { HijoStats, NovedadResumen, PadreStats, RegistroAsistenciaSimple } from '@/services/dashboard/dashboardService'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Bell, BarChart3, Clock, AlertCircle, ChevronRight, GraduationCap, CalendarDays } from 'lucide-react'

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

const ESTADO_ASISTENCIA_STYLE: Record<string, string> = {
  Presente:    'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  Tarde:       'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  Ausente:     'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400',
  Excusa:      'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  Suspensión:  'bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400',
}

function AsistenciaHistorial({ registros }: { registros: RegistroAsistenciaSimple[] }) {
  const [pagina, setPagina] = useState(0)
  const POR_PAGINA = 10
  const total = registros.length
  const slice = registros.slice(pagina * POR_PAGINA, (pagina + 1) * POR_PAGINA)

  if (!registros.length) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-slate-400">
        <CalendarDays size={36} className="mb-2 opacity-40" />
        <p className="text-sm font-semibold">Sin registros de asistencia</p>
      </div>
    )
  }

  return (
    <div>
      <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-white/5 text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-widest font-black">
              <th className="px-4 py-3 text-left">Fecha</th>
              <th className="px-4 py-3 text-left">Tipo</th>
              <th className="px-4 py-3 text-left">Estado</th>
              <th className="px-4 py-3 text-left">Observación</th>
            </tr>
          </thead>
          <tbody>
            {slice.map((r, i) => (
              <tr
                key={r.idAsistencia}
                className={`border-t border-slate-100 dark:border-white/5 ${i % 2 === 0 ? '' : 'bg-slate-50/50 dark:bg-white/[0.02]'}`}
              >
                <td className="px-4 py-3 whitespace-nowrap text-slate-700 dark:text-slate-300 font-semibold">
                  {new Date(r.fecha + 'T00:00:00').toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-slate-500 dark:text-slate-400 capitalize">
                  {r.tipo ?? '—'}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${ESTADO_ASISTENCIA_STYLE[r.estado] ?? 'bg-slate-100 text-slate-600'}`}>
                    {r.estado}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-400 dark:text-slate-500 text-xs max-w-[180px] truncate" title={r.observacion ?? ''}>
                  {r.observacion || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {total > POR_PAGINA && (
        <div className="flex items-center justify-between mt-4 px-1">
          <span className="text-xs text-slate-400 font-semibold">
            {pagina * POR_PAGINA + 1}–{Math.min((pagina + 1) * POR_PAGINA, total)} de {total}
          </span>
          <div className="flex gap-2">
            <button
              disabled={pagina === 0}
              onClick={() => setPagina(p => p - 1)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-200 dark:hover:bg-white/20 transition-colors"
            >
              Anterior
            </button>
            <button
              disabled={(pagina + 1) * POR_PAGINA >= total}
              onClick={() => setPagina(p => p + 1)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-200 dark:hover:bg-white/20 transition-colors"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function HijoPanel({ hijo }: { hijo: HijoStats }) {
  return (
    <motion.div 
      key={hijo.idEstudiante}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        <StatsCard 
          title="General GPA" 
          value={hijo.promedioGeneral.toFixed(2)} 
          progress={(hijo.promedioGeneral / 10) * 100}
          color="#8b5cf6" 
          trend={{ value: 0.8, type: 'up', label: 'vs last term' }}
        />
        <StatsCard 
          title="Attendance" 
          value={`${hijo.porcentajeAsistencia}%`} 
          progress={hijo.porcentajeAsistencia}
          color="#3b82f6" 
          trend={{ value: 98, type: 'neutral', label: 'Target reached' }}
        />
        <StatsCard 
          title="Active Notifications" 
          value={hijo.novedadesActivas} 
          progress={hijo.novedadesActivas > 0 ? 100 : 0}
          color="#f59e0b" 
          trend={{ value: 0, type: 'neutral', label: 'Inbox clean' }}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <motion.div 
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
           className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-premium border border-slate-100 dark:border-white/5"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Average by Subject</h3>
              <p className="text-xs text-slate-400 font-medium tracking-tight">Academic results per registered materia</p>
            </div>
            <BarChart3 className="text-slate-200" size={32} />
          </div>
          {hijo.notasPorMateria.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={hijo.notasPorMateria} layout="vertical" margin={{ left: 0, right: 30 }}>
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
                  {hijo.notasPorMateria.map((entry, i) => (
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

        <DashboardCharts data={hijo.notasPorPeriodo} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-1">
           <CircularChart 
             data={hijo.asistenciaEstados.map(e => ({ name: e.estado, value: e.cantidad }))} 
             title="Attendance Breakdown"
             colors={['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6']}
           />
        </div>

        <motion.div
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           className="xl:col-span-2 bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-premium border border-slate-100 dark:border-white/5"
        >
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Recent Updates</h3>
              <p className="text-xs text-slate-400 font-medium tracking-tight">School and teacher notifications</p>
            </div>
            <div className="px-3 py-1 bg-slate-100 dark:bg-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500 rounded-lg border border-slate-200/50 dark:border-white/5">
               Latest
            </div>
          </div>
          <NovedadesList novedades={hijo.novedadesRecientes} />
        </motion.div>
      </div>

      {/* Historial de asistencia */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-premium border border-slate-100 dark:border-white/5"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Historial de Asistencia</h3>
            <p className="text-xs text-slate-400 font-medium tracking-tight">Registros de entrada y salida del estudiante</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
            <CalendarDays size={20} className="text-blue-500" />
          </div>
        </div>
        <AsistenciaHistorial registros={hijo.registrosAsistencia} />
      </motion.div>
    </motion.div>
  )
}

export default function PadreDashboardClient({ initialData }: { initialData?: PadreStats }) {
  const { data, loading, error } = usePadreDashboard(initialData)
  const [hijoActivo, setHijoActivo] = useState(0)

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
                 <p className="font-black uppercase tracking-widest text-xs">Sync Error</p>
                 <p className="font-medium">{error}</p>
              </div>
           </div>
        </div>
     )
  }

  if (!data || data.hijos.length === 0) {
    return (
      <div className="p-8 max-w-[1600px] mx-auto">
        <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-6 tracking-tight">Family Dashboard</h1>
        <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-[2.5rem] p-12 text-center group">
          <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/10 transition-transform group-hover:scale-110">
             <AlertCircle className="text-blue-500" size={32} />
          </div>
          <p className="text-blue-700 dark:text-blue-300 font-bold text-xl tracking-tight">No students linked to your account.</p>
          <p className="text-blue-500 dark:text-blue-400/70 text-sm mt-2 max-w-sm mx-auto font-medium">Please contact the administration office to link your student profiles to this user account.</p>
        </div>
      </div>
    )
  }

  const diaActual = new Intl.DateTimeFormat('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(new Date())
  const hijo = data.hijos[hijoActivo]

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
        >
          <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight leading-tight uppercase">Family Academic Tracking</h1>
          <p className="text-slate-500 dark:text-slate-400 font-semibold capitalize mt-1">{diaActual}</p>
        </motion.div>
        
        <div className="px-6 py-4 bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-[1.5rem] flex items-center gap-4">
           <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Users size={24} />
           </div>
           <div>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Active Profiles</p>
              <p className="text-lg font-black text-slate-800 dark:text-white tracking-tighter">{data.hijos.length} Students</p>
           </div>
        </div>
      </div>

      {data.hijos.length > 1 && (
        <div className="flex gap-3 flex-wrap bg-slate-100/50 dark:bg-white/5 p-2 rounded-[2rem] w-fit border border-slate-200/50 dark:border-white/5">
          {data.hijos.map((h, i) => (
            <button
              key={h.idEstudiante}
              onClick={() => setHijoActivo(i)}
              className={`px-6 py-3 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                hijoActivo === i
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white'
              }`}
            >
              {h.nombreCompleto.split(' ')[0]}
            </button>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div 
          key={hijo.idEstudiante}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl p-8" />
          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="w-24 h-24 rounded-[2rem] bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-black text-4xl shadow-xl border border-white/20">
              {hijo.nombreCompleto.charAt(0)}
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-4xl font-black text-white tracking-tighter mb-1 uppercase leading-none">{hijo.nombreCompleto}</h2>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-4">
                <div className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-lg flex items-center gap-2 border border-white/10">
                  <GraduationCap size={14} className="text-white/70" />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">{hijo.curso}</span>
                </div>
                <div className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-lg flex items-center gap-2 border border-white/10">
                  <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">ID Code:</span>
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">{hijo.codigoEstudiante}</span>
                </div>
              </div>
            </div>
            <div className="md:ml-auto">
               <motion.button 
                 whileHover={{ scale: 1.05 }}
                 whileTap={{ scale: 0.95 }}
                 className="px-6 py-3 bg-white text-blue-700 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-2"
               >
                 <span>View Full Profile</span>
                 <ChevronRight size={16} />
               </motion.button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <HijoPanel hijo={hijo} />
    </div>
  )
}
