'use client'

import { useUsuarios } from '@/hooks/useUsuarios'
import UsuariosFilters from '@/components/usuarios/UsuariosFilters'
import UsuariosTable from '@/components/usuarios/UsuariosTable'
import UsuarioModal from '@/components/usuarios/UsuarioModal'
import UsuariosPendientes from '@/components/usuarios/UsuariosPendientes'

export default function UsuariosClient() {
  const {
    // validados
    usuarios,
    totalCount,
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
  } = useUsuarios()

  return (
    <div className="p-6 space-y-6">
      {/* ── Sección: Pendientes de validación ──────────────────────────── */}
      <UsuariosPendientes
        pendingUsuarios={pendingUsuarios}
        loading={pendingLoading}
        error={pendingError}
        onValidar={handleValidar}
        onRechazar={handleRechazar}
      />

      {/* ── Sección: Usuarios validados ─────────────────────────────────── */}
      <UsuariosFilters
        searchQuery={searchQuery}
        filterRol={filterRol}
        totalCount={totalCount}
        onSearchChange={setSearchQuery}
        onFilterRolChange={setFilterRol}
        onNuevoUsuario={openCreateModal}
      />

      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-slate-100 dark:bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : (
        <UsuariosTable
          usuarios={usuarios}
          onEdit={openEditModal}
          onToggleEstado={handleToggleEstado}
          onDelete={handleDelete}
        />
      )}

      {/* Modal crear / editar */}
      <UsuarioModal
        mode={modalMode}
        usuario={selectedUsuario}
        saving={saving}
        onClose={closeModal}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
      />
    </div>
  )
}
