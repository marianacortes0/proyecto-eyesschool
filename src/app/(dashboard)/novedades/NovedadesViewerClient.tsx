'use client'

import { useMemo, useState } from 'react'
import { type NovedadesAsociadoBootstrap } from '@/services/asociado/asociadoActions'

// El backend usa Bajo/Medio/Alto/Crítico; se mapean también las variantes
// Alta/Media/Baja por compatibilidad.
const GRAVEDAD_COLOR: Record<string, string> = {
  Alto:      'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
  Alta:      'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
  'Crítico': 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
  Medio:     'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300',
  Media:     'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300',
  Bajo:      'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300',
  Baja:      'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300',
}

const ESTADO_COLOR: Record<string, string> = {
  Pendiente:  'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300',
  Completado: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300',
}

/**
 * Vista de novedades en SOLO LECTURA para el estudiante asociado (rol padre = su
 * hijo, rol estudiante = él mismo). Los datos llegan acotados desde
 * /estudiantes/{id}/novedades; sin acciones de edición.
 */
export default function NovedadesViewerClient({ info, novedades }: NovedadesAsociadoBootstrap) {
  const [filterEstado, setFilterEstado] = useState('')

  const filtradas = useMemo(
    () => novedades.filter(n => !filterEstado || n.estado === filterEstado),
    [novedades, filterEstado]
  )

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Novedades</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {info ? info.nombre : 'Estudiante'} · {novedades.length} novedad{novedades.length !== 1 ? 'es' : ''}
        </p>
      </div>

      {!info ? (
        <div className="px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-300 text-sm">
          No encontramos un estudiante asociado a tu cuenta.
        </div>
      ) : (
        <>
          {/* Filtros */}
          <div className="flex flex-wrap gap-3">
            <select
              value={filterEstado}
              onChange={e => setFilterEstado(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Todos los estados</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Completado">Completado</option>
            </select>
          </div>

          {/* Tabla */}
          {filtradas.length === 0 ? (
            <div className="text-center py-16 text-sm rounded-2xl border border-dashed border-slate-300 dark:border-white/15 text-slate-500 dark:text-slate-400">
              {novedades.length === 0 ? 'No hay novedades registradas.' : 'No hay novedades con ese estado.'}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide">
                    <th className="px-4 py-3 text-left">Fecha</th>
                    <th className="px-4 py-3 text-left">Tipo</th>
                    <th className="px-4 py-3 text-left">Gravedad</th>
                    <th className="px-4 py-3 text-left">Descripción</th>
                    <th className="px-4 py-3 text-left">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {filtradas.map(n => (
                    <tr key={n.idNovedad} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-slate-600 dark:text-slate-300">
                        {new Date(n.fecha).toLocaleDateString('es-CO')}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-700 dark:text-slate-300">{n.nombreTipo}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${GRAVEDAD_COLOR[n.nivelGravedad] ?? 'bg-slate-100 text-slate-600'}`}>
                          {n.nivelGravedad || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 max-w-xs truncate text-slate-600 dark:text-slate-300" title={n.descripcion}>
                        {n.descripcion}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${ESTADO_COLOR[n.estado] ?? 'bg-slate-100 text-slate-600'}`}>
                          {n.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
