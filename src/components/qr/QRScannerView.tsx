'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { type ScanStatus, type ScanResult, type ScanEstado, type PendingRegistration } from '@/hooks/useEscanear'

type Props = {
  status: ScanStatus
  errorMsg: string | null
  pending: PendingRegistration | null
  lastResult: ScanResult | null
  recentScans: ScanResult[]
  onCapture: (blob: Blob) => void
  onConfirm: (estado: ScanEstado, observacion: string) => Promise<void>
  onCancel: () => void
  onClearError: () => void
}

const ESTADOS: { value: ScanEstado; label: string; ring: string; badge: string; dot: string }[] = [
  {
    value: 'Presente',
    label: 'Presente',
    ring:  'ring-emerald-500 bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300',
    badge: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300',
    dot:   'bg-emerald-500',
  },
  {
    value: 'Tarde',
    label: 'Tarde',
    ring:  'ring-amber-500 bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300',
    badge: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300',
    dot:   'bg-amber-500',
  },
  {
    value: 'Ausente',
    label: 'Ausente',
    ring:  'ring-red-500 bg-red-50 dark:bg-red-500/20 text-red-700 dark:text-red-300',
    badge: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300',
    dot:   'bg-red-500',
  },
]

function estadoInfo(e: ScanEstado) {
  return ESTADOS.find((s) => s.value === e)!
}

// ── Panel de confirmación ────────────────────────────────────────────────────

