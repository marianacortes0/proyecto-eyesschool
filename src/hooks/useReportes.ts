'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  getReportes,
  createReporte,
  updateReporte,
  deleteReporte,
  type Reporte,
} from '@/services/reportes/reportesService'

export type ModalMode = 'create' | 'edit' | null

export function useReportes(idAdministrador: number) {
  const [reportes, setReportes] = useState<Reporte[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Filtros
  const [filterTipo, setFilterTipo] = useState('')
  const [filterEstado, setFilterEstado] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Modal
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [selected, setSelected] = useState<Reporte | null>(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setReportes(await getReportes())
    } catch (e: any) {
      setError(e.message ?? 'Error al cargar reportes')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const filtered = reportes.filter(r => {
    if (filterTipo && r.tipoReporte !== filterTipo) return false
    if (filterEstado && r.estado !== filterEstado) return false
    if (searchQuery && !r.nombreReporte.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const openCreate = () => { setSelected(null); setModalMode('create') }
  const openEdit = (r: Reporte) => { setSelected(r); setModalMode('edit') }
  const closeModal = () => { setSelected(null); setModalMode(null) }

  const handleCreate = async (
    payload: Pick<Reporte, 'nombreReporte' | 'tipoReporte' | 'fechaInicio' | 'fechaFin' | 'parametros'> & { archivoGenerado?: string | null }
  ) => {
    setSaving(true)
    try {
      await createReporte({ ...payload, idAdministrador })
      await fetchAll()
      closeModal()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async (
    idReporte: number,
    payload: Partial<Pick<Reporte, 'nombreReporte' | 'tipoReporte' | 'estado' | 'fechaInicio' | 'fechaFin' | 'parametros' | 'archivoGenerado'>>
  ) => {
    setSaving(true)
    try {
      await updateReporte(idReporte, payload)
      await fetchAll()
      closeModal()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (idReporte: number) => {
    if (!confirm('¿Eliminar este reporte?')) return
    try {
      await deleteReporte(idReporte)
      setReportes(prev => prev.filter(r => r.idReporte !== idReporte))
    } catch (e: any) {
      setError(e.message)
    }
  }

  return {
    reportes: filtered,
    totalCount: reportes.length,
    loading,
    saving,
    error,
    filterTipo, setFilterTipo,
    filterEstado, setFilterEstado,
    searchQuery, setSearchQuery,
    modalMode,
    selected,
    openCreate,
    openEdit,
    closeModal,
    handleCreate,
    handleUpdate,
    handleDelete,
  }
}
