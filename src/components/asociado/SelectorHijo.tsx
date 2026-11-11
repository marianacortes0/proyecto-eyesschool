'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { Hijo } from '@/lib/utils/hijoActivo'

type Props = {
  hijos: Hijo[]
  /** Id del hijo que se está mostrando. */
  activoId: number | null
}

/**
 * Selector de estudiante para un padre con dos hijos o más. Con uno solo no se
 * dibuja nada. Al elegir otro cambia `?hijo=` y la página vuelve a cargar los
 * datos de ese estudiante (notas, asistencia, novedades, horario, inicio).
 */
export default function SelectorHijo({ hijos, activoId }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  if (hijos.length < 2) return null

  const elegir = (id: string) => {
    const next = new URLSearchParams(params.toString())
    next.set('hijo', id)
    router.push(`${pathname}?${next.toString()}`)
  }

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3">
      <label htmlFor="selector-hijo" className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Estudiante
      </label>
      <select
        id="selector-hijo"
        value={activoId ?? ''}
        onChange={(e) => elegir(e.target.value)}
        className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      >
        {hijos.map((h) => (
          <option key={h.idEstudiante} value={h.idEstudiante}>
            {h.nombre}
          </option>
        ))}
      </select>
    </div>
  )
}
