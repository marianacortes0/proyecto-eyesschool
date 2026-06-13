import { apiFetch } from '@/services/api/client'

export type EstadoAsistencia = 'Presente' | 'Ausente' | 'Tarde' | 'Excusa' | 'Suspensión'

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
  codigo_qr: string | null
  tipo: string | null
}

export type EstudianteSelector = {
  idEstudiante: number
  codigoEstudiante: string
  nombreCompleto: string
  curso: string | null
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

type AsistenciaRaw = {
  idAsistencia: number
  idEstudiante: number
  estado: string
  fecha: string
  fechaRegistro: string
  observacion: string | null
  registradoPor: number
  codigoQr: string | null
  tipo: string | null
}

type EstudianteRaw = {
  idEstudiante: number
  codigoEstudiante: string
  estado: string
  idCursoActual: number | null
  usuario?: { primerNombre: string; primerApellido: string; segundoNombre: string | null; segundoApellido: string | null }
  cursoActual?: { nombreCurso: string; jornada: string } | null
}

function buildNombre(u?: EstudianteRaw['usuario']): string {
  if (!u) return '—'
  return [u.primerNombre, u.segundoNombre, u.primerApellido, u.segundoApellido].filter(Boolean).join(' ')
}

export const getRegistros = async (filtros: FiltrosAsistencia = {}): Promise<RegistroAsistencia[]> => {
  const params = new URLSearchParams({ skip: '0', limit: '200' })
  if (filtros.idEstudiante) params.set('id_estudiante', String(filtros.idEstudiante))
  if (filtros.fecha) params.set('fecha', filtros.fecha)
  if (filtros.estado && filtros.estado !== 'todos') params.set('estado', filtros.estado)

  const data = await apiFetch<AsistenciaRaw[]>(`/asistencia?${params}`)

  const resultado: RegistroAsistencia[] = data.map(r => ({
    idAsistencia:     r.idAsistencia,
    idEstudiante:     r.idEstudiante,
    estado:           r.estado as EstadoAsistencia,
    fecha:            r.fecha,
    fechaRegistro:    r.fechaRegistro,
    observacion:      r.observacion,
    registradoPor:    r.registradoPor,
    nombreEstudiante: '—',
    codigoEstudiante: '—',
    curso:            null,
    codigo_qr:        r.codigoQr ?? null,
    tipo:             r.tipo ?? null,
  }))

  if (filtros.search) {
    const q = filtros.search.toLowerCase()
    return resultado.filter(r =>
      r.nombreEstudiante.toLowerCase().includes(q) ||
      r.codigoEstudiante.toLowerCase().includes(q)
    )
  }

  return resultado
}

export const getEstudiantesSelector = async (): Promise<EstudianteSelector[]> => {
  const data = await apiFetch<EstudianteRaw[]>('/estudiantes?estado=Activo&limit=500')
  return data.map(e => ({
    idEstudiante:     e.idEstudiante,
    codigoEstudiante: e.codigoEstudiante,
    nombreCompleto:   buildNombre(e.usuario),
    curso:            null,
    jornada:          null,
  }))
}

export const crearRegistro = async (data: CreateRegistroData): Promise<void> => {
  await apiFetch('/asistencia', {
    method: 'POST',
    body: JSON.stringify({
      id_estudiante:  data.idEstudiante,
      estado:         data.estado,
      fecha:          data.fecha,
      observacion:    data.observacion ?? null,
      registrado_por: data.registradoPor,
      tipo:           data.tipo,
    }),
  })
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
