'use client'

import { useState } from 'react'
import { type UsuarioConRol } from '@/services/usuarios/usuariosService'

interface UsuariosPendientesProps {
  pendingUsuarios: UsuarioConRol[]
  loading: boolean
  error: string | null
  onValidar: (id: number, idRol: number) => Promise<void>
  onRechazar: (id: number) => Promise<void>
}

// Roles asignables por el administrador (idRol según tabla public.roles)
const ROLES_ASIGNABLES = [
  { value: 4, label: 'Padre / Acudiente', color: 'text-purple-600 dark:text-purple-400' },
  { value: 1, label: 'Profesor', color: 'text-green-600 dark:text-green-400' },
  { value: 3, label: 'Administrador', color: 'text-blue-600 dark:text-blue-400' },
] as const

const TIPO_DOC: Record<string, string> = {
  CC: 'C.C.', CE: 'C.E.', TI: 'T.I.', PAS: 'PAS',
}

function formatFecha(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

interface CardProps {
  usuario: UsuarioConRol
  onValidar: (id: number, idRol: number) => Promise<void>
  onRechazar: (id: number) => Promise<void>
}

function PendienteCard({ usuario, onValidar, onRechazar }: CardProps) {
  // Default a Profesor (1) porque los pendientes son usuarios que solicitaron ese rol
  const [rolSeleccionado, setRolSeleccionado] = useState(1)
  const [aprobando, setAprobando] = useState(false)
  const [rechazando, setRechazando] = useState(false)
  const [confirmReject, setConfirmReject] = useState(false)

  const nombreCompleto = [
    usuario.primerNombre,
    usuario.segundoNombre,
    usuario.primerApellido,
    usuario.segundoApellido,
  ]
    .filter(Boolean)
    .join(' ')

  const handleAprobar = async () => {
    setAprobando(true)
    try {
      await onValidar(usuario.idUsuario, rolSeleccionado)
    } finally {
      setAprobando(false)
    }
  }

  const handleRechazar = async () => {
    setRechazando(true)
    try {
      await onRechazar(usuario.idUsuario)
    } finally {
      setRechazando(false)
      setConfirmReject(false)
    }
  }

  return (
    <div className="bg-white dark:bg-[#1a1a1a] border border-amber-200 dark:border-amber-500/30 rounded-2xl p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center text-amber-700 dark:text-amber-300 font-bold text-sm shrink-0">
            {usuario.primerNombre[0]}{usuario.primerApellido[0]}
          </div>
          <div>
            <p className="font-semibold text-slate-800 dark:text-white text-sm">{nombreCompleto}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {TIPO_DOC[usuario.tipoDocumento] ?? usuario.tipoDocumento} {usuario.numeroDocumento}
            </p>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded-lg bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-semibold whitespace-nowrap">
          Pendiente
        </span>
      </div>

      {/* Info */}
      <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400">
        {usuario.correo && (
          <p className="flex items-center gap-1.5">
            <span>✉</span> {usuario.correo}
          </p>
        )}
        {usuario.telefono && (
          <p className="flex items-center gap-1.5">
            <span>📞</span> {usuario.telefono}
          </p>
        )}
        <p className="flex items-center gap-1.5">
          <span>📅</span> Registrado el {formatFecha(usuario.fechaRegistro)}
        </p>
      </div>

      {/* Role selector */}
      <div>
        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
          Asignar como:
        </p>
        <div className="flex flex-wrap gap-2">
          {ROLES_ASIGNABLES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRolSeleccionado(r.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                rolSeleccionado === r.value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300'
                  : 'border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/20'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        {/* Aprobar */}
        <button
          onClick={handleAprobar}
          disabled={aprobando || rechazando}
          className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold transition-colors disabled:opacity-60 shadow-md shadow-emerald-500/20"
        >
          {aprobando ? 'Aprobando...' : '✓ Aprobar'}
        </button>

        {/* Rechazar */}
        {confirmReject ? (
          <div className="flex gap-1.5">
            <button
              onClick={handleRechazar}
              disabled={rechazando}
              className="px-3 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-semibold transition-colors disabled:opacity-60"
            >
              {rechazando ? '...' : '¿Confirmar?'}
            </button>
            <button
              onClick={() => setConfirmReject(false)}
              className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-white/20 transition-colors"
            >
              No
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmReject(true)}
            disabled={aprobando || rechazando}
            className="px-4 py-2 rounded-xl border border-red-200 dark:border-red-500/30 text-red-500 dark:text-red-400 text-xs font-semibold hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors disabled:opacity-60"
          >
            ✕ Rechazar
          </button>
        )}
      </div>
    </div>
  )
}

export default function UsuariosPendientes({
  pendingUsuarios,
  loading,
  error,
  onValidar,
  onRechazar,
}: UsuariosPendientesProps) {
  const [sqlVisible, setSqlVisible] = useState(false)

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">⏳</span>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">
              Validación Pendiente
            </h2>
          </div>
          {pendingUsuarios.length > 0 && (
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-xs font-bold">
              {pendingUsuarios.length}
            </span>
          )}
        </div>

        {/* SQL Helper */}
        <button
          onClick={() => setSqlVisible((v) => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
          title="Script para asignar el primer administrador"
        >
          🛠 Script SQL
        </button>
      </div>

      {/* SQL Panel */}
      {sqlVisible && (
        <div className="rounded-xl border border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 p-4 space-y-2">
          <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">
            Script inicial — asignar el primer Administrador
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Ejecutar una única vez en el <strong>SQL Editor de Supabase</strong>, reemplazando el email:
          </p>
          <pre className="bg-slate-900 text-green-400 rounded-lg p-3 text-xs overflow-x-auto whitespace-pre">
{`UPDATE public.usuario
SET "idRol" = 3
WHERE auth_id = (
  SELECT id FROM auth.users
  WHERE email = 'correo@ejemplo.com'
);`}
          </pre>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            idRol 3 = Administrador · Una vez ejecutado, ese usuario podrá validar a los demás.
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 rounded-2xl bg-slate-100 dark:bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : pendingUsuarios.length === 0 ? (
        <div className="flex items-center gap-3 px-4 py-5 rounded-2xl border border-dashed border-slate-200 dark:border-white/10 text-slate-400 dark:text-slate-500">
          <span className="text-2xl">✅</span>
          <div>
            <p className="font-semibold text-sm">Sin pendientes</p>
            <p className="text-xs mt-0.5">Todos los usuarios registrados han sido validados.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pendingUsuarios.map((u) => (
            <PendienteCard
              key={u.idUsuario}
              usuario={u}
              onValidar={onValidar}
              onRechazar={onRechazar}
            />
          ))}
        </div>
      )}

      {/* Divider */}
      <hr className="border-slate-200 dark:border-white/10" />
    </section>
  )
}
