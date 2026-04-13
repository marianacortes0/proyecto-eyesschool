'use client'

import { useState, useCallback, useEffect } from 'react'
import {
  getUsuarios,
  updateUsuario,
  toggleUsuarioEstado,
  type UsuarioConRol,
  type CreateUsuarioData,
  type UpdateUsuarioData,
} from '@/services/usuarios/usuariosService'
import {
  createUsuarioConAuth,
  getPendingUsuariosAction,
  validarUsuarioAction,
  rechazarUsuarioAction,
  deleteUsuarioAction,
} from '@/app/(dashboard)/usuarios/actions'

export type ModalMode = 'create' | 'edit' | null

export function useUsuarios() {
  // ── Usuarios validados ───────────────────────────────────────────────────
  const [usuarios, setUsuarios] = useState<UsuarioConRol[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // ── Usuarios pendientes ──────────────────────────────────────────────────
  const [pendingUsuarios, setPendingUsuarios] = useState<UsuarioConRol[]>([])
  const [pendingLoading, setPendingLoading] = useState(true)
  const [pendingError, setPendingError] = useState<string | null>(null)

  // ── Modal ────────────────────────────────────────────────────────────────
  const [selectedUsuario, setSelectedUsuario] = useState<UsuarioConRol | null>(null)
  const [modalMode, setModalMode] = useState<ModalMode>(null)

  // ── Filtros ──────────────────────────────────────────────────────────────
  const [filterRol, setFilterRol] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // ── Fetch validados ──────────────────────────────────────────────────────
  const fetchUsuarios = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getUsuarios()
      setUsuarios(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }, [])

  // ── Fetch pendientes (server action con admin client — bypasea RLS) ──────
  const fetchPending = useCallback(async () => {
    try {
      setPendingLoading(true)
      setPendingError(null)
      const data = await getPendingUsuariosAction()
      setPendingUsuarios(data)
    } catch (err) {
      setPendingError(err instanceof Error ? err.message : 'Error al cargar pendientes')
    } finally {
      setPendingLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsuarios()
    fetchPending()
  }, [fetchUsuarios, fetchPending])

  // ── CRUD validados ───────────────────────────────────────────────────────
  const handleCreate = async (data: CreateUsuarioData): Promise<void> => {
    setSaving(true)
    try {
      await createUsuarioConAuth(data)
      await Promise.all([fetchUsuarios(), fetchPending()])
      closeModal()
    } catch (err) {
      throw err
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async (data: UpdateUsuarioData): Promise<void> => {
    if (!selectedUsuario) return
    setSaving(true)
    try {
      await updateUsuario(selectedUsuario.idUsuario, data)
      await fetchUsuarios()
      closeModal()
    } catch (err) {
      throw err
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number): Promise<void> => {
    try {
      await deleteUsuarioAction(id)
      await fetchUsuarios()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar usuario')
    }
  }

  const handleToggleEstado = async (id: number, nuevoEstado: boolean): Promise<void> => {
    try {
      await toggleUsuarioEstado(id, nuevoEstado)
      await fetchUsuarios()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cambiar estado')
    }
  }

  // ── Validación de pendientes ─────────────────────────────────────────────
  const handleValidar = async (id: number, idRol: number): Promise<void> => {
    try {
      await validarUsuarioAction(id, idRol)
      await Promise.all([fetchUsuarios(), fetchPending()])
    } catch (err) {
      setPendingError(err instanceof Error ? err.message : 'Error al validar usuario')
    }
  }

  const handleRechazar = async (id: number): Promise<void> => {
    try {
      await rechazarUsuarioAction(id)
      await fetchPending()
    } catch (err) {
      setPendingError(err instanceof Error ? err.message : 'Error al rechazar usuario')
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
