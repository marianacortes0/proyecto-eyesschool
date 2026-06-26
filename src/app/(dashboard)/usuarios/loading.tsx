// Se muestra al instante mientras el Server Component resuelve los datos (streaming).
export default function LoadingUsuarios() {
  return (
    <div className="p-6 space-y-6">
      {/* Barra de filtros / acciones */}
      <div className="h-12 rounded-xl bg-slate-100 dark:bg-white/5 animate-pulse" />
      {/* Filas de la tabla */}
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-14 rounded-xl bg-slate-100 dark:bg-white/5 animate-pulse" />
        ))}
      </div>
    </div>
  )
}
