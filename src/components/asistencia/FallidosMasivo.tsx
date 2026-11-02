'use client'

import type { RegistroFallido } from '@/services/asistencia/asistenciaService'

type Props = {
  fallidos: RegistroFallido[]
  /** Nombre a mostrar de cada estudiante (por id). */
  nombreDe: (idEstudiante: number) => string
  onReintentar: () => void
  onDescartar: () => void
  /** Mientras se reenvía, los botones no se pueden pulsar. */
  ocupado?: boolean
}

/**
 * Lista de estudiantes cuyo registro de asistencia no se pudo guardar, con el
 * motivo, para reenviar solo esos (Reintentar) o dejarlos fuera (Descartar).
 */
export default function FallidosMasivo({ fallidos, nombreDe, onReintentar, onDescartar, ocupado }: Props) {
  if (fallidos.length === 0) return null

  return (
    <section
      aria-label="Registros no guardados"
      className="rounded-2xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 p-4 space-y-3"
    >
      <p className="text-sm font-semibold text-red-700 dark:text-red-300">
        {fallidos.length} registro{fallidos.length !== 1 ? 's' : ''} no se guardó
        {fallidos.length !== 1 ? 'aron' : ''}
      </p>

      <ul className="divide-y divide-red-100 dark:divide-red-500/20">
        {fallidos.map((f) => (
          <li key={f.idEstudiante} className="py-1.5 flex flex-wrap justify-between gap-2 text-sm">
            <span className="font-medium text-slate-800 dark:text-white">{nombreDe(f.idEstudiante)}</span>
            <span className="text-xs text-red-600 dark:text-red-300">{f.motivo}</span>
          </li>
        ))}
      </ul>

      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onDescartar}
          disabled={ocupado}
          className="px-4 py-2 rounded-xl text-sm font-semibold bg-white dark:bg-white/10 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 disabled:opacity-50"
        >
          Descartar
        </button>
        <button
          type="button"
          onClick={onReintentar}
          disabled={ocupado}
          className="px-4 py-2 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
        >
          Reintentar
        </button>
      </div>
    </section>
  )
}
