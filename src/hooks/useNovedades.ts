'use client'

import { useEffect, useState } from 'react'
import {
  getNovedades,
  getTiposNovedad,
  getCursosParaNovedades,
  getEstudiantesParaNovedades,
  createNovedad,
  updateNovedad,
  deleteNovedad,
  type Novedad,
  type TipoNovedad,
  type CursoOpt,
  type EstudianteOpt,
} from '@/services/novedades/novedadesService'
import { useAuth } from './useAuth'

export type ModalMode = 'create' | 'edit' | null

export function useNovedades(idAdministrador: number = 0) {
  const { userId } = useAuth()

  const [novedades, setNovedades] = useState<Novedad[]>([])
  const [tiposNovedad, setTiposNovedad] = useState<TipoNovedad[]>([])
  const [cursos, setCursos] = useState<CursoOpt[]>([])
  const [estudiantes, setEstudiantes] = useState<EstudianteOpt[]>([])
  const [loading, setLoading] = useState(true)
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
      const [nov, tipos, curs, ests] = await Promise.all([
        getNovedades(),
        getTiposNovedad(),
        getCursosParaNovedades(),
        getEstudiantesParaNovedades(),
      ])
      setNovedades(nov)
      setTiposNovedad(tipos)
      setCursos(curs)
      setEstudiantes(ests)
    } catch (e: any) {
      setError(e.message ?? 'Error al cargar novedades')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

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
    if (!idAdministrador) return
    setSaving(true)
    try {
      await createNovedad({ ...payload, registradoPor: idAdministrador })
      await fetchAll()
      closeModal()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async (
    idNovedad: number,
    payload: { descripcion?: string; estado?: string; accionTomada?: string; fechaResolucion?: string; idTipoNovedad?: number }
  ) => {
    setSaving(true)
    try {
      await updateNovedad(idNovedad, payload)
      await fetchAll()
      closeModal()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (idNovedad: number) => {
    if (!confirm('¿Eliminar esta novedad?')) return
    try {
      await deleteNovedad(idNovedad)
      setNovedades(prev => prev.filter(n => n.idNovedad !== idNovedad))
    } catch (e: any) {
      setError(e.message)
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
