'use client'

import { useState, useMemo } from 'react'
import { useHorarios } from '@/hooks/useHorarios'
import { DIAS_SEMANA, type Horario, type Curso, type Materia, type Especializacion, type ProfesorOpt, type Asignacion } from '@/services/horarios/horariosService'
import { can, type Role } from '@/lib/utils/permissions'

const JORNADAS = ['Mañana', 'Tarde', 'Noche', 'Completa']

const DIA_HEADER: Record<string, string> = {
  Lunes:      'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300',
  Martes:     'bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300',
  Miércoles:  'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  Jueves:     'bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-300',
  Viernes:    'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300',
  Sábado:     'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300',
}

const DIA_CELL: Record<string, string> = {
  Lunes:      'border-l-2 border-blue-400 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-500/5',
  Martes:     'border-l-2 border-violet-400 dark:border-violet-500 bg-violet-50/50 dark:bg-violet-500/5',
  Miércoles:  'border-l-2 border-emerald-400 dark:border-emerald-500 bg-emerald-50/50 dark:bg-emerald-500/5',
  Jueves:     'border-l-2 border-orange-400 dark:border-orange-500 bg-orange-50/50 dark:bg-orange-500/5',
  Viernes:    'border-l-2 border-rose-400 dark:border-rose-500 bg-rose-50/50 dark:bg-rose-500/5',
  Sábado:     'border-l-2 border-amber-400 dark:border-amber-500 bg-amber-50/50 dark:bg-amber-500/5',
}

interface Props { role: Role }

