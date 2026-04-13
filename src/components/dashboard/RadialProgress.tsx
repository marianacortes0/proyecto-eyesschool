'use client'

import { motion } from 'framer-motion'

interface RadialProgressProps {
  progress: number // 0 to 100
  color: string
  size?: number
  strokeWidth?: number
}

export const RadialProgress = ({ 
  progress, 
  color, 
  size = 60, 
  strokeWidth = 6 
}: RadialProgressProps) => {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (progress / 100) * circumference

  return (
    <div className="relative flex items-center justify-center transform hover:scale-110 transition-transform duration-300" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background circle */}
        <circle
          className="text-slate-100 dark:text-white/5"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress circle */}
        <motion.circle
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ 
             filter: `drop-shadow(0 0 4px ${color}40)` 
          }}
        />
      </svg>
      {/* Centered text */}
      <span className="absolute text-[10px] font-black text-slate-700 dark:text-slate-300">
        {Math.round(progress)}%
      </span>
    </div>
  )
}
