'use client'

import { useState, useEffect, useMemo } from 'react'
import { type RegistroAsistencia, type EstudianteSelector, type EstadoAsistencia } from '@/services/asistencia/asistenciaService'
import { type ModalMode } from '@/hooks/useAsistencia'
import { type CreateRegistroData, type UpdateRegistroData } from '@/services/asistencia/asistenciaService'

type Props = {
  mode: ModalMode
  registro: RegistroAsistencia | null
  estudiantes: EstudianteSelector[]
  saving: boolean
  onClose: () => void
  onCreate: (data: Omit<CreateRegistroData, 'registradoPor'>) => Promise<void>
  onUpdate: (data: UpdateRegistroData) => Promise<void>
}

const ESTADOS: EstadoAsistencia[] = ['Presente', 'Tarde', 'Ausente', 'Excusa', 'Suspensión']

const ESTADO_COLOR: Record<EstadoAsistencia, string> = {
  Presente:   'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300',
  Tarde:      'border-amber-500 bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300',
  Ausente:    'border-red-500 bg-red-50 dark:bg-red-500/20 text-red-700 dark:text-red-300',
  Excusa:     'border-blue-500 bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300',
  Suspensión: 'border-slate-500 bg-slate-100 dark:bg-slate-500/20 text-slate-700 dark:text-slate-300',
}

export default function AsistenciaModal({
  mode, registro, estudiantes, saving, onClose, onCreate, onUpdate,
}: Props) {
  const [jornadaSeleccionada, setJornadaSeleccionada] = useState<string>('')
  const [cursoSeleccionado,   setCursoSeleccionado]   = useState<string>('')
  const [idEstudiante,        setIdEstudiante]        = useState<number | ''>('')
  const [estado,              setEstado]              = useState<EstadoAsistencia>('Presente')
  const [fecha,               setFecha]               = useState('')
  const [observacion,         setObservacion]         = useState('')
  const [formError,           setFormError]           = useState<string | null>(null)

  const jornadas = useMemo(() => {
    const seen = new Set<string>()
    for (const e of estudiantes) {
      if (e.jornada) seen.add(e.jornada)
    }
    return [...seen].sort()
  }, [estudiantes])

  const cursosDeJornada = useMemo(() => {
    const seen = new Set<string>()
    const result: string[] = []
    for (const e of estudiantes) {
      if (jornadaSeleccionada && e.jornada === jornadaSeleccionada && e.curso && !seen.has(e.curso)) {
        seen.add(e.curso)
        result.push(e.curso)
      }
    }
    return result.sort()
  }, [estudiantes, jornadaSeleccionada])

  const estudiantesFiltrados = useMemo(
    () => cursoSeleccionado ? estudiantes.filter(e => e.curso === cursoSeleccionado) : [],
    [estudiantes, cursoSeleccionado]
  )

  useEffect(() => {
    if (mode === 'edit' && registro) {
      setIdEstudiante(registro.idEstudiante)
      setEstado(registro.estado)
      setFecha(registro.fecha)
      setObservacion(registro.observacion ?? '')
    } else {
      setJornadaSeleccionada('')
      setCursoSeleccionado('')
      setIdEstudiante('')
      setEstado('Presente')
      setFecha(new Date().toISOString().split('T')[0])
      setObservacion('')
    }
    setFormError(null)
  }, [mode, registro])

  if (!mode) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (mode === 'create' && !idEstudiante) {
      setFormError('Selecciona un estudiante')
      return
    }
    if (!fecha) {
      setFormError('La fecha es obligatoria')
      return
    }

    try {
      if (mode === 'create') {
        await onCreate({
          idEstudiante: idEstudiante as number,
          estado,
          fecha,
          observacion: observacion || null,
        })
      } else {
        await onUpdate({
          estado,
          fecha,
          observacion: observacion || null,
        })
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Error al guardar')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white dark:bg-[#1a1a2e] rounded-2xl shadow-2xl border border-white/20 dark:border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/10">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">
            {mode === 'create' ? 'Registrar Asistencia' : 'Editar Registro'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xl leading-none">✕</button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Jornada → Curso → Estudiante — solo al crear */}
          {mode === 'create' && (
            <>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-gray-300">
                  Jornada <span className="text-red-500">*</span>
                </label>
                <select
                  value={jornadaSeleccionada}
                  onChange={(e) => { setJornadaSeleccionada(e.target.value); setCursoSeleccionado(''); setIdEstudiante('') }}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Seleccionar jornada...</option>
                  {jornadas.map((j) => (
                    <option key={j} value={j}>{j}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-gray-300">
                  Curso <span className="text-red-500">*</span>
                </label>
                <select
                  value={cursoSeleccionado}
                  onChange={(e) => { setCursoSeleccionado(e.target.value); setIdEstudiante('') }}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  required
                  disabled={!jornadaSeleccionada}
                >
                  <option value="">
                    {jornadaSeleccionada ? 'Seleccionar curso...' : 'Primero selecciona una jornada'}
                  </option>
                  {cursosDeJornada.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-gray-300">
                  Estudiante <span className="text-red-500">*</span>
                </label>
                <select
                  value={idEstudiante}
                  onChange={(e) => setIdEstudiante(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  required
                  disabled={!cursoSeleccionado}
                >
                  <option value="">
                    {cursoSeleccionado ? 'Seleccionar estudiante...' : 'Primero selecciona un curso'}
                  </option>
                  {estudiantesFiltrados.map((e) => (
                    <option key={e.idEstudiante} value={e.idEstudiante}>
                      {e.nombreCompleto} — {e.codigoEstudiante}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Fecha */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 dark:text-gray-300">
              Fecha <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Estado */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-gray-300">
              Estado <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {ESTADOS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEstado(e)}
                  className={`py-2.5 rounded-xl text-xs font-semibold border-2 transition-all ${
                    estado === e
                      ? ESTADO_COLOR[e]
                      : 'border-slate-200 dark:border-white/10 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Observación */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 dark:text-gray-300">
              Observaciones <span className="text-slate-400 font-normal">(opcional)</span>
            </label>
            <textarea
              rows={3}
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              placeholder="Ej: llegó sin uniforme, presentó excusa médica..."
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-800 dark:text-white text-sm placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Error */}
          {formError && (
            <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-3 py-2 rounded-lg">
              {formError}
            </p>
          )}

          {/* Acciones */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
            >
              {saving ? 'Guardando...' : mode === 'create' ? 'Registrar' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
