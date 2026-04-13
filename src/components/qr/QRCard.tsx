'use client'

import { useRef, useCallback } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { type EstudianteQR } from '@/services/qr/qrService'

type Props = {
  estudiante: EstudianteQR
  canDownload: boolean
  size?: number
}

export default function QRCard({ estudiante, canDownload, size = 180 }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)

  const handleDownload = useCallback(() => {
    const svg = svgRef.current
    if (!svg) return

    const serializer = new XMLSerializer()
    const svgString = serializer.serializeToString(svg)
    const blob = new Blob([svgString], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = `QR_${estudiante.codigoEstudiante}.svg`
    a.click()
    URL.revokeObjectURL(url)
  }, [estudiante.codigoEstudiante])

  return (
    <div className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-white dark:bg-white/5 border border-white/40 dark:border-white/10 shadow-md hover:shadow-lg transition-shadow">
      <div className="rounded-xl overflow-hidden p-2 bg-white">
        <QRCodeSVG
          ref={svgRef}
          value={estudiante.codigoEstudiante}
          size={size}
          level="M"
          includeMargin={false}
        />
      </div>

      <div className="text-center space-y-0.5">
        <p className="font-semibold text-slate-800 dark:text-white text-sm leading-tight">
          {estudiante.nombreCompleto}
        </p>
        <p className="text-xs text-blue-600 dark:text-blue-400 font-mono font-semibold">
          {estudiante.codigoEstudiante}
        </p>
        {estudiante.curso && (
          <p className="text-xs text-slate-500 dark:text-gray-400">
            {estudiante.curso}
          </p>
        )}
      </div>

      {canDownload && (
        <button
          onClick={handleDownload}
          className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
        >
          Descargar QR
        </button>
      )}
    </div>
  )
}
