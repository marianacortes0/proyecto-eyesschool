import { apiFetch } from '@/services/api/client'

export type CursoOpt = { idCurso: number; nombreCurso: string; grado: string; jornada: string }
export type EstudianteOpt = { idEstudiante: number; nombre: string; codigo: string; idCursoActual: number | null }

export type Novedad = {
  idNovedad: number
  fecha: string
  descripcion: string
  estado: string
  accionTomada: string | null
  fechaResolucion: string | null
  idEstudiante: number
  idTipoNovedad: number
  registradoPor: number
  nombreEstudiante?: string
  codigoEstudiante?: string
  nombreTipo?: string
  nivelGravedad?: string
}

export type TipoNovedad = {
  idTipoNovedad: number
  nombreTipo: string
  nivelGravedad: string
  requiereAccion: boolean
  activo: boolean
}

export const ESTADOS_NOVEDAD = ['Pendiente', 'Completado'] as const

export async function getCursosParaNovedades(): Promise<CursoOpt[]> {
  const data = await apiFetch<Record<string, unknown>[]>('/cursos?activo=true&limit=200')
  return data.map(c => ({
    idCurso:     c.idCurso as number,
    nombreCurso: c.nombreCurso as string,
    grado:       c.grado as string,
    jornada:     c.jornada as string,
  }))
}

export async function getEstudiantesParaNovedades(): Promise<EstudianteOpt[]> {
  const data = await apiFetch<Record<string, unknown>[]>('/estudiantes?limit=500')
  return data.map(e => ({
    idEstudiante:  e.idEstudiante as number,
    nombre:        `Estudiante #${e.idEstudiante}`,
    codigo:        e.codigoEstudiante as string,
    idCursoActual: (e.idCursoActual as number | null) ?? null,
  }))
}

export async function getNovedades(): Promise<Novedad[]> {
  const data = await apiFetch<Record<string, unknown>[]>('/novedades?limit=500')
  return data.map(r => ({
    idNovedad:       r.idNovedad as number,
    fecha:           r.fecha as string,
    descripcion:     r.descripcion as string,
    estado:          r.estado as string,
    accionTomada:    r.accionTomada as string | null,
    fechaResolucion: r.fechaResolucion as string | null,
    idEstudiante:    r.idEstudiante as number,
    idTipoNovedad:   r.idTipoNovedad as number,
    registradoPor:   r.registradoPor as number,
    codigoEstudiante: `EST${String(r.idEstudiante).padStart(3, '0')}`,
    nombreEstudiante: `Estudiante #${r.idEstudiante}`,
    nombreTipo:       '',
    nivelGravedad:    '',
  }))
}

export async function getTiposNovedad(): Promise<TipoNovedad[]> {
  const data = await apiFetch<Record<string, unknown>[]>('/tipos-novedad?limit=200')
  return data.map(t => ({
    idTipoNovedad:  t.idTipoNovedad as number,
    nombreTipo:     t.nombreTipo as string,
    nivelGravedad:  t.nivelGravedad as string,
    requiereAccion: t.requiereAccion as boolean,
    activo:         t.activo as boolean,
  }))
}

export async function createNovedad(
  payload: Pick<Novedad, 'descripcion' | 'idEstudiante' | 'idTipoNovedad' | 'registradoPor'>
): Promise<void> {
  await apiFetch('/novedades', {
    method: 'POST',
    body: JSON.stringify({
      descripcion:    payload.descripcion,
      id_estudiante:  payload.idEstudiante,
      id_tipo_novedad: payload.idTipoNovedad,
      registrado_por: payload.registradoPor,
    }),
  })
}

export async function updateNovedad(
  idNovedad: number,
  payload: Partial<Pick<Novedad, 'descripcion' | 'estado' | 'accionTomada' | 'fechaResolucion' | 'idTipoNovedad'>>
): Promise<void> {
  const body: Record<string, unknown> = {}
  if (payload.descripcion     !== undefined) body.descripcion       = payload.descripcion
  if (payload.estado          !== undefined) body.estado            = payload.estado
  if (payload.accionTomada    !== undefined) body.accion_tomada     = payload.accionTomada
  if (payload.fechaResolucion !== undefined) body.fecha_resolucion  = payload.fechaResolucion
  if (payload.idTipoNovedad   !== undefined) body.id_tipo_novedad   = payload.idTipoNovedad
  await apiFetch(`/novedades/${idNovedad}`, { method: 'PUT', body: JSON.stringify(body) })
}

export async function deleteNovedad(idNovedad: number): Promise<void> {
  await apiFetch(`/novedades/${idNovedad}`, { method: 'DELETE' })
}
