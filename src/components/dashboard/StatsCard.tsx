import { RadialProgress } from './RadialProgress';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Props {
  title: string;
  value: string | number;
  progress?: number;
  color?: string;
  trend?: {
    value: number;
    type: 'up' | 'down' | 'neutral';
    label: string;
  };
}

export const StatsCard = ({ title, value, progress, color = '#3b82f6', trend }: Props) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-[2rem] shadow-premium p-6 flex flex-col justify-between transition-all border border-white/20 dark:border-white/5 relative overflow-hidden group h-full"
    >
      <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
        <div className="w-24 h-24 rounded-full" style={{ backgroundColor: color }} />
      </div>

      <div className="flex items-start justify-between relative z-10 w-full mb-4">
        <div className="space-y-1">
          <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest">{title}</p>
          <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter">{value}</h2>
        </div>
        {progress !== undefined && (
          <div className="shrink-0 scale-110">
            <RadialProgress progress={progress} color={color} />
          </div>
        )}
      </div>

      {trend ? (
        <div className="flex items-center gap-2 pt-2 border-t border-slate-50 dark:border-white/5 mt-auto">
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
            trend.type === 'up' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' :
            trend.type === 'down' ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400' :
            'bg-slate-50 text-slate-600 dark:bg-white/10 dark:text-slate-400'
          }`}>
            {trend.type === 'up' ? <TrendingUp size={12} /> : 
             trend.type === 'down' ? <TrendingDown size={12} /> : 
             <Minus size={12} />}
            <span>{trend.type === 'up' ? '+' : ''}{trend.value}%</span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">{trend.label}</span>
        </div>
      ) : (
        <div className="pt-2 border-t border-slate-50 dark:border-white/5 mt-auto">
           <span className="text-[10px] text-slate-400 font-black tracking-widest uppercase">Live Academic Update</span>
        </div>
      )}
    </motion.div>
  );
};