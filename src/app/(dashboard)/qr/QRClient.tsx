'use client'

import { useAuth } from '@/hooks/useAuth'
import { useQR } from '@/hooks/useQR'
import QRAdminView from '@/components/qr/QRAdminView'
import QREstudianteView from '@/components/qr/QREstudianteView'
import { type CodigoQRConEstudiante } from '@/services/qr/qrService'

type Props = {
  miCodigoServer?: CodigoQRConEstudiante | null
}

export default function QRClient({ miCodigoServer }: Props) {
  const { role } = useAuth()

  const {
    estudiantes,
    totalCount,
    sinAsignar,
    cursos,
    asistencia,
    loading,
    error,
    fechaFiltro,
    setFechaFiltro,
    searchQuery,
    setSearchQuery,
    refetchAsistencia,
    handleAsignarQR,
  } = useQR(role)

  if (role === 'admin' || role === 'docente') {
    return (
      <QRAdminView
        estudiantes={estudiantes}
        totalCount={totalCount}
        sinAsignar={sinAsignar}
        cursos={cursos}
        asistencia={asistencia}
        loading={loading}
        error={error}
        searchQuery={searchQuery}
        fechaFiltro={fechaFiltro}
        onSearchChange={setSearchQuery}
        onFechaChange={setFechaFiltro}
        onRefreshAsistencia={refetchAsistencia}
        onAsignarQR={handleAsignarQR}
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
