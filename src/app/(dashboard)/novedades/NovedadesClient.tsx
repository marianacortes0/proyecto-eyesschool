'use client'

import { useState, useMemo } from 'react'
import { useNovedades } from '@/hooks/useNovedades'
import { ESTADOS_NOVEDAD, type Novedad, type CursoOpt, type EstudianteOpt } from '@/services/novedades/novedadesService'
import { type Role } from '@/lib/utils/permissions'
import { can } from '@/lib/utils/permissions'

const GRAVEDAD_COLOR: Record<string, string> = {
  Alta:   'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
  Media:  'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300',
  Baja:   'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300',
}

const ESTADO_COLOR: Record<string, string> = {
  Pendiente:   'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300',
  Completado:  'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300',
}

interface Props { role: Role; registradoPor: number }

export default function NovedadesClient({ role, registradoPor }: Props) {
  const {
    novedades, tiposNovedad, cursos, estudiantes,
    loading, saving, error,
    filterEstado, filterTipo, searchQuery,
    setFilterEstado, setFilterTipo, setSearchQuery,
    modalMode, selected,
    openCreate, openEdit, closeModal,
    handleCreate, handleUpdate, handleDelete,
  } = useNovedades(registradoPor)

  const canCreate = can(role, 'create', 'novedades')
  const canUpdate = can(role, 'update', 'novedades')
  const canDelete = can(role, 'delete', 'novedades')

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Novedades</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Registro de novedades estudiantiles
          </p>
        </div>
        {canCreate && (
          <button
            onClick={openCreate}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            + Nueva novedad
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Buscar estudiante o descripción..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={filterEstado}
          onChange={e => setFilterEstado(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos los estados</option>
          {ESTADOS_NOVEDAD.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
        <select
          value={filterTipo}
          onChange={e => setFilterTipo(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos los tipos</option>
          {tiposNovedad.map(t => (
            <option key={t.idTipoNovedad} value={String(t.idTipoNovedad)}>{t.nombreTipo}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Tabla */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-slate-100 dark:bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : novedades.length === 0 ? (
        <div className="text-center py-16 text-slate-400 dark:text-slate-500 text-sm">
          No hay novedades registradas.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide">
                <th className="px-4 py-3 text-left">Fecha</th>
                <th className="px-4 py-3 text-left">Estudiante</th>
                <th className="px-4 py-3 text-left">Tipo</th>
                <th className="px-4 py-3 text-left">Gravedad</th>
                <th className="px-4 py-3 text-left">Descripción</th>
                <th className="px-4 py-3 text-left">Estado</th>
                {(canUpdate || canDelete) && <th className="px-4 py-3 text-right">Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {novedades.map(n => (
                <tr
                  key={n.idNovedad}
                  className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                >
                  <td className="px-4 py-3 whitespace-nowrap text-slate-600 dark:text-slate-300">
                    {new Date(n.fecha).toLocaleDateString('es-CO')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-800 dark:text-white">{n.nombreEstudiante}</div>
                    <div className="text-xs text-slate-400">{n.codigoEstudiante}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-700 dark:text-slate-300">{n.nombreTipo}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${GRAVEDAD_COLOR[n.nivelGravedad ?? ''] ?? 'bg-slate-100 text-slate-600'}`}>
                      {n.nivelGravedad}
                    </span>
                  </td>
                  <td className="px-4 py-3 max-w-xs truncate text-slate-600 dark:text-slate-300" title={n.descripcion}>
                    {n.descripcion}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${ESTADO_COLOR[n.estado] ?? 'bg-slate-100 text-slate-600'}`}>
                      {n.estado}
                    </span>
                  </td>
                  {(canUpdate || canDelete) && (
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-2">
                        {canUpdate && (
                          <button
                            onClick={() => openEdit(n)}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-300 text-xs font-semibold transition-colors"
                          >
                            Editar
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(n.idNovedad)}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-300 text-xs font-semibold transition-colors"
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modalMode && (
        <NovedadModal
          mode={modalMode}
          novedad={selected}
          tiposNovedad={tiposNovedad}
          cursos={cursos}
          estudiantes={estudiantes}
          saving={saving}
          onClose={closeModal}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  )
}

// ── Modal ────────────────────────────────────────────────────────────────────

const SEL_CLASS = 'w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'

interface ModalProps {
  mode: 'create' | 'edit'
  novedad: Novedad | null
  tiposNovedad: { idTipoNovedad: number; nombreTipo: string }[]
  cursos: CursoOpt[]
  estudiantes: EstudianteOpt[]
  saving: boolean
  onClose: () => void
  onCreate: (p: { descripcion: string; idEstudiante: number; idTipoNovedad: number }) => void
  onUpdate: (id: number, p: { descripcion?: string; estado?: string; accionTomada?: string | null; fechaResolucion?: string | null; idTipoNovedad?: number }) => Promise<void> | void
}

function NovedadModal({ mode, novedad, tiposNovedad, cursos, estudiantes, saving, onClose, onCreate, onUpdate }: ModalProps) {
  const [descripcion, setDescripcion] = useState(novedad?.descripcion ?? '')
  const [idEstudiante, setIdEstudiante] = useState(String(novedad?.idEstudiante ?? ''))
  const [idTipoNovedad, setIdTipoNovedad] = useState(String(novedad?.idTipoNovedad ?? ''))
  const [estado, setEstado] = useState(novedad?.estado ?? 'Pendiente')
  const [accionTomada, setAccionTomada] = useState(novedad?.accionTomada ?? '')
  const [fechaResolucion, setFechaResolucion] = useState(novedad?.fechaResolucion?.slice(0, 10) ?? '')

  // Cascade: Jornada → Grado → Curso → Estudiante
  const [jornada, setJornada] = useState('')
  const [grado, setGrado] = useState('')
  const [idCurso, setIdCurso] = useState('')

  const jornadas = useMemo(() => [...new Set(cursos.map(c => c.jornada))].sort(), [cursos])
  const grados = useMemo(
    () => jornada ? [...new Set(cursos.filter(c => c.jornada === jornada).map(c => c.grado))].sort() : [],
    [jornada, cursos]
  )
  const cursosDelGrado = useMemo(
    () => jornada && grado ? cursos.filter(c => c.jornada === jornada && c.grado === grado) : [],
    [jornada, grado, cursos]
  )
  const estudiantesFiltrados = useMemo(() => {
    if (!idCurso) return []
    return estudiantes.filter(e => e.idCursoActual === Number(idCurso))
  }, [idCurso, estudiantes])

  const handleJornadaChange = (val: string) => { setJornada(val); setGrado(''); setIdCurso(''); setIdEstudiante('') }
  const handleGradoChange = (val: string) => { setGrado(val); setIdCurso(''); setIdEstudiante('') }
  const handleCursoChange = (val: string) => { setIdCurso(val); setIdEstudiante('') }

  const handleEstadoChange = (val: string) => {
    setEstado(val)
    if (val === 'Pendiente') { setAccionTomada(''); setFechaResolucion('') }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (mode === 'create') {
      onCreate({ descripcion, idEstudiante: Number(idEstudiante), idTipoNovedad: Number(idTipoNovedad) })
    } else if (novedad) {
      onUpdate(novedad.idNovedad, {
        descripcion,
        idTipoNovedad: Number(idTipoNovedad),
        estado,
        accionTomada: estado === 'Completado' ? (accionTomada || null) : null,
        fechaResolucion: estado === 'Completado' ? (fechaResolucion || null) : null,
      })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="w-full max-w-lg bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">
            {mode === 'create' ? 'Nueva novedad' : 'Editar novedad'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xl font-bold leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {mode === 'create' && (
            <>
              {/* Jornada + Grado */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Jornada</label>
                  <select
                    required
                    value={jornada}
                    onChange={e => handleJornadaChange(e.target.value)}
                    className={SEL_CLASS}
                  >
                    <option value="">Seleccionar</option>
                    {jornadas.map(j => <option key={j} value={j}>{j}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Grado</label>
                  <select
                    required
                    disabled={!jornada}
                    value={grado}
                    onChange={e => handleGradoChange(e.target.value)}
                    className={`${SEL_CLASS} disabled:opacity-40`}
                  >
                    <option value="">Seleccionar</option>
                    {grados.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>

              {/* Curso */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Curso</label>
                <select
                  required
                  disabled={!grado}
                  value={idCurso}
                  onChange={e => handleCursoChange(e.target.value)}
                  className={`${SEL_CLASS} disabled:opacity-40`}
                >
                  <option value="">{!grado ? 'Primero selecciona el grado' : 'Seleccionar curso'}</option>
                  {cursosDelGrado.map(c => (
                    <option key={c.idCurso} value={String(c.idCurso)}>{c.nombreCurso}</option>
                  ))}
                </select>
              </div>

              {/* Estudiante */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Estudiante</label>
                <select
                  required
                  disabled={!idCurso}
                  value={idEstudiante}
                  onChange={e => setIdEstudiante(e.target.value)}
                  className={`${SEL_CLASS} disabled:opacity-40`}
                >
                  <option value="">{!idCurso ? 'Primero selecciona el curso' : 'Seleccionar estudiante'}</option>
                  {estudiantesFiltrados.map(est => (
                    <option key={est.idEstudiante} value={String(est.idEstudiante)}>
                      {est.nombre} — {est.codigo}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Tipo */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Tipo de novedad</label>
            <select
              required
              value={idTipoNovedad}
              onChange={e => setIdTipoNovedad(e.target.value)}
              className={SEL_CLASS}
            >
              <option value="">Seleccionar tipo</option>
              {tiposNovedad.map(t => (
                <option key={t.idTipoNovedad} value={String(t.idTipoNovedad)}>{t.nombreTipo}</option>
              ))}
            </select>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Descripción</label>
            <textarea
              required
              rows={3}
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              className={`${SEL_CLASS} resize-none`}
            />
          </div>

          {/* Estado */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Estado</label>
            <select
              value={estado}
              onChange={e => handleEstadoChange(e.target.value)}
              className={SEL_CLASS}
            >
              {ESTADOS_NOVEDAD.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>

          {/* Acción tomada y fecha — solo si Completado */}
          {estado === 'Completado' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Acción tomada</label>
                <textarea
                  required
                  rows={2}
                  value={accionTomada}
                  onChange={e => setAccionTomada(e.target.value)}
                  className={`${SEL_CLASS} resize-none`}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Fecha de resolución</label>
                <input
                  type="date"
                  required
                  value={fechaResolucion}
                  onChange={e => setFechaResolucion(e.target.value)}
                  className={SEL_CLASS}
                />
              </div>
            </>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
            >
              {saving ? 'Guardando...' : mode === 'create' ? 'Crear' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
