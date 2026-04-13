'use client'

import { type RegistroAsistencia, type EstadoAsistencia } from '@/services/asistencia/asistenciaService'
import { type Role } from '@/lib/utils/permissions'

type Props = {
  registros: RegistroAsistencia[]
  role: Role
  onEdit: (r: RegistroAsistencia) => void
  onDelete: (id: number) => void
}

const ESTADO_BADGE: Record<EstadoAsistencia, string> = {
  Presente:   'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300',
  Tarde:      'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300',
  Ausente:    'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300',
  Excusa:     'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300',
  Suspensión: 'bg-slate-100 dark:bg-slate-500/20 text-slate-700 dark:text-slate-300',
}

export default function AsistenciaTable({ registros, role, onEdit, onDelete }: Props) {
  const canEdit = role === 'admin'

  if (registros.length === 0) {
    return (
      <div className="text-center py-14 text-slate-500 dark:text-gray-400">
        <p className="text-4xl mb-3">📋</p>
        <p className="font-semibold">No hay registros para los filtros seleccionados.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/40 dark:border-white/10 shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-gray-400 text-xs uppercase tracking-wider">
          <tr>
            <th className="px-4 py-3 text-left">Estudiante</th>
            <th className="px-4 py-3 text-left">Fecha</th>
            <th className="px-4 py-3 text-left">Estado</th>
            <th className="px-4 py-3 text-left">Observación</th>
            <th className="px-4 py-3 text-left">Tipo</th>
            <th className="px-4 py-3 text-left">Registrado</th>
            {canEdit && <th className="px-4 py-3 text-right">Acciones</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
          {registros.map((r) => (
            <tr
              key={r.idAsistencia}
              className="bg-white dark:bg-transparent hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors"
            >
              {/* Estudiante */}
              <td className="px-4 py-3">
                <p className="font-semibold text-slate-800 dark:text-white">{r.nombreEstudiante}</p>
                <p className="text-xs text-slate-400 font-mono">{r.codigoEstudiante}</p>
                {r.curso && <p className="text-xs text-slate-400">{r.curso}</p>}
              </td>

              {/* Fecha */}
              <td className="px-4 py-3 text-xs text-slate-600 dark:text-gray-400 whitespace-nowrap">
                {new Date(r.fecha + 'T00:00:00').toLocaleDateString('es-CO', {
                  day: '2-digit', month: '2-digit', year: 'numeric',
                })}
              </td>

              {/* Estado */}
              <td className="px-4 py-3">
                <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${ESTADO_BADGE[r.estado] ?? ESTADO_BADGE['Excusa']}`}>
                  {r.estado}
                </span>
              </td>

              {/* Observación */}
              <td className="px-4 py-3 text-xs text-slate-500 dark:text-gray-400 max-w-48">
                <span className="line-clamp-2" title={r.observacion ?? undefined}>
                  {r.observacion ?? <span className="text-slate-300 dark:text-gray-600 italic">Sin observación</span>}
                </span>
              </td>

              {/* Tipo */}
              <td className="px-4 py-3">
                {r.tipo ? (
                  <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                    r.tipo.toLowerCase() === 'entrada'
                      ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                      : r.tipo.toLowerCase() === 'salida'
                        ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300'
                        : 'bg-slate-100 dark:bg-slate-500/20 text-slate-600 dark:text-slate-300'
                  }`}>
                    {r.tipo.charAt(0).toUpperCase() + r.tipo.slice(1)}
                  </span>
                ) : (
                  <span className="text-xs text-slate-300 dark:text-gray-600">—</span>
                )}
              </td>

              {/* Fecha registro */}
              <td className="px-4 py-3 text-xs text-slate-500 dark:text-gray-400 whitespace-nowrap">
                {new Date(r.fechaRegistro).toLocaleTimeString('es-CO', {
                  hour: '2-digit', minute: '2-digit',
                })}
              </td>

              {/* Acciones */}
              {canEdit && (
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onEdit(r)}
                      title="Editar"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => onDelete(r.idAsistencia)}
                      title="Eliminar"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
