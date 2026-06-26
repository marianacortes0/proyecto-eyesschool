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
  getNotasBootstrapAction,
  type NotasBootstrap,
} from '@/services/notas/notasActions'
import { notifySuccess, notifyError } from '@/lib/toast'
import { getErrorMessage } from '@/lib/errors'
import { useConfirm } from '@/components/ui/ConfirmDialog'

export type ModalMode = 'create' | 'edit' | null

export type EstudianteOpt = { idEstudiante: number; codigoEstudiante: string; nombre: string; idCursoActual: number | null }
export type MateriaOpt = { idMateria: number; nombreMateria: string }
export type CursoOpt = { idCurso: number; nombreCurso: string; grado: string; jornada: string }

/** Nota con el curso/jornada del estudiante resuelto a partir de su curso actual. */
export type NotaEnriquecida = Nota & {
  idCurso: number | null
  nombreCurso: string | null
  jornada: string | null
}

export function useNotas(idUsuarioRegistrador: number, initialData?: NotasBootstrap) {
  const confirm = useConfirm()

  const [notas, setNotas] = useState<Nota[]>(initialData?.notas ?? [])
  const [estudiantes, setEstudiantes] = useState<EstudianteOpt[]>(initialData?.estudiantes ?? [])
  const [materias, setMaterias] = useState<MateriaOpt[]>(initialData?.materias ?? [])
  const [cursos, setCursos] = useState<CursoOpt[]>(initialData?.cursos ?? [])
  const [loading, setLoading] = useState(!initialData)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Filtros
  const [filterEstudiante, setFilterEstudiante] = useState('')
  const [filterMateria, setFilterMateria] = useState('')
  const [filterPeriodo, setFilterPeriodo] = useState('')
  const [filterCurso, setFilterCurso] = useState('')
  const [filterJornada, setFilterJornada] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Modal
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [selected, setSelected] = useState<Nota | null>(null)

  // Carga/refresco consolidado (una sola server action). `silent` evita el
  // esqueleto de carga cuando es un refresco tras una mutación.
  const fetchAll = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoading(true)
    setError(null)
    try {
      const data = await getNotasBootstrapAction()
      setNotas(data.notas)
      setEstudiantes(data.estudiantes)
      setMaterias(data.materias)
      setCursos(data.cursos)
    } catch (err) {
      setError(getErrorMessage(err, 'Error al cargar notas'))
    } finally {
      if (!opts?.silent) setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Si la página entregó los datos desde el servidor, no refetcheamos al montar.
    if (initialData) return
    fetchAll()
  }, [initialData, fetchAll])

  // Resuelve nombre real, materia y curso de cada nota (idEstudiante → estudiante → curso)
  const cursoById = new Map(cursos.map(c => [c.idCurso, c]))
  const estudianteById = new Map(estudiantes.map(e => [e.idEstudiante, e]))
  const materiaById = new Map(materias.map(m => [m.idMateria, m]))

  const enriquecidas: NotaEnriquecida[] = notas.map(n => {
    const est = estudianteById.get(n.idEstudiante)
    const curso = est?.idCursoActual != null ? cursoById.get(est.idCursoActual) : undefined
    return {
      ...n,
      nombreEstudiante: est?.nombre ?? n.nombreEstudiante,
      codigoEstudiante: est?.codigoEstudiante ?? n.codigoEstudiante,
      nombreMateria:    materiaById.get(n.idMateria)?.nombreMateria ?? n.nombreMateria,
      idCurso:     curso?.idCurso ?? null,
      nombreCurso: curso?.nombreCurso ?? null,
      jornada:     curso?.jornada ?? null,
    }
  })

  const filtered = enriquecidas.filter(n => {
    if (filterEstudiante && String(n.idEstudiante) !== filterEstudiante) return false
    if (filterMateria && String(n.idMateria) !== filterMateria) return false
    if (filterPeriodo && String(n.idPeriodo) !== filterPeriodo) return false
    if (filterCurso && String(n.idCurso) !== filterCurso) return false
    if (filterJornada && n.jornada !== filterJornada) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      if (
        !n.nombreEstudiante?.toLowerCase().includes(q) &&
        !n.codigoEstudiante?.toLowerCase().includes(q) &&
        !n.nombreMateria?.toLowerCase().includes(q) &&
        !n.nombreCurso?.toLowerCase().includes(q)
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
      await fetchAll({ silent: true })
      closeModal()
      notifySuccess('Nota creada exitosamente')
    } catch (e) {
      notifyError(getErrorMessage(e, 'Error al guardar la nota'))
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
      await fetchAll({ silent: true })
      closeModal()
      notifySuccess('Nota editada exitosamente')
    } catch (e) {
      notifyError(getErrorMessage(e, 'Error al guardar la nota'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (idNota: number) => {
    const ok = await confirm({
      title: 'Eliminar nota',
      message: '¿Está seguro de eliminar esta nota? Esta acción no se puede deshacer.',
    })
    if (!ok) return
    try {
      await deleteNota(idNota)
      setNotas(prev => prev.filter(n => n.idNota !== idNota))
      notifySuccess('Nota eliminada exitosamente')
    } catch (e) {
      notifyError(getErrorMessage(e, 'Error al eliminar la nota'))
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
    filterCurso, setFilterCurso,
    filterJornada, setFilterJornada,
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
