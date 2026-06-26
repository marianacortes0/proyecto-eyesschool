import { apiFetch, getClientToken } from '@/services/api/client'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

export type Nota = {
  idNota: number
  nota: number
  observacion: string | null
  fechaRegistro: string
  idEstudiante: number
  idMateria: number
  idPeriodo: number
  registradoPor: number
  nombreEstudiante?: string
  codigoEstudiante?: string
  nombreMateria?: string
}

export const PERIODOS: Record<number, string> = {
  1: 'Periodo 1',
  2: 'Periodo 2',
  3: 'Periodo 3',
  4: 'Periodo 4',
}

export const NOTA_MIN = 0
export const NOTA_MAX = 5
export const NOTA_APROBACION = 3

export function notaColor(nota: number): string {
  if (nota >= 4.5) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
  if (nota >= NOTA_APROBACION) return 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300'
  if (nota >= 2) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300'
  return 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300'
}

export async function getNotas(): Promise<Nota[]> {
  const data = await apiFetch<Record<string, unknown>[]>('/notas?limit=500')
  return data.map(r => ({
    idNota:        r.idNota as number,
    nota:          Number(r.nota),
    observacion:   r.observacion as string | null,
    fechaRegistro: r.fechaRegistro as string,
    idEstudiante:  r.idEstudiante as number,
    idMateria:     r.idMateria as number,
    idPeriodo:     r.idPeriodo as number,
    registradoPor: r.registradoPor as number,
    codigoEstudiante: `EST${String(r.idEstudiante).padStart(3, '0')}`,
    nombreEstudiante:  `Estudiante #${r.idEstudiante}`,
    nombreMateria:     `Materia #${r.idMateria}`,
  }))
}

export async function getCursosParaNotas() {
  // Sin filtro `activo` (ver getCursosAction): un estudiante puede estar en un
  // curso inactivo; así su curso sigue apareciendo en el desplegable.
  const data = await apiFetch<Record<string, unknown>[]>('/cursos?limit=200')
  return data.map(c => ({
    idCurso:     c.idCurso as number,
    nombreCurso: c.nombreCurso as string,
    grado:       c.grado as string,
    jornada:     c.jornada as string,
  }))
}

export async function getEstudiantesParaNotas() {
  // Sin filtro `estado` (ver getEstudiantesAction): el backend lo compara exacto
  // y sensible a mayúsculas, y el campo no es confiable. Así Notas muestra los
  // mismos estudiantes que el módulo Usuarios.
  const data = await apiFetch<Record<string, unknown>[]>('/estudiantes?limit=500')
  return data.map(e => ({
    idEstudiante:  e.idEstudiante as number,
    codigoEstudiante: e.codigoEstudiante as string,
    idCursoActual: (e.idCursoActual as number | null) ?? null,
    nombre: `Estudiante #${e.idEstudiante}`,
  }))
}

export async function getMateriasParaNotas() {
  const data = await apiFetch<Record<string, unknown>[]>('/materias?activa=true&limit=200')
  return data.map(m => ({
    idMateria:     m.idMateria as number,
    nombreMateria: m.nombreMateria as string,
  }))
}

export async function createNota(
  payload: Pick<Nota, 'idEstudiante' | 'idMateria' | 'idPeriodo' | 'nota' | 'observacion' | 'registradoPor'>
): Promise<void> {
  await apiFetch('/notas', {
    method: 'POST',
    body: JSON.stringify({
      id_estudiante:  payload.idEstudiante,
      id_materia:     payload.idMateria,
      id_periodo:     payload.idPeriodo,
      nota:           payload.nota,
      observacion:    payload.observacion ?? null,
      registrado_por: payload.registradoPor,
    }),
  })
}

export async function updateNota(
  idNota: number,
  payload: Partial<Pick<Nota, 'nota' | 'observacion' | 'idPeriodo' | 'idMateria'>>
): Promise<void> {
  const body: Record<string, unknown> = {}
  if (payload.nota      !== undefined) body.nota       = payload.nota
  if (payload.observacion !== undefined) body.observacion = payload.observacion
  if (payload.idPeriodo !== undefined) body.id_periodo = payload.idPeriodo
  if (payload.idMateria !== undefined) body.id_materia = payload.idMateria
  await apiFetch(`/notas/${idNota}`, { method: 'PUT', body: JSON.stringify(body) })
}

export async function deleteNota(idNota: number): Promise<void> {
  await apiFetch(`/notas/${idNota}`, { method: 'DELETE' })
}

/**
 * Descarga el boletín en PDF de un estudiante (todas sus notas agrupadas por
 * periodo). Va autenticado con el token de acceso y fuerza la descarga del archivo.
 */
export async function downloadBoletinPdf(idEstudiante: number, nombre?: string): Promise<void> {
  const token = getClientToken()
  const res = await fetch(`${API_BASE}/notas/estudiantes/${idEstudiante}/boletin/pdf`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!res.ok) {
    let msg = `HTTP ${res.status}`
    try { msg = ((await res.json()) as { detail?: string }).detail ?? msg } catch {}
    throw new Error(msg)
  }

  const blob = await res.blob()
  const safe = (nombre ?? `estudiante_${idEstudiante}`).replace(/[^a-zA-Z0-9-_]+/g, '_')
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `boletin_${safe}.pdf`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
