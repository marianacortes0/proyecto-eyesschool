'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import {
  actualizarRegistro,
  eliminarRegistro,
  type RegistroAsistencia,
  type EstudianteSelector,
  type EstadoAsistencia,
  type TipoAsistencia,
  type CursoOption,
  type CreateRegistroData,
  type UpdateRegistroData,
} from '@/services/asistencia/asistenciaService'
import { notifySuccess, notifyError } from '@/lib/toast'
import { useConfirm } from '@/components/ui/ConfirmDialog'
import {
  crearRegistroAction,
  crearRegistrosMasivoAction,
  getRegistrosAction,
  getAsistenciaBootstrapAction,
  type AsistenciaBootstrap,
} from '@/services/asistencia/asistenciaActions'

/** Datos compartidos al registrar varios estudiantes a la vez (mismo estado). */
export type CreateManyData = {
  estado: EstadoAsistencia
  fecha: string
  tipo: TipoAsistencia
  observacion?: string | null
}

export type { EstadoAsistencia }
export type ModalMode = 'create' | 'edit' | null

export function useAsistencia(
  idUsuarioRegistrador: number,
  idEstudiantePropio?: number,
  initialData?: AsistenciaBootstrap,
  nombreEstudiantePropio?: string,
) {
  const confirm = useConfirm()
  const [registros, setRegistros]       = useState<RegistroAsistencia[]>(initialData?.registros ?? [])
  const [estudiantes, setEstudiantes]   = useState<EstudianteSelector[]>(initialData?.estudiantes ?? [])
  const [cursos, setCursos]             = useState<CursoOption[]>(initialData?.cursos ?? [])
  const [loading, setLoading]           = useState(!initialData)
  const [saving, setSaving]             = useState(false)
  const [error, setError]               = useState<string | null>(null)

  // Modal
  const [modalMode, setModalMode]           = useState<ModalMode>(null)
  const [selectedRecord, setSelectedRecord] = useState<RegistroAsistencia | null>(null)

  // Filtros
  const [fechaFiltro, setFechaFiltro] = useState(
    () => new Date().toISOString().split('T')[0]
  )
  const [estadoFiltro, setEstadoFiltro]     = useState<EstadoAsistencia | 'todos'>('todos')
  const [cursoFiltro, setCursoFiltro]       = useState<number | 'todos'>('todos')
  const [jornadaFiltro, setJornadaFiltro]   = useState<string | 'todos'>('todos')
  const [searchQuery, setSearchQuery]       = useState('')

  // ── Fetch ──────────────────────────────────────────────────────────────────
  // Nota: el filtro por curso y la búsqueda se resuelven en el cliente (ver más
  // abajo), por eso no se pasan a la acción ni disparan refetch.

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getAsistenciaBootstrapAction({ fecha: fechaFiltro, estado: estadoFiltro, idEstudiante: idEstudiantePropio })
      setRegistros(data.registros)
      setEstudiantes(data.estudiantes)
      setCursos(data.cursos)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar asistencia')
    } finally {
      setLoading(false)
    }
  }, [fechaFiltro, estadoFiltro, idEstudiantePropio])

  const fetchRegistros = useCallback(async () => {
    try {
      setError(null)
      const regs = await getRegistrosAction({ fecha: fechaFiltro, estado: estadoFiltro, idEstudiante: idEstudiantePropio })
      setRegistros(regs)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar registros')
    }
  }, [fechaFiltro, estadoFiltro, idEstudiantePropio])

  // Si la página entregó los datos del día desde el servidor, no refetcheamos en
  // el primer montaje; los cambios de filtro posteriores sí disparan fetchAll.
  const seededRef = useRef(!!initialData)
  useEffect(() => {
    if (seededRef.current) {
      seededRef.current = false
      return
    }
    fetchAll()
  }, [fetchAll])

  // ── Enriquecimiento y filtros en cliente ─────────────────────────────────────
  // /asistencia solo devuelve id_estudiante. El curso se resuelve uniendo
  // estudiante (id_curso_actual) con el catálogo de cursos (nombre_curso).
  const estudiantePorId = useMemo(() => {
    const m = new Map<number, EstudianteSelector>()
    for (const e of estudiantes) m.set(e.idEstudiante, e)
    return m
  }, [estudiantes])

  const cursoPorId = useMemo(() => {
    const m = new Map<number, CursoOption>()
    for (const c of cursos) m.set(c.idCurso, c)
    return m
  }, [cursos])

  // El modal arma la cascada Jornada → Curso → Estudiante a partir de la lista de
  // estudiantes, pero /estudiantes solo trae idCurso. Resolvemos curso (nombre) y
  // jornada contra el catálogo para que esos desplegables no salgan vacíos.
  const estudiantesConCurso = useMemo(
    () => estudiantes.map((e) => {
      const curso = e.idCurso != null ? cursoPorId.get(e.idCurso) : undefined
      return { ...e, curso: curso?.nombreCurso ?? null, jornada: curso?.jornada ?? null }
    }),
    [estudiantes, cursoPorId]
  )

  const registrosEnriquecidos = useMemo(
    () => registros.map((r) => {
      const est = estudiantePorId.get(r.idEstudiante)
      const curso = est?.idCurso != null ? cursoPorId.get(est.idCurso) : undefined
      // Para padre/estudiante el selector global no está disponible (vista acotada);
      // el nombre del estudiante asociado se inyecta como respaldo para no mostrar "—".
      const nombrePropio =
        idEstudiantePropio != null && r.idEstudiante === idEstudiantePropio
          ? nombreEstudiantePropio
          : undefined
      return {
        ...r,
        codigoEstudiante: est?.codigoEstudiante ?? r.codigoEstudiante,
        nombreEstudiante: est?.nombreCompleto ?? nombrePropio ?? r.nombreEstudiante,
        curso:   curso?.nombreCurso ?? null,
        jornada: curso?.jornada ?? null,
      }
    }),
    [registros, estudiantePorId, cursoPorId, idEstudiantePropio, nombreEstudiantePropio]
  )

  // Catálogo de cursos para el desplegable, ordenado por nombre.
  const cursosOrdenados = useMemo(
    () => [...cursos].sort((a, b) => a.nombreCurso.localeCompare(b.nombreCurso)),
    [cursos]
  )

  // Jornadas distintas presentes en el catálogo de cursos.
  const jornadas = useMemo(() => {
    const set = new Set<string>()
    for (const c of cursos) if (c.jornada) set.add(c.jornada)
    return [...set].sort((a, b) => a.localeCompare(b))
  }, [cursos])

  const registrosVisibles = useMemo(() => {
    let list = registrosEnriquecidos
    // Filtro por estado en cliente sobre el valor ya normalizado (robusto ante
    // variantes del backend: 'presente'/'asistio'/1 → 'Presente').
    if (estadoFiltro !== 'todos') {
      list = list.filter((r) => r.estado === estadoFiltro)
    }
    if (cursoFiltro !== 'todos') {
      list = list.filter((r) => estudiantePorId.get(r.idEstudiante)?.idCurso === cursoFiltro)
    }
    if (jornadaFiltro !== 'todos') {
      list = list.filter((r) => r.jornada === jornadaFiltro)
    }
    const q = searchQuery.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (r) =>
          r.nombreEstudiante.toLowerCase().includes(q) ||
          r.codigoEstudiante.toLowerCase().includes(q)
      )
    }
    return list
  }, [registrosEnriquecidos, estadoFiltro, cursoFiltro, jornadaFiltro, searchQuery, estudiantePorId])

  // ── CRUD ───────────────────────────────────────────────────────────────────

  const handleCreate = async (data: Omit<CreateRegistroData, 'registradoPor'>): Promise<void> => {
    setSaving(true)
    setError(null)
    try {
      await crearRegistroAction({ ...data, registradoPor: idUsuarioRegistrador })
      await fetchRegistros()
      closeModal()
      notifySuccess('Registro de asistencia guardado correctamente')
    } catch (err) {
      notifyError(err instanceof Error ? err.message : 'Error al guardar el registro de asistencia')
    } finally {
      setSaving(false)
    }
  }

  // Registro de VARIOS estudiantes a la vez (mismo estado/tipo/fecha). Usa la
  // acción por lotes y refresca/cierra una sola vez al terminar.
  const handleCreateMany = async (ids: number[], data: CreateManyData): Promise<void> => {
    if (ids.length === 0) return
    setSaving(true)
    setError(null)
    try {
      const res = await crearRegistrosMasivoAction({
        items: ids.map((id) => ({ idEstudiante: id, estado: data.estado })),
        fecha: data.fecha,
        tipo: data.tipo,
        registradoPor: idUsuarioRegistrador,
        observacion: data.observacion ?? null,
      })
      await fetchRegistros()
      closeModal()
      if (res.ok > 0) notifySuccess(`${res.ok} registro${res.ok !== 1 ? 's' : ''} de asistencia guardado${res.ok !== 1 ? 's' : ''}`)
      if (res.fail > 0) notifyError(`${res.fail} no se pudieron registrar (¿ya marcados hoy?)`)
    } catch (err) {
      notifyError(err instanceof Error ? err.message : 'Error al registrar el lote')
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
      notifySuccess('Registro de asistencia editado correctamente')
    } catch (err) {
      notifyError(err instanceof Error ? err.message : 'Error al editar el registro de asistencia')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number): Promise<void> => {
    const ok = await confirm({
      title: 'Eliminar registro',
      message: '¿Está seguro de eliminar este registro de asistencia? Esta acción no se puede deshacer.',
    })
    if (!ok) return
    try {
      await eliminarRegistro(id)
      setRegistros((prev) => prev.filter((r) => r.idAsistencia !== id))
      notifySuccess('Registro de asistencia eliminado correctamente')
    } catch (err) {
      notifyError(err instanceof Error ? err.message : 'Error al eliminar el registro de asistencia')
    }
  }

  // ── Modal ──────────────────────────────────────────────────────────────────

  const openCreate = () => { setSelectedRecord(null); setModalMode('create') }
  const openEdit   = (r: RegistroAsistencia) => { setSelectedRecord(r); setModalMode('edit') }
  const closeModal = () => { setModalMode(null); setSelectedRecord(null) }

  return {
    registros: registrosVisibles,
    estudiantes: estudiantesConCurso,
    cursos: cursosOrdenados,
    jornadas,
    totalCount: registrosVisibles.length,
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
    cursoFiltro,
    setCursoFiltro,
    jornadaFiltro,
    setJornadaFiltro,
    searchQuery,
    setSearchQuery,
    // acciones
    handleCreate,
    handleCreateMany,
    handleUpdate,
    handleDelete,
  }
}
