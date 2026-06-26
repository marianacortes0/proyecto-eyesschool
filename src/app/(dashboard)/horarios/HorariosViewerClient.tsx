'use client'

import { useMemo } from 'react'
import { type HorarioAsociadoBootstrap, type HorarioViewer } from '@/services/asociado/asociadoActions'
import { DIAS_SEMANA } from '@/services/horarios/horariosService'

// Mismo lenguaje visual que la grilla de admin (HorariosClient): acento por
// materia + cabecera de día con color.
const BLOQUE_COLORES = [
  'border-l-4 border-blue-400 bg-blue-50/60 dark:bg-blue-500/10',
  'border-l-4 border-violet-400 bg-violet-50/60 dark:bg-violet-500/10',
  'border-l-4 border-emerald-400 bg-emerald-50/60 dark:bg-emerald-500/10',
  'border-l-4 border-orange-400 bg-orange-50/60 dark:bg-orange-500/10',
  'border-l-4 border-rose-400 bg-rose-50/60 dark:bg-rose-500/10',
  'border-l-4 border-amber-400 bg-amber-50/60 dark:bg-amber-500/10',
  'border-l-4 border-cyan-400 bg-cyan-50/60 dark:bg-cyan-500/10',
  'border-l-4 border-fuchsia-400 bg-fuchsia-50/60 dark:bg-fuchsia-500/10',
]
const colorPorMateria = (idMateria: number) => BLOQUE_COLORES[idMateria % BLOQUE_COLORES.length]

const DIA_HEADER: Record<string, string> = {
  Lunes:      'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300',
  Martes:     'bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300',
  Miércoles:  'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  Jueves:     'bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-300',
  Viernes:    'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300',
  Sábado:     'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300',
}

// Normaliza el día del backend (puede venir sin tilde) al rótulo canónico.
function normalizaDia(dia: string): string {
  const d = dia.trim().toLowerCase()
  if (d.startsWith('lun')) return 'Lunes'
  if (d.startsWith('mar')) return 'Martes'
  if (d.startsWith('mie') || d.startsWith('mié')) return 'Miércoles'
  if (d.startsWith('jue')) return 'Jueves'
  if (d.startsWith('vie')) return 'Viernes'
  if (d.startsWith('sab') || d.startsWith('sáb')) return 'Sábado'
  return dia
}

const hhmm = (t: string) => (t ? t.slice(0, 5) : '—')

/**
 * Horario en SOLO LECTURA del estudiante asociado (padre → su hijo; estudiante →
 * él mismo). Reutiliza el MISMO diseño de grilla semanal que la vista de admin,
 * pero acotado al curso del estudiante y sin acciones de gestión.
 */
