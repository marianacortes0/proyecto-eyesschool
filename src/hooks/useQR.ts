'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  type EstudianteQR,
  type CodigoQRConEstudiante,
  type RegistroAsistencia,
  type UsuarioSinEstudiante,
  type CursoSimple,
} from '@/services/qr/qrService'
import {
  getEstudiantesConQRAction,
  getRegistrosAsistenciaAction,
  getUsuariosSinEstudianteAction,
  getQRBootstrapAction,
  type QRBootstrap,
} from '@/services/qr/qrActions'
import { asignarQR } from '@/auth/actions'
import { type Role } from '@/lib/utils/permissions'

export type ModalMode = 'create' | 'edit' | null

export function useQR(role: Role | null, initialData?: QRBootstrap) {
  // ── Estado admin ──────────────────────────────────────────────────────────
  const [estudiantes, setEstudiantes]   = useState<EstudianteQR[]>(initialData?.estudiantes ?? [])
  const [asistencia, setAsistencia]     = useState<RegistroAsistencia[]>(initialData?.asistencia ?? [])
  const [sinAsignar, setSinAsignar]     = useState<UsuarioSinEstudiante[]>(initialData?.sinAsignar ?? [])
  const [cursos, setCursos]             = useState<CursoSimple[]>(initialData?.cursos ?? [])
  const [loading, setLoading]           = useState(!initialData)
  const [error, setError]               = useState<string | null>(null)

  // ── Estado estudiante ─────────────────────────────────────────────────────
  const [miCodigo] = useState<CodigoQRConEstudiante | null>(null)
  const [miLoading] = useState(true)

  // ── Filtros admin ─────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery]   = useState('')
  const [fechaFiltro, setFechaFiltro]   = useState(
    () => new Date().toISOString().split('T')[0]
  )

  // ── Fetch admin ───────────────────────────────────────────────────────────
  const fetchAdmin = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getQRBootstrapAction(fechaFiltro)
      setEstudiantes(data.estudiantes)
      setAsistencia(data.asistencia)
      setSinAsignar(data.sinAsignar)
      setCursos(data.cursos)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }, [fechaFiltro])

  const fetchAsistencia = useCallback(async () => {
    try {
      const data = await getRegistrosAsistenciaAction(fechaFiltro)
      setAsistencia(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar asistencia')
    }
  }, [fechaFiltro])

  // Si la página entregó los datos del día desde el servidor, no refetcheamos en
  // el primer montaje; los cambios de fecha posteriores sí disparan fetchAdmin.
  const seededRef = useRef(!!initialData)
  useEffect(() => {
    if (role !== 'admin' && role !== 'docente') return
    if (seededRef.current) {
      seededRef.current = false
      return
    }
    fetchAdmin()
  }, [role, fetchAdmin])

  // ── Asignar QR ────────────────────────────────────────────────────────────
  const handleAsignarQR = async (
    idUsuario: number,
    idCursoActual: number | null
  ): Promise<void> => {
    setError(null)
    const result = await asignarQR(idUsuario, idCursoActual)
    if ('error' in result) {
      setError(result.error)
      return
    }
    // Refrescar lista de estudiantes y pendientes
    const [estudiantesData, sinAsignarData] = await Promise.all([
      getEstudiantesConQRAction(),
      getUsuariosSinEstudianteAction(),
    ])
    setEstudiantes(estudiantesData)
    setSinAsignar(sinAsignarData)
  }

  // ── Filtro de búsqueda sobre estudiantes ──────────────────────────────────
  const filteredEstudiantes = estudiantes.filter((e) => {
    const q = searchQuery.toLowerCase()
    return (
      q === '' ||
      e.nombreCompleto.toLowerCase().includes(q) ||
      e.codigoEstudiante.toLowerCase().includes(q) ||
      (e.curso ?? '').toLowerCase().includes(q)
    )
  })

  return {
    // admin
    estudiantes: filteredEstudiantes,
    totalCount: estudiantes.length,
    sinAsignar,
    cursos,
    asistencia,
    loading,
    error,
    fechaFiltro,
    setFechaFiltro,
    searchQuery,
    setSearchQuery,
    refetchAsistencia: fetchAsistencia,
    handleAsignarQR,
    // estudiante
    miCodigo,
    miLoading,
  }
}
