// Se muestra al instante mientras el Server Component resuelve los datos (streaming).
export default function LoadingNotas() {
  return (
    <div className="space-y-6">
      <div className="h-10 w-48 rounded-xl bg-slate-100 dark:bg-white/5 animate-pulse" />
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 rounded-2xl bg-slate-100 dark:bg-white/5 animate-pulse" />
        ))}
      </div>
      <div className="h-12 rounded-xl bg-slate-100 dark:bg-white/5 animate-pulse" />
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-14 rounded-xl bg-slate-100 dark:bg-white/5 animate-pulse" />
        ))}
      </div>
    </div>
  )
}
