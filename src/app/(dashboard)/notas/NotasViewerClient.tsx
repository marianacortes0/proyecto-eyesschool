'use client'

import { useMemo, useState } from 'react'
import { type NotasAsociadoBootstrap } from '@/services/asociado/asociadoActions'
import { PERIODOS, notaColor, NOTA_APROBACION, downloadBoletinPdf } from '@/services/notas/notasService'
import { notifyError } from '@/lib/toast'
import { getErrorMessage } from '@/lib/errors'

/**
 * Vista de notas en SOLO LECTURA para el estudiante asociado (rol padre = su hijo,
 * rol estudiante = él mismo). Sin selector de estudiante ni acciones de edición:
 * los datos llegan acotados desde /estudiantes/{id}/notas.
 */
export default function NotasViewerClient({ info, notas, materias }: NotasAsociadoBootstrap) {
  const [filterMateria, setFilterMateria] = useState('')
  const [filterPeriodo, setFilterPeriodo] = useState('')
  const [downloading, setDownloading] = useState(false)

  const filtradas = useMemo(
    () => notas.filter(n => {
      if (filterMateria && String(n.idMateria) !== filterMateria) return false
      if (filterPeriodo && String(n.idPeriodo) !== filterPeriodo) return false
      return true
    }),
    [notas, filterMateria, filterPeriodo]
  )

  const stats = useMemo(() => {
    if (!filtradas.length) return { promedio: 0, aprobados: 0, reprobados: 0 }
    const sum = filtradas.reduce((a, n) => a + n.nota, 0)
    const aprobados = filtradas.filter(n => n.nota >= NOTA_APROBACION).length
    return {
      promedio: Number((sum / filtradas.length).toFixed(2)),
      aprobados,
      reprobados: filtradas.length - aprobados,
    }
  }, [filtradas])

  const handleDownload = async () => {
    if (!info) return
    setDownloading(true)
    try {
      await downloadBoletinPdf(info.idEstudiante, info.nombre)
    } catch (e) {
      notifyError(getErrorMessage(e, 'No se pudo descargar el boletín'))
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Notas</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {info ? info.nombre : 'Estudiante'} · {notas.length} nota{notas.length !== 1 ? 's' : ''}
        </p>
      </div>

      {!info ? (
        <div className="px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-300 text-sm">
          No encontramos un estudiante asociado a tu cuenta.
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 p-4">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Promedio</p>
              <p className={`text-3xl font-black mt-1 ${stats.promedio >= NOTA_APROBACION ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                {stats.promedio.toFixed(1)}
              </p>
            </div>
            <div className="bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 p-4">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Aprobados</p>
              <p className="text-3xl font-black text-green-600 dark:text-green-400 mt-1">{stats.aprobados}</p>
            </div>
            <div className="bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 p-4">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Reprobados</p>
              <p className="text-3xl font-black text-red-500 dark:text-red-400 mt-1">{stats.reprobados}</p>
            </div>
          </div>

          {/* Barra de boletín */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 rounded-2xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Boletín del estudiante</p>
              <p className="font-bold text-slate-800 dark:text-white truncate">
                {info.nombre}
                {info.codigo && <span className="ml-2 text-xs font-normal text-slate-400">{info.codigo}</span>}
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-50 text-white text-sm font-semibold transition-colors whitespace-nowrap"
            >
              {downloading ? 'Generando...' : 'Descargar boletín PDF'}
            </button>
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap gap-3">
            <select
              value={filterMateria}
              onChange={e => setFilterMateria(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Todas las materias</option>
              {materias.map(m => (
                <option key={m.idMateria} value={String(m.idMateria)}>{m.nombreMateria}</option>
              ))}
            </select>
            <select
              value={filterPeriodo}
              onChange={e => setFilterPeriodo(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Todos los periodos</option>
              {Object.entries(PERIODOS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          {/* Tabla */}
          {filtradas.length === 0 ? (
            <div className="text-center py-16 text-sm rounded-2xl border border-dashed border-slate-300 dark:border-white/15 text-slate-500 dark:text-slate-400">
              {notas.length === 0 ? 'Aún no hay notas registradas.' : 'No hay notas con los filtros seleccionados.'}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide">
                    <th className="px-4 py-3 text-left">Materia</th>
                    <th className="px-4 py-3 text-center">Nota</th>
                    <th className="px-4 py-3 text-left">Periodo</th>
                    <th className="px-4 py-3 text-left">Observación</th>
                    <th className="px-4 py-3 text-left">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {filtradas.map(n => (
                    <tr key={n.idNota} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{n.nombreMateria}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-black ${notaColor(n.nota)}`}>
                            {n.nota.toFixed(1)}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            n.nota >= NOTA_APROBACION
                              ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300'
                              : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300'
                          }`}>
                            {n.nota >= NOTA_APROBACION ? 'Aprobado' : 'Reprobado'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{n.periodoLabel}</td>
                      <td className="px-4 py-3 max-w-[260px] truncate text-slate-500 dark:text-slate-400 text-xs" title={n.observacion ?? ''}>
                        {n.observacion ?? '—'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-500 dark:text-slate-400 text-xs">
                        {new Date(n.fechaRegistro).toLocaleDateString('es-CO')}
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
