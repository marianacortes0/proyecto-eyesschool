'use client'

import { useMemo, useState } from 'react'
import {
  crearRegistrosMasivoAction,
  type RegistroMasivoItem,
} from '@/services/asistencia/asistenciaActions'
import type {
  CursoOption,
  EstudianteSelector,
  EstadoAsistencia,
  TipoAsistencia,
} from '@/services/asistencia/asistenciaService'
import { notifySuccess, notifyError, notifyWarning } from '@/lib/toast'

type Props = {
  cursos: CursoOption[]
  estudiantes: EstudianteSelector[]
  idUsuarioRegistrador: number
  /** Se llama tras un registro exitoso para refrescar la lista del día. */
  onRegistered?: () => void
}

const ESTADOS: EstadoAsistencia[] = ['Presente', 'Tarde', 'Ausente', 'Excusa', 'Suspensión']

const ESTADO_BTN: Record<EstadoAsistencia, string> = {
  Presente:   'bg-emerald-500 text-white',
  Tarde:      'bg-amber-500 text-white',
  Ausente:    'bg-red-500 text-white',
  Excusa:     'bg-blue-500 text-white',
  Suspensión: 'bg-slate-500 text-white',
}

const SEL_CLASS =
  'px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary'

/**
 * Registro de asistencia POR LOTES: se elige jornada → curso y se marca el estado
 * de TODOS sus estudiantes de una vez (por defecto "Presente"), enviándolos en un
 * solo lote. Alternativa al escaneo individual de la cámara.
 */
export default function RegistroMasivo({ cursos, estudiantes, idUsuarioRegistrador, onRegistered }: Props) {
  const hoy = new Date().toISOString().split('T')[0]

  const [jornada, setJornada] = useState('')
  const [idCurso, setIdCurso] = useState('')
  const [fecha, setFecha] = useState(hoy)
  const [tipo, setTipo] = useState<TipoAsistencia>('entrada')
  const [estados, setEstados] = useState<Record<number, EstadoAsistencia>>({})
  const [submitting, setSubmitting] = useState(false)

  const jornadas = useMemo(
    () => [...new Set(cursos.map((c) => c.jornada).filter((j): j is string => !!j))].sort(),
    [cursos]
  )
  const cursosDeJornada = useMemo(
    () => (jornada ? cursos.filter((c) => c.jornada === jornada) : []),
    [jornada, cursos]
  )
  const estudiantesDelCurso = useMemo(
    () => (idCurso ? estudiantes.filter((e) => e.idCurso === Number(idCurso)) : []),
    [idCurso, estudiantes]
  )

  // Estado efectivo de un estudiante (por defecto "Presente" hasta que se cambie).
  const estadoDe = (id: number): EstadoAsistencia => estados[id] ?? 'Presente'

  const handleJornada = (val: string) => {
    setJornada(val)
    setIdCurso('')
    setEstados({})
  }
  const handleCurso = (val: string) => {
    setIdCurso(val)
    setEstados({})
  }

  const marcarTodos = (estado: EstadoAsistencia) => {
    const next: Record<number, EstadoAsistencia> = {}
    for (const e of estudiantesDelCurso) next[e.idEstudiante] = estado
    setEstados(next)
  }

  const handleSubmit = async () => {
    if (estudiantesDelCurso.length === 0) {
      notifyWarning('Selecciona un curso con estudiantes')
      return
    }
    setSubmitting(true)
    try {
      const items: RegistroMasivoItem[] = estudiantesDelCurso.map((e) => ({
        idEstudiante: e.idEstudiante,
        estado: estadoDe(e.idEstudiante),
      }))
      const res = await crearRegistrosMasivoAction({
        items,
        fecha,
        tipo,
        registradoPor: idUsuarioRegistrador,
      })
      if (res.ok > 0) {
        notifySuccess(`${res.ok} registro${res.ok !== 1 ? 's' : ''} de asistencia guardado${res.ok !== 1 ? 's' : ''}`)
      }
      if (res.fail > 0) {
        notifyError(`${res.fail} no se pudieron registrar (¿ya marcados hoy?)`)
      }
      onRegistered?.()
    } catch (err) {
      notifyError(err instanceof Error ? err.message : 'Error al registrar el lote')
    } finally {
      setSubmitting(false)
    }
  }

  const nombreCurso = cursos.find((c) => c.idCurso === Number(idCurso))?.nombreCurso

  return (
    <div className="space-y-5">
      {/* Selección de curso + parámetros del lote */}
      <div className="flex flex-wrap gap-3">
        <select value={jornada} onChange={(e) => handleJornada(e.target.value)} className={`${SEL_CLASS} capitalize`}>
          <option value="">Jornada…</option>
          {jornadas.map((j) => (
            <option key={j} value={j}>{j}</option>
          ))}
        </select>

        <select
          value={idCurso}
          onChange={(e) => handleCurso(e.target.value)}
          disabled={!jornada}
          className={`${SEL_CLASS} disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          <option value="">{jornada ? 'Curso…' : 'Elige jornada primero'}</option>
          {cursosDeJornada.map((c) => (
            <option key={c.idCurso} value={String(c.idCurso)}>{c.nombreCurso}</option>
          ))}
        </select>

        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className={SEL_CLASS}
        />

        {/* Tipo entrada/salida */}
        <div className="inline-flex rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden">
          {(['entrada', 'salida'] as TipoAsistencia[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTipo(t)}
              className={`px-4 py-2.5 text-sm font-semibold capitalize transition-colors ${
                tipo === t
                  ? 'bg-primary text-white'
                  : 'bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {!idCurso ? (
        <div className="text-center py-12 text-sm rounded-2xl border border-dashed border-slate-300 dark:border-white/15 text-slate-500 dark:text-slate-400">
          Selecciona una jornada y un curso para marcar la asistencia de todos sus estudiantes.
        </div>
      ) : estudiantesDelCurso.length === 0 ? (
        <div className="text-center py-12 text-sm rounded-2xl border border-dashed border-slate-300 dark:border-white/15 text-slate-500 dark:text-slate-400">
          Este curso no tiene estudiantes activos.
        </div>
      ) : (
        <>
          {/* Atajos: marcar todos */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {nombreCurso} · {estudiantesDelCurso.length} estudiante{estudiantesDelCurso.length !== 1 ? 's' : ''} · Marcar todos:
            </span>
            {ESTADOS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => marcarTodos(e)}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/20 transition-colors"
              >
                {e}
              </button>
            ))}
          </div>

          {/* Lista de estudiantes con su estado */}
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 divide-y divide-slate-100 dark:divide-white/5 overflow-hidden">
            {estudiantesDelCurso.map((e) => (
              <div key={e.idEstudiante} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3 bg-white dark:bg-transparent">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-800 dark:text-white truncate">{e.nombreCompleto}</p>
                  <p className="text-xs text-slate-400 font-mono">{e.codigoEstudiante}</p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {ESTADOS.map((est) => {
                    const active = estadoDe(e.idEstudiante) === est
                    return (
                      <button
                        key={est}
                        type="button"
                        onClick={() => setEstados((prev) => ({ ...prev, [e.idEstudiante]: est }))}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                          active
                            ? ESTADO_BTN[est]
                            : 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/20'
                        }`}
                      >
                        {est}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Acción de envío */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-50 text-white text-sm font-semibold transition-colors shadow-lg shadow-blue-500/30"
            >
              {submitting
                ? 'Registrando…'
                : `Registrar ${estudiantesDelCurso.length} asistencia${estudiantesDelCurso.length !== 1 ? 's' : ''} (${tipo})`}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
