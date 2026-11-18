'use client'

// DEF-WEB-12 · Aviso común cuando una pantalla no pudo cargar sus datos: el
// mensaje (nunca técnico, ver getErrorMessage) y un botón para volver a pedirlos.
// Mientras se muestra, la pantalla no debe afirmar «0 registros» ni «No hay…».

export default function ErrorCarga({ mensaje, onReintentar }: { mensaje: string; onReintentar: () => void }) {
  return (
    <div
      role="alert"
      className="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-sm flex flex-wrap items-center justify-between gap-3"
    >
      <span>{mensaje}</span>
      <button
        type="button"
        onClick={onReintentar}
        className="px-4 py-1.5 rounded-xl bg-red-500 text-white text-xs font-semibold hover:bg-red-600"
      >
        Reintentar
      </button>
    </div>
  )
}
