// Se muestra al instante mientras el Server Component resuelve los datos (streaming).
export default function LoadingAsistencia() {
  return (
    <div className="space-y-6">
      <div className="h-10 w-64 rounded-xl bg-slate-100 dark:bg-white/5 animate-pulse" />
      <div className="h-12 rounded-xl bg-slate-100 dark:bg-white/5 animate-pulse" />
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-14 rounded-xl bg-slate-100 dark:bg-white/5 animate-pulse" />
        ))}
      </div>
    </div>
  )
}
