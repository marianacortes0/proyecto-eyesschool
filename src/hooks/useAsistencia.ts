'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  actualizarRegistro,
  eliminarRegistro,
  type RegistroAsistencia,
  type EstudianteSelector,
  type EstadoAsistencia,
  type CreateRegistroData,
  type UpdateRegistroData,
} from '@/services/asistencia/asistenciaService'
import {
  crearRegistroAction,
  getRegistrosAction,
  getEstudiantesSelectorAction,
} from '@/services/asistencia/asistenciaActions'

export type { EstadoAsistencia }
export type ModalMode = 'create' | 'edit' | null

export function useAsistencia(idUsuarioRegistrador: number, idEstudiantePropio?: number) {
  const [registros, setRegistros]       = useState<RegistroAsistencia[]>([])
  const [estudiantes, setEstudiantes]   = useState<EstudianteSelector[]>([])
  const [loading, setLoading]           = useState(true)
  const [saving, setSaving]             = useState(false)
  const [error, setError]               = useState<string | null>(null)

  // Modal
  const [modalMode, setModalMode]           = useState<ModalMode>(null)
  const [selectedRecord, setSelectedRecord] = useState<RegistroAsistencia | null>(null)

  // Filtros
  const [fechaFiltro, setFechaFiltro] = useState(
    () => new Date().toISOString().split('T')[0]
  )
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoAsistencia | 'todos'>('todos')
  const [searchQuery, setSearchQuery]   = useState('')

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const [regs, ests] = await Promise.all([
        getRegistrosAction({ fecha: fechaFiltro, estado: estadoFiltro, search: searchQuery, idEstudiante: idEstudiantePropio }),
        getEstudiantesSelectorAction(),
      ])
      setRegistros(regs)
      setEstudiantes(ests)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar asistencia')
    } finally {
      setLoading(false)
    }
  }, [fechaFiltro, estadoFiltro, searchQuery, idEstudiantePropio])

  const fetchRegistros = useCallback(async () => {
    try {
      setError(null)
      const regs = await getRegistrosAction({ fecha: fechaFiltro, estado: estadoFiltro, search: searchQuery, idEstudiante: idEstudiantePropio })
      setRegistros(regs)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar registros')
    }
  }, [fechaFiltro, estadoFiltro, searchQuery, idEstudiantePropio])

  useEffect(() => { fetchAll() }, [fetchAll])

  // ── CRUD ───────────────────────────────────────────────────────────────────

  const handleCreate = async (data: Omit<CreateRegistroData, 'registradoPor'>): Promise<void> => {
    setSaving(true)
    setError(null)
    try {
      await crearRegistroAction({ ...data, registradoPor: idUsuarioRegistrador })
      await fetchRegistros()
      closeModal()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear registro')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async (data: UpdateRegistroData): Promise<void> => {
    if (!selectedRecord) return
    setSaving(true)
    setError(null)
    try {
      await actualizarRegistro(selectedRecord.idAsistencia, data)
      await fetchRegistros()
      closeModal()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar registro')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number): Promise<void> => {
    try {
      setError(null)
      await eliminarRegistro(id)
      setRegistros((prev) => prev.filter((r) => r.idAsistencia !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar registro')
    }
  }

  // ── Modal ──────────────────────────────────────────────────────────────────

  const openCreate = () => { setSelectedRecord(null); setModalMode('create') }
  const openEdit   = (r: RegistroAsistencia) => { setSelectedRecord(r); setModalMode('edit') }
  const closeModal = () => { setModalMode(null); setSelectedRecord(null) }

  return {
    registros,
    estudiantes,
    totalCount: registros.length,
    loading,
    saving,
    error,
    // modal
    modalMode,
    selectedRecord,
    openCreate,
    openEdit,
    closeModal,
    // filtros
    fechaFiltro,
    setFechaFiltro,
    estadoFiltro,
    setEstadoFiltro,
    searchQuery,
    setSearchQuery,
    // acciones
    handleCreate,
    handleUpdate,
    handleDelete,
  }
}