function ConfirmPanel({
  pending,
  saving,
  onConfirm,
  onCancel,
}: {
  pending: PendingRegistration
  saving: boolean
  onConfirm: (estado: ScanEstado, obs: string) => void
  onCancel: () => void
}) {
  const [estado, setEstado]     = useState<ScanEstado>('Presente')
  const [obs, setObs]           = useState('')
  const obsRef                  = useRef<HTMLTextAreaElement>(null)

  // Enfocar el campo de observaciones al aparecer
  useEffect(() => { obsRef.current?.focus() }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onConfirm(estado, obs)
  }

  const { qrData } = pending
  const info = estadoInfo(estado)

  return (
    <div className="flex flex-col gap-5 p-5 rounded-2xl bg-white dark:bg-white/5 border-2 border-blue-300 dark:border-blue-500/50 shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200">
      {/* Estudiante detectado */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-xl flex-shrink-0">
          👤
        </div>
        <div>
          <p className="font-bold text-slate-800 dark:text-white leading-tight">
            {qrData.nombreCompleto}
          </p>
          <p className="text-xs text-slate-400 font-mono">{qrData.codigoEstudiante}</p>
          {qrData.curso && (
            <p className="text-xs text-slate-400">{qrData.curso}</p>
          )}
        </div>
        <span className="ml-auto text-xs text-slate-400">
          {pending.detectedAt.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Selector de estado */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600 dark:text-gray-400 uppercase tracking-wider">
            Estado de asistencia
          </label>
          <div className="grid grid-cols-3 gap-2">
            {ESTADOS.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setEstado(s.value)}
                className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                  estado === s.value
                    ? `ring-2 ${s.ring} border-transparent`
                    : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 bg-transparent hover:border-slate-300'
                }`}
              >
                {s.value === 'Presente' ? '✅' : s.value === 'Tarde' ? '⏰' : '❌'}{' '}
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Observaciones */}
        <div className="space-y-1.5">
          <label
            htmlFor="obs-field"
            className="text-xs font-semibold text-slate-600 dark:text-gray-400 uppercase tracking-wider"
          >
            Observaciones{' '}
            <span className="text-slate-400 font-normal normal-case">(opcional)</span>
          </label>
          <textarea
            id="obs-field"
            ref={obsRef}
            rows={2}
            value={obs}
            onChange={(e) => setObs(e.target.value)}
            placeholder="Ej: llegó sin uniforme, justificó médicamente..."
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-800 dark:text-white text-sm placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Acciones */}
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-white/5 transition-colors disabled:opacity-40"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className={`flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition-colors disabled:opacity-50 ${
              info.dot === 'bg-emerald-500' ? 'bg-emerald-600 hover:bg-emerald-700' :
              info.dot === 'bg-amber-500'   ? 'bg-amber-500 hover:bg-amber-600' :
              'bg-red-600 hover:bg-red-700'
            }`}
          >
            {saving ? 'Guardando…' : `Registrar ${estado}`}
          </button>
        </div>
      </form>
    </div>
  )
}

// ── Componente principal ────────────────────────────────────────────────────

export default function QRScannerView({
  status,
  errorMsg,
  pending,
  lastResult,
  recentScans,
  onCapture,
  onConfirm,
  onCancel,
  onClearError,
}: Props) {
  const videoRef  = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [cameraActive, setCameraActive] = useState(false)
  const [cameraError, setCameraError]   = useState<string | null>(null)
  const [autoScan, setAutoScan]         = useState(false)

  // ── Cámara ─────────────────────────────────────────────────────────────────

  const startCamera = useCallback(async () => {
    setCameraError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
      setCameraActive(true)
    } catch {
      setCameraError('No se pudo acceder a la cámara. Verifica los permisos del navegador.')
    }
  }, [])

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    setCameraActive(false)
    setAutoScan(false)
  }, [])

  useEffect(() => () => stopCamera(), [stopCamera])

  // ── Captura ─────────────────────────────────────────────────────────────────

  const captureFrame = useCallback(() => {
    const video  = videoRef.current
    const canvas = canvasRef.current
    // No capturar si hay un registro pendiente de confirmar
    if (!video || !canvas || !cameraActive || status === 'scanning' || status === 'pending' || status === 'saving') return

    canvas.width  = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')?.drawImage(video, 0, 0)

    canvas.toBlob(
      (blob) => { if (blob) onCapture(blob) },
      'image/jpeg',
      0.85,
    )
  }, [cameraActive, status, onCapture])

  // ── Auto-scan ──────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!autoScan || !cameraActive) return
    const interval = setInterval(captureFrame, 2_000)
    return () => clearInterval(interval)
  }, [autoScan, cameraActive, captureFrame])

  // ── Ring del visor según estado ────────────────────────────────────────────

  const statusRing =
    status === 'scanning' ? 'ring-blue-400 animate-pulse' :
    status === 'pending'  ? 'ring-blue-500' :
    status === 'saving'   ? 'ring-blue-400 animate-pulse' :
    status === 'success'  ? 'ring-emerald-400' :
    status === 'error'    ? 'ring-red-400' :
    'ring-slate-300 dark:ring-white/20'

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* ── Columna izquierda: cámara + confirmación ───────────────────────── */}
      <div className="lg:col-span-3 space-y-4">
        {/* Visor */}
        <div className={`relative rounded-2xl overflow-hidden bg-slate-900 ring-4 ${statusRing} transition-all duration-300`}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full aspect-video object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Overlay cuando cámara apagada */}
          {!cameraActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-900/80">
              <p className="text-5xl">📷</p>
              <p className="text-white/80 text-sm font-medium text-center px-6">
                {cameraError ?? 'Activa la cámara para escanear códigos QR'}
              </p>
              <button
                onClick={startCamera}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
              >
                Activar cámara
              </button>
            </div>
          )}

          {/* Badge de estado */}
          {cameraActive && (
            <div className="absolute top-3 right-3">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-white backdrop-blur-sm ${
                status === 'scanning' || status === 'saving' ? 'bg-blue-500/80' :
                status === 'pending'  ? 'bg-blue-600/80' :
                status === 'success'  ? 'bg-emerald-500/80' :
                status === 'error'    ? 'bg-red-500/80' :
                'bg-slate-700/70'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  status === 'scanning' || status === 'saving' ? 'bg-blue-200 animate-pulse' :
                  status === 'pending'  ? 'bg-blue-200' :
                  status === 'success'  ? 'bg-emerald-200' :
                  status === 'error'    ? 'bg-red-200' : 'bg-slate-400'
                }`} />
                {status === 'scanning' ? 'Detectando…' :
                 status === 'pending'  ? 'Confirmación requerida' :
                 status === 'saving'   ? 'Guardando…' :
                 status === 'success'  ? 'Registrado' :
                 status === 'error'    ? 'Error' :
                 autoScan             ? 'Auto-scan activo' : 'Listo'}
              </span>
            </div>
          )}
        </div>

        {/* Controles de cámara */}
        {cameraActive && status !== 'pending' && status !== 'saving' && (
          <div className="flex gap-2">
            <button
              onClick={captureFrame}
              disabled={status === 'scanning'}
              className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold transition-colors"
            >
              {status === 'scanning' ? 'Detectando…' : '📸 Escanear'}
            </button>

            <button
              onClick={() => setAutoScan((v) => !v)}
              className={`px-4 py-3 rounded-xl font-semibold text-sm transition-colors ${
                autoScan
                  ? 'bg-amber-500 hover:bg-amber-600 text-white'
                  : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-gray-300 hover:bg-slate-300'
              }`}
              title={autoScan ? 'Desactivar auto-scan' : 'Activar auto-scan (cada 2s)'}
            >
              {autoScan ? '⏸ Auto' : '▶ Auto'}
            </button>

            <button
              onClick={stopCamera}
              className="px-4 py-3 rounded-xl bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-gray-300 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-500/20 text-sm font-semibold transition-colors"
              title="Apagar cámara"
            >
              ⏹
            </button>
          </div>
        )}

        {/* Panel de confirmación (aparece al detectar un QR) */}
        {(status === 'pending' || status === 'saving') && pending && (
          <ConfirmPanel
            pending={pending}
            saving={status === 'saving'}
            onConfirm={onConfirm}
            onCancel={onCancel}
          />
        )}

        {/* Mensaje de error */}
        {errorMsg && (
          <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-sm">
            <span className="flex-shrink-0 mt-0.5">⚠</span>
            <span className="flex-1">{errorMsg}</span>
            <button onClick={onClearError} className="flex-shrink-0 hover:opacity-70">✕</button>
          </div>
        )}

        {/* Confirmación visual de éxito */}
        {status === 'success' && lastResult && (
          <div className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30">
            <span className="text-3xl">✅</span>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-emerald-800 dark:text-emerald-300">
                {lastResult.codigo.nombreCompleto}
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-mono">
                {lastResult.codigo.codigoEstudiante}
                {lastResult.codigo.curso ? ` · ${lastResult.codigo.curso}` : ''}
              </p>
              {lastResult.observacion && (
                <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 mt-0.5 truncate">
                  {lastResult.observacion}
                </p>
              )}
            </div>
            <span className={`flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${estadoInfo(lastResult.estado).badge}`}>
              {lastResult.estado}
            </span>
          </div>
        )}
      </div>

      {/* ── Columna derecha: historial del día ────────────────────────────── */}
      <div className="lg:col-span-2 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-slate-800 dark:text-white">
            Registro del día
          </h2>
          <span className="text-xs text-slate-400 bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-full">
            {recentScans.length} registrado{recentScans.length !== 1 ? 's' : ''}
          </span>
        </div>

        {recentScans.length === 0 ? (
          <div className="text-center py-10 text-slate-400 dark:text-gray-500 text-sm">
            <p className="text-3xl mb-2">📋</p>
            <p>Aún no hay registros en esta sesión.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
            {recentScans.map((s) => {
              const info = estadoInfo(s.estado)
              return (
                <div
                  key={s.id}
                  className="flex items-start gap-3 px-4 py-3 rounded-xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 shadow-sm"
                >
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${info.dot}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 dark:text-white text-sm truncate">
                      {s.codigo.nombreCompleto}
                    </p>
                    <p className="text-xs text-slate-400 font-mono">{s.codigo.codigoEstudiante}</p>
                    {s.observacion && (
                      <p className="text-xs text-slate-400 mt-0.5 truncate" title={s.observacion}>
                        {s.observacion}
                      </p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0 space-y-1">
                    <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${info.badge}`}>
                      {s.estado}
                    </span>
                    <p className="text-xs text-slate-400">
                      {s.timestamp.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
