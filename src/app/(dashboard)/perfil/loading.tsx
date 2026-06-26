// Se muestra al instante mientras el Server Component resuelve los datos (streaming).
export default function LoadingPerfil() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-20 w-20 rounded-full bg-slate-100 dark:bg-white/5 animate-pulse" />
        <div className="space-y-2">
          <div className="h-6 w-48 rounded-lg bg-slate-100 dark:bg-white/5 animate-pulse" />
          <div className="h-4 w-32 rounded-lg bg-slate-100 dark:bg-white/5 animate-pulse" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-white/5 animate-pulse" />
        ))}
      </div>
    </div>
  )
}
