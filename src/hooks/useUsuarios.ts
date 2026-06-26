'use client'

import { useState, useCallback, useEffect } from 'react'
import {
  type UsuarioConRol,
  type CreateUsuarioData,
  type UpdateUsuarioData,
  type CursoOpt,
  type EstudianteOpt,
  type EspecializacionOpt,
} from '@/services/usuarios/usuariosService'
import {
  getUsuariosBootstrapAction,
  type UsuariosBootstrap,
  createUsuarioConAuth,
  updateUsuarioAction,
  toggleUsuarioEstadoAction,
  validarUsuarioAction,
  rechazarUsuarioAction,
  deleteUsuarioAction,
  updateEstudianteCursoAction,
  updatePadreRelacionAction,
  setProfesorEspecializacionByNameAction,
  updateProfesorFechaAction,
  updateAdministradorAction,
} from '@/app/(dashboard)/usuarios/actions'
import { notifySuccess, notifyError } from '@/lib/toast'
import { useConfirm } from '@/components/ui/ConfirmDialog'

export type ModalMode = 'create' | 'edit' | null

const ID_ROL_PROFESOR = 1
const ID_ROL_ESTUDIANTE = 2
const ID_ROL_ADMIN = 3
const ID_ROL_PADRE = 4

export function useUsuarios(initialData?: UsuariosBootstrap) {
  const confirm = useConfirm()
  // ── Usuarios validados ───────────────────────────────────────────────────
  const [usuarios, setUsuarios] = useState<UsuarioConRol[]>(initialData?.usuarios ?? [])
  const [loading, setLoading] = useState(!initialData)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // ── Usuarios pendientes ──────────────────────────────────────────────────
  const [pendingUsuarios, setPendingUsuarios] = useState<UsuarioConRol[]>(initialData?.pendientes ?? [])
  const [pendingLoading, setPendingLoading] = useState(!initialData)
  const [pendingError, setPendingError] = useState<string | null>(null)

  // ── Modal ────────────────────────────────────────────────────────────────
  const [selectedUsuario, setSelectedUsuario] = useState<UsuarioConRol | null>(null)
  const [modalMode, setModalMode] = useState<ModalMode>(null)

  // ── Filtros ──────────────────────────────────────────────────────────────
  const [filterRol, setFilterRol] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // ── Cursos (para asignar a estudiantes) ──────────────────────────────────
  const [cursos, setCursos] = useState<CursoOpt[]>(initialData?.cursos ?? [])

  // ── Estudiantes (para vincular a padres) ─────────────────────────────────
  const [estudiantes, setEstudiantes] = useState<EstudianteOpt[]>(initialData?.estudiantes ?? [])

  // ── Especializaciones (para asignar a profesores) ────────────────────────
  const [especializaciones, setEspecializaciones] = useState<EspecializacionOpt[]>(initialData?.especializaciones ?? [])

  // ── Carga / refresco consolidado (una sola server action que enriquece
  //    validados Y pendientes con sus datos de rol). `silent` evita el
  //    esqueleto de carga cuando es un refresco tras una mutación. ──────────
  const fetchBootstrap = useCallback(async (opts?: { silent?: boolean }) => {
    try {
      if (!opts?.silent) {
        setLoading(true)
        setPendingLoading(true)
      }
      setError(null)
      setPendingError(null)
      const data = await getUsuariosBootstrapAction()
      setUsuarios(data.usuarios)
      setPendingUsuarios(data.pendientes)
      setCursos(data.cursos)
      setEstudiantes(data.estudiantes)
      setEspecializaciones(data.especializaciones)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al cargar usuarios'
      setError(msg)
      setPendingError(msg)
    } finally {
      if (!opts?.silent) {
        setLoading(false)
        setPendingLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    // Si la página ya entregó los datos desde el servidor, no refetcheamos al montar.
    if (initialData) return
    fetchBootstrap()
  }, [initialData, fetchBootstrap])

  // ── CRUD validados ───────────────────────────────────────────────────────
  const handleCreate = async (data: CreateUsuarioData): Promise<void> => {
    setSaving(true)
    try {
      await createUsuarioConAuth(data)
    } catch (err) {
      notifyError(err instanceof Error ? err.message : 'Error al crear el usuario')
      setSaving(false)
      return
    }
    setSaving(false)
    closeModal()
    notifySuccess('Usuario creado exitosamente')
    // Refresca la tabla en segundo plano para no bloquear el cierre del modal
    void fetchBootstrap({ silent: true })
  }

  const handleUpdate = async (data: UpdateUsuarioData): Promise<void> => {
    if (!selectedUsuario) return
    setSaving(true)
    try {
      await updateUsuarioAction(selectedUsuario.idUsuario, data)
      // Si es estudiante, persistir el curso actual y la vigencia
      if (data.idRol === ID_ROL_ESTUDIANTE && data.idCursoActual !== undefined) {
        await updateEstudianteCursoAction(
          selectedUsuario.idUsuario,
          data.idCursoActual ?? null,
          data.fechaAsignacion ?? undefined,
          data.fechaFin ?? undefined,
        )
      }
      // Si es profesor, persistir la fecha de vinculación
      if (data.idRol === ID_ROL_PROFESOR && data.fechaAsignacion) {
        await updateProfesorFechaAction(selectedUsuario.idUsuario, data.fechaAsignacion)
      }
      // Si es administrador, persistir cargo, nivel de acceso y vigencia
      if (data.idRol === ID_ROL_ADMIN) {
        await updateAdministradorAction(selectedUsuario.idUsuario, {
          cargo: data.cargo ?? '',
          nivelAcceso: data.nivelAcceso ?? 'Bajo',
          fechaAsignacion: data.fechaAsignacion ?? '',
          fechaFin: data.fechaFin ?? '',
        })
      }
      // Si es padre, persistir el estudiante vinculado y el parentesco
      if (data.idRol === ID_ROL_PADRE && data.idEstudianteRelacionado != null && data.parentesco) {
        await updatePadreRelacionAction(
          selectedUsuario.idUsuario,
          data.idEstudianteRelacionado,
          data.parentesco,
        )
      }
      // Si es profesor, persistir la especialización (por nombre; se crea si no existe)
      if (data.idRol === ID_ROL_PROFESOR && data.especializacion !== undefined) {
        await setProfesorEspecializacionByNameAction(
          selectedUsuario.idUsuario,
          data.especializacion ?? '',
          data.institucion ?? '',
        )
      }
    } catch (err) {
      notifyError(err instanceof Error ? err.message : 'Error al editar el usuario')
      setSaving(false)
      return
    }
    setSaving(false)
    closeModal()
    notifySuccess('Usuario editado exitosamente')
    // Refresca la tabla en segundo plano para no bloquear el cierre del modal
    void fetchBootstrap({ silent: true })
  }

  const handleDelete = async (id: number): Promise<void> => {
    const u = usuarios.find((x) => x.idUsuario === id)
    const nombre = u ? [u.primerNombre, u.primerApellido].filter(Boolean).join(' ') : 'este usuario'
    const ok = await confirm({
      title: 'Eliminar usuario',
      message: `¿Está seguro de eliminar al usuario ${nombre}? Esta acción no se puede deshacer.`,
    })
    if (!ok) return
    try {
      await deleteUsuarioAction(id)
      await fetchBootstrap({ silent: true })
      notifySuccess('Usuario eliminado exitosamente')
    } catch (err) {
      notifyError(err instanceof Error ? err.message : 'Error al eliminar el usuario')
    }
  }

  const handleToggleEstado = async (id: number, nuevoEstado: boolean): Promise<void> => {
    try {
      await toggleUsuarioEstadoAction(id, nuevoEstado)
      await fetchBootstrap({ silent: true })
      notifySuccess('Cambios guardados correctamente')
    } catch (err) {
      notifyError(err instanceof Error ? err.message : 'Error al cambiar el estado del usuario')
    }
  }

  // ── Validación de pendientes ─────────────────────────────────────────────
  const handleValidar = async (id: number, idRol: number): Promise<void> => {
    try {
      await validarUsuarioAction(id, idRol)
      await fetchBootstrap({ silent: true })
      notifySuccess('Su cuenta ha sido aprobada. Ya puede iniciar sesión.')
    } catch (err) {
      notifyError(err instanceof Error ? err.message : 'Error al aprobar el usuario')
    }
  }

  const handleRechazar = async (id: number): Promise<void> => {
    try {
      await rechazarUsuarioAction(id)
      await fetchBootstrap({ silent: true })
      notifySuccess('Solicitud rechazada correctamente')
    } catch (err) {
      notifyError(err instanceof Error ? err.message : 'Error al rechazar el usuario')
    }
  }

  // ── Modal ────────────────────────────────────────────────────────────────
  const openCreateModal = () => {
    setSelectedUsuario(null)
    setModalMode('create')
  }

  const openEditModal = (usuario: UsuarioConRol) => {
    setSelectedUsuario(usuario)
    setModalMode('edit')
  }

  const closeModal = () => {
    setModalMode(null)
    setSelectedUsuario(null)
  }

  // ── Filtros ──────────────────────────────────────────────────────────────
  const filteredUsuarios = usuarios.filter((u) => {
    const matchesRol = filterRol === null || u.idRol === filterRol
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      q === '' ||
      u.primerNombre.toLowerCase().includes(q) ||
      u.primerApellido.toLowerCase().includes(q) ||
      (u.correo ?? '').toLowerCase().includes(q) ||
      u.numeroDocumento.toLowerCase().includes(q)
    return matchesRol && matchesSearch
  })

  return {
    // validados
    usuarios: filteredUsuarios,
    totalCount: usuarios.length,
    loading,
    error,
    saving,
    // pendientes
    pendingUsuarios,
    pendingLoading,
    pendingError,
    // modal
    selectedUsuario,
    modalMode,
    cursos,
    estudiantes,
    especializaciones,
    // filtros
    filterRol,
    searchQuery,
    setFilterRol,
    setSearchQuery,
    // acciones validados
    openCreateModal,
    openEditModal,
    closeModal,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleToggleEstado,
    // acciones pendientes
    handleValidar,
    handleRechazar,
  }
}
