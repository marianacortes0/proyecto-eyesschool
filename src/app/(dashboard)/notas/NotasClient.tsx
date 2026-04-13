'use client'

import { useState, useMemo } from 'react'
import { useNotas, type EstudianteOpt, type MateriaOpt, type CursoOpt } from '@/hooks/useNotas'
import { PERIODOS, notaColor, NOTA_APROBACION, type Nota } from '@/services/notas/notasService'
import { can, type Role } from '@/lib/utils/permissions'

interface Props { role: Role; idUsuarioRegistrador: number }

export default function NotasClient({ role, idUsuarioRegistrador }: Props) {
  const {
    notas, totalNotas, estudiantes, materias, cursos,
    loading, saving, error, stats,
    filterEstudiante, setFilterEstudiante,
    filterMateria, setFilterMateria,
    filterPeriodo, setFilterPeriodo,
    searchQuery, setSearchQuery,
    modalMode, selected,
    openCreate, openEdit, closeModal,
    handleCreate, handleUpdate, handleDelete,
  } = useNotas(idUsuarioRegistrador)

  const canCreate = can(role, 'create', 'notas')
  const canUpdate = can(role, 'update', 'notas')
  const canDelete = can(role, 'delete', 'notas')

  return (
    <div className="space-y-6">

      {/* ── Encabezado ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Notas</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {totalNotas} registro{totalNotas !== 1 ? 's' : ''} en total
          </p>
        </div>
        {canCreate && (
          <button
            onClick={openCreate}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            + Registrar nota
          </button>
        )}
      </div>

      {/* ── KPIs ─────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 p-4">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Promedio</p>
          <p className={`text-3xl font-black mt-1 ${stats.promedio >= NOTA_APROBACION ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
            {stats.promedio.toFixed(1)}
          </p>
        </div>
        <div className="bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 p-4">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Aprobados</p>
          <p className="text-3xl font-black text-green-600 dark:text-green-400 mt-1">{stats.aprobados}</p>
        </div>
        <div className="bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 p-4">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Reprobados</p>
          <p className="text-3xl font-black text-red-500 dark:text-red-400 mt-1">{stats.reprobados}</p>
        </div>
      </div>

      {/* ── Filtros ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Buscar estudiante o materia..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="flex-1 min-w-[200px] px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={filterEstudiante}
          onChange={e => setFilterEstudiante(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos los estudiantes</option>
          {estudiantes.map(e => (
            <option key={e.idEstudiante} value={String(e.idEstudiante)}>
              {e.nombre} ({e.codigoEstudiante})
            </option>
          ))}
        </select>
        <select
          value={filterMateria}
          onChange={e => setFilterMateria(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todas las materias</option>
          {materias.map(m => (
            <option key={m.idMateria} value={String(m.idMateria)}>{m.nombreMateria}</option>
          ))}
        </select>
        <select
          value={filterPeriodo}
          onChange={e => setFilterPeriodo(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos los periodos</option>
          {Object.entries(PERIODOS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* ── Tabla ────────────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-slate-100 dark:bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : notas.length === 0 ? (
        <div className="text-center py-16 text-slate-400 dark:text-slate-500 text-sm">
          No hay notas que coincidan con los filtros.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide">
                <th className="px-4 py-3 text-left">Estudiante</th>
                <th className="px-4 py-3 text-left">Materia</th>
                <th className="px-4 py-3 text-left">Periodo</th>
                <th className="px-4 py-3 text-center">Nota</th>
                <th className="px-4 py-3 text-left">Observación</th>
                <th className="px-4 py-3 text-left">Fecha</th>
                {(canUpdate || canDelete) && <th className="px-4 py-3 text-right">Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {notas.map(n => (
                <tr
                  key={n.idNota}
                  className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                >
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-800 dark:text-white">{n.nombreEstudiante}</p>
                    <p className="text-xs text-slate-400">{n.codigoEstudiante}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{n.nombreMateria}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                    {PERIODOS[n.idPeriodo] ?? `P${n.idPeriodo}`}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-black ${notaColor(n.nota)}`}>
                      {n.nota.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 max-w-[200px] truncate text-slate-500 dark:text-slate-400 text-xs" title={n.observacion ?? ''}>
                    {n.observacion ?? '—'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-500 dark:text-slate-400 text-xs">
                    {new Date(n.fechaRegistro).toLocaleDateString('es-CO')}
                  </td>
                  {(canUpdate || canDelete) && (
                    <td className="px-4 py-3 text-right">
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
                            onClick={() => handleDelete(n.idNota)}
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

      {/* ── Modal ────────────────────────────────────────────────────────────── */}
      {modalMode && (
        <NotaModal
          mode={modalMode}
          nota={selected}
          estudiantes={estudiantes}
          materias={materias}
          cursos={cursos}
          saving={saving}
          onClose={closeModal}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  )
}

// ── Modal ─────────────────────────────────────────────────────────────────────

interface ModalProps {
  mode: 'create' | 'edit'
  nota: Nota | null
  estudiantes: EstudianteOpt[]
  materias: MateriaOpt[]
  cursos: CursoOpt[]
  saving: boolean
  onClose: () => void
  onCreate: (p: Pick<Nota, 'idEstudiante' | 'idMateria' | 'idPeriodo' | 'nota' | 'observacion'>) => void
  onUpdate: (id: number, p: Partial<Pick<Nota, 'nota' | 'observacion' | 'idPeriodo' | 'idMateria'>>) => void
}

function NotaModal({ mode, nota, estudiantes, materias, cursos, saving, onClose, onCreate, onUpdate }: ModalProps) {
  const [jornada, setJornada] = useState('')
  const [grado, setGrado] = useState('')
  const [idEstudiante, setIdEstudiante] = useState(String(nota?.idEstudiante ?? ''))
  const [idMateria, setIdMateria] = useState(String(nota?.idMateria ?? ''))
  const [idPeriodo, setIdPeriodo] = useState(String(nota?.idPeriodo ?? '1'))
  const [notaVal, setNotaVal] = useState(String(nota?.nota ?? ''))
  const [observacion, setObservacion] = useState(nota?.observacion ?? '')
  const [formError, setFormError] = useState<string | null>(null)

  const jornadas = useMemo(
    () => {
      const seen = new Set<string>()
      seen.add('mañana')
      seen.add('tarde')
      cursos.forEach(c => { if (c.jornada) seen.add(c.jornada.toLowerCase()) })
      return [...seen].sort()
    },
    [cursos]
  )

  const grados = useMemo(
    () => jornada
      ? [...new Set(cursos.filter(c => c.jornada === jornada).map(c => c.grado))].sort()
      : [],
    [jornada, cursos]
  )

  const cursosDelGrado = useMemo(
    () => jornada && grado
      ? cursos.filter(c => c.jornada === jornada && c.grado === grado)
      : [],
    [jornada, grado, cursos]
  )

  const estudiantesFiltrados = useMemo(
    () => {
      const ids = new Set(cursosDelGrado.map(c => c.idCurso))
      return ids.size > 0 ? estudiantes.filter(e => e.idCursoActual !== null && ids.has(e.idCursoActual)) : []
    },
    [cursosDelGrado, estudiantes]
  )

  const handleJornadaChange = (val: string) => {
    setJornada(val)
    setGrado('')
    setIdEstudiante('')
  }

  const handleGradoChange = (val: string) => {
    setGrado(val)
    setIdEstudiante('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    const n = parseFloat(notaVal)
    if (isNaN(n) || n < 0 || n > 5) {
      setFormError('La nota debe estar entre 0.0 y 5.0')
      return
    }

    if (mode === 'create') {
      if (!jornada || !grado) {
        setFormError('Selecciona jornada y grado.')
        return
      }
      if (!idEstudiante || !idMateria) {
        setFormError('Selecciona estudiante y materia.')
        return
      }
      onCreate({
        idEstudiante: Number(idEstudiante),
        idMateria: Number(idMateria),
        idPeriodo: Number(idPeriodo),
        nota: n,
        observacion: observacion || null,
      })
    } else if (nota) {
      onUpdate(nota.idNota, {
        nota: n,
        observacion: observacion || null,
        idPeriodo: Number(idPeriodo),
        idMateria: Number(idMateria),
      })
    }
  }

  const preview = parseFloat(notaVal)
  const hasPreview = !isNaN(preview) && preview >= 0 && preview <= 5

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="w-full max-w-md bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden">

        <div className="px-6 py-4 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">
            {mode === 'create' ? 'Registrar nota' : 'Editar nota'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xl font-bold">×</button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

          {mode === 'create' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Jornada</label>
                  <select
                    required
                    value={jornada}
                    onChange={e => handleJornadaChange(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar...</option>
                    {jornadas.map(j => (
                      <option key={j} value={j}>{j}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Grado</label>
                  <select
                    required
                    disabled={!jornada}
                    value={grado}
                    onChange={e => handleGradoChange(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <option value="">Seleccionar...</option>
                    {grados.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Estudiante</label>
                <select
                  required
                  disabled={!grado}
                  value={idEstudiante}
                  onChange={e => setIdEstudiante(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <option value="">{grado ? 'Seleccionar estudiante...' : 'Primero selecciona jornada y grado'}</option>
                  {estudiantesFiltrados.map(e => (
                    <option key={e.idEstudiante} value={String(e.idEstudiante)}>
                      {e.nombre} — {e.codigoEstudiante}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {mode === 'edit' && nota && (
            <div className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
              <p className="text-xs text-slate-500 dark:text-slate-400">Estudiante</p>
              <p className="font-semibold text-slate-800 dark:text-white text-sm mt-0.5">{nota.nombreEstudiante}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Periodo</label>
              <select
                value={idPeriodo}
                onChange={e => setIdPeriodo(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(PERIODOS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Materia</label>
            <select
              required
              disabled={mode === 'create' && !idEstudiante}
              value={idMateria}
              onChange={e => setIdMateria(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <option value="">{mode === 'create' && !idEstudiante ? 'Primero selecciona un estudiante' : 'Seleccionar materia...'}</option>
              {materias.map(m => (
                <option key={m.idMateria} value={String(m.idMateria)}>{m.nombreMateria}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Nota <span className="font-normal text-slate-400">(0.0 – 5.0)</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                required
                step="0.1"
                min="0"
                max="5"
                placeholder="Ej: 4.5"
                value={notaVal}
                onChange={e => setNotaVal(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {hasPreview && (
                <span className={`px-3 py-1.5 rounded-xl text-sm font-black ${notaColor(preview)}`}>
                  {preview.toFixed(1)}
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Observación <span className="font-normal text-slate-400">(opcional)</span>
            </label>
            <textarea
              rows={2}
              value={observacion}
              onChange={e => setObservacion(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {formError && <p className="text-xs text-red-500 dark:text-red-400">{formError}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors">
              {saving ? 'Guardando...' : mode === 'create' ? 'Registrar' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
