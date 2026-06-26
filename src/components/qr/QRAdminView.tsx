'use client'

import { useState } from 'react'
import { type EstudianteQR, getQRImageUrl } from '@/services/qr/qrService'
import { notifySuccess, notifyError } from '@/lib/toast'
import Pagination from '@/components/ui/Pagination'
import { usePagination } from '@/hooks/usePagination'

type Props = {
  estudiantes: EstudianteQR[]
  totalCount: number
  loading: boolean
  error: string | null
  searchQuery: string
  onSearchChange: (q: string) => void
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
      notifySuccess('Código QR generado(descargado) exitosamente')
    } catch {
      notifyError('Error al generar el código QR')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      title="Descargar QR"
      className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-primary hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors disabled:opacity-40 inline-flex"
    >
      <span className="material-symbols-outlined !text-xl">{loading ? 'hourglass_empty' : 'download'}</span>
    </button>
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

// ── Vista principal ───────────────────────────────────────────────────────────

export default function QRAdminView({
  estudiantes,
  totalCount,
  loading,
  error,
  searchQuery,
  onSearchChange,
}: Props) {
  const { page, setPage, totalPages, pageItems, total, from, to } = usePagination(estudiantes)

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
            Códigos QR
          </h1>
          <p className="text-sm text-slate-500 dark:text-gray-400 mt-0.5">
            {totalCount} estudiante{totalCount !== 1 ? 's' : ''} con código QR
          </p>
        </div>
      </div>

      {/* Barra de filtros */}
      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="Buscar por nombre, código o curso..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="flex-1 min-w-56 px-4 py-2 rounded-xl border border-white/40 dark:border-white/10 bg-white/80 dark:bg-white/5 text-slate-800 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
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
      ) : (
        <>
          <TablaQR estudiantes={pageItems} />
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            from={from}
            to={to}
            onPageChange={setPage}
            itemLabel="estudiantes"
          />
        </>
      )}
    </div>
  )
}
