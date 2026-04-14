'use client'

import { useState } from 'react'
import { type CodigoQRConEstudiante, type TipoQR, getQRImageUrl } from '@/services/qr/qrService'

type Props = {
  codigo: CodigoQRConEstudiante | null
  loading: boolean
}

const TIPO_INFO: Record<TipoQR, { label: string; color: string }> = {
  ingreso: { label: 'Código de Ingreso',           color: 'text-green-600 dark:text-green-400' },
  salida:  { label: 'Código de Salida',            color: 'text-orange-600 dark:text-orange-400' },
  ambos:   { label: 'Código de Ingreso y Salida',  color: 'text-blue-600 dark:text-blue-400' },
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
      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold transition-colors"
    >
      {downloading ? 'Descargando...' : 'Descargar QR'}
    </button>
  )
}

export default function QREstudianteView({ codigo, loading }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
          Mi Código QR
        </h1>
        <p className="text-sm text-slate-500 dark:text-gray-400 mt-0.5">
          Presenta este código al docente para registrar tu asistencia.
        </p>
      </div>

      <div className="flex justify-center pt-4">
        {loading ? (
          <div className="w-72 h-96 rounded-2xl bg-slate-100 dark:bg-white/5 animate-pulse" />
        ) : !codigo ? (
          <div className="text-center py-12 text-slate-500 dark:text-gray-400">
            <p className="text-4xl mb-3">🔒</p>
            <p className="font-semibold">No tienes un código QR activo.</p>
            <p className="text-sm mt-1">Contacta al administrador para que te asigne uno.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-5 p-7 rounded-2xl bg-white dark:bg-white/5 border border-white/40 dark:border-white/10 shadow-lg max-w-xs w-full">
            {/* Imagen QR vía goqr.me */}
            <div className="rounded-xl overflow-hidden bg-white p-2 shadow-sm">
              <img
                src={getQRImageUrl(codigo.codigo, 220)}
                alt={`Código QR de ${codigo.codigoEstudiante}`}
                width={220}
                height={220}
                className="block"
              />
            </div>

            <div className="text-center space-y-1 w-full">
              <p className="font-bold text-slate-800 dark:text-white text-base">
                {codigo.nombreCompleto}
              </p>
              <p className="text-xs font-mono font-semibold text-blue-600 dark:text-blue-400">
                {codigo.codigoEstudiante}
              </p>
              {codigo.curso && (
                <p className="text-xs text-slate-500 dark:text-gray-400">{codigo.curso}</p>
              )}
              <p className={`text-xs font-semibold pt-1 ${TIPO_INFO[codigo.tipo].color}`}>
                {TIPO_INFO[codigo.tipo].label}
              </p>
              {codigo.fechaVencimiento && (
                <p className="text-xs text-slate-400 dark:text-gray-500">
                  Vence: {new Date(codigo.fechaVencimiento).toLocaleDateString('es-CO')}
                </p>
              )}
            </div>

            <DownloadButton codigo={codigo} />
          </div>
        )}
      </div>
    </div>
  )
}
