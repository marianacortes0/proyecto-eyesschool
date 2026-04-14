'use client'

import { useState } from 'react'
import { type CodigoQRConEstudiante, type TipoQR, getQRImageUrl } from '@/services/qr/qrService'

type Props = {
  codigos: CodigoQRConEstudiante[]
  onEdit: (c: CodigoQRConEstudiante) => void
  onToggle: (id: number, activo: boolean) => void
  onDelete: (id: number) => void
  onRenew: (id: number) => void
}

const TIPO_BADGE: Record<TipoQR, { label: string; cls: string }> = {
  ingreso: { label: '🚪 Ingreso', cls: 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300' },
  salida:  { label: '🏃 Salida',  cls: 'bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300' },
  ambos:   { label: '↕️ Ambos',   cls: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300' },
}

function DownloadButton({ codigo }: { codigo: CodigoQRConEstudiante }) {
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const url = getQRImageUrl(codigo.codigo, 512)
      const response = await fetch(url)
      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = objectUrl
      a.download = `QR_${codigo.codigoEstudiante}_${codigo.tipo}.png`
      a.click()
      URL.revokeObjectURL(objectUrl)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      title="Descargar QR"
      className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors disabled:opacity-40"
    >
      {downloading ? '⏳' : '⬇'}
    </button>
  )
}

export default function QRCodigosTable({ codigos, onEdit, onToggle, onDelete, onRenew }: Props) {
  if (codigos.length === 0) {
    return (
      <div className="text-center py-14 text-slate-500 dark:text-gray-400">
        No hay códigos QR registrados.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/40 dark:border-white/10 shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-gray-400 text-xs uppercase tracking-wider">
          <tr>
            <th className="px-4 py-3 text-left">Estudiante</th>
            <th className="px-4 py-3 text-left">QR</th>
            <th className="px-4 py-3 text-left">Tipo</th>
            <th className="px-4 py-3 text-left">Estado</th>
            <th className="px-4 py-3 text-left">Creado</th>
            <th className="px-4 py-3 text-left">Vence</th>
            <th className="px-4 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
          {codigos.map((c) => {
            const badge = TIPO_BADGE[c.tipo]
            const vencido =
              c.fechaVencimiento != null &&
              new Date(c.fechaVencimiento) < new Date()

            return (
              <tr
                key={c.idCodigo}
                className="bg-white dark:bg-transparent hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors"
              >
                {/* Estudiante */}
                <td className="px-4 py-3">
                  <p className="font-semibold text-slate-800 dark:text-white">
                    {c.nombreCompleto}
                  </p>
                  <p className="text-xs text-slate-400 font-mono">{c.codigoEstudiante}</p>
                  {c.curso && (
                    <p className="text-xs text-slate-400">{c.curso}</p>
                  )}
                </td>

                {/* Imagen QR (goqr.me) */}
                <td className="px-4 py-3">
                  <img
                    src={getQRImageUrl(c.codigo, 56)}
                    alt={`QR de ${c.codigoEstudiante}`}
                    width={56}
                    height={56}
                    className="rounded border border-slate-200 dark:border-white/10 bg-white"
                  />
                </td>

                {/* Tipo */}
                <td className="px-4 py-3">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${badge.cls}`}>
                    {badge.label}
                  </span>
                </td>

                {/* Estado */}
                <td className="px-4 py-3">
                  <button
                    onClick={() => onToggle(c.idCodigo, !c.activo)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                      c.activo
                        ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200'
                        : 'bg-slate-100 dark:bg-white/5 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${c.activo ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                    {c.activo ? 'Activo' : 'Inactivo'}
                  </button>
                </td>

                {/* Fecha creación */}
                <td className="px-4 py-3 text-xs text-slate-500 dark:text-gray-400 whitespace-nowrap">
                  {new Date(c.fechaCreacion).toLocaleDateString('es-CO')}
                </td>

                {/* Vencimiento */}
                <td className="px-4 py-3 text-xs whitespace-nowrap">
                  {c.fechaVencimiento ? (
                    <span className={vencido ? 'text-red-500 font-semibold' : 'text-slate-500 dark:text-gray-400'}>
                      {vencido ? '⚠ ' : ''}{new Date(c.fechaVencimiento).toLocaleDateString('es-CO')}
                    </span>
                  ) : (
                    <span className="text-slate-300 dark:text-gray-600">Sin vencimiento</span>
                  )}
                </td>

                {/* Acciones */}
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <DownloadButton codigo={c} />
                    <button
                      onClick={() => onEdit(c)}
                      title="Editar"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => onRenew(c.idCodigo)}
                      title="Renovar — genera un nuevo código QR"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors text-sm"
                    >
                      🔄
                    </button>
                    <button
                      onClick={() => onDelete(c.idCodigo)}
                      title="Eliminar"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
