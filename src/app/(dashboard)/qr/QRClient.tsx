'use client'

import { useAuth } from '@/hooks/useAuth'
import { useQR } from '@/hooks/useQR'
import QRAdminView from '@/components/qr/QRAdminView'
import QREstudianteView from '@/components/qr/QREstudianteView'
import { type CodigoQRConEstudiante } from '@/services/qr/qrService'
import { type QRBootstrap } from '@/services/qr/qrActions'

type Props = {
  miCodigoServer?: CodigoQRConEstudiante | null
  initialData?: QRBootstrap
}

export default function QRClient({ miCodigoServer, initialData }: Props) {
  const { role } = useAuth()

  const {
    estudiantes,
    totalCount,
    loading,
    error,
    searchQuery,
    setSearchQuery,
  } = useQR(role, initialData)

  if (role === 'admin' || role === 'docente') {
    return (
      <QRAdminView
        estudiantes={estudiantes}
        totalCount={totalCount}
        loading={loading}
        error={error}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
    )
  }

  if (role === 'estudiante') {
    return (
      <QREstudianteView
        codigo={miCodigoServer ?? null}
        loading={false}
      />
    )
  }

  return null
}
