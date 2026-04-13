'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  createHorario,
  updateHorario,
  deleteHorario,
  createCurso,
  updateCurso,
  deleteCurso,
  createMateria,
  updateMateria,
  deleteMateria,
  createEspecializacion,
  updateEspecializacion,
  deleteEspecializacion,
  asignarProfesorHorario,
  type Horario,
  type Curso,
  type Materia,
  type Especializacion,
  type ProfesorOpt,
  type AsignacionProfesor,
} from '@/services/horarios/horariosService'
import {
  getHorariosAction,
  getCursosAction,
  getAllCursosAction,
  getMateriasAction,
  getAllMateriasAction,
  getEspecializacionesAction,
  getProfesoresAction,
  getAsignacionesProfesoresAction,
} from '@/services/horarios/horariosActions'

export type ModalMode = 'create' | 'edit' | null

export function useHorarios() {
  const [horarios, setHorarios] = useState<Horario[]>([])
  const [cursos, setCursos] = useState<Curso[]>([])
  const [allCursos, setAllCursos] = useState<Curso[]>([])
  const [materias, setMaterias] = useState<Materia[]>([])
  const [allMaterias, setAllMaterias] = useState<Materia[]>([])
  const [especializaciones, setEspecializaciones] = useState<Especializacion[]>([])
  const [profesores, setProfesores] = useState<ProfesorOpt[]>([])
  const [asignaciones, setAsignaciones] = useState<AsignacionProfesor[]>([])

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
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingCurso, setSavingCurso] = useState(false)
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
  const [cursoModalMode, setCursoModalMode] = useState<ModalMode>(null)
  const [selectedCurso, setSelectedCurso] = useState<Curso | null>(null)
  const [cursosModalOpen, setCursosModalOpen] = useState(false)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [h, c, m, am, ac, profs, asigns, esps] = await Promise.all([
        getHorariosAction(), getCursosAction(), getMateriasAction(), getAllMateriasAction(), getAllCursosAction(),
        getProfesoresAction(), getAsignacionesProfesoresAction(), getEspecializacionesAction(),
      ])
      setHorarios(h)
      setCursos(c)
      setMaterias(m)
      setAllMaterias(am)
      setAllCursos(ac)
      setProfesores(profs)
      setAsignaciones(asigns)
      setEspecializaciones(esps)
    } catch (e: any) {
      setError(e.message ?? 'Error al cargar horarios')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  // Enrich horarios with profesor name from asignaciones
  const enriched = horarios.map(h => {
    const asign = asignaciones.find(a => a.idHorario === h.idHorario)
    return { ...h, nombreProfesor: asign?.nombreProfesor }
  })

  const profHorarioIds = filterProfesor
    ? new Set(asignaciones.filter(a => String(a.idProfesor) === filterProfesor).map(a => a.idHorario))
    : null

  const filtered = enriched.filter(h => {
    if (filterActivo === 'activo' && !h.activo) return false
    if (filterActivo === 'inactivo' && h.activo) return false
    if (vista === 'estudiantes') {
      if (filterCurso && String(h.idCurso) !== filterCurso) return false
    } else {
      if (profHorarioIds && !profHorarioIds.has(h.idHorario)) return false
    }
    return true
  })

  // ── Horario CRUD ─────────────────────────────────────────────────────────────

  const openCreate = () => { setSelected(null); setModalMode('create') }
  const openEdit = (h: Horario) => { setSelected(h); setModalMode('edit') }
  const closeModal = () => { setSelected(null); setModalMode(null) }

  const handleCreate = async (
    payload: Omit<Horario, 'idHorario' | 'nombreCurso' | 'gradoCurso' | 'nombreMateria'>,
    idProfesor?: number
  ) => {
    setSaving(true)
    try {
      const { idHorario } = await createHorario(payload)
      if (idProfesor) {
        await asignarProfesorHorario(idProfesor, idHorario)
      }
      await fetchAll()
      closeModal()
    } catch (e: any) {
      const msg: string = e.message ?? ''
      if (msg.includes('uq_horario_salon_horario')) {
        setError('Ese salón ya tiene un bloque asignado en ese día y horario.')
      } else {
        setError(msg)
      }
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async (
    idHorario: number,
    payload: Partial<Omit<Horario, 'idHorario' | 'nombreCurso' | 'gradoCurso' | 'nombreMateria'>>
  ) => {
    setSaving(true)
    try {
      await updateHorario(idHorario, payload)
      await fetchAll()
      closeModal()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActivo = async (h: Horario) => {
    try {
      await updateHorario(h.idHorario, { activo: !h.activo })
      setHorarios(prev =>
        prev.map(x => x.idHorario === h.idHorario ? { ...x, activo: !h.activo } : x)
      )
    } catch (e: any) {
      setError(e.message)
    }
  }

  const handleDelete = async (idHorario: number) => {
    if (!confirm('¿Eliminar este horario? Esta acción no se puede deshacer.')) return
    try {
      await deleteHorario(idHorario)
      setHorarios(prev => prev.filter(h => h.idHorario !== idHorario))
    } catch (e: any) {
      setError(e.message)
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
    } catch (e: any) {
      setError(e.message)
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
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSavingCurso(false)
    }
  }

  const handleDeleteCurso = async (idCurso: number) => {
    if (!confirm('¿Eliminar este curso? Los horarios asociados quedarán sin curso.')) return
    try {
      await deleteCurso(idCurso)
      await fetchAll()
    } catch (e: any) {
      setError(e.message)
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
    } catch (e: any) {
      setError(e.message)
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
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSavingMateria(false)
    }
  }

  const handleDeleteMateria = async (idMateria: number) => {
    if (!confirm('¿Eliminar esta materia? Los horarios asociados quedarán sin materia.')) return
    try {
      await deleteMateria(idMateria)
      await fetchAll()
    } catch (e: any) {
      setError(e.message)
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
    } catch (e: any) {
      setError(e.message)
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
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSavingEspecializacion(false)
    }
  }

  const handleDeleteEspecializacion = async (idEspecializacion: number) => {
    if (!confirm('¿Eliminar esta especialización?')) return
    try {
      await deleteEspecializacion(idEspecializacion)
      await fetchAll()
    } catch (e: any) {
      setError(e.message)
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
    loading,
    saving,
    savingCurso,
    savingMateria,
    savingEspecializacion,
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
  }
}