export default function HorariosClient({ role }: Props) {
  const {
    horarios, cursos, allCursos, materias, allMaterias, especializaciones, profesores,
    loading, saving, savingCurso, savingMateria, savingEspecializacion, error,
    vista, setVista,
    filterCurso, setFilterCurso,
    filterProfesor, setFilterProfesor,
    filterActivo, setFilterActivo,
    modalMode, selected,
    openCreate, openEdit, closeModal,
    handleCreate, handleUpdate, handleToggleActivo, handleDelete,
    cursosModalOpen, cursoModalMode, selectedCurso,
    openCursosModal, closeCursosModal,
    openCreateCurso, openEditCurso, closeCursoForm,
    handleCreateCurso, handleUpdateCurso, handleDeleteCurso,
    materiasModalOpen, materiaModalMode, selectedMateria,
    openMateriasModal, closeMateriasModal,
    openCreateMateria, openEditMateria, closeMateriaForm,
    handleCreateMateria, handleUpdateMateria, handleDeleteMateria,
    especializacionesModalOpen, especializacionModalMode, selectedEspecializacion,
    openEspecializacionesModal, closeEspecializacionesModal,
    openCreateEspecializacion, openEditEspecializacion, closeEspecializacionForm,
    handleCreateEspecializacion, handleUpdateEspecializacion, handleDeleteEspecializacion,
    // asignacion crud
    asignacionesList, savingAsignacion,
    asignacionesModalOpen, asignacionModalMode, selectedAsignacion,
    openAsignacionesModal, closeAsignacionesModal,
    openCreateAsignacion, openEditAsignacion, closeAsignacionForm,
    handleCreateAsignacion, handleUpdateAsignacion, handleDeleteAsignacion,
  } = useHorarios()

  const [filterJornada, setFilterJornada] = useState('')

  const canCreate = can(role, 'create', 'horarios')
  const canUpdate = can(role, 'update', 'horarios')
  const canDelete = can(role, 'delete', 'horarios')

  const jornadas = useMemo(() => [...new Set(cursos.map(c => c.jornada))].sort(), [cursos])
  const cursosDeJornada = useMemo(
    () => filterJornada ? cursos.filter(c => c.jornada === filterJornada) : cursos,
    [filterJornada, cursos]
  )

  // Calcular slots únicos (horaInicio+horaFin) ordenados
  const slots: { inicio: string; fin: string }[] = []
  const slotKeys = new Set<string>()
  horarios.forEach(h => {
    const key = `${h.horaInicio}|${h.horaFin}`
    if (!slotKeys.has(key)) {
      slotKeys.add(key)
      slots.push({ inicio: h.horaInicio, fin: h.horaFin })
    }
  })
  slots.sort((a, b) => a.inicio.localeCompare(b.inicio))
  const slots4 = slots.slice(0, 4)

  // Días que tienen al menos un horario
  const diasActivos = DIAS_SEMANA.filter(d =>
    horarios.some(h => h.dia === d)
  )

  // Lookup rápido: dia+slot → horario
  const lookup = (dia: string, inicio: string) =>
    horarios.find(h => h.dia === dia && h.horaInicio === inicio) ?? null

  return (
    <div className="space-y-6">

      {/* ── Encabezado ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Horarios</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {horarios.length} bloque{horarios.length !== 1 ? 's' : ''} registrado{horarios.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canCreate && (
            <button
              onClick={openAsignacionesModal}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Asignaciones
            </button>
          )}
          {canCreate && (
            <button
              onClick={openEspecializacionesModal}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Especializaciones
            </button>
          )}
          {canCreate && (
            <button
              onClick={openMateriasModal}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Materias
            </button>
          )}
          {canCreate && (
            <button
              onClick={openCursosModal}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Cursos
            </button>
          )}
          {canCreate && (
            <button
              onClick={openCreate}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              + Nuevo horario
            </button>
          )}
        </div>
      </div>

      {/* ── Vista toggle + Filtros ───────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Segmented control */}
        <div className="flex rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden shrink-0">
          <button
            onClick={() => { setVista('estudiantes'); setFilterProfesor(''); setFilterJornada(''); setFilterCurso('') }}
            className={`px-4 py-2 text-sm font-semibold transition-colors ${vista === 'estudiantes' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10'}`}
          >
            Estudiantes
          </button>
          <button
            onClick={() => { setVista('profesores'); setFilterCurso(''); setFilterJornada('') }}
            className={`px-4 py-2 text-sm font-semibold transition-colors ${vista === 'profesores' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10'}`}
          >
            Profesores
          </button>
        </div>

        {/* Filtro contextual */}
        {vista === 'estudiantes' ? (
          <>
            <select
              value={filterJornada}
              onChange={e => { setFilterJornada(e.target.value); setFilterCurso('') }}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas las jornadas</option>
              {jornadas.map(j => (
                <option key={j} value={j}>{j}</option>
              ))}
            </select>
            <select
              value={filterCurso}
              onChange={e => setFilterCurso(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los cursos</option>
              {cursosDeJornada.map(c => (
                <option key={c.idCurso} value={String(c.idCurso)}>
                  {c.nombreCurso} — {c.grado}
                </option>
              ))}
            </select>
          </>
        ) : (
          <select
            value={filterProfesor}
            onChange={e => setFilterProfesor(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los profesores</option>
            {profesores.map(p => (
              <option key={p.idProfesor} value={String(p.idProfesor)}>{p.nombre}</option>
            ))}
          </select>
        )}

        <select
          value={filterActivo}
          onChange={e => setFilterActivo(e.target.value as any)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="todos">Activos e inactivos</option>
          <option value="activo">Solo activos</option>
          <option value="inactivo">Solo inactivos</option>
        </select>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* ── Grilla de horarios ───────────────────────────────────────────────── */}
      {vista === 'estudiantes' && !filterJornada ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
            <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-slate-600 dark:text-slate-300 font-semibold">Selecciona una jornada</p>
          <p className="text-sm text-slate-400 dark:text-slate-500">Elige la jornada para ver los cursos disponibles</p>
        </div>
      ) : vista === 'estudiantes' && filterJornada && !filterCurso ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center">
            <svg className="w-7 h-7 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <p className="text-slate-600 dark:text-slate-300 font-semibold">Selecciona un curso</p>
          <p className="text-sm text-slate-400 dark:text-slate-500">Elige el curso para ver su horario</p>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-5 gap-3">
          {Array.from({ length: 25 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-slate-100 dark:bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : horarios.length === 0 ? (
        <div className="text-center py-16 text-slate-400 dark:text-slate-500 text-sm">
          No hay horarios registrados para este curso.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-[700px]">

            {/* Cabecera de días */}
            <div
              className="grid gap-2 mb-2"
              style={{ gridTemplateColumns: `80px repeat(${diasActivos.length}, 1fr)` }}
            >
              <div /> {/* esquina vacía */}
              {diasActivos.map(dia => (
                <div
                  key={dia}
                  className={`rounded-xl px-3 py-2 text-center text-xs font-bold uppercase tracking-wide ${DIA_HEADER[dia] ?? 'bg-slate-100 text-slate-600'}`}
                >
                  {dia}
                </div>
              ))}
            </div>

            {/* Filas de slots (hasta 4) */}
            <div className="space-y-2">
              {slots4.map((slot, idx) => (
                <div
                  key={`${slot.inicio}-${slot.fin}-${idx}`}
                  className="grid gap-2 items-stretch"
                  style={{ gridTemplateColumns: `80px repeat(${diasActivos.length}, 1fr)` }}
                >
                  {/* Etiqueta del slot */}
                  <div className="flex flex-col items-center justify-center py-2">
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase">
                      Bloque {idx + 1}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono tabular-nums mt-0.5">
                      {slot.inicio.slice(0, 5)}
                    </span>
                    <span className="text-[10px] text-slate-300 dark:text-slate-600 font-mono tabular-nums">
                      {slot.fin.slice(0, 5)}
                    </span>
                  </div>

                  {/* Celda por día */}
                  {diasActivos.map(dia => {
                    const h = lookup(dia, slot.inicio)
                    return (
                      <HorarioCell
                        key={dia}
                        dia={dia}
                        horario={h}
                        vista={vista}
                        canUpdate={canUpdate}
                        canDelete={canDelete}
                        onEdit={openEdit}
                        onToggle={handleToggleActivo}
                        onDelete={handleDelete}
                      />
                    )
                  })}
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* ── Tabla resumen completa ───────────────────────────────────────────── */}
      {!loading && horarios.length > 0 && (
        <details className="group">
          <summary className="cursor-pointer text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white select-none list-none flex items-center gap-2">
            <span className="group-open:rotate-90 transition-transform inline-block">▶</span>
            Ver todos los bloques ({horarios.length})
          </summary>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide">
                  <th className="px-4 py-3 text-left">Día</th>
                  <th className="px-4 py-3 text-left">Horario</th>
                  <th className="px-4 py-3 text-left">Materia</th>
                  <th className="px-4 py-3 text-left">Curso</th>
                  <th className="px-4 py-3 text-left">Salón</th>
                  <th className="px-4 py-3 text-left">Estado</th>
                  {(canUpdate || canDelete) && <th className="px-4 py-3 text-right">Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {horarios.map(h => (
                  <tr
                    key={h.idHorario}
                    className={`border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${!h.activo ? 'opacity-50' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${DIA_HEADER[h.dia] ?? 'bg-slate-100 text-slate-600'}`}>
                        {h.dia}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-mono text-xs text-slate-600 dark:text-slate-300">
                      {h.horaInicio.slice(0, 5)} – {h.horaFin.slice(0, 5)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800 dark:text-white">{h.nombreMateria}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{h.nombreCurso}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{h.salon}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${h.activo ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300' : 'bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-400'}`}>
                        {h.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    {(canUpdate || canDelete) && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          {canUpdate && (
                            <button
                              onClick={() => openEdit(h)}
                              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-300 text-xs font-semibold transition-colors"
                            >
                              Editar
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(h.idHorario)}
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
        </details>
      )}

      {/* ── Modal horario ────────────────────────────────────────────────────── */}
      {modalMode && (
        <HorarioModal
          mode={modalMode}
          horario={selected}
          cursos={cursos}
          materias={materias}
          profesores={profesores}
          saving={saving}
          onClose={closeModal}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
        />
      )}

      {/* ── Modal gestión cursos ─────────────────────────────────────────────── */}
      {cursosModalOpen && (
        <CursosModal
          cursos={allCursos}
          cursoModalMode={cursoModalMode}
          selectedCurso={selectedCurso}
          saving={savingCurso}
          canUpdate={canUpdate}
          canDelete={canDelete}
          canCreate={canCreate}
          onClose={closeCursosModal}
          onOpenCreate={openCreateCurso}
          onOpenEdit={openEditCurso}
          onCloseForm={closeCursoForm}
          onCreate={handleCreateCurso}
          onUpdate={handleUpdateCurso}
          onDelete={handleDeleteCurso}
        />
      )}

      {/* ── Modal gestión materias ───────────────────────────────────────────── */}
      {materiasModalOpen && (
        <MateriasModal
          materias={allMaterias}
          materiaModalMode={materiaModalMode}
          selectedMateria={selectedMateria}
          saving={savingMateria}
          canUpdate={canUpdate}
          canDelete={canDelete}
          canCreate={canCreate}
          onClose={closeMateriasModal}
          onOpenCreate={openCreateMateria}
          onOpenEdit={openEditMateria}
          onCloseForm={closeMateriaForm}
          onCreate={handleCreateMateria}
          onUpdate={handleUpdateMateria}
          onDelete={handleDeleteMateria}
        />
      )}

      {/* ── Modal gestión especializaciones ─────────────────────────────────── */}
      {especializacionesModalOpen && (
        <EspecializacionesModal
          especializaciones={especializaciones}
          especializacionModalMode={especializacionModalMode}
          selectedEspecializacion={selectedEspecializacion}
          saving={savingEspecializacion}
          canUpdate={canUpdate}
          canDelete={canDelete}
          canCreate={canCreate}
          onClose={closeEspecializacionesModal}
          onOpenCreate={openCreateEspecializacion}
          onOpenEdit={openEditEspecializacion}
          onCloseForm={closeEspecializacionForm}
          onCreate={handleCreateEspecializacion}
          onUpdate={handleUpdateEspecializacion}
          onDelete={handleDeleteEspecializacion}
        />
      )}

      {/* ── Modal gestión asignaciones ───────────────────────────────────────── */}
      {asignacionesModalOpen && (
        <AsignacionesModal
          asignaciones={asignacionesList}
          asignacionModalMode={asignacionModalMode}
          selectedAsignacion={selectedAsignacion}
          profesores={profesores}
          cursos={allCursos}
          materias={allMaterias}
          saving={savingAsignacion}
          canUpdate={canUpdate}
          canDelete={canDelete}
          canCreate={canCreate}
          onClose={closeAsignacionesModal}
          onOpenCreate={openCreateAsignacion}
          onOpenEdit={openEditAsignacion}
          onCloseForm={closeAsignacionForm}
          onCreate={handleCreateAsignacion}
          onUpdate={handleUpdateAsignacion}
          onDelete={handleDeleteAsignacion}
        />
      )}
    </div>
  )
}

// ── Celda de la grilla ────────────────────────────────────────────────────────

interface CellProps {
  dia: string
  horario: Horario | null
  vista: 'estudiantes' | 'profesores'
  canUpdate: boolean
  canDelete: boolean
  onEdit: (h: Horario) => void
  onToggle: (h: Horario) => void
  onDelete: (id: number) => void
}

function HorarioCell({ dia, horario: h, vista, canUpdate, canDelete, onEdit, onToggle, onDelete }: CellProps) {
  const [hover, setHover] = useState(false)

  if (!h) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 dark:border-white/10 h-24 flex items-center justify-center text-slate-300 dark:text-slate-700 text-xs">
        —
      </div>
    )
  }

  return (
    <div
      className={`
        relative rounded-xl border border-slate-100 dark:border-white/10 p-3 h-24 flex flex-col justify-between
        transition-all cursor-default
        ${DIA_CELL[dia] ?? ''}
        ${!h.activo ? 'opacity-40' : ''}
        ${hover ? 'shadow-md' : ''}
      `}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="overflow-hidden">
        <p className="text-xs font-bold text-slate-800 dark:text-white truncate leading-tight">
          {h.nombreMateria}
        </p>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
          {vista === 'profesores'
            ? (h.nombreProfesor ?? h.nombreCurso)
            : h.nombreCurso}
        </p>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
          Salón {h.salon}
        </p>
      </div>

      {/* Botones al hover */}
      {hover && (canUpdate || canDelete) && (
        <div className="absolute inset-x-2 bottom-2 flex gap-1">
          {canUpdate && (
            <button
              onClick={() => onEdit(h)}
              className="flex-1 py-1 rounded-lg bg-white/80 dark:bg-black/40 hover:bg-blue-100 dark:hover:bg-blue-500/30 text-slate-600 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-300 text-[10px] font-bold transition-colors"
            >
              Editar
            </button>
          )}
          {canUpdate && (
            <button
              onClick={() => onToggle(h)}
              className="py-1 px-2 rounded-lg bg-white/80 dark:bg-black/40 hover:bg-amber-100 dark:hover:bg-amber-500/30 text-slate-500 hover:text-amber-600 dark:hover:text-amber-300 text-[10px] font-bold transition-colors"
            >
              {h.activo ? '⏸' : '▶'}
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => onDelete(h.idHorario)}
              className="py-1 px-2 rounded-lg bg-white/80 dark:bg-black/40 hover:bg-red-100 dark:hover:bg-red-500/30 text-slate-500 hover:text-red-600 dark:hover:text-red-300 text-[10px] font-bold transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ── Modal ─────────────────────────────────────────────────────────────────────

interface ModalProps {
  mode: 'create' | 'edit'
  horario: Horario | null
  cursos: Curso[]
  materias: Materia[]
  profesores: ProfesorOpt[]
  saving: boolean
  onClose: () => void
  onCreate: (p: Omit<Horario, 'idHorario' | 'nombreCurso' | 'gradoCurso' | 'nombreMateria'>, idProfesor?: number) => void
  onUpdate: (id: number, p: Partial<Omit<Horario, 'idHorario' | 'nombreCurso' | 'gradoCurso' | 'nombreMateria'>>) => void
}

function HorarioModal({ mode, horario, cursos, materias, profesores, saving, onClose, onCreate, onUpdate }: ModalProps) {
  const [dia, setDia] = useState(horario?.dia ?? 'Lunes')
  const [horaInicio, setHoraInicio] = useState(horario?.horaInicio?.slice(0, 5) ?? '07:00')
  const [horaFin, setHoraFin] = useState(horario?.horaFin?.slice(0, 5) ?? '08:00')
  const [salon, setSalon] = useState(horario?.salon ?? '')
  const [jornada, setJornada] = useState<string>(() => {
    if (horario?.idCurso) {
      return cursos.find(c => c.idCurso === horario.idCurso)?.jornada ?? ''
    }
    return ''
  })
  const [idCurso, setIdCurso] = useState<string>(String(horario?.idCurso ?? ''))
  const [idMateria, setIdMateria] = useState(String(horario?.idMateria ?? ''))
  const [idProfesor, setIdProfesor] = useState<string>('')
  const [activo, setActivo] = useState(horario?.activo ?? true)
  const [formError, setFormError] = useState<string | null>(null)

  const jornadas = useMemo(() => [...new Set(cursos.map(c => c.jornada))].sort(), [cursos])
  const cursosDeJornada = useMemo(
    () => jornada ? cursos.filter(c => c.jornada === jornada) : [],
    [cursos, jornada]
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    if (!idCurso) { setFormError('Selecciona un curso.'); return }
    if (!idMateria) { setFormError('Selecciona una materia.'); return }
    if (horaFin <= horaInicio) { setFormError('La hora fin debe ser mayor que la de inicio.'); return }

    const payload = {
      dia,
      horaInicio: `${horaInicio}:00`,
      horaFin: `${horaFin}:00`,
      salon,
      idCurso: Number(idCurso),
      idMateria: Number(idMateria),
      activo,
    }
    mode === 'create'
      ? onCreate(payload, idProfesor ? Number(idProfesor) : undefined)
      : onUpdate(horario!.idHorario, payload)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="w-full max-w-lg bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">
            {mode === 'create' ? 'Nuevo bloque' : 'Editar bloque'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xl font-bold">×</button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Día</label>
            <select required value={dia} onChange={e => setDia(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {DIAS_SEMANA.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Hora inicio</label>
              <input type="time" required value={horaInicio} onChange={e => setHoraInicio(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Hora fin</label>
              <input type="time" required value={horaFin} onChange={e => setHoraFin(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Jornada</label>
            <select required value={jornada} onChange={e => { setJornada(e.target.value); setIdCurso('') }}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Seleccionar jornada...</option>
              {jornadas.map(j => <option key={j} value={j}>{j}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Curso</label>
            <select required value={idCurso} onChange={e => setIdCurso(e.target.value)}
              disabled={!jornada}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50">
              <option value="">{jornada ? 'Seleccionar curso...' : 'Primero selecciona una jornada'}</option>
              {cursosDeJornada.map(c => (
                <option key={c.idCurso} value={String(c.idCurso)}>{c.nombreCurso} — {c.grado}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Materia</label>
            <select required value={idMateria} onChange={e => setIdMateria(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Seleccionar materia</option>
              {materias.map(m => (
                <option key={m.idMateria} value={String(m.idMateria)}>{m.nombreMateria}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Salón</label>
            <input type="text" required placeholder="Ej: 201, Lab. Informática" value={salon} onChange={e => setSalon(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          {mode === 'create' && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Profesor (opcional)</label>
              <select value={idProfesor} onChange={e => setIdProfesor(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Sin asignar</option>
                {profesores.map(p => (
                  <option key={p.idProfesor} value={String(p.idProfesor)}>{p.nombre}</option>
                ))}
              </select>
            </div>
          )}

          {mode === 'edit' && (
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input type="checkbox" className="sr-only" checked={activo} onChange={e => setActivo(e.target.checked)} />
                <div className={`w-10 h-6 rounded-full transition-colors ${activo ? 'bg-blue-600' : 'bg-slate-300 dark:bg-white/20'}`} />
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${activo ? 'translate-x-5' : 'translate-x-1'}`} />
              </div>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{activo ? 'Activo' : 'Inactivo'}</span>
            </label>
          )}

          {formError && <p className="text-xs text-red-500 dark:text-red-400">{formError}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors">
              {saving ? 'Guardando...' : mode === 'create' ? 'Crear' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Modal gestión de cursos ───────────────────────────────────────────────────

interface CursosModalProps {
  cursos: Curso[]
  cursoModalMode: 'create' | 'edit' | null
  selectedCurso: Curso | null
  saving: boolean
  canCreate: boolean
  canUpdate: boolean
  canDelete: boolean
  onClose: () => void
  onOpenCreate: () => void
  onOpenEdit: (c: Curso) => void
  onCloseForm: () => void
  onCreate: (p: Omit<Curso, 'idCurso'>) => void
  onUpdate: (id: number, p: Partial<Omit<Curso, 'idCurso'>>) => void
  onDelete: (id: number) => void
}

function CursosModal({
  cursos, cursoModalMode, selectedCurso, saving,
  canCreate, canUpdate, canDelete,
  onClose, onOpenCreate, onOpenEdit, onCloseForm,
  onCreate, onUpdate, onDelete,
}: CursosModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="w-full max-w-2xl bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden flex flex-col max-h-[85vh]">

        <div className="px-6 py-4 border-b border-slate-100 dark:border-white/10 flex items-center justify-between shrink-0">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Gestionar cursos</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xl font-bold">×</button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {cursoModalMode ? (
            <CursoForm
              mode={cursoModalMode}
              curso={selectedCurso}
              saving={saving}
              onClose={onCloseForm}
              onCreate={onCreate}
              onUpdate={onUpdate}
            />
          ) : (
            <div className="p-6 space-y-4">
              {canCreate && (
                <button
                  onClick={onOpenCreate}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  + Nuevo curso
                </button>
              )}
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide">
                      <th className="px-4 py-3 text-left">Nombre</th>
                      <th className="px-4 py-3 text-left">Grado</th>
                      <th className="px-4 py-3 text-left">Jornada</th>
                      <th className="px-4 py-3 text-left">Año</th>
                      <th className="px-4 py-3 text-left">Estado</th>
                      {(canUpdate || canDelete) && <th className="px-4 py-3 text-right">Acciones</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {cursos.length === 0 && (
                      <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400 text-xs">No hay cursos registrados.</td></tr>
                    )}
                    {cursos.map(c => (
                      <tr key={c.idCurso} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 font-semibold text-slate-800 dark:text-white">{c.nombreCurso}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{c.grado}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{c.jornada}</td>
                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{c.ano}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${c.activo ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300' : 'bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-400'}`}>
                            {c.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        {(canUpdate || canDelete) && (
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              {canUpdate && (
                                <button
                                  onClick={() => onOpenEdit(c)}
                                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-300 text-xs font-semibold transition-colors"
                                >
                                  Editar
                                </button>
                              )}
                              {canDelete && (
                                <button
                                  onClick={() => onDelete(c.idCurso)}
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
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Formulario crear/editar curso ─────────────────────────────────────────────

interface CursoFormProps {
  mode: 'create' | 'edit'
  curso: Curso | null
  saving: boolean
  onClose: () => void
  onCreate: (p: Omit<Curso, 'idCurso'>) => void
  onUpdate: (id: number, p: Partial<Omit<Curso, 'idCurso'>>) => void
}

function CursoForm({ mode, curso, saving, onClose, onCreate, onUpdate }: CursoFormProps) {
  const [nombreCurso, setNombreCurso] = useState(curso?.nombreCurso ?? '')
  const [grado, setGrado] = useState(curso?.grado ?? '')
  const [jornada, setJornada] = useState(curso?.jornada ?? '')
  const [ano, setAno] = useState(String(curso?.ano ?? new Date().getFullYear()))
  const [activo, setActivo] = useState(curso?.activo ?? true)
  const [formError, setFormError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    if (!nombreCurso.trim() || !grado.trim() || !jornada) {
      setFormError('Nombre, grado y jornada son requeridos.')
      return
    }
    const payload = { nombreCurso: nombreCurso.trim(), grado: grado.trim(), jornada, ano: Number(ano), activo }
    mode === 'create' ? onCreate(payload) : onUpdate(curso!.idCurso, payload)
  }

  const SEL = 'w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'

  return (
    <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-sm font-semibold">← Volver</button>
        <span className="text-slate-300 dark:text-slate-600">|</span>
        <span className="text-sm font-bold text-slate-700 dark:text-white">{mode === 'create' ? 'Nuevo curso' : 'Editar curso'}</span>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Nombre del curso</label>
        <input
          required
          value={nombreCurso}
          onChange={e => setNombreCurso(e.target.value)}
          placeholder="Ej: 10A"
          className={SEL}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Grado</label>
          <input
            required
            value={grado}
            onChange={e => setGrado(e.target.value)}
            placeholder="Ej: Décimo"
            className={SEL}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Jornada</label>
          <select required value={jornada} onChange={e => setJornada(e.target.value)} className={SEL}>
            <option value="">Seleccionar...</option>
            {JORNADAS.map(j => <option key={j} value={j}>{j}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Año</label>
          <input
            required
            type="number"
            min="2020"
            max="2099"
            value={ano}
            onChange={e => setAno(e.target.value)}
            className={SEL}
          />
        </div>
        <div className="flex items-end pb-0.5">
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input type="checkbox" className="sr-only" checked={activo} onChange={e => setActivo(e.target.checked)} />
              <div className={`w-10 h-6 rounded-full transition-colors ${activo ? 'bg-blue-600' : 'bg-slate-300 dark:bg-white/20'}`} />
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${activo ? 'translate-x-5' : 'translate-x-1'}`} />
            </div>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{activo ? 'Activo' : 'Inactivo'}</span>
          </label>
        </div>
      </div>

      {formError && <p className="text-xs text-red-500 dark:text-red-400">{formError}</p>}

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onClose}
          className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors">
          {saving ? 'Guardando...' : mode === 'create' ? 'Crear' : 'Guardar'}
        </button>
      </div>
    </form>
  )
}

// ── Modal gestión de materias ─────────────────────────────────────────────────

interface MateriasModalProps {
  materias: Materia[]
  materiaModalMode: 'create' | 'edit' | null
  selectedMateria: Materia | null
  saving: boolean
  canCreate: boolean
  canUpdate: boolean
  canDelete: boolean
  onClose: () => void
  onOpenCreate: () => void
  onOpenEdit: (m: Materia) => void
  onCloseForm: () => void
  onCreate: (p: Omit<Materia, 'idMateria'>) => void
  onUpdate: (id: number, p: Partial<Omit<Materia, 'idMateria'>>) => void
  onDelete: (id: number) => void
}

function MateriasModal({
  materias, materiaModalMode, selectedMateria, saving,
  canCreate, canUpdate, canDelete,
  onClose, onOpenCreate, onOpenEdit, onCloseForm,
  onCreate, onUpdate, onDelete,
}: MateriasModalProps) {

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="w-full max-w-2xl bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden flex flex-col max-h-[85vh]">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-white/10 flex items-center justify-between shrink-0">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Gestionar materias</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xl font-bold">×</button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {materiaModalMode ? (
            <MateriaForm
              key={selectedMateria?.idMateria ?? 'new'}
              mode={materiaModalMode}
              materia={selectedMateria}
              saving={saving}
              onClose={onCloseForm}
              onCreate={onCreate}
              onUpdate={onUpdate}
            />
          ) : (
            <div className="p-6 space-y-4">
              {canCreate && (
                <button onClick={onOpenCreate} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors">+ Nueva materia</button>
              )}
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide">
                      <th className="px-4 py-3 text-left">Nombre</th>
                      <th className="px-4 py-3 text-left">Código</th>
                      <th className="px-4 py-3 text-left">Estado</th>
                      {(canUpdate || canDelete) && <th className="px-4 py-3 text-right">Acciones</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {materias.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400 text-xs">No hay materias registradas.</td></tr>}
                    {materias.map(m => (
                      <tr key={m.idMateria} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 font-semibold text-slate-800 dark:text-white">{m.nombreMateria}</td>
                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400 font-mono text-xs">{m.codigoMateria}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${m.activa ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300' : 'bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-400'}`}>{m.activa ? 'Activa' : 'Inactiva'}</span>
                        </td>
                        {(canUpdate || canDelete) && (
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              {canUpdate && <button onClick={() => onOpenEdit(m)} className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-300 text-xs font-semibold transition-colors">Editar</button>}
                              {canDelete && <button onClick={() => onDelete(m.idMateria)} className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-300 text-xs font-semibold transition-colors">Eliminar</button>}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Modal gestión de especializaciones ────────────────────────────────────────

interface EspecializacionesModalProps {
  especializaciones: Especializacion[]
  especializacionModalMode: 'create' | 'edit' | null
  selectedEspecializacion: Especializacion | null
  saving: boolean
  canCreate: boolean
  canUpdate: boolean
  canDelete: boolean
  onClose: () => void
  onOpenCreate: () => void
  onOpenEdit: (e: Especializacion) => void
  onCloseForm: () => void
  onCreate: (p: Omit<Especializacion, 'idEspecializacion'>) => void
  onUpdate: (id: number, p: Partial<Omit<Especializacion, 'idEspecializacion'>>) => void
  onDelete: (id: number) => void
}

function EspecializacionesModal({
  especializaciones, especializacionModalMode, selectedEspecializacion, saving,
  canCreate, canUpdate, canDelete,
  onClose, onOpenCreate, onOpenEdit, onCloseForm,
  onCreate, onUpdate, onDelete,
}: EspecializacionesModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="w-full max-w-xl bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden flex flex-col max-h-[85vh]">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-white/10 flex items-center justify-between shrink-0">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Gestionar especializaciones</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xl font-bold">×</button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {especializacionModalMode ? (
            <EspecializacionForm
              key={selectedEspecializacion?.idEspecializacion ?? 'new'}
              mode={especializacionModalMode}
              especializacion={selectedEspecializacion}
              saving={saving}
              onClose={onCloseForm}
              onCreate={onCreate}
              onUpdate={onUpdate}
            />
          ) : (
            <div className="p-6 space-y-4">
              {canCreate && (
                <button onClick={onOpenCreate} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors">+ Nueva especialización</button>
              )}
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide">
                      <th className="px-4 py-3 text-left">Nombre</th>
                      <th className="px-4 py-3 text-left">Estado</th>
                      {(canUpdate || canDelete) && <th className="px-4 py-3 text-right">Acciones</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {especializaciones.length === 0 && <tr><td colSpan={3} className="px-4 py-8 text-center text-slate-400 text-xs">No hay especializaciones registradas.</td></tr>}
                    {especializaciones.map(esp => (
                      <tr key={esp.idEspecializacion} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 font-semibold text-slate-800 dark:text-white">{esp.nombreEspecializacion}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${esp.activo ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300' : 'bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-400'}`}>{esp.activo ? 'Activo' : 'Inactivo'}</span>
                        </td>
                        {(canUpdate || canDelete) && (
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              {canUpdate && <button onClick={() => onOpenEdit(esp)} className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-300 text-xs font-semibold transition-colors">Editar</button>}
                              {canDelete && <button onClick={() => onDelete(esp.idEspecializacion)} className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-300 text-xs font-semibold transition-colors">Eliminar</button>}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── MateriaForm ───────────────────────────────────────────────────────────────

function MateriaForm({ mode, materia, saving, onClose, onCreate, onUpdate }: {
  mode: 'create' | 'edit'; materia: Materia | null; saving: boolean
  onClose: () => void
  onCreate: (p: Omit<Materia, 'idMateria'>) => void
  onUpdate: (id: number, p: Partial<Omit<Materia, 'idMateria'>>) => void
}) {
  const SEL = 'w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
  const [nombre, setNombre] = useState(materia?.nombreMateria ?? '')
  const [codigo, setCodigo] = useState(materia?.codigoMateria ?? '')
  const [activa, setActiva] = useState(materia?.activa ?? true)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload = { nombreMateria: nombre.trim(), codigoMateria: codigo.trim(), activa }
    mode === 'create' ? onCreate(payload) : onUpdate(materia!.idMateria, payload)
  }

  return (
    <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-sm font-semibold">← Volver</button>
        <span className="text-slate-300 dark:text-slate-600">|</span>
        <span className="text-sm font-bold text-slate-700 dark:text-white">{mode === 'create' ? 'Nueva materia' : 'Editar materia'}</span>
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Nombre</label>
        <input required value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej: Matemáticas" className={SEL} />
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Código</label>
        <input required value={codigo} onChange={e => setCodigo(e.target.value)} placeholder="Ej: MAT-01" className={SEL} />
      </div>
      <label className="flex items-center gap-3 cursor-pointer">
        <div className="relative">
          <input type="checkbox" className="sr-only" checked={activa} onChange={e => setActiva(e.target.checked)} />
          <div className={`w-10 h-6 rounded-full transition-colors ${activa ? 'bg-blue-600' : 'bg-slate-300 dark:bg-white/20'}`} />
          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${activa ? 'translate-x-5' : 'translate-x-1'}`} />
        </div>
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{activa ? 'Activa' : 'Inactiva'}</span>
      </label>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">Cancelar</button>
        <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors">{saving ? 'Guardando...' : mode === 'create' ? 'Crear' : 'Guardar'}</button>
      </div>
    </form>
  )
}

// ── EspecializacionForm ───────────────────────────────────────────────────────

function EspecializacionForm({ mode, especializacion, saving, onClose, onCreate, onUpdate }: {
  mode: 'create' | 'edit'; especializacion: Especializacion | null; saving: boolean
  onClose: () => void
  onCreate: (p: Omit<Especializacion, 'idEspecializacion'>) => void
  onUpdate: (id: number, p: Partial<Omit<Especializacion, 'idEspecializacion'>>) => void
}) {
  const SEL = 'w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
  const [nombre, setNombre] = useState(especializacion?.nombreEspecializacion ?? '')
  const [activo, setActivo] = useState(especializacion?.activo ?? true)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload = { nombreEspecializacion: nombre.trim(), activo }
    mode === 'create' ? onCreate(payload) : onUpdate(especializacion!.idEspecializacion, payload)
  }

  return (
    <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-sm font-semibold">← Volver</button>
        <span className="text-slate-300 dark:text-slate-600">|</span>
        <span className="text-sm font-bold text-slate-700 dark:text-white">{mode === 'create' ? 'Nueva especialización' : 'Editar especialización'}</span>
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Nombre</label>
        <input required value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej: Matemáticas y Física" className={SEL} />
      </div>
      <label className="flex items-center gap-3 cursor-pointer">
        <div className="relative">
          <input type="checkbox" className="sr-only" checked={activo} onChange={e => setActivo(e.target.checked)} />
          <div className={`w-10 h-6 rounded-full transition-colors ${activo ? 'bg-blue-600' : 'bg-slate-300 dark:bg-white/20'}`} />
          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${activo ? 'translate-x-5' : 'translate-x-1'}`} />
        </div>
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{activo ? 'Activo' : 'Inactivo'}</span>
      </label>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">Cancelar</button>
        <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors">{saving ? 'Guardando...' : mode === 'create' ? 'Crear' : 'Guardar'}</button>
      </div>
    </form>
  )
}

// ── Modal gestión de asignaciones ──────────────────────────────────────────────

interface AsignacionesModalProps {
  asignaciones: Asignacion[]
  asignacionModalMode: 'create' | 'edit' | null
  selectedAsignacion: Asignacion | null
  profesores: ProfesorOpt[]
  cursos: Curso[]
  materias: Materia[]
  saving: boolean
  canCreate: boolean
  canUpdate: boolean
  canDelete: boolean
  onClose: () => void
  onOpenCreate: () => void
  onOpenEdit: (a: Asignacion) => void
  onCloseForm: () => void
  onCreate: (p: Omit<Asignacion, 'idAsignacion' | 'nombreProfesor' | 'nombreCurso' | 'nombreMateria'>) => void
  onUpdate: (id: number, p: Partial<Omit<Asignacion, 'idAsignacion'>>) => void
  onDelete: (id: number) => void
}

function AsignacionesModal({
  asignaciones, asignacionModalMode, selectedAsignacion, profesores, cursos, materias, saving,
  canCreate, canUpdate, canDelete,
  onClose, onOpenCreate, onOpenEdit, onCloseForm,
  onCreate, onUpdate, onDelete,
}: AsignacionesModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="w-full max-w-4xl bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden flex flex-col max-h-[85vh]">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-white/10 flex items-center justify-between shrink-0">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Gestionar asignaciones de profesores</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xl font-bold">×</button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {asignacionModalMode ? (
            <AsignacionForm
              mode={asignacionModalMode}
              asignacion={selectedAsignacion}
              profesores={profesores}
              cursos={cursos}
              materias={materias}
              saving={saving}
              onClose={onCloseForm}
              onCreate={onCreate}
              onUpdate={onUpdate}
            />
          ) : (
            <div className="p-6 space-y-4">
              {canCreate && (
                <button onClick={onOpenCreate} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors">+ Nueva asignación</button>
              )}
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide">
                      <th className="px-4 py-3 text-left">Profesor</th>
                      <th className="px-4 py-3 text-left">Curso</th>
                      <th className="px-4 py-3 text-left">Materia</th>
                      <th className="px-4 py-3 text-left">Fecha Asig.</th>
                      <th className="px-4 py-3 text-left">Estado</th>
                      {(canUpdate || canDelete) && <th className="px-4 py-3 text-right">Acciones</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {asignaciones.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400 text-xs">No hay asignaciones registradas.</td></tr>}
                    {asignaciones.map(a => (
                      <tr key={a.idAsignacion} className={`border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${!a.activo ? 'opacity-50' : ''}`}>
                        <td className="px-4 py-3 font-semibold text-slate-800 dark:text-white">{a.nombreProfesor}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{a.nombreCurso}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{a.nombreMateria}</td>
                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs">{new Date(a.fechaAsignacion).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${a.activo ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300' : 'bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-400'}`}>{a.activo ? 'Activa' : 'Inactiva'}</span>
                        </td>
                        {(canUpdate || canDelete) && (
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              {canUpdate && <button onClick={() => onOpenEdit(a)} className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-300 text-xs font-semibold transition-colors">Editar</button>}
                              {canDelete && <button onClick={() => onDelete(a.idAsignacion)} className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-300 text-xs font-semibold transition-colors">Eliminar</button>}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── AsignacionForm ────────────────────────────────────────────────────────────

function AsignacionForm({ mode, asignacion, profesores, cursos, materias, saving, onClose, onCreate, onUpdate }: {
  mode: 'create' | 'edit'; asignacion: Asignacion | null; profesores: ProfesorOpt[]; cursos: Curso[]; materias: Materia[]; saving: boolean
  onClose: () => void
  onCreate: (p: Omit<Asignacion, 'idAsignacion' | 'nombreProfesor' | 'nombreCurso' | 'nombreMateria'>) => void
  onUpdate: (id: number, p: Partial<Omit<Asignacion, 'idAsignacion'>>) => void
}) {
  const SEL = 'w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
  
  const [idProfesor, setIdProfesor] = useState(String(asignacion?.idProfesor ?? ''))
  const [idCurso, setIdCurso] = useState(String(asignacion?.idCurso ?? ''))
  const [idMateria, setIdMateria] = useState(String(asignacion?.idMateria ?? ''))
  const [fechaAsignacion, setFechaAsignacion] = useState(asignacion?.fechaAsignacion?.slice(0, 10) ?? new Date().toISOString().slice(0, 10))
  const [fechaFinalizacion, setFechaFinalizacion] = useState(asignacion?.fechaFinalizacion ?? '')
  const [activo, setActivo] = useState(asignacion?.activo ?? true)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!idProfesor || !idCurso || !idMateria) {
      setError('Por favor selecciona todos los campos requeridos.')
      return
    }
    const payload = {
      idProfesor: Number(idProfesor),
      idCurso: Number(idCurso),
      idMateria: Number(idMateria),
      fechaAsignacion: new Date(fechaAsignacion).toISOString(),
      fechaFinalizacion: fechaFinalizacion || null,
      activo
    }
    mode === 'create' ? onCreate(payload) : onUpdate(asignacion!.idAsignacion, payload)
  }

  return (
    <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-sm font-semibold">← Volver</button>
        <span className="text-slate-300 dark:text-slate-600">|</span>
        <span className="text-sm font-bold text-slate-700 dark:text-white">{mode === 'create' ? 'Nueva asignación' : 'Editar asignación'}</span>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Profesor</label>
        <select required value={idProfesor} onChange={e => setIdProfesor(e.target.value)} className={SEL}>
          <option value="">Seleccionar profesor...</option>
          {profesores.map(p => <option key={p.idProfesor} value={p.idProfesor}>{p.nombre}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Curso</label>
          <select required value={idCurso} onChange={e => setIdCurso(e.target.value)} className={SEL}>
            <option value="">Seleccionar curso...</option>
            {cursos.map(c => <option key={c.idCurso} value={c.idCurso}>{c.nombreCurso} — {c.grado}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Materia</label>
          <select required value={idMateria} onChange={e => setIdMateria(e.target.value)} className={SEL}>
            <option value="">Seleccionar materia...</option>
            {materias.map(m => <option key={m.idMateria} value={m.idMateria}>{m.nombreMateria}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Fecha Asignación</label>
          <input type="date" required value={fechaAsignacion} onChange={e => setFechaAsignacion(e.target.value)} className={SEL} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Fecha Finalización (Opcional)</label>
          <input type="date" value={fechaFinalizacion} onChange={e => setFechaFinalizacion(e.target.value)} className={SEL} />
        </div>
      </div>

      <label className="flex items-center gap-3 cursor-pointer pt-2">
        <div className="relative">
          <input type="checkbox" className="sr-only" checked={activo} onChange={e => setActivo(e.target.checked)} />
          <div className={`w-10 h-6 rounded-full transition-colors ${activo ? 'bg-blue-600' : 'bg-slate-300 dark:bg-white/20'}`} />
          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${activo ? 'translate-x-5' : 'translate-x-1'}`} />
        </div>
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{activo ? 'Activo' : 'Inactivo'}</span>
      </label>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">Cancelar</button>
        <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors">{saving ? 'Guardando...' : mode === 'create' ? 'Crear' : 'Guardar'}</button>
      </div>
    </form>
  )
}