export default function HorariosViewerClient({ info, curso, horarios }: HorarioAsociadoBootstrap) {
  // Día canónico para casar con DIAS_SEMANA / DIA_HEADER.
  const bloques = useMemo(
    () => horarios.map(h => ({ ...h, dia: normalizaDia(h.dia) })),
    [horarios]
  )

  return (
    <div className="space-y-6">
      {/* Encabezado (mismo estilo que admin) */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Horarios</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {info ? info.nombre : 'Estudiante'}
          {curso && (
            <>
              {' · '}
              <span className="font-semibold text-slate-600 dark:text-slate-300">{curso.nombreCurso}</span>
              {curso.grado ? ` — ${curso.grado}` : ''}
              {curso.jornada && <span className="capitalize"> · {curso.jornada}</span>}
            </>
          )}
          {' · '}
          {bloques.length} bloque{bloques.length !== 1 ? 's' : ''}
        </p>
      </div>

      {!info ? (
        <div className="px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-300 text-sm">
          No encontramos un estudiante asociado a tu cuenta.
        </div>
      ) : !curso ? (
        <div className="px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-300 text-sm">
          El estudiante aún no está asignado a un curso.
        </div>
      ) : bloques.length === 0 ? (
        <div className="text-center py-16 text-slate-400 dark:text-slate-500 text-sm">
          No hay horarios registrados para este curso.
        </div>
      ) : (
        <>
          <HorarioGrid horarios={bloques} />

          {/* Tabla resumen (misma estética que admin, sin columnas de gestión) */}
          <details className="group">
            <summary className="cursor-pointer text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white select-none list-none flex items-center gap-2">
              <span className="group-open:rotate-90 transition-transform inline-block">▶</span>
              Ver todos los bloques ({bloques.length})
            </summary>
            <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide">
                    <th className="px-4 py-3 text-left">Día</th>
                    <th className="px-4 py-3 text-left">Horario</th>
                    <th className="px-4 py-3 text-left">Materia</th>
                    <th className="px-4 py-3 text-left">Salón</th>
                  </tr>
                </thead>
                <tbody>
                  {bloques.map(h => (
                    <tr key={h.idHorario} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${DIA_HEADER[h.dia] ?? 'bg-slate-100 text-slate-600'}`}>
                          {h.dia}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap font-mono text-xs text-slate-600 dark:text-slate-300">
                        {hhmm(h.horaInicio)} – {hhmm(h.horaFin)}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800 dark:text-white">{h.nombreMateria}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{h.salon || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </>
      )}
    </div>
  )
}

// ── Grilla semanal (mismo diseño que la grilla de admin, en solo lectura) ──────

function HorarioGrid({ horarios }: { horarios: HorarioViewer[] }) {
  // Slots únicos (horaInicio+horaFin) ordenados.
  const slots: { inicio: string; fin: string }[] = []
  const slotKeys = new Set<string>()
  horarios.forEach(h => {
    const key = `${h.horaInicio}|${h.horaFin}`
    if (!slotKeys.has(key)) {
      slotKeys.add(key)
      slots.push({ inicio: h.horaInicio, fin: h.horaFin })
    }
  })
  slots.sort((a, b) => a.inicio.localeCompare(b.inicio))

  // Días con al menos un bloque.
  const diasActivos = DIAS_SEMANA.filter(d => horarios.some(h => h.dia === d))

  const lookup = (dia: string, inicio: string) =>
    horarios.find(h => h.dia === dia && h.horaInicio === inicio) ?? null

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[700px]">
        {/* Cabecera de días */}
        <div className="grid gap-2 mb-2" style={{ gridTemplateColumns: `80px repeat(${diasActivos.length}, 1fr)` }}>
          <div />
          {diasActivos.map(dia => (
            <div
              key={dia}
              className={`rounded-xl px-3 py-2 text-center text-xs font-bold uppercase tracking-wide ${DIA_HEADER[dia] ?? 'bg-slate-100 text-slate-600'}`}
            >
              {dia}
            </div>
          ))}
        </div>

        {/* Filas de slots */}
        <div className="space-y-2">
          {slots.map((slot, idx) => (
            <div
              key={`${slot.inicio}-${slot.fin}-${idx}`}
              className="grid gap-2 items-stretch"
              style={{ gridTemplateColumns: `80px repeat(${diasActivos.length}, 1fr)` }}
            >
              <div className="flex flex-col items-center justify-center py-2">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase">Bloque {idx + 1}</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono tabular-nums mt-0.5">{slot.inicio.slice(0, 5)}</span>
                <span className="text-[10px] text-slate-300 dark:text-slate-600 font-mono tabular-nums">{slot.fin.slice(0, 5)}</span>
              </div>

              {diasActivos.map(dia => {
                const h = lookup(dia, slot.inicio)
                if (!h) {
                  return (
                    <div key={dia} className="rounded-xl border border-dashed border-slate-200 dark:border-white/10 h-24 flex items-center justify-center text-slate-300 dark:text-slate-700 text-xs">
                      —
                    </div>
                  )
                }
                return (
                  <div
                    key={dia}
                    className={`relative rounded-xl border border-slate-100 dark:border-white/10 p-3 h-24 flex flex-col justify-between transition-all ${colorPorMateria(h.idMateria)}`}
                  >
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-slate-800 dark:text-white truncate leading-tight">{h.nombreMateria}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {h.horaInicio.slice(0, 5)} – {h.horaFin.slice(0, 5)}
                      </p>
                      {h.salon && (
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">Salón {h.salon}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
