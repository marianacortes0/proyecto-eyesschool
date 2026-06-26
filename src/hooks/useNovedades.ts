'use client'

import { useEffect, useState } from 'react'
import {
  type Novedad,
  type TipoNovedad,
  type CursoOpt,
  type EstudianteOpt,
} from '@/services/novedades/novedadesService'
import {
  getNovedadesBootstrapAction,
  type NovedadesBootstrap,
  createNovedadAction,
  updateNovedadAction,
  deleteNovedadAction,
} from '@/services/novedades/novedadesActions'
import { notifySuccess, notifyError } from '@/lib/toast'
import { getErrorMessage } from '@/lib/errors'
import { useConfirm } from '@/components/ui/ConfirmDialog'

export type ModalMode = 'create' | 'edit' | null

export function useNovedades(registradoPor: number = 0, initialData?: NovedadesBootstrap) {
  const confirm = useConfirm()

  const [novedades, setNovedades] = useState<Novedad[]>(initialData?.novedades ?? [])
  const [tiposNovedad, setTiposNovedad] = useState<TipoNovedad[]>(initialData?.tiposNovedad ?? [])
  const [cursos, setCursos] = useState<CursoOpt[]>(initialData?.cursos ?? [])
  const [estudiantes, setEstudiantes] = useState<EstudianteOpt[]>(initialData?.estudiantes ?? [])
  const [loading, setLoading] = useState(!initialData)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Filtros
  const [filterEstado, setFilterEstado] = useState<string>('')
  const [filterTipo, setFilterTipo] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')

  // Modal
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [selected, setSelected] = useState<Novedad | null>(null)

  const fetchAll = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getNovedadesBootstrapAction()
      setNovedades(data.novedades)
      setTiposNovedad(data.tiposNovedad)
      setCursos(data.cursos)
      setEstudiantes(data.estudiantes)
    } catch (e) {
      setError(getErrorMessage(e, 'Error al cargar novedades'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Si la página entregó los datos desde el servidor, no refetcheamos al montar.
    if (initialData) return
    fetchAll()
  }, [initialData])

  const filtered = novedades.filter(n => {
    if (filterEstado && n.estado !== filterEstado) return false
    if (filterTipo && String(n.idTipoNovedad) !== filterTipo) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      if (
        !n.nombreEstudiante?.toLowerCase().includes(q) &&
        !n.descripcion.toLowerCase().includes(q)
      ) return false
    }
    return true
  })

  const openCreate = () => { setSelected(null); setModalMode('create') }
  const openEdit = (n: Novedad) => { setSelected(n); setModalMode('edit') }
  const closeModal = () => { setSelected(null); setModalMode(null) }

  const handleCreate = async (payload: { descripcion: string; idEstudiante: number; idTipoNovedad: number }) => {
    if (!registradoPor) return
    setSaving(true)
    try {
      await createNovedadAction({ ...payload, registradoPor })
      await fetchAll()
      closeModal()
      notifySuccess('Novedad creada exitosamente')
    } catch (e) {
      notifyError(getErrorMessage(e, 'Error al guardar la novedad'))
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async (
    idNovedad: number,
    payload: { 
      descripcion?: string; 
      estado?: string; 
      accionTomada?: string | null; 
      fechaResolucion?: string | null; 
      idTipoNovedad?: number 
    }
  ) => {
    setSaving(true)
    try {
      await updateNovedadAction(idNovedad, payload)
      await fetchAll()
      closeModal()
      notifySuccess('Novedad editada exitosamente')
    } catch (e) {
      notifyError(getErrorMessage(e, 'Error al guardar la novedad'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (idNovedad: number) => {
    const ok = await confirm({
      title: 'Eliminar novedad',
      message: '¿Está seguro de eliminar esta novedad? Esta acción no se puede deshacer.',
    })
    if (!ok) return
    try {
      await deleteNovedadAction(idNovedad)
      setNovedades(prev => prev.filter(n => n.idNovedad !== idNovedad))
      notifySuccess('Novedad eliminada exitosamente')
    } catch (e) {
      notifyError(getErrorMessage(e, 'Error al eliminar la novedad'))
    }
  }

  return {
    novedades: filtered,
    tiposNovedad,
    cursos,
    estudiantes,
    loading,
    saving,
    error,
    filterEstado,
    filterTipo,
    searchQuery,
    setFilterEstado,
    setFilterTipo,
    setSearchQuery,
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
