'use client'

import { useEffect, useState, useCallback } from 'react'
import { type Reporte } from '@/services/reportes/reportesService'
import {
  getReportesAction,
  createReporteAction,
  updateReporteAction,
  deleteReporteAction,
} from '@/services/reportes/reportesActions'
import { notifySuccess, notifyError } from '@/lib/toast'
import { getErrorMessage } from '@/lib/errors'
import { useConfirm } from '@/components/ui/ConfirmDialog'

export type ModalMode = 'create' | 'edit' | null

export function useReportes(idAdministrador: number, initialReportes?: Reporte[]) {
  const confirm = useConfirm()
  const [reportes, setReportes] = useState<Reporte[]>(initialReportes ?? [])
  const [loading, setLoading] = useState(!initialReportes)
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
      setReportes(await getReportesAction())
    } catch (e) {
      setError(getErrorMessage(e, 'Error al cargar reportes'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Si la página entregó los reportes desde el servidor, no refetcheamos al montar.
    if (initialReportes) return
    fetchAll()
  }, [initialReportes, fetchAll])

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
      await createReporteAction({ ...payload, idAdministrador })
      await fetchAll()
      closeModal()
      notifySuccess('Reporte generado correctamente')
    } catch (e) {
      notifyError(getErrorMessage(e, 'Error al generar el reporte'))
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
      await updateReporteAction(idReporte, payload)
      await fetchAll()
      closeModal()
      notifySuccess('Cambios aplicados con éxito')
    } catch (e) {
      notifyError(getErrorMessage(e, 'Error al guardar el reporte'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (idReporte: number) => {
    const ok = await confirm({
      title: 'Eliminar reporte',
      message: '¿Está seguro de eliminar este reporte? Esta acción no se puede deshacer.',
    })
    if (!ok) return
    try {
      await deleteReporteAction(idReporte)
      setReportes(prev => prev.filter(r => r.idReporte !== idReporte))
      notifySuccess('Reporte eliminado exitosamente')
    } catch (e) {
      notifyError(getErrorMessage(e, 'Error al eliminar el reporte'))
    }
  }

  return {
    reportes: filtered,
    allReportes: reportes,
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
