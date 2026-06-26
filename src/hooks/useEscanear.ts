'use client'

import { useState, useCallback } from 'react'
import {
  readQRFromImage,
  type CodigoQRConEstudiante,
} from '@/services/qr/qrService'
import {
  getCodigoQRByValueAction,
  createAsistenciaAction,
  getRegistrosAsistenciaAction,
} from '@/services/qr/qrActions'
import { normalizeTipo } from '@/services/asistencia/asistenciaService'
import { notifySuccess, notifyError, notifyWarning } from '@/lib/toast'

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
          setErrorMsg('No se pudo leer el código QR, intente nuevamente')
          notifyWarning('No se pudo leer el código QR, intente nuevamente')
          setStatus('error')
          return
        }

        // Buscar en codigos_qr
        const qrData = await getCodigoQRByValueAction(codigoTexto)
        if (!qrData) {
          setErrorMsg('Código QR inválido')
          notifyError('Código QR inválido')
          setStatus('error')
          return
        }

        // Debounce: evitar doble detección del mismo estudiante en 5s
        const ahora = Date.now()
        const ultimoScan = lastScanTime.get(qrData.idEstudiante) ?? 0
        if (ahora - ultimoScan < DEBOUNCE_MS) {
          setErrorMsg(`${qrData.nombreCompleto} ya fue detectado recientemente.`)
          notifyWarning(`${qrData.nombreCompleto} ya fue detectado recientemente.`)
          setStatus('error')
          return
        }
        lastScanTime.set(qrData.idEstudiante, ahora)

        // Mostrar formulario de confirmación
        setPending({ qrData, detectedAt: new Date() })
        setStatus('pending')
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : 'Error al procesar el escaneo')
        notifyError(err instanceof Error ? err.message : 'Error al procesar el escaneo')
        setStatus('error')
      }
    },
    [status, lastScanTime]
  )

  // ── Paso 2: confirmar y registrar asistencia ──────────────────────────────

  const confirmRegistration = useCallback(
    async (tipo: 'entrada' | 'salida') => {
      if (!pending || status === 'saving') return
      setStatus('saving')
      setErrorMsg(null)

      try {
        const hoy = new Date().toISOString().split('T')[0]
        const tipoLabel = tipo === 'entrada' ? 'Entrada' : 'Salida'

        // Evita duplicar el mismo tipo (entrada/salida) en el día para el estudiante.
        const registrosHoy = (await getRegistrosAsistenciaAction(hoy))
          .filter((r) => r.idEstudiante === pending.qrData.idEstudiante)
        if (registrosHoy.some((r) => normalizeTipo(r.tipo) === tipo)) {
          setErrorMsg(`El estudiante ya tiene registro de ${tipoLabel.toLowerCase()} hoy`)
          notifyError(`El estudiante ya tiene registro de ${tipoLabel.toLowerCase()} hoy`)
          setStatus('error')
          return
        }

        // El escaneo QR solo pide estudiante + tipo: el estado se asume "Presente"
        // y la observación se genera automáticamente.
        const estado: ScanEstado = 'Presente'
        const hora = pending.detectedAt.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
        const obsTexto = `Registro por QR (${tipoLabel}) a las ${hora}`

        await createAsistenciaAction({
          idEstudiante:  pending.qrData.idEstudiante,
          estado,
          fecha:         hoy,
          observacion:   obsTexto,
          registradoPor: idUsuarioRegistrador,
          codigo_qr:     pending.qrData.codigo,
          tipo,
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

        notifySuccess('¡Asistencia registrada correctamente!')
        notifySuccess(`Bienvenido ${pending.qrData.nombreCompleto}`)
        notifySuccess(`${tipoLabel} registrada: ${hora}`)

        setTimeout(() => setStatus('idle'), 3_000)
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : 'Error al registrar la asistencia, intente nuevamente')
        notifyError(err instanceof Error ? err.message : 'Error al registrar la asistencia, intente nuevamente')
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
