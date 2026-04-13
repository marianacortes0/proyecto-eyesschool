'use client'

import { useState } from 'react'
import { type UsuarioConRol } from '@/services/usuarios/usuariosService'

interface UsuariosTableProps {
  usuarios: UsuarioConRol[]
  onEdit: (usuario: UsuarioConRol) => void
  onToggleEstado: (id: number, nuevoEstado: boolean) => void
  onDelete: (id: number) => void
}

const ROL_BADGE: Record<number, { label: string; className: string }> = {
  1: { label: 'Profesor', className: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300' },
  2: { label: 'Estudiante', className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300' },
  3: { label: 'Admin', className: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300' },
  4: { label: 'Padre', className: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300' },
}

const TIPO_DOC: Record<string, string> = {
  CC: 'C.C.',
  CE: 'C.E.',
  TI: 'T.I.',
  PAS: 'PAS',
}

export default function UsuariosTable({
  usuarios,
  onEdit,
  onToggleEstado,
  onDelete,
}: UsuariosTableProps) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)

  if (usuarios.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400 dark:text-slate-500">
        <span className="text-4xl mb-3">👤</span>
        <p className="font-semibold">No se encontraron usuarios</p>
        <p className="text-sm mt-1">Ajusta los filtros o crea un nuevo usuario</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-white/10">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
            <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">Nombre</th>
            <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">Documento</th>
            <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">Correo</th>
            <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">Rol</th>
            <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">Estado</th>
            <th className="px-4 py-3 text-right font-semibold text-slate-600 dark:text-slate-300">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
          {usuarios.map((u) => {
            const rolBadge = ROL_BADGE[u.idRol]
            const nombreCompleto = [u.primerNombre, u.segundoNombre, u.primerApellido, u.segundoApellido]
              .filter(Boolean)
              .join(' ')

            return (
              <tr
                key={u.idUsuario}
                className="bg-white dark:bg-transparent hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
              >
                {/* Nombre */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-xs shrink-0">
                      {u.primerNombre[0]}{u.primerApellido[0]}
                    </div>
                    <span className="font-medium text-slate-800 dark:text-white">{nombreCompleto}</span>
                  </div>
                </td>

                {/* Documento */}
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                  <span className="text-slate-400 dark:text-slate-500 text-xs mr-1">
                    {TIPO_DOC[u.tipoDocumento] ?? u.tipoDocumento}
                  </span>
                  {u.numeroDocumento}
                </td>

                {/* Correo */}
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                  {u.correo ?? <span className="text-slate-400 italic text-xs">Sin correo</span>}
                </td>

                {/* Rol */}
                <td className="px-4 py-3">
                  {rolBadge ? (
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${rolBadge.className}`}>
                      {rolBadge.label}
                    </span>
                  ) : (
                    <span className="text-slate-400 text-xs">—</span>
                  )}
                </td>

                {/* Estado */}
                <td className="px-4 py-3">
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                      u.estado
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                        : 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-300'
                    }`}
                  >
                    {u.estado ? 'Activo' : 'Inactivo'}
                  </span>
                </td>

                {/* Acciones */}
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    {/* Editar */}
                    <button
                      onClick={() => onEdit(u)}
                      title="Editar"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                    >
                      ✏️
                    </button>

                    {/* Toggle estado */}
                    <button
                      onClick={() => onToggleEstado(u.idUsuario, !u.estado)}
                      title={u.estado ? 'Desactivar' : 'Activar'}
                      className={`p-1.5 rounded-lg transition-colors ${
                        u.estado
                          ? 'text-slate-500 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10'
                          : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'
                      }`}
                    >
                      {u.estado ? '🔒' : '🔓'}
                    </button>

                    {/* Eliminar */}
                    {confirmDeleteId === u.idUsuario ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            onDelete(u.idUsuario)
                            setConfirmDeleteId(null)
                          }}
                          className="px-2 py-1 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-colors"
                        >
                          Confirmar
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-white/20 transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(u.idUsuario)}
                        title="Eliminar"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
