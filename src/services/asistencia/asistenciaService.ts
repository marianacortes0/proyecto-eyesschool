import { ApiError, apiFetch } from '@/services/api/client'

export type EstadoAsistencia = 'Presente' | 'Ausente' | 'Tarde' | 'Excusa' | 'Suspensión'

const ESTADOS_VALIDOS: EstadoAsistencia[] = ['Presente', 'Ausente', 'Tarde', 'Excusa', 'Suspensión']

/**
 * Normaliza el estado recibido del backend a uno del enum, tolerando variantes
 * ('presente'|'asistio'|1 → 'Presente', etc.). Así el filtro por estado coincide
 * exactamente sin importar cómo lo almacene la BD.
 */
export function normalizeEstado(raw: unknown): EstadoAsistencia {
  if (raw == null) return 'Ausente'
  const s = String(raw).trim().toLowerCase()
  if (['presente', 'asistio', 'asistió', 'presencial', '1'].includes(s)) return 'Presente'
  if (['tarde', 'retardo', '2'].includes(s)) return 'Tarde'
  if (['ausente', 'falta', 'inasistencia', '0'].includes(s)) return 'Ausente'
  if (['excusa', 'excusado', 'justificado'].includes(s)) return 'Excusa'
  if (['suspension', 'suspensión', 'suspendido'].includes(s)) return 'Suspensión'
  return ESTADOS_VALIDOS.find(e => e.toLowerCase() === s) ?? 'Ausente'
}

/**
 * Normaliza el tipo de marcación. El QR guarda 'ingreso'/'ambos' y otras fuentes
 * pueden usar 1/2, pero la tabla muestra 'entrada'/'salida'.
 */
export function normalizeTipo(raw: unknown): 'entrada' | 'salida' | null {
  if (raw == null || raw === '') return null
  const s = String(raw).trim().toLowerCase()
  if (['salida', 'egreso', 'out', '2'].includes(s)) return 'salida'
  if (['entrada', 'ingreso', 'ambos', 'in', '1'].includes(s)) return 'entrada'
  return null
}

export type RegistroAsistencia = {
  idAsistencia: number
  idEstudiante: number
  estado: EstadoAsistencia
  fecha: string
  fechaRegistro: string
  observacion: string | null
  registradoPor: number
  nombreEstudiante: string
  codigoEstudiante: string
  curso: string | null
  jornada: string | null
  codigo_qr: string | null
  tipo: string | null
}

export type EstudianteSelector = {
  idEstudiante: number
  codigoEstudiante: string
  nombreCompleto: string
  curso: string | null
  jornada: string | null
  idCurso: number | null
}

export type CursoOption = {
  idCurso: number
  nombreCurso: string
  jornada: string | null
}

export type TipoAsistencia = 'entrada' | 'salida'

export type CreateRegistroData = {
  idEstudiante: number
  estado: EstadoAsistencia
  fecha: string
  observacion?: string | null
  registradoPor: number
  tipo: TipoAsistencia
}

export type UpdateRegistroData = {
  estado?: EstadoAsistencia
  fecha?: string
  observacion?: string | null
  tipo?: TipoAsistencia
}

export type FiltrosAsistencia = {
  fecha?: string
  estado?: EstadoAsistencia | 'todos'
  search?: string
  idEstudiante?: number
}

export const actualizarRegistro = async (id: number, data: UpdateRegistroData): Promise<void> => {
  await apiFetch(`/asistencia/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      estado:      data.estado,
      fecha:       data.fecha,
      observacion: data.observacion,
      tipo:        data.tipo,
    }),
  })
}

export const eliminarRegistro = async (id: number): Promise<void> => {
  await apiFetch(`/asistencia/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ activo: false }),
  })
}

// ── Registro masivo (WEB-06) ──────────────────────────────────────────────────

export type RegistroMasivoItem = { idEstudiante: number; estado: EstadoAsistencia }

export type RegistroFallido = { idEstudiante: number; motivo: string }

/** Resultado de un lote: quién se guardó, quién ya estaba registrado y quién falló. */
export type RegistroMasivoResult = {
  guardados: number[]
  duplicados: number[]
  fallidos: RegistroFallido[]
}

/**
 * Clasifica, por estudiante, lo que respondió la API. Un 409 (BE-08: ya tiene
 * registro ese día) va a `duplicados`; cualquier otro error, a `fallidos`.
 * `resultados[i]` corresponde a `items[i]`.
 */
export function clasificarResultados(
  items: RegistroMasivoItem[],
  resultados: PromiseSettledResult<unknown>[]
): RegistroMasivoResult {
  const salida: RegistroMasivoResult = { guardados: [], duplicados: [], fallidos: [] }
  resultados.forEach((r, i) => {
    const idEstudiante = items[i].idEstudiante
    if (r.status === 'fulfilled') {
      salida.guardados.push(idEstudiante)
    } else if (r.reason instanceof ApiError && r.reason.status === 409) {
      salida.duplicados.push(idEstudiante)
    } else {
      salida.fallidos.push({
        idEstudiante,
        motivo: r.reason instanceof Error && r.reason.message ? r.reason.message : 'Error desconocido',
      })
    }
  })
  return salida
}

/** Deja del lote original solo a los estudiantes que fallaron (con su estado). */
export function itemsParaReintento(items: RegistroMasivoItem[], fallidos: RegistroFallido[]): RegistroMasivoItem[] {
  const ids = new Set(fallidos.map((f) => f.idEstudiante))
  return items.filter((it) => ids.has(it.idEstudiante))
}
