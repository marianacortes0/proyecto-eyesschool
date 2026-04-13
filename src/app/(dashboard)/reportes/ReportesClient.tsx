'use client'

import { useState, useRef } from 'react'
import { useReportes } from '@/hooks/useReportes'
import {
  TIPOS_REPORTE,
  ESTADOS_REPORTE,
  uploadArchivoReporte,
  type Reporte,
} from '@/services/reportes/reportesService'
import { can, type Role } from '@/lib/utils/permissions'

const ESTADO_STYLE: Record<string, string> = {
  Pendiente:   'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300',
  Generando:   'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
  Completado:  'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300',
  Error:       'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
}

const TIPO_STYLE: Record<string, string> = {
  Academico:     'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300',
  Disciplinario: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
  Medico:        'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
  Asistencia:    'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300',
  Estadistico:   'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300',
}

const TIPO_ICON: Record<string, string> = {
  Academico:     '📝',
  Disciplinario: '⚠️',
  Medico:        '🏥',
  Asistencia:    '📋',
  Estadistico:   '📊',
}

interface Props { role: Role; idAdministrador: number }

export default function ReportesClient({ role, idAdministrador }: Props) {
  const {
    reportes, totalCount, loading, saving, error,
    filterTipo, setFilterTipo,
    filterEstado, setFilterEstado,
    searchQuery, setSearchQuery,
    modalMode, selected,
    openCreate, openEdit, closeModal,
    handleCreate, handleUpdate, handleDelete,
  } = useReportes(idAdministrador)

  const canCreate = can(role, 'create', 'reportes')
  const canUpdate = can(role, 'update', 'reportes')
  const canDelete = can(role, 'delete', 'reportes')
  const canDownload = can(role, 'download', 'reportes')

  // Contadores por estado
  const countByEstado = (estado: string) =>
    reportes.filter(r => r.estado === estado).length

  return (
    <div className="space-y-6">

      {/* ── Encabezado ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Reportes</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {totalCount} reporte{totalCount !== 1 ? 's' : ''} en total
          </p>
        </div>
        {canCreate && (
          <button
            onClick={openCreate}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            + Nuevo reporte
          </button>
        )}
      </div>

      {/* ── KPI cards ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {ESTADOS_REPORTE.map(estado => (
          <div
            key={estado}
            className="bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 p-4"
          >
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              {estado}
            </p>
            <p className="text-3xl font-black text-slate-800 dark:text-white mt-1">
              {countByEstado(estado)}
            </p>
            <span className={`mt-2 inline-block px-2 py-0.5 rounded-lg text-[10px] font-bold ${ESTADO_STYLE[estado]}`}>
              {estado}
            </span>
          </div>
        ))}
      </div>

      {/* ── Filtros ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="flex-1 min-w-[200px] px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={filterTipo}
          onChange={e => setFilterTipo(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos los tipos</option>
          {TIPOS_REPORTE.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select
          value={filterEstado}
          onChange={e => setFilterEstado(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos los estados</option>
          {ESTADOS_REPORTE.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* ── Lista de reportes ────────────────────────────────────────────────── */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-slate-100 dark:bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : reportes.length === 0 ? (
        <div className="text-center py-16 text-slate-400 dark:text-slate-500 text-sm">
          No hay reportes que coincidan con los filtros.
        </div>
      ) : (
        <div className="space-y-3">
          {reportes.map(r => (
            <ReporteCard
              key={r.idReporte}
              reporte={r}
              canUpdate={canUpdate}
              canDelete={canDelete}
              canDownload={canDownload}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* ── Modal ────────────────────────────────────────────────────────────── */}
      {modalMode && (
        <ReporteModal
          mode={modalMode}
          reporte={selected}
          saving={saving}
          onClose={closeModal}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  )
}

// ── Tarjeta de reporte ────────────────────────────────────────────────────────

interface CardProps {
  reporte: Reporte
  canUpdate: boolean
  canDelete: boolean
  canDownload: boolean
  onEdit: (r: Reporte) => void
  onDelete: (id: number) => void
}

function ReporteCard({ reporte: r, canUpdate, canDelete, canDownload, onEdit, onDelete }: CardProps) {
  return (
    <div className="bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-md transition-all">

      {/* Ícono tipo */}
      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center text-2xl">
        {TIPO_ICON[r.tipoReporte] ?? '📄'}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <p className="font-bold text-slate-800 dark:text-white truncate">{r.nombreReporte}</p>
          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${TIPO_STYLE[r.tipoReporte] ?? 'bg-slate-100 text-slate-600'}`}>
            {r.tipoReporte}
          </span>
          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${ESTADO_STYLE[r.estado] ?? 'bg-slate-100 text-slate-600'}`}>
            {r.estado}
          </span>
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span>
            Período: {new Date(r.fechaInicio).toLocaleDateString('es-CO')} – {new Date(r.fechaFin).toLocaleDateString('es-CO')}
          </span>
          <span>·</span>
          <span>
            Generado: {new Date(r.fechaGeneracion).toLocaleDateString('es-CO')}
          </span>
          {r.parametros && r.parametros !== '{}' && (
            <>
              <span>·</span>
              <span className="truncate max-w-[200px]">{r.parametros}</span>
            </>
          )}
        </div>
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {canDownload && r.archivoGenerado && (
          <a
            href={r.archivoGenerado}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 rounded-xl bg-green-100 dark:bg-green-500/20 hover:bg-green-200 dark:hover:bg-green-500/30 text-green-700 dark:text-green-300 text-xs font-semibold transition-colors"
          >
            Descargar
          </a>
        )}
        {canUpdate && (
          <button
            onClick={() => onEdit(r)}
            className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-300 text-xs font-semibold transition-colors"
          >
            Editar
          </button>
        )}
        {canDelete && (
          <button
            onClick={() => onDelete(r.idReporte)}
            className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-300 text-xs font-semibold transition-colors"
          >
            Eliminar
          </button>
        )}
      </div>
    </div>
  )
}

// ── Modal ─────────────────────────────────────────────────────────────────────

interface ModalProps {
  mode: 'create' | 'edit'
  reporte: Reporte | null
  saving: boolean
  onClose: () => void
  onCreate: (p: Pick<Reporte, 'nombreReporte' | 'tipoReporte' | 'fechaInicio' | 'fechaFin' | 'parametros'> & { archivoGenerado?: string | null }) => void
  onUpdate: (id: number, p: Partial<Pick<Reporte, 'nombreReporte' | 'tipoReporte' | 'estado' | 'fechaInicio' | 'fechaFin' | 'parametros' | 'archivoGenerado'>>) => void
}

function ReporteModal({ mode, reporte, saving, onClose, onCreate, onUpdate }: ModalProps) {
  const hoy = new Date().toISOString().slice(0, 10)

  const [nombreReporte, setNombreReporte] = useState(reporte?.nombreReporte ?? '')
  const [tipoReporte, setTipoReporte] = useState(reporte?.tipoReporte ?? 'Academico')
  const [estado, setEstado] = useState(reporte?.estado ?? 'Pendiente')
  const [fechaInicio, setFechaInicio] = useState(reporte?.fechaInicio?.slice(0, 10) ?? hoy)
  const [fechaFin, setFechaFin] = useState(reporte?.fechaFin?.slice(0, 10) ?? hoy)
  const [archivoUrl, setArchivoUrl] = useState<string | null>(reporte?.archivoGenerado ?? null)
  const [archivoNombre, setArchivoNombre] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setFormError(null)
    try {
      const url = await uploadArchivoReporte(file)
      setArchivoUrl(url)
      setArchivoNombre(file.name)
    } catch (err: any) {
      setFormError(err.message ?? 'Error al subir archivo')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    if (fechaFin < fechaInicio) {
      setFormError('La fecha de fin debe ser mayor o igual a la de inicio.')
      return
    }
    if (mode === 'create') {
      onCreate({ nombreReporte, tipoReporte, fechaInicio, fechaFin, parametros: '', archivoGenerado: archivoUrl })
    } else if (reporte) {
      onUpdate(reporte.idReporte, {
        nombreReporte,
        tipoReporte,
        estado,
        fechaInicio,
        fechaFin,
        parametros: '',
        archivoGenerado: archivoUrl,
      })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="w-full max-w-lg bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden">

        <div className="px-6 py-4 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">
            {mode === 'create' ? 'Nuevo reporte' : 'Editar reporte'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xl font-bold">×</button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Nombre del reporte</label>
            <input
              type="text"
              required
              placeholder="Ej: Asistencia Primer Trimestre 2026"
              value={nombreReporte}
              onChange={e => setNombreReporte(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Tipo</label>
              <select
                value={tipoReporte}
                onChange={e => setTipoReporte(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {TIPOS_REPORTE.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            {mode === 'edit' && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Estado</label>
                <select
                  value={estado}
                  onChange={e => setEstado(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {ESTADOS_REPORTE.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Fecha inicio</label>
              <input
                type="date"
                required
                value={fechaInicio}
                onChange={e => setFechaInicio(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Fecha fin</label>
              <input
                type="date"
                required
                value={fechaFin}
                onChange={e => setFechaFin(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Archivo */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Archivo generado <span className="font-normal text-slate-400">(opcional)</span>
            </label>
            <input ref={fileRef} type="file" className="hidden" onChange={handleFileChange} />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-dashed border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 text-sm hover:border-blue-400 hover:text-blue-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Subiendo...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  {archivoUrl ? 'Cambiar archivo' : 'Subir archivo'}
                </>
              )}
            </button>
            {archivoUrl && (
              <div className="mt-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <a
                  href={archivoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline truncate"
                >
                  {archivoNombre ?? 'Ver archivo actual'}
                </a>
              </div>
            )}
          </div>

          {formError && <p className="text-xs text-red-500 dark:text-red-400">{formError}</p>}

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
              disabled={saving || uploading}
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
