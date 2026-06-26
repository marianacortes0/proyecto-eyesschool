'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { type ScanStatus, type ScanResult, type ScanEstado, type PendingRegistration } from '@/hooks/useEscanear'

type Props = {
  status: ScanStatus
  errorMsg: string | null
  pending: PendingRegistration | null
  lastResult: ScanResult | null
  recentScans: ScanResult[]
  todayRecords?: { idAsistencia: number; nombreEstudiante: string; codigoEstudiante: string; estado: string; fecha: string; fechaRegistro: string; observacion: string | null }[]
  onCapture: (blob: Blob) => void
  onConfirm: (tipo: 'entrada' | 'salida') => Promise<void>
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
  onConfirm: (tipo: 'entrada' | 'salida') => void
  onCancel: () => void
}) {
  const [tipo, setTipo] = useState<'entrada' | 'salida'>('entrada')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onConfirm(tipo)
  }

  const { qrData } = pending

  return (
    <div className="flex flex-col gap-5 p-5 rounded-2xl bg-white dark:bg-white/5 border-2 border-blue-300 dark:border-primary/50 shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200">
      {/* Estudiante detectado */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300 flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined !text-xl">person</span>
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
        {/* Tipo: Entrada / Salida — único campo a elegir */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600 dark:text-gray-400 uppercase tracking-wider">
            Tipo de registro
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setTipo('entrada')}
              className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                tipo === 'entrada'
                  ? 'border-primary bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300'
                  : 'border-slate-200 dark:border-white/10 text-slate-500 hover:border-slate-300'
              }`}
            >
              <span className="material-symbols-outlined !text-lg align-middle">login</span> Entrada
            </button>
            <button
              type="button"
              onClick={() => setTipo('salida')}
              className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                tipo === 'salida'
                  ? 'border-violet-500 bg-violet-50 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300'
                  : 'border-slate-200 dark:border-white/10 text-slate-500 hover:border-slate-300'
              }`}
            >
              <span className="material-symbols-outlined !text-lg align-middle">logout</span> Salida
            </button>
          </div>
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
              tipo === 'entrada' ? 'bg-primary hover:bg-primary/90' : 'bg-violet-600 hover:bg-violet-700'
            }`}
          >
            {saving ? 'Guardando…' : `Registrar ${tipo === 'entrada' ? 'Entrada' : 'Salida'}`}
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
  todayRecords,
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
    status === 'pending'  ? 'ring-primary' :
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
              <span className="material-symbols-outlined !text-6xl text-white/80">photo_camera</span>
              <p className="text-white/80 text-sm font-medium text-center px-6">
                {cameraError ?? 'Activa la cámara para escanear códigos QR'}
              </p>
              <button
                onClick={startCamera}
                className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-semibold transition-colors"
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
                status === 'pending'  ? 'bg-primary/80' :
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
              className="flex-1 py-3 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-semibold transition-colors"
            >
              {status === 'scanning' ? 'Detectando…' : (
                <span className="inline-flex items-center gap-1.5"><span className="material-symbols-outlined !text-lg">photo_camera</span> Escanear</span>
              )}
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

        {/* Pista visual mientras escanea */}
        {status === 'scanning' && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-primary/30 text-blue-600 dark:text-blue-300 text-sm">
            <svg className="w-4 h-4 animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            <span>⚠️ Escaneando… mantenga el código QR frente a la cámara</span>
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
            <span className="material-symbols-outlined flex-shrink-0 !text-lg">warning</span>
            <span className="flex-1">{errorMsg}</span>
            <button onClick={onClearError} className="flex-shrink-0 hover:opacity-70 inline-flex"><span className="material-symbols-outlined !text-lg">close</span></button>
          </div>
        )}

        {/* Confirmación visual de éxito */}
        {status === 'success' && lastResult && (
          <div className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30">
            <span className="material-symbols-outlined !text-3xl text-emerald-500">check_circle</span>
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
            {(todayRecords?.length ?? 0)} registrado{(todayRecords?.length ?? 0) !== 1 ? 's' : ''}
          </span>
        </div>

        {(!todayRecords || todayRecords.length === 0) ? (
          <div className="text-center py-10 text-slate-400 dark:text-gray-500 text-sm">
            <span className="material-symbols-outlined !text-4xl mb-2 opacity-60">fact_check</span>
            <p>No hay registros de asistencia hoy.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
            {todayRecords.map((r) => {
              const estadoVal = r.estado as ScanEstado
              const inf = ESTADOS.find(s => s.value === estadoVal)
              const badge = inf?.badge ?? 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300'
              const dot = inf?.dot ?? 'bg-slate-400'
              return (
                <div
                  key={r.idAsistencia}
                  className="flex items-start gap-3 px-4 py-3 rounded-xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 shadow-sm"
                >
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${dot}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 dark:text-white text-sm truncate">
                      {r.nombreEstudiante}
                    </p>
                    <p className="text-xs text-slate-400 font-mono">{r.codigoEstudiante}</p>
                    {r.observacion && (
                      <p className="text-xs text-slate-400 mt-0.5 truncate" title={r.observacion}>
                        {r.observacion}
                      </p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0 space-y-1">
                    <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${badge}`}>
                      {r.estado}
                    </span>
                    <p className="text-xs text-slate-400">
                      {new Date(r.fechaRegistro).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
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
