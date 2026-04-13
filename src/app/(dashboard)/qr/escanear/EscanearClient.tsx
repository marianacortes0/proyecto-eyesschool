'use client'

import { useEffect, useState, useCallback } from 'react'
import { useEscanear } from '@/hooks/useEscanear'
import { useAsistencia } from '@/hooks/useAsistencia'
import { getRegistrosAsistenciaAction } from '@/services/qr/qrActions'
import type { RegistroAsistencia } from '@/services/qr/qrService'
import QRScannerView from '@/components/qr/QRScannerView'
import AsistenciaModal from '@/components/asistencia/AsistenciaModal'
import { type Role } from '@/lib/utils/permissions'

type Props = {
  role: Role
  idUsuarioRegistrador: number
}

const ROLE_LABEL: Partial<Record<Role, { title: string; subtitle: string }>> = {
  admin:   { title: 'Escanear / Registrar Asistencia', subtitle: 'Escanea un código QR o registra manualmente la asistencia' },
  docente: { title: 'Escanear / Registrar Asistencia', subtitle: 'Escanea un código QR o registra manualmente la asistencia' },
}

export default function EscanearClient({ role, idUsuarioRegistrador }: Props) {
  const {
    status,
    errorMsg,
    pending,
    lastResult,
    recentScans,
    processCapture,
    confirmRegistration,
    cancelPending,
    clearError,
  } = useEscanear(idUsuarioRegistrador)

  const {
    estudiantes,
    saving,
    modalMode,
    selectedRecord,
    openCreate,
    closeModal,
    handleCreate,
  } = useAsistencia(idUsuarioRegistrador)

  // ── Registros de hoy desde la BD ──────────────────────────────────────────
  const [todayRecords, setTodayRecords] = useState<RegistroAsistencia[]>([])

  const fetchToday = useCallback(async () => {
    try {
      const hoy = new Date().toISOString().split('T')[0]
      const data = await getRegistrosAsistenciaAction(hoy)
      setTodayRecords(data)
    } catch {
      // silently ignore
    }
  }, [])

  // Cargar al montar
  useEffect(() => { fetchToday() }, [fetchToday])

  // Recargar cuando se completa un escaneo exitoso
  useEffect(() => {
    if (status === 'success') fetchToday()
  }, [status, fetchToday])

  const info = ROLE_LABEL[role] ?? ROLE_LABEL.admin!

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
            {info.title}
          </h1>
          <p className="text-sm text-slate-500 dark:text-gray-400 mt-0.5">
            {info.subtitle}
          </p>
        </div>

        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-800 dark:bg-white/10 dark:hover:bg-white/20 text-white text-sm font-semibold transition-colors shadow-sm"
        >
          ✏️ Registrar manual
        </button>
      </div>

      {/* Instrucciones QR */}
      <div className="flex flex-wrap gap-2 text-xs text-slate-500 dark:text-gray-400">
        {['1. Activa la cámara', '2. Apunta al código QR y pulsa Escanear', '3. Selecciona el estado y agrega observaciones', '4. Confirma el registro'].map((step) => (
          <span
            key={step}
            className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-white/5"
          >
            {step}
          </span>
        ))}
      </div>

      <QRScannerView
        status={status}
        errorMsg={errorMsg}
        pending={pending}
        lastResult={lastResult}
        recentScans={recentScans}
        todayRecords={todayRecords}
        onCapture={processCapture}
        onConfirm={confirmRegistration}
        onCancel={cancelPending}
        onClearError={clearError}
      />

      {/* Modal de registro manual */}
      <AsistenciaModal
        mode={modalMode}
        registro={selectedRecord}
        estudiantes={estudiantes}
        saving={saving}
        onClose={closeModal}
        onCreate={handleCreate}
        onUpdate={async () => {}}
      />
    </div>
  )
}

