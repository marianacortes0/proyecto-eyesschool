'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  createCurso,
  updateCurso,
  deleteCurso,
  createMateria,
  updateMateria,
  deleteMateria,
  createEspecializacion,
  updateEspecializacion,
  deleteEspecializacion,
  type Horario,
  type Curso,
  type Materia,
  type Especializacion,
  type ProfesorOpt,
  type Asignacion,
} from '@/services/horarios/horariosService'
import {
  getHorariosBootstrapAction,
  type HorariosBootstrap,
  createHorarioAction,
  updateHorarioAction,
  deleteHorarioAction,
  createAsignacionAction,
  updateAsignacionAction,
  deleteAsignacionAction,
} from '@/services/horarios/horariosActions'
import { notifySuccess, notifyError } from '@/lib/toast'
import { getErrorMessage } from '@/lib/errors'
import { useConfirm } from '@/components/ui/ConfirmDialog'

export type ModalMode = 'create' | 'edit' | null

export function useHorarios(initialData?: HorariosBootstrap) {
  const confirm = useConfirm()
  const [horarios, setHorarios] = useState<Horario[]>(initialData?.horarios ?? [])
  const [cursos, setCursos] = useState<Curso[]>(initialData?.cursos ?? [])
  const [allCursos, setAllCursos] = useState<Curso[]>(initialData?.allCursos ?? [])
  const [materias, setMaterias] = useState<Materia[]>(initialData?.materias ?? [])
  const [allMaterias, setAllMaterias] = useState<Materia[]>(initialData?.allMaterias ?? [])
  const [especializaciones, setEspecializaciones] = useState<Especializacion[]>(initialData?.especializaciones ?? [])
  const [profesores, setProfesores] = useState<ProfesorOpt[]>(initialData?.profesores ?? [])
  const [asignacionesList, setAsignacionesList] = useState<Asignacion[]>(initialData?.asignaciones ?? [])

  // Modal materias
  const [materiasModalOpen, setMateriasModalOpen] = useState(false)
  const [materiaModalMode, setMateriaModalMode] = useState<ModalMode>(null)
  const [selectedMateria, setSelectedMateria] = useState<Materia | null>(null)
  const [savingMateria, setSavingMateria] = useState(false)

  // Modal especializaciones
  const [especializacionesModalOpen, setEspecializacionesModalOpen] = useState(false)
  const [especializacionModalMode, setEspecializacionModalMode] = useState<ModalMode>(null)
  const [selectedEspecializacion, setSelectedEspecializacion] = useState<Especializacion | null>(null)
  const [savingEspecializacion, setSavingEspecializacion] = useState(false)

  const [loading, setLoading] = useState(!initialData)
  const [saving, setSaving] = useState(false)
  const [savingCurso, setSavingCurso] = useState(false)
  const [savingAsignacion, setSavingAsignacion] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Vista
  const [vista, setVista] = useState<'estudiantes' | 'profesores'>('estudiantes')

  // Filtros
  const [filterCurso, setFilterCurso] = useState('')
  const [filterProfesor, setFilterProfesor] = useState('')
  const [filterActivo, setFilterActivo] = useState<'todos' | 'activo' | 'inactivo'>('todos')

  // Modal horario
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [selected, setSelected] = useState<Horario | null>(null)

  // Modal cursos
  const [cursosModalOpen, setCursosModalOpen] = useState(false)
  const [cursoModalMode, setCursoModalMode] = useState<ModalMode>(null)
  const [selectedCurso, setSelectedCurso] = useState<Curso | null>(null)

  // Modal asignaciones
  const [asignacionesModalOpen, setAsignacionesModalOpen] = useState(false)
  const [asignacionModalMode, setAsignacionModalMode] = useState<ModalMode>(null)
  const [selectedAsignacion, setSelectedAsignacion] = useState<Asignacion | null>(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getHorariosBootstrapAction()
      setHorarios(data.horarios)
      setCursos(data.cursos)
      setMaterias(data.materias)
      setAllMaterias(data.allMaterias)
      setAllCursos(data.allCursos)
      setProfesores(data.profesores)
      setEspecializaciones(data.especializaciones)
      setAsignacionesList(data.asignaciones)
    } catch (e) {
      setError(getErrorMessage(e, 'Error al cargar horarios'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Si la página entregó los datos desde el servidor, no refetcheamos al montar.
    if (initialData) return
    fetchAll()
  }, [initialData, fetchAll])

  // Enriquecer cada horario con curso (nombre + grado), materia (nombre + código)
  // y profesor. El profesor se resuelve por la asignación profesor↔(curso+materia),
  // ya que el backend no expone un join directo horario→profesor.
  const cursoById = new Map(allCursos.map(c => [c.idCurso, c]))
  const materiaById = new Map(allMaterias.map(m => [m.idMateria, m]))
  const asignacionPorCursoMateria = new Map<string, typeof asignacionesList[number]>()
  for (const a of asignacionesList) {
    const key = `${a.idCurso}-${a.idMateria}`
    const prev = asignacionPorCursoMateria.get(key)
    if (!prev || (a.activo && !prev.activo)) asignacionPorCursoMateria.set(key, a)
  }

  const enriched = horarios.map(h => {
    const curso = cursoById.get(h.idCurso)
    const materia = materiaById.get(h.idMateria)
    const asign = asignacionPorCursoMateria.get(`${h.idCurso}-${h.idMateria}`)
    return {
      ...h,
      nombreCurso:   curso?.nombreCurso ?? h.nombreCurso,
      gradoCurso:    curso?.grado ?? h.gradoCurso,
      nombreMateria: materia?.nombreMateria ?? h.nombreMateria,
      codigoMateria: materia?.codigoMateria ?? h.codigoMateria,
      idProfesor:    asign?.idProfesor,
      nombreProfesor: asign?.nombreProfesor,
    }
  })

  const filtered = enriched.filter(h => {
    if (filterActivo === 'activo' && !h.activo) return false
    if (filterActivo === 'inactivo' && h.activo) return false
    if (vista === 'estudiantes') {
      if (filterCurso && String(h.idCurso) !== filterCurso) return false
    } else {
      if (filterProfesor && String(h.idProfesor ?? '') !== filterProfesor) return false
    }
    return true
  })

  // ── Horario CRUD ─────────────────────────────────────────────────────────────

  const openCreate = () => { setSelected(null); setModalMode('create') }
  const openEdit = (h: Horario) => { setSelected(h); setModalMode('edit') }
  const closeModal = () => { setSelected(null); setModalMode(null) }

  /** Asigna/actualiza el profesor que dicta una materia en un curso (asignación). */
  const upsertProfesorAsignacion = async (idCurso: number, idMateria: number, idProfesor?: number) => {
    if (!idProfesor) return
    const existing = asignacionesList.find(a => a.idCurso === idCurso && a.idMateria === idMateria)
    if (existing) {
      if (existing.idProfesor !== idProfesor) {
        await updateAsignacionAction(existing.idAsignacion, { idProfesor })
      }
    } else {
      await createAsignacionAction({
        idProfesor,
        idCurso,
        idMateria,
        fechaAsignacion: new Date().toISOString().slice(0, 10),
        fechaFinalizacion: null,
        activo: true,
      })
    }
  }

  const handleCreate = async (
    payload: Omit<Horario, 'idHorario' | 'nombreCurso' | 'gradoCurso' | 'nombreMateria'>,
    idProfesor?: number
  ) => {
    setSaving(true)
    try {
      await createHorarioAction(payload)
      await upsertProfesorAsignacion(payload.idCurso, payload.idMateria, idProfesor)
      await fetchAll()
      closeModal()
      notifySuccess('Horario creado exitosamente')
    } catch (e) {
      const msg = getErrorMessage(e, '')
      notifyError(
        msg.includes('uq_horario_salon_horario')
          ? 'Ese salón ya tiene un bloque asignado en ese día y horario.'
          : (msg || 'Error al crear el horario')
      )
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async (
    idHorario: number,
    payload: Partial<Omit<Horario, 'idHorario' | 'nombreCurso' | 'gradoCurso' | 'nombreMateria'>>,
    idProfesor?: number
  ) => {
    setSaving(true)
    try {
      await updateHorarioAction(idHorario, payload)
      const idCurso = payload.idCurso ?? selected?.idCurso
      const idMateria = payload.idMateria ?? selected?.idMateria
      if (idCurso != null && idMateria != null) {
        await upsertProfesorAsignacion(idCurso, idMateria, idProfesor)
      }
      await fetchAll()
      closeModal()
      notifySuccess('Horario editado exitosamente')
    } catch (e) {
      notifyError(getErrorMessage(e, 'Error al editar el horario'))
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActivo = async (h: Horario) => {
    try {
      await updateHorarioAction(h.idHorario, { activo: !h.activo })
      setHorarios(prev =>
        prev.map(x => x.idHorario === h.idHorario ? { ...x, activo: !h.activo } : x)
      )
      notifySuccess('Cambios aplicados con éxito')
    } catch (e) {
      notifyError(getErrorMessage(e, 'Error al actualizar el horario'))
    }
  }

  const handleDelete = async (idHorario: number) => {
    const ok = await confirm({
      title: 'Eliminar horario',
      message: '¿Está seguro de eliminar este horario? Esta acción no se puede deshacer.',
    })
    if (!ok) return
    try {
      await deleteHorarioAction(idHorario)
      setHorarios(prev => prev.filter(h => h.idHorario !== idHorario))
      notifySuccess('Horario eliminado exitosamente')
    } catch (e) {
      notifyError(getErrorMessage(e, 'Error al eliminar el horario'))
    }
  }

  // ── Curso CRUD ───────────────────────────────────────────────────────────────

  const openCursosModal = () => setCursosModalOpen(true)
  const closeCursosModal = () => { setCursosModalOpen(false); setCursoModalMode(null); setSelectedCurso(null) }
  const openCreateCurso = () => { setSelectedCurso(null); setCursoModalMode('create') }
  const openEditCurso = (c: Curso) => { setSelectedCurso(c); setCursoModalMode('edit') }
  const closeCursoForm = () => { setSelectedCurso(null); setCursoModalMode(null) }

  const handleCreateCurso = async (payload: Omit<Curso, 'idCurso'>) => {
    setSavingCurso(true)
    try {
      await createCurso(payload)
      await fetchAll()
      closeCursoForm()
      notifySuccess('Curso creado exitosamente')
    } catch (e) {
      notifyError(getErrorMessage(e, 'Error al crear el curso'))
    } finally {
      setSavingCurso(false)
    }
  }

  const handleUpdateCurso = async (idCurso: number, payload: Partial<Omit<Curso, 'idCurso'>>) => {
    setSavingCurso(true)
    try {
      await updateCurso(idCurso, payload)
      await fetchAll()
      closeCursoForm()
      notifySuccess('Curso editado exitosamente')
    } catch (e) {
      notifyError(getErrorMessage(e, 'Error al editar el curso'))
    } finally {
      setSavingCurso(false)
    }
  }

  const handleDeleteCurso = async (idCurso: number) => {
    const ok = await confirm({
      title: 'Eliminar curso',
      message: '¿Está seguro de eliminar este curso? Los horarios asociados quedarán sin curso.',
    })
    if (!ok) return
    try {
      await deleteCurso(idCurso)
      await fetchAll()
      notifySuccess('Curso eliminado exitosamente')
    } catch (e) {
      notifyError(getErrorMessage(e, 'Error al eliminar el curso'))
    }
  }

  // ── Materia CRUD ─────────────────────────────────────────────────────────────

  const openMateriasModal = () => setMateriasModalOpen(true)
  const closeMateriasModal = () => { setMateriasModalOpen(false); setMateriaModalMode(null); setSelectedMateria(null) }
  const openCreateMateria = () => { setSelectedMateria(null); setMateriaModalMode('create') }
  const openEditMateria = (m: Materia) => { setSelectedMateria(m); setMateriaModalMode('edit') }
  const closeMateriaForm = () => { setSelectedMateria(null); setMateriaModalMode(null) }

  const handleCreateMateria = async (payload: Omit<Materia, 'idMateria'>) => {
    setSavingMateria(true)
    try {
      await createMateria(payload)
      await fetchAll()
      closeMateriaForm()
      notifySuccess('Materia creada exitosamente')
    } catch (e) {
      notifyError(getErrorMessage(e, 'Error al crear la materia'))
    } finally {
      setSavingMateria(false)
    }
  }

  const handleUpdateMateria = async (idMateria: number, payload: Partial<Omit<Materia, 'idMateria'>>) => {
    setSavingMateria(true)
    try {
      await updateMateria(idMateria, payload)
      await fetchAll()
      closeMateriaForm()
      notifySuccess('Materia editada exitosamente')
    } catch (e) {
      notifyError(getErrorMessage(e, 'Error al editar la materia'))
    } finally {
      setSavingMateria(false)
    }
  }

  const handleDeleteMateria = async (idMateria: number) => {
    const ok = await confirm({
      title: 'Eliminar materia',
      message: '¿Está seguro de eliminar esta materia? Los horarios asociados quedarán sin materia.',
    })
    if (!ok) return
    try {
      await deleteMateria(idMateria)
      await fetchAll()
      notifySuccess('Materia eliminada exitosamente')
    } catch (e) {
      notifyError(getErrorMessage(e, 'Error al eliminar la materia'))
    }
  }

  // ── Especialización CRUD ──────────────────────────────────────────────────────

  const openEspecializacionesModal = () => setEspecializacionesModalOpen(true)
  const closeEspecializacionesModal = () => { setEspecializacionesModalOpen(false); setEspecializacionModalMode(null); setSelectedEspecializacion(null) }
  const openCreateEspecializacion = () => { setSelectedEspecializacion(null); setEspecializacionModalMode('create') }
  const openEditEspecializacion = (e: Especializacion) => { setSelectedEspecializacion(e); setEspecializacionModalMode('edit') }
  const closeEspecializacionForm = () => { setSelectedEspecializacion(null); setEspecializacionModalMode(null) }

  const handleCreateEspecializacion = async (payload: Omit<Especializacion, 'idEspecializacion'>) => {
    setSavingEspecializacion(true)
    try {
      await createEspecializacion(payload)
      await fetchAll()
      closeEspecializacionForm()
      notifySuccess('Especialización creada exitosamente')
    } catch (e) {
      notifyError(getErrorMessage(e, 'Error al crear la especialización'))
    } finally {
      setSavingEspecializacion(false)
    }
  }

  const handleUpdateEspecializacion = async (idEspecializacion: number, payload: Partial<Omit<Especializacion, 'idEspecializacion'>>) => {
    setSavingEspecializacion(true)
    try {
      await updateEspecializacion(idEspecializacion, payload)
      await fetchAll()
      closeEspecializacionForm()
      notifySuccess('Especialización editada exitosamente')
    } catch (e) {
      notifyError(getErrorMessage(e, 'Error al editar la especialización'))
    } finally {
      setSavingEspecializacion(false)
    }
  }

  const handleDeleteEspecializacion = async (idEspecializacion: number) => {
    const ok = await confirm({
      title: 'Eliminar especialización',
      message: '¿Está seguro de eliminar esta especialización? Esta acción no se puede deshacer.',
    })
    if (!ok) return
    try {
      await deleteEspecializacion(idEspecializacion)
      await fetchAll()
      notifySuccess('Especialización eliminada exitosamente')
    } catch (e) {
      notifyError(getErrorMessage(e, 'Error al eliminar la especialización'))
    }
  }

  // ── Asignación CRUD ──────────────────────────────────────────────────────────

  const openAsignacionesModal = () => setAsignacionesModalOpen(true)
  const closeAsignacionesModal = () => { setAsignacionesModalOpen(false); setAsignacionModalMode(null); setSelectedAsignacion(null) }
  const openCreateAsignacion = () => { setSelectedAsignacion(null); setAsignacionModalMode('create') }
  const openEditAsignacion = (a: Asignacion) => { setSelectedAsignacion(a); setAsignacionModalMode('edit') }
  const closeAsignacionForm = () => { setSelectedAsignacion(null); setAsignacionModalMode(null) }

  const handleCreateAsignacion = async (payload: Omit<Asignacion, 'idAsignacion' | 'nombreProfesor' | 'nombreCurso' | 'nombreMateria'>) => {
    setSavingAsignacion(true)
    try {
      await createAsignacionAction(payload)
      await fetchAll()
      closeAsignacionForm()
      notifySuccess('Horario asignado correctamente')
    } catch (e) {
      notifyError(getErrorMessage(e, 'Error al crear la asignación'))
    } finally {
      setSavingAsignacion(false)
    }
  }

  const handleUpdateAsignacion = async (idAsignacion: number, payload: Partial<Omit<Asignacion, 'idAsignacion'>>) => {
    setSavingAsignacion(true)
    try {
      await updateAsignacionAction(idAsignacion, payload)
      await fetchAll()
      closeAsignacionForm()
      notifySuccess('Asignación editada exitosamente')
    } catch (e) {
      notifyError(getErrorMessage(e, 'Error al editar la asignación'))
    } finally {
      setSavingAsignacion(false)
    }
  }

  const handleDeleteAsignacion = async (idAsignacion: number) => {
    const ok = await confirm({
      title: 'Eliminar asignación',
      message: '¿Está seguro de eliminar esta asignación? Esta acción no se puede deshacer.',
    })
    if (!ok) return
    try {
      await deleteAsignacionAction(idAsignacion)
      await fetchAll()
      notifySuccess('Asignación eliminada exitosamente')
    } catch (e) {
      notifyError(getErrorMessage(e, 'Error al eliminar la asignación'))
    }
  }

  return {
    horarios: filtered,
    cursos,
    allCursos,
    materias,
    allMaterias,
    especializaciones,
    profesores,
    asignacionesList,
    loading,
    saving,
    savingCurso,
    savingMateria,
    savingEspecializacion,
    savingAsignacion,
    error,
    vista, setVista,
    filterCurso, setFilterCurso,
    filterProfesor, setFilterProfesor,
    filterActivo, setFilterActivo,
    modalMode,
    selected,
    openCreate,
    openEdit,
    closeModal,
    handleCreate,
    handleUpdate,
    handleToggleActivo,
    handleDelete,
    // curso crud
    cursosModalOpen,
    cursoModalMode,
    selectedCurso,
    openCursosModal,
    closeCursosModal,
    openCreateCurso,
    openEditCurso,
    closeCursoForm,
    handleCreateCurso,
    handleUpdateCurso,
    handleDeleteCurso,
    // materia crud
    materiasModalOpen,
    materiaModalMode,
    selectedMateria,
    openMateriasModal,
    closeMateriasModal,
    openCreateMateria,
    openEditMateria,
    closeMateriaForm,
    handleCreateMateria,
    handleUpdateMateria,
    handleDeleteMateria,
    // especialización crud
    especializacionesModalOpen,
    especializacionModalMode,
    selectedEspecializacion,
    openEspecializacionesModal,
    closeEspecializacionesModal,
    openCreateEspecializacion,
    openEditEspecializacion,
    closeEspecializacionForm,
    handleCreateEspecializacion,
    handleUpdateEspecializacion,
    handleDeleteEspecializacion,
    // asignacion crud
    asignacionesModalOpen,
    asignacionModalMode,
    selectedAsignacion,
    openAsignacionesModal,
    closeAsignacionesModal,
    openCreateAsignacion,
    openEditAsignacion,
    closeAsignacionForm,
    handleCreateAsignacion,
    handleUpdateAsignacion,
    handleDeleteAsignacion,
  }
}
