'use client'

import { useState, useCallback } from 'react'
import {
  readQRFromImage,
  type CodigoQRConEstudiante,
} from '@/services/qr/qrService'
import {
  getCodigoQRByValueAction,
  createAsistenciaAction,
} from '@/services/qr/qrActions'

export type ScanEstado = 'Presente' | 'Ausente' | 'Tarde'

export type ScanResult = {
  id: string
  codigo: CodigoQRConEstudiante
  estado: ScanEstado
  observacion: string | null
  timestamp: Date
}

export type ScanStatus = 'idle' | 'scanning' | 'pending' | 'saving' | 'success' | 'error'

/** Registro detectado pero aún no confirmado */
export type PendingRegistration = {
  qrData: CodigoQRConEstudiante
  detectedAt: Date
}

const MAX_RECENT = 20
const DEBOUNCE_MS = 5_000

export function useEscanear(idUsuarioRegistrador: number) {
  const [status, setStatus]                       = useState<ScanStatus>('idle')
  const [errorMsg, setErrorMsg]                   = useState<string | null>(null)
  const [pending, setPending]                     = useState<PendingRegistration | null>(null)
  const [lastResult, setLastResult]               = useState<ScanResult | null>(null)
  const [recentScans, setRecentScans]             = useState<ScanResult[]>([])

  // Mapa de debounce {idEstudiante → timestamp}
  const lastScanTime = useState<Map<number, number>>(() => new Map())[0]

  // ── Paso 1: decodificar imagen y resolver estudiante ──────────────────────

  const processCapture = useCallback(
    async (imageBlob: Blob) => {
      if (status === 'scanning' || status === 'saving') return
      setStatus('scanning')
      setErrorMsg(null)

      try {
        // Decodificar QR con goqr.me
        const codigoTexto = await readQRFromImage(imageBlob)
        if (!codigoTexto) {
          setErrorMsg('No se detectó ningún código QR en la imagen.')
          setStatus('error')
          return
        }

        // Buscar en codigos_qr
        const qrData = await getCodigoQRByValueAction(codigoTexto)
        if (!qrData) {
          setErrorMsg('Código QR no reconocido, inactivo o vencido.')
          setStatus('error')
          return
        }

        // Debounce: evitar doble detección del mismo estudiante en 5s
        const ahora = Date.now()
        const ultimoScan = lastScanTime.get(qrData.idEstudiante) ?? 0
        if (ahora - ultimoScan < DEBOUNCE_MS) {
          setErrorMsg(`${qrData.nombreCompleto} ya fue detectado recientemente.`)
          setStatus('error')
          return
        }
        lastScanTime.set(qrData.idEstudiante, ahora)

        // Mostrar formulario de confirmación
        setPending({ qrData, detectedAt: new Date() })
        setStatus('pending')
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : 'Error al procesar el escaneo')
        setStatus('error')
      }
    },
    [status, lastScanTime]
  )

  // ── Paso 2: confirmar y registrar asistencia ──────────────────────────────

  const confirmRegistration = useCallback(
    async (estado: ScanEstado, observacion: string) => {
      if (!pending || status === 'saving') return
      setStatus('saving')
      setErrorMsg(null)

      try {
        const hora = pending.detectedAt.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
        const tipoLabel =
          pending.qrData.tipo === 'ingreso' ? 'Ingreso' :
          pending.qrData.tipo === 'salida'  ? 'Salida'  : 'Ingreso/Salida'

        const obsTexto = observacion.trim()
          ? observacion.trim()
          : `Registro por QR (${tipoLabel}) a las ${hora}`

        await createAsistenciaAction({
          idEstudiante:  pending.qrData.idEstudiante,
          estado,
          fecha:         new Date().toISOString().split('T')[0],
          observacion:   obsTexto,
          registradoPor: idUsuarioRegistrador,
          codigo_qr:     pending.qrData.codigo,
          tipo:          pending.qrData.tipo,
        })

        const result: ScanResult = {
          id: `${pending.qrData.idEstudiante}-${Date.now()}`,
          codigo: pending.qrData,
          estado,
          observacion: obsTexto,
          timestamp: new Date(),
        }

        setLastResult(result)
        setRecentScans((prev) => [result, ...prev].slice(0, MAX_RECENT))
        setPending(null)
        setStatus('success')

        setTimeout(() => setStatus('idle'), 3_000)
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : 'Error al guardar asistencia')
        setStatus('error')
      }
    },
    [pending, status, idUsuarioRegistrador]
  )

  // ── Cancelar escaneo pendiente ─────────────────────────────────────────────

  const cancelPending = useCallback(() => {
    setPending(null)
    setStatus('idle')
    setErrorMsg(null)
  }, [])

  const clearError = useCallback(() => {
    setErrorMsg(null)
    if (status === 'error') setStatus('idle')
  }, [status])

  return {
    status,
    errorMsg,
    pending,
    lastResult,
    recentScans,
    processCapture,
    confirmRegistration,
    cancelPending,
    clearError,
  }
}
