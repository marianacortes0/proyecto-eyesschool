'use client'

interface UsuariosFiltersProps {
  searchQuery: string
  filterRol: number | null
  totalCount: number
  onSearchChange: (value: string) => void
  onFilterRolChange: (rol: number | null) => void
  onNuevoUsuario: () => void
}

// Roles reales en la BD: 1=Profesor | 2=Estudiante | 3=Administrador | 4=Padre
const ROL_FILTROS = [
  { label: 'Todos', value: null },
  { label: 'Administradores', value: 3 },
  { label: 'Profesores', value: 1 },
  { label: 'Estudiantes', value: 2 },
  { label: 'Padres', value: 4 },
]

export default function UsuariosFilters({
  searchQuery,
  filterRol,
  totalCount,
  onSearchChange,
  onFilterRolChange,
  onNuevoUsuario,
}: UsuariosFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Usuarios</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {totalCount} usuario{totalCount !== 1 ? 's' : ''} registrado{totalCount !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={onNuevoUsuario}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-blue-500/30"
        >
          <span className="text-lg leading-none">+</span>
          Nuevo Usuario
        </button>
      </div>

      {/* Search + role filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 !text-lg">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por nombre, correo o documento..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a] text-slate-800 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Role filter chips */}
        <div className="flex flex-wrap gap-2">
          {ROL_FILTROS.map((f) => (
            <button
              key={String(f.value)}
              onClick={() => onFilterRolChange(f.value)}
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                filterRol === f.value
                  ? 'bg-primary text-white shadow-md shadow-blue-500/30'
                  : 'bg-white dark:bg-[#1a1a1a] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:border-blue-400 dark:hover:border-primary'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
