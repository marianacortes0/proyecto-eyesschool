'use client'

import dynamic from 'next/dynamic'
import { useDocenteDashboard } from '@/hooks/useDocenteDashboard'
import { StatsCard } from './StatsCard'
import type { HorarioHoy, TopEstudiante, DocenteStats } from '@/services/dashboard/dashboardService'
import { motion } from 'framer-motion'
import { Calendar, Trophy, Users, AlertCircle, Clock, BookOpen } from 'lucide-react'

const DashboardCharts = dynamic(
  () => import('./DashboardCharts').then((mod) => mod.DashboardCharts),
  { ssr: false, loading: () => <div className="h-[300px] bg-slate-100 dark:bg-slate-800 animate-pulse rounded-[2rem] w-full" /> }
)

const CircularChart = dynamic(
  () => import('./CircularChart').then((mod) => mod.CircularChart),
  { ssr: false, loading: () => <div className="h-[300px] bg-slate-100 dark:bg-slate-800 animate-pulse rounded-[2rem] w-full" /> }
)

function notaColor(nota: number) {
  if (nota >= 7) return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
  if (nota >= 5) return 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
  if (nota >= 3) return 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400'
  return 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
}

function HorarioList({ horarios }: { horarios: HorarioHoy[] }) {
  if (!horarios.length) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-slate-400">
        <Clock size={40} className="mb-2 opacity-50" />
        <p className="text-sm font-medium">No class scheduled for today</p>
      </div>
    )
  }
  return (
    <ul className="space-y-4 mt-6">
      {horarios.map(h => (
        <li key={h.idHorario} className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl flex items-center justify-between border border-transparent hover:border-blue-100 dark:hover:border-white/10 transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-blue-600 shadow-sm group-hover:scale-110 transition-transform">
              <BookOpen size={20} />
            </div>
            <div>
              <p className="font-bold text-slate-800 dark:text-white text-sm uppercase tracking-tight">{h.nombreMateria}</p>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{h.nombreCurso} · Salón {h.salon}</p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black bg-blue-600 text-white rounded-lg px-2 py-1 shadow-lg shadow-blue-500/20">
              {h.horaInicio.slice(0, 5)} – {h.horaFin.slice(0, 5)}
            </span>
          </div>
        </li>
      ))}
    </ul>
  )
}

function TopEstudiantesTable({ estudiantes }: { estudiantes: TopEstudiante[] }) {
  if (!estudiantes.length) {
    return <p className="text-slate-400 text-xs mt-4">Sin datos de estudiantes.</p>
  }
  return (
    <div className="mt-6">
      <div className="space-y-3">
        {estudiantes.map((e, i) => (
          <div key={e.idEstudiante} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all group border border-transparent hover:border-slate-100 dark:hover:border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500">
                #{i + 1}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-white leading-tight">{e.nombre}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase">{e.codigoEstudiante}</p>
              </div>
            </div>
            <div className={`px-3 py-1.5 rounded-xl font-black text-xs ${notaColor(e.promedio)}`}>
              {e.promedio.toFixed(1)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function DocenteDashboardClient({ initialData }: { initialData?: DocenteStats }) {
  const { data, loading, error } = useDocenteDashboard(initialData)

  if (loading) {
    return (
      <div className="p-8 space-y-8 animate-pulse">
        <div className="h-40 bg-slate-100 dark:bg-slate-800 rounded-[2rem]" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
           {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-slate-100 dark:bg-slate-800 rounded-[2rem]" />)}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-[2.5rem] p-8 flex items-center gap-4 text-rose-700 dark:text-rose-400">
          <AlertCircle size={32} />
          <div>
            <p className="font-black uppercase tracking-widest text-xs">Error detected</p>
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
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
        >
          <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Academic Docent Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 font-semibold capitalize">{diaActual}</p>
        </motion.div>
        
        <div className="px-6 py-3 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-2xl flex items-center gap-3">
          <Calendar className="text-blue-600" size={20} />
          <span className="text-sm font-bold text-blue-700 dark:text-blue-300">New Semester Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatsCard title="General Grade Average" value={data.promedioNotas} progress={(data.promedioNotas / 10) * 100} color="#8b5cf6" trend={{ value: 1.2, type: 'up', label: 'vs last week' }} />
        <StatsCard title="Approval Rate"         value={`${data.aprobacion}%`} progress={data.aprobacion} color="#10b981" trend={{ value: 5, type: 'up', label: 'goal reached' }} />
        <StatsCard title="Active Students"       value={data.estudiantesCount} progress={data.estudiantesCount > 0 ? 100 : 0} color="#3b82f6" trend={{ value: 12, type: 'neutral', label: 'total classes' }} />
        <StatsCard title="Pending Updates"      value={data.novedadesPendientes} progress={data.novedadesPendientes > 0 ? 100 : 0} color="#f59e0b" trend={{ value: 0, type: 'neutral', label: 'inbox clean' }} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2">
          <DashboardCharts data={data.notasPorPeriodo} />
        </div>
        <motion.div 
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-premium border border-slate-100 dark:border-white/5"
        >
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Top Students</h2>
              <p className="text-xs text-slate-400 font-medium tracking-tight">Highest academic performers</p>
            </div>
            <Trophy className="text-amber-400" size={24} />
          </div>
          <TopEstudiantesTable estudiantes={data.topEstudiantes} />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="xl:col-span-2 bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-premium border border-slate-100 dark:border-white/5"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Today's Schedule</h2>
              <p className="text-xs text-slate-400 font-medium tracking-tight">Your upcoming academic sessions</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 font-bold text-xs uppercase shadow-sm">
              Today
            </div>
          </div>
          <HorarioList horarios={data.horariosHoy} />
        </motion.div>
        
        <CircularChart 
          data={data.distribucionNotas} 
          title="Student Performance"
          colors={['#10b981', '#ef4444', '#f59e0b', '#3b82f6']}
        />
      </div>
    </div>
  )
}
