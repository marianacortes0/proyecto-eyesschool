'use client'

import { useState, useEffect } from 'react'
import { type CodigoQRConEstudiante, type EstudianteQR, type TipoQR } from '@/services/qr/qrService'
import { type ModalMode } from '@/hooks/useQR'
import { type CreateCodigoQRData, type UpdateCodigoQRData } from '@/services/qr/qrService'

type Props = {
  mode: ModalMode
  codigo: CodigoQRConEstudiante | null
  estudiantes: EstudianteQR[]
  saving: boolean
  onClose: () => void
  onCreate: (data: CreateCodigoQRData) => Promise<void>
  onUpdate: (data: UpdateCodigoQRData) => Promise<void>
}

const TIPOS: { value: TipoQR; label: string; desc: string }[] = [
  { value: 'ambos',   label: 'Ingreso y Salida', desc: 'Un código para ambos registros' },
  { value: 'ingreso', label: 'Solo Ingreso',      desc: 'Registro de entrada únicamente' },
  { value: 'salida',  label: 'Solo Salida',       desc: 'Registro de salida únicamente' },
]

export default function QRCodigoModal({
  mode,
  codigo,
  estudiantes,
  saving,
  onClose,
  onCreate,
  onUpdate,
}: Props) {
  const [idEstudiante, setIdEstudiante] = useState<number | ''>('')
  const [tipo, setTipo] = useState<TipoQR>('ambos')
  const [fechaVencimiento, setFechaVencimiento] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (mode === 'edit' && codigo) {
      setIdEstudiante(codigo.idEstudiante)
      setTipo(codigo.tipo)
      setFechaVencimiento(codigo.fechaVencimiento ?? '')
    } else {
      setIdEstudiante('')
      setTipo('ambos')
      setFechaVencimiento('')
    }
    setError(null)
  }, [mode, codigo])

  if (!mode) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      if (mode === 'create') {
        if (!idEstudiante) { setError('Selecciona un estudiante'); return }
        await onCreate({
          idEstudiante: idEstudiante as number,
          tipo,
          fechaVencimiento: fechaVencimiento || null,
        })
      } else {
        await onUpdate({
          tipo,
          fechaVencimiento: fechaVencimiento || null,
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-[#1a1a2e] rounded-2xl shadow-2xl border border-white/20 dark:border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/10">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">
            {mode === 'create' ? 'Nuevo Código QR' : 'Editar Código QR'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Estudiante (solo al crear) */}
          {mode === 'create' && (
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-gray-300">
                Estudiante <span className="text-red-500">*</span>
              </label>
              <select
                value={idEstudiante}
                onChange={(e) => setIdEstudiante(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Seleccionar estudiante...</option>
                {estudiantes.map((e) => (
                  <option key={e.idEstudiante} value={e.idEstudiante}>
                    {e.nombreCompleto} — {e.codigoEstudiante}
                    {e.curso ? ` (${e.curso})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Tipo de QR */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-gray-300">
              Tipo de código <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {TIPOS.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTipo(t.value)}
                  className={`flex flex-col items-center gap-1 px-3 py-3 rounded-xl border text-center transition-all ${
                    tipo === t.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300'
                      : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 hover:border-blue-300'
                  }`}
                >
                  <span className="text-lg">
                    {t.value === 'ingreso' ? '🚪' : t.value === 'salida' ? '🏃' : '↕️'}
                  </span>
                  <span className="text-xs font-semibold leading-tight">{t.label}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400 dark:text-gray-500">
              {TIPOS.find((t) => t.value === tipo)?.desc}
            </p>
          </div>

          {/* Fecha de vencimiento */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 dark:text-gray-300">
              Fecha de vencimiento <span className="text-slate-400 font-normal">(opcional)</span>
            </label>
            <input
              type="date"
              value={fechaVencimiento}
              onChange={(e) => setFechaVencimiento(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {fechaVencimiento && (
              <button
                type="button"
                onClick={() => setFechaVencimiento('')}
                className="text-xs text-slate-400 hover:text-red-500"
              >
                Quitar fecha de vencimiento
              </button>
            )}
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          {/* Acciones */}
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
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
            >
              {saving ? 'Guardando...' : mode === 'create' ? 'Crear Código' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
