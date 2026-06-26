'use client'

import { useAsistencia, type EstadoAsistencia } from '@/hooks/useAsistencia'
import { type AsistenciaBootstrap } from '@/services/asistencia/asistenciaActions'
import { type Role } from '@/lib/utils/permissions'
import AsistenciaTable from '@/components/asistencia/AsistenciaTable'
import AsistenciaModal from '@/components/asistencia/AsistenciaModal'
import Pagination from '@/components/ui/Pagination'
import { usePagination } from '@/hooks/usePagination'
import { notifySuccess } from '@/lib/toast'

type Props = {
  role: Role
  idUsuarioRegistrador: number
  idEstudiantePropio?: number
  nombreEstudiantePropio?: string
  initialData?: AsistenciaBootstrap
}

const ESTADOS: (EstadoAsistencia | 'todos')[] = ['todos', 'Presente', 'Tarde', 'Ausente', 'Excusa', 'Suspensión']

export default function AsistenciaClient({ role, idUsuarioRegistrador, idEstudiantePropio, nombreEstudiantePropio, initialData }: Props) {
  const {
    registros,
    estudiantes,
    totalCount,
    loading,
    saving,
    error,
    modalMode,
    selectedRecord,
    openEdit,
    closeModal,
    cursos,
    jornadas,
    fechaFiltro,
    setFechaFiltro,
    estadoFiltro,
    setEstadoFiltro,
    cursoFiltro,
    setCursoFiltro,
    jornadaFiltro,
    setJornadaFiltro,
    searchQuery,
    setSearchQuery,
    handleCreate,
    handleUpdate,
    handleDelete,
  } = useAsistencia(idUsuarioRegistrador, idEstudiantePropio, initialData, nombreEstudiantePropio)

  // Estudiante y padre ven SOLO la asistencia del estudiante asociado: se ocultan
  // los filtros de búsqueda/jornada/curso (el catálogo global no les corresponde).
  const esEstudiante = role === 'estudiante' || role === 'padre'

  const { page, setPage, totalPages, pageItems, total, from, to } = usePagination(registros)

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
          Historial de Asistencia
        </h1>
        <p className="text-sm text-slate-500 dark:text-gray-400 mt-0.5">
          {totalCount} registro{totalCount !== 1 ? 's' : ''} encontrado{totalCount !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        {/* Búsqueda — oculta para estudiantes (solo ven sus propios registros) */}
        {!esEstudiante && (
          <input
            type="search"
            placeholder="Buscar por nombre o código..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 min-w-48 px-4 py-2 rounded-xl border border-white/40 dark:border-white/10 bg-white/80 dark:bg-white/5 text-slate-800 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        )}

        {/* Fecha */}
        <input
          type="date"
          value={fechaFiltro}
          onChange={(e) => setFechaFiltro(e.target.value)}
          className="px-3 py-2 rounded-xl border border-white/40 dark:border-white/10 bg-white/80 dark:bg-white/5 text-slate-700 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />

        {/* Estado */}
        <select
          value={estadoFiltro}
          onChange={(e) => {
            setEstadoFiltro(e.target.value as EstadoAsistencia | 'todos')
            notifySuccess('Filtro aplicado correctamente')
          }}
          className="px-3 py-2 rounded-xl border border-white/40 dark:border-white/10 bg-white/80 dark:bg-white/5 text-slate-700 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {ESTADOS.map((e) => (
            <option key={e} value={e}>
              {e === 'todos' ? 'Todos los estados' : e}
            </option>
          ))}
        </select>

        {/* Jornada — oculta para estudiantes (solo ven sus propios registros) */}
        {!esEstudiante && (
          <select
            value={jornadaFiltro}
            onChange={(e) => setJornadaFiltro(e.target.value)}
            className="px-3 py-2 rounded-xl border border-white/40 dark:border-white/10 bg-white/80 dark:bg-white/5 text-slate-700 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary capitalize"
          >
            <option value="todos">Todas las jornadas</option>
            {jornadas.map((j) => (
              <option key={j} value={j}>
                {j}
              </option>
            ))}
          </select>
        )}

        {/* Curso — oculto para estudiantes (solo ven sus propios registros) */}
        {!esEstudiante && (
          <select
            value={cursoFiltro}
            onChange={(e) => setCursoFiltro(e.target.value === 'todos' ? 'todos' : Number(e.target.value))}
            className="px-3 py-2 rounded-xl border border-white/40 dark:border-white/10 bg-white/80 dark:bg-white/5 text-slate-700 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="todos">Todos los cursos</option>
            {cursos.map((c) => (
              <option key={c.idCurso} value={c.idCurso}>
                {c.nombreCurso}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Resumen de estados (solo hoy) */}
      {!loading && registros.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {(['Presente', 'Tarde', 'Ausente', 'Excusa', 'Suspensión'] as EstadoAsistencia[]).map((e) => {
            const count = registros.filter((r) => r.estado === e).length
            const colors: Record<string, string> = {
              Presente:   'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30',
              Tarde:      'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30',
              Ausente:    'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 border-red-200 dark:border-red-500/30',
              Excusa:     'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-primary/30',
              Suspensión: 'bg-slate-50 dark:bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-500/30',
            }
            return (
              <div key={e} className={`px-4 py-3 rounded-xl border text-center ${colors[e]}`}>
                <p className="text-2xl font-black">{count}</p>
                <p className="text-xs font-semibold mt-0.5">{e}</p>
              </div>
            )
          })}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Aviso: filtro Presente sin resultados */}
      {!loading && estadoFiltro === 'Presente' && registros.length === 0 && (
        <div className="px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-300 text-sm">
          ⚠️ No hay registros con estado &apos;Presente&apos;
        </div>
      )}

      {/* Tabla o skeleton */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <AsistenciaTable
            registros={pageItems}
            role={role}
            onEdit={openEdit}
            onDelete={handleDelete}
          />
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            from={from}
            to={to}
            onPageChange={setPage}
            itemLabel="registros"
          />
        </>
      )}

      {/* Modal */}
      <AsistenciaModal
        mode={modalMode}
        registro={selectedRecord}
        estudiantes={estudiantes}
        saving={saving}
        onClose={closeModal}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
      />
    </div>
  )
}
