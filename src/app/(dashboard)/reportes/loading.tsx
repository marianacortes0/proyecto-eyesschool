// Se muestra al instante mientras el Server Component resuelve los datos (streaming).
export default function LoadingReportes() {
  return (
    <div className="space-y-6">
      <div className="h-10 w-48 rounded-xl bg-slate-100 dark:bg-white/5 animate-pulse" />
      <div className="h-12 rounded-xl bg-slate-100 dark:bg-white/5 animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-32 rounded-2xl bg-slate-100 dark:bg-white/5 animate-pulse" />
        ))}
      </div>
    </div>
  )
}
