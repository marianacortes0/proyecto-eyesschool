'use client'

import dynamic from 'next/dynamic'
import { useDashboard } from '../../../hooks/useDashboard'
import { StatsCard } from '../../../components/dashboard/StatsCard'
import { motion } from 'framer-motion'
import { Plus, Download } from 'lucide-react'

const DashboardCharts = dynamic(
  () => import('../../../components/dashboard/DashboardCharts').then((mod) => mod.DashboardCharts),
  { ssr: false, loading: () => <div className="h-[300px] bg-slate-100 dark:bg-slate-800 animate-pulse rounded-[2rem] w-full shadow-sm"></div> }
)

const CircularChart = dynamic(
  () => import('../../../components/dashboard/CircularChart').then((mod) => mod.CircularChart),
  { ssr: false, loading: () => <div className="h-[300px] bg-slate-100 dark:bg-slate-800 animate-pulse rounded-[2rem] w-full shadow-sm"></div> }
)

export default function AdminDashboardClient() {
  const { stats, charts, distribucionUsuarios, loading } = useDashboard()

  if (loading) return (
    <div className="p-8 space-y-8 animate-pulse">
      <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-slate-100 dark:bg-slate-800 rounded-[2rem]" />)}
      </div>
    </div>
  )

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Panel de Administración</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Welcome back, Mariana. Here is your academic overview for today.</p>
        </motion.div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-white rounded-2xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-white/10 transition-all border border-slate-200/50 dark:border-white/5">
            <Download size={18} />
            <span>Export Data</span>
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30">
            <Plus size={18} />
            <span>New Report</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatsCard 
          title="General Average" 
          value={stats.promedio} 
          progress={(stats.promedio / 10) * 100}
          color="#3b82f6" 
          trend={{ value: 2.4, type: 'up', label: 'from last month' }}
        />
        <StatsCard 
          title="Approval Rate" 
          value={`${stats.aprobacion}%`} 
          progress={stats.aprobacion}
          color="#10b981"
          trend={{ value: 89, type: 'neutral', label: 'Target: 92% reached' }}
        />
        <StatsCard 
          title="Active Students" 
          value={stats.estudiantes} 
          progress={stats.estudiantes > 0 ? 100 : 0}
          color="#6366f1"
          trend={{ value: 100, type: 'up', label: 'Full capacity enrollment' }}
        />
        <StatsCard 
          title="Avg. Attendance" 
          value={`${stats.asistencia}%`} 
          progress={stats.asistencia}
          color="#f43f5e"
          trend={{ value: 3, type: 'down', label: 'Requires attention' }}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2">
          <DashboardCharts data={charts} />
        </div>
        <div>
          <CircularChart 
            data={distribucionUsuarios} 
            title="User Distribution"
            colors={['#3b82f6', '#10b981', '#f59e0b', '#ef4444']}
          />
        </div>
      </div>
    </div>
  )
}
