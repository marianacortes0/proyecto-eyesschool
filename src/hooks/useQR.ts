'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  getMiCodigoQR,
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
  getCursosActivosAction,
} from '@/services/qr/qrActions'
import { asignarQR } from '@/auth/actions'
import { type Role } from '@/lib/utils/permissions'

export type ModalMode = 'create' | 'edit' | null

export function useQR(role: Role | null) {
  // ── Estado admin ──────────────────────────────────────────────────────────
  const [estudiantes, setEstudiantes]   = useState<EstudianteQR[]>([])
  const [asistencia, setAsistencia]     = useState<RegistroAsistencia[]>([])
  const [sinAsignar, setSinAsignar]     = useState<UsuarioSinEstudiante[]>([])
  const [cursos, setCursos]             = useState<CursoSimple[]>([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState<string | null>(null)

  // ── Estado estudiante ─────────────────────────────────────────────────────
  const [miCodigo, setMiCodigo]         = useState<CodigoQRConEstudiante | null>(null)
  const [miLoading, setMiLoading]       = useState(true)

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
      const [estudiantesData, asistenciaData, sinAsignarData, cursosData] = await Promise.all([
        getEstudiantesConQRAction(),
        getRegistrosAsistenciaAction(fechaFiltro),
        getUsuariosSinEstudianteAction(),
        getCursosActivosAction(),
      ])
      setEstudiantes(estudiantesData)
      setAsistencia(asistenciaData)
      setSinAsignar(sinAsignarData)
      setCursos(cursosData)
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

  // ── Fetch estudiante ──────────────────────────────────────────────────────
  const fetchMiCodigo = useCallback(async () => {
    try {
      setMiLoading(true)
      setMiCodigo(await getMiCodigoQR())
    } catch {
      setMiCodigo(null)
    } finally {
      setMiLoading(false)
    }
  }, [])

  useEffect(() => {
    if (role === 'admin' || role === 'docente') fetchAdmin()
    // estudiante: datos se obtienen server-side en page.tsx
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
