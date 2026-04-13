'use client'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { motion } from 'framer-motion'

interface CircularChartProps {
  data: { name: string; value: number }[]
  title: string
  colors?: string[]
}

const DEFAULT_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export const CircularChart = ({ data, title, colors = DEFAULT_COLORS }: CircularChartProps) => {
  const total = data?.reduce((acc, curr) => acc + curr.value, 0) || 0;
  const displayTotal = total >= 1000 ? (total / 1000).toFixed(1) + 'k' : total;

  if (!data || data.length === 0) {
    return (
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-8 rounded-[2rem] shadow-premium flex flex-col items-center justify-center h-full min-h-[300px] border border-white/20 dark:border-white/5">
        <h2 className="font-black text-slate-800 dark:text-white mb-4 self-start tracking-tight">{title}</h2>
        <p className="text-slate-400 text-sm font-medium">No results found.</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-8 rounded-[2rem] shadow-premium h-full flex flex-col border border-white/20 dark:border-white/5"
    >
      <div>
        <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">{title}</h2>
        <p className="text-xs text-slate-400 font-medium mb-6">Global demographic breakdown</p>
      </div>
      
      <div className="flex-1 flex items-center justify-center relative min-h-[250px]">
        <div className="absolute inset-0 flex flex-col items-center justify-center z-0">
          <span className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter">{displayTotal}</span>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Users</span>
        </div>
        
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={75}
              outerRadius={95}
              paddingAngle={8}
              dataKey="value"
              animationBegin={200}
              animationDuration={1500}
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={colors[index % colors.length]} 
                  className="hover:opacity-80 transition-opacity cursor-pointer focus:outline-none"
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: '16px',
                border: 'none',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                padding: '8px 12px',
                fontSize: '11px',
                fontFamily: 'Poppins, sans-serif'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-2">
        {data.map((item, index) => (
          <div key={item.name} className="flex items-center justify-between group">
            <div className="flex items-center gap-2">
              <div 
                className="w-2.5 h-2.5 rounded-full" 
                style={{ backgroundColor: colors[index % colors.length] }} 
              />
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{item.name}</span>
            </div>
            <span className="text-xs font-black text-slate-400 dark:text-slate-500">{Math.round((item.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
