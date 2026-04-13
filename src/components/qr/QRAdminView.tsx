'use client'

import { useState } from 'react'
import { type EstudianteQR, type RegistroAsistencia, type UsuarioSinEstudiante, type CursoSimple, getQRImageUrl } from '@/services/qr/qrService'

type Props = {
  estudiantes: EstudianteQR[]
  totalCount: number
  sinAsignar: UsuarioSinEstudiante[]
  cursos: CursoSimple[]
  asistencia: RegistroAsistencia[]
  loading: boolean
  error: string | null
  searchQuery: string
  fechaFiltro: string
  onSearchChange: (q: string) => void
  onFechaChange: (f: string) => void
  onRefreshAsistencia: () => void
  onAsignarQR: (idUsuario: number, idCursoActual: number | null) => Promise<void>
}

type Tab = 'qr' | 'asistencia' | 'asignar'

const ESTADO_STYLE: Record<string, string> = {
  Presente:    'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300',
  Tarde:       'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300',
  Ausente:     'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300',
  Excusa:      'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300',
  Suspensión:  'bg-slate-100 dark:bg-slate-500/20 text-slate-700 dark:text-slate-300',
}

// ── Descarga individual ───────────────────────────────────────────────────────

function DownloadBtn({ estudiante }: { estudiante: EstudianteQR }) {
  const [loading, setLoading] = useState(false)

  const handleDownload = async () => {
    setLoading(true)
    try {
      const url = getQRImageUrl(estudiante.codigoEstudiante, 512)
      const res  = await fetch(url)
      const blob = await res.blob()
      const obj  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = obj
      a.download = `QR_${estudiante.codigoEstudiante}.png`
      a.click()
      URL.revokeObjectURL(obj)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      title="Descargar QR"
      className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors disabled:opacity-40"
    >
      {loading ? '⏳' : '⬇'}
    </button>
  )
}

// ── Modal de asignación ───────────────────────────────────────────────────────

function AsignarModal({
  usuario,
  cursos,
  onConfirm,
  onClose,
}: {
  usuario: UsuarioSinEstudiante
  cursos: CursoSimple[]
  onConfirm: (idCurso: number | null) => Promise<void>
  onClose: () => void
}) {
  const [idCurso, setIdCurso] = useState<string>('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await onConfirm(idCurso ? parseInt(idCurso) : null)
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white dark:bg-[#1a1a2e] rounded-2xl shadow-2xl border border-white/20 dark:border-white/10">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/10">
          <h2 className="text-base font-bold text-slate-800 dark:text-white">Asignar código QR</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xl leading-none">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
            <p className="text-sm font-semibold text-slate-800 dark:text-white">
              {usuario.primerNombre} {usuario.primerApellido}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">{usuario.correo ?? usuario.numeroDocumento}</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Curso</label>
            <select
              value={idCurso}
              onChange={(e) => setIdCurso(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="" disabled>Seleccionar curso...</option>
              {cursos.map((c) => (
                <option key={c.idCurso} value={c.idCurso}>{c.nombreCurso}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || !idCurso}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
            >
              {saving ? 'Asignando...' : 'Asignar QR'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Tabla de QR por estudiante ────────────────────────────────────────────────

function TablaQR({ estudiantes }: { estudiantes: EstudianteQR[] }) {
  if (estudiantes.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 dark:text-gray-400">
        No hay estudiantes activos registrados.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/40 dark:border-white/10 shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-gray-400 text-xs uppercase tracking-wider">
          <tr>
            <th className="px-4 py-3 text-left">Estudiante</th>
            <th className="px-4 py-3 text-left">Código QR</th>
            <th className="px-4 py-3 text-right">Descargar</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
          {estudiantes.map((e) => (
            <tr
              key={e.idEstudiante}
              className="bg-white dark:bg-transparent hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors"
            >
              <td className="px-4 py-3">
                <p className="font-semibold text-slate-800 dark:text-white">{e.nombreCompleto}</p>
                <p className="text-xs text-slate-400 font-mono">{e.codigoEstudiante}</p>
              </td>

              <td className="px-4 py-3">
                <img
                  src={getQRImageUrl(e.codigoEstudiante, 56)}
                  alt={`QR ${e.codigoEstudiante}`}
                  width={56}
                  height={56}
                  className="rounded border border-slate-200 dark:border-white/10 bg-white"
                />
              </td>

              <td className="px-4 py-3 text-right">
                <DownloadBtn estudiante={e} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Tabla por asignar ─────────────────────────────────────────────────────────

function TablaAsignar({
  sinAsignar,
  cursos,
  onAsignar,
}: {
  sinAsignar: UsuarioSinEstudiante[]
  cursos: CursoSimple[]
  onAsignar: (idUsuario: number, idCurso: number | null) => Promise<void>
}) {
  const [modalUsuario, setModalUsuario] = useState<UsuarioSinEstudiante | null>(null)

  if (sinAsignar.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 dark:text-gray-400">
        Todos los estudiantes registrados ya tienen código QR asignado.
      </div>
    )
  }

  return (
    <>
      <div className="overflow-x-auto rounded-2xl border border-white/40 dark:border-white/10 shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-gray-400 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3 text-left">Estudiante</th>
              <th className="px-4 py-3 text-left">Documento</th>
              <th className="px-4 py-3 text-left">Correo</th>
              <th className="px-4 py-3 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {sinAsignar.map((u) => (
              <tr
                key={u.idUsuario}
                className="bg-white dark:bg-transparent hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors"
              >
                <td className="px-4 py-3">
                  <p className="font-semibold text-slate-800 dark:text-white">
                    {u.primerNombre} {u.primerApellido}
                  </p>
                </td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-400 font-mono text-xs">
                  {u.numeroDocumento}
                </td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs">
                  {u.correo ?? '—'}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => setModalUsuario(u)}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
                  >
                    Asignar QR
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalUsuario && (
        <AsignarModal
          usuario={modalUsuario}
          cursos={cursos}
          onConfirm={async (idCurso) => {
            await onAsignar(modalUsuario.idUsuario, idCurso)
            setModalUsuario(null)
          }}
          onClose={() => setModalUsuario(null)}
        />
      )}
    </>
  )
}

// ── Tabla de asistencia reciente ──────────────────────────────────────────────

function TablaAsistencia({ registros }: { registros: RegistroAsistencia[] }) {
  if (registros.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 dark:text-gray-400">
        <p className="text-3xl mb-2">📋</p>
        <p>No hay registros de asistencia para esta fecha.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/40 dark:border-white/10 shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-gray-400 text-xs uppercase tracking-wider">
          <tr>
            <th className="px-4 py-3 text-left">Estudiante</th>
            <th className="px-4 py-3 text-left">Estado</th>
            <th className="px-4 py-3 text-left">Observación</th>
            <th className="px-4 py-3 text-left">Tipo</th>
            <th className="px-4 py-3 text-left">Hora registro</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
          {registros.map((r) => (
            <tr
              key={r.idAsistencia}
              className="bg-white dark:bg-transparent hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors"
            >
              <td className="px-4 py-3">
                <p className="font-semibold text-slate-800 dark:text-white">{r.nombreEstudiante}</p>
                <p className="text-xs text-slate-400 font-mono">{r.codigoEstudiante}</p>
              </td>

              <td className="px-4 py-3">
                <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${ESTADO_STYLE[r.estado] ?? ESTADO_STYLE['Excusa']}`}>
                  {r.estado}
                </span>
              </td>

              <td className="px-4 py-3 text-xs text-slate-500 dark:text-gray-400 max-w-48 truncate">
                {r.observacion ?? <span className="text-slate-300 dark:text-gray-600">—</span>}
              </td>

              <td className="px-4 py-3">
                {r.tipo ? (
                  <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                    r.tipo.toLowerCase() === 'entrada'
                      ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                      : r.tipo.toLowerCase() === 'salida'
                        ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300'
                        : 'bg-slate-100 dark:bg-slate-500/20 text-slate-600 dark:text-slate-300'
                  }`}>
                    {r.tipo.charAt(0).toUpperCase() + r.tipo.slice(1)}
                  </span>
                ) : (
                  <span className="text-xs text-slate-300 dark:text-gray-600">—</span>
                )}
              </td>

              <td className="px-4 py-3 text-xs text-slate-500 dark:text-gray-400 whitespace-nowrap">
                {new Date(r.fechaRegistro).toLocaleTimeString('es-CO', {
                  hour: '2-digit', minute: '2-digit',
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Vista principal ───────────────────────────────────────────────────────────

export default function QRAdminView({
  estudiantes,
  totalCount,
  sinAsignar,
  cursos,
  asistencia,
  loading,
  error,
  searchQuery,
  fechaFiltro,
  onSearchChange,
  onFechaChange,
  onRefreshAsistencia,
  onAsignarQR,
}: Props) {
  const [tab, setTab] = useState<Tab>('qr')

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
            Códigos QR
          </h1>
          <p className="text-sm text-slate-500 dark:text-gray-400 mt-0.5">
            {totalCount} estudiante{totalCount !== 1 ? 's' : ''} con código QR activo
            {sinAsignar.length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-semibold">
                {sinAsignar.length} pendiente{sinAsignar.length !== 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-slate-100 dark:bg-white/5">
          <button
            onClick={() => setTab('qr')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              tab === 'qr'
                ? 'bg-white dark:bg-white/10 text-slate-800 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-gray-400 hover:text-slate-700'
            }`}
          >
            📲 Códigos QR
          </button>
          <button
            onClick={() => { setTab('asistencia'); onRefreshAsistencia() }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              tab === 'asistencia'
                ? 'bg-white dark:bg-white/10 text-slate-800 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-gray-400 hover:text-slate-700'
            }`}
          >
            📋 Asistencia
          </button>
          <button
            onClick={() => setTab('asignar')}
            className={`relative px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              tab === 'asignar'
                ? 'bg-white dark:bg-white/10 text-slate-800 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-gray-400 hover:text-slate-700'
            }`}
          >
            👤 Por Asignar
            {sinAsignar.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] font-black flex items-center justify-center">
                {sinAsignar.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Barra de filtros */}
      <div className="flex flex-wrap gap-3">
        {tab === 'qr' && (
          <input
            type="search"
            placeholder="Buscar por nombre, código o curso..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="flex-1 min-w-56 px-4 py-2 rounded-xl border border-white/40 dark:border-white/10 bg-white/80 dark:bg-white/5 text-slate-800 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )}
        {tab === 'asistencia' && (
          <input
            type="date"
            value={fechaFiltro}
            onChange={(e) => { onFechaChange(e.target.value); onRefreshAsistencia() }}
            className="px-4 py-2 rounded-xl border border-white/40 dark:border-white/10 bg-white/80 dark:bg-white/5 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Contenido */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : tab === 'qr' ? (
        <TablaQR estudiantes={estudiantes} />
      ) : tab === 'asistencia' ? (
        <TablaAsistencia registros={asistencia} />
      ) : (
        <TablaAsignar
          sinAsignar={sinAsignar}
          cursos={cursos}
          onAsignar={onAsignarQR}
        />
      )}
    </div>
  )
}
