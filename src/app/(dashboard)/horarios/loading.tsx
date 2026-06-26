// Se muestra al instante mientras el Server Component resuelve los datos (streaming).
export default function LoadingHorarios() {
  return (
    <div className="space-y-6">
      <div className="h-10 w-56 rounded-xl bg-slate-100 dark:bg-white/5 animate-pulse" />
      <div className="h-12 rounded-xl bg-slate-100 dark:bg-white/5 animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-64 rounded-2xl bg-slate-100 dark:bg-white/5 animate-pulse" />
        ))}
      </div>
    </div>
  )
}
