'use client'

import { motion } from 'framer-motion'
import { 
  Book, 
  Pencil, 
  Calculator, 
  FlaskConical, 
  Globe, 
  Palette, 
  Music, 
  Microscope,
  Square,
  Triangle,
  Circle
} from 'lucide-react'

const icons = [
  { Icon: Book, size: 24, top: '10%', left: '5%', delay: 0 },
  { Icon: Pencil, size: 20, top: '20%', left: '85%', delay: 2 },
  { Icon: Calculator, size: 24, top: '80%', left: '10%', delay: 4 },
  { Icon: FlaskConical, size: 22, top: '70%', left: '90%', delay: 1 },
  { Icon: Globe, size: 28, top: '40%', left: '95%', delay: 5 },
  { Icon: Palette, size: 24, top: '85%', left: '40%', delay: 3 },
  { Icon: Music, size: 20, top: '15%', left: '45%', delay: 6 },
  { Icon: Microscope, size: 26, top: '60%', left: '5%', delay: 7 },
  { Icon: Square, size: 16, top: '30%', left: '20%', delay: 2 },
  { Icon: Triangle, size: 16, top: '50%', left: '80%', delay: 4 },
  { Icon: Circle, size: 14, top: '75%', left: '60%', delay: 1 },
]

export const BackgroundDecorations = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
      {/* Mesh Gradient Base */}
      <div className="absolute inset-0 bg-mesh opacity-100" />
      
      {/* Graph Paper Pattern */}
      <div className="absolute inset-0 bg-graph-paper opacity-50" />

      {/* Floating Icons */}
      {icons.map(({ Icon, size, top, left, delay }, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ 
            opacity: [0.03, 0.08, 0.03],
            y: [0, -15, 0],
            rotate: [0, 10, -10, 0]
          }}
          transition={{ 
            duration: 15, 
            repeat: Infinity, 
            delay, 
            ease: "easeInOut" 
          }}
          className="absolute"
          style={{ top, left }}
        >
          <Icon size={size} className="text-slate-400 dark:text-slate-500" />
        </motion.div>
      ))}

      {/* Subtle Color Orbs */}
      <div className="absolute top-[20%] left-[10%] w-[400px] h-[400px] bg-blue-400/5 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] bg-purple-400/5 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
    </div>
  )
}
