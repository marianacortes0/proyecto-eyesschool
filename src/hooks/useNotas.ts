'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  updateNota,
  deleteNota,
  PERIODOS,
  type Nota,
} from '@/services/notas/notasService'
import {
  createNotaAction,
  getNotasAction,
  getEstudiantesAction,
  getMateriasAction,
  getCursosAction,
} from '@/services/notas/notasActions'

export type ModalMode = 'create' | 'edit' | null

export type EstudianteOpt = { idEstudiante: number; codigoEstudiante: string; nombre: string; idCursoActual: number | null }
export type MateriaOpt = { idMateria: number; nombreMateria: string }
export type CursoOpt = { idCurso: number; nombreCurso: string; grado: string; jornada: string }

export function useNotas(idUsuarioRegistrador: number) {

  const [notas, setNotas] = useState<Nota[]>([])
  const [estudiantes, setEstudiantes] = useState<EstudianteOpt[]>([])
  const [materias, setMaterias] = useState<MateriaOpt[]>([])
  const [cursos, setCursos] = useState<CursoOpt[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Filtros
  const [filterEstudiante, setFilterEstudiante] = useState('')
  const [filterMateria, setFilterMateria] = useState('')
  const [filterPeriodo, setFilterPeriodo] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Modal
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [selected, setSelected] = useState<Nota | null>(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [n, e, m, c] = await Promise.all([
        getNotasAction(),
        getEstudiantesAction(),
        getMateriasAction(),
        getCursosAction(),
      ])
      setNotas(n)
      setEstudiantes(e)
      setMaterias(m)
      setCursos(c)
    } catch (err: any) {
      setError(err.message ?? 'Error al cargar notas')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const filtered = notas.filter(n => {
    if (filterEstudiante && String(n.idEstudiante) !== filterEstudiante) return false
    if (filterMateria && String(n.idMateria) !== filterMateria) return false
    if (filterPeriodo && String(n.idPeriodo) !== filterPeriodo) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      if (
        !n.nombreEstudiante?.toLowerCase().includes(q) &&
        !n.codigoEstudiante?.toLowerCase().includes(q) &&
        !n.nombreMateria?.toLowerCase().includes(q)
      ) return false
    }
    return true
  })

  // Estadísticas calculadas de la vista filtrada
  const stats = (() => {
    if (!filtered.length) return { promedio: 0, aprobados: 0, reprobados: 0 }
    const sum = filtered.reduce((a, n) => a + n.nota, 0)
    const aprobados = filtered.filter(n => n.nota >= 3).length
    return {
      promedio: Number((sum / filtered.length).toFixed(2)),
      aprobados,
      reprobados: filtered.length - aprobados,
    }
  })()

  const openCreate = () => { setSelected(null); setModalMode('create') }
  const openEdit = (n: Nota) => { setSelected(n); setModalMode('edit') }
  const closeModal = () => { setSelected(null); setModalMode(null) }

  const handleCreate = async (
    payload: Pick<Nota, 'idEstudiante' | 'idMateria' | 'idPeriodo' | 'nota' | 'observacion'>
  ) => {
    if (!idUsuarioRegistrador) return
    setSaving(true)
    try {
      await createNotaAction({ ...payload, registradoPor: idUsuarioRegistrador })
      await fetchAll()
      closeModal()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async (
    idNota: number,
    payload: Partial<Pick<Nota, 'nota' | 'observacion' | 'idPeriodo' | 'idMateria'>>
  ) => {
    setSaving(true)
    try {
      await updateNota(idNota, payload)
      await fetchAll()
      closeModal()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (idNota: number) => {
    if (!confirm('¿Eliminar esta nota?')) return
    try {
      await deleteNota(idNota)
      setNotas(prev => prev.filter(n => n.idNota !== idNota))
    } catch (e: any) {
      setError(e.message)
    }
  }

  return {
    notas: filtered,
    totalNotas: notas.length,
    estudiantes,
    materias,
    cursos,
    periodos: PERIODOS,
    loading,
    saving,
    error,
    stats,
    filterEstudiante, setFilterEstudiante,
    filterMateria, setFilterMateria,
    filterPeriodo, setFilterPeriodo,
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
