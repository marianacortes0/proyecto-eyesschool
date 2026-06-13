import { apiFetch, getClientToken } from '@/services/api/client'

export type TipoQR = 'ingreso' | 'salida' | 'ambos'

export type EstudianteQR = {
  idEstudiante: number
  codigoEstudiante: string
  nombreCompleto: string
  curso: string | null
}

export type CodigoQRConEstudiante = EstudianteQR & {
  idCodigo: number
  tipo: TipoQR
  codigo: string
  activo: boolean
  fechaCreacion: string
  fechaVencimiento: string | null
  creadoPor: number | null
}

export type CreateCodigoQRData  = { idEstudiante: number; tipo: TipoQR; fechaVencimiento: string | null }
export type UpdateCodigoQRData  = { tipo?: TipoQR; fechaVencimiento?: string | null; activo?: boolean }

export type RegistroAsistencia = {
  idAsistencia: number
  idEstudiante: number
  estado: 'Presente' | 'Ausente' | 'Tarde' | 'Excusa' | 'Suspensión'
  fecha: string
  fechaRegistro: string
  observacion: string | null
  registradoPor: number
  nombreEstudiante: string
  codigoEstudiante: string
  codigo_qr: string | null
  tipo: string | null
}

export type CreateAsistenciaData = {
  idEstudiante: number
  estado: 'Presente' | 'Ausente' | 'Tarde' | 'Excusa' | 'Suspensión'
  fecha: string
  observacion?: string
  registradoPor: number
  codigo_qr?: string | null
  tipo?: string | null
}

export type UsuarioSinEstudiante = {
  idUsuario: number
  primerNombre: string
  primerApellido: string
  correo: string | null
  numeroDocumento: string
}

export type CursoSimple = { idCurso: number; nombreCurso: string }

// External QR image service — no backend change needed
export const getQRImageUrl = (codigoEstudiante: string, size = 200): string =>
  `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(codigoEstudiante)}&size=${size}x${size}&ecc=M&margin=2`

type EstRaw = Record<string, unknown>

function buildNombreFromRaw(e: EstRaw): string {
  const u = e.usuario as Record<string, unknown> | undefined
  if (!u) return '—'
  return [u.primerNombre, u.segundoNombre, u.primerApellido, u.segundoApellido]
    .filter(Boolean).join(' ')
}

export const getEstudiantesConQR = async (): Promise<EstudianteQR[]> => {
  const data = await apiFetch<EstRaw[]>('/estudiantes?estado=Activo&limit=500')
  return data.map(e => ({
    idEstudiante:     e.idEstudiante as number,
    codigoEstudiante: e.codigoEstudiante as string,
    nombreCompleto:   buildNombreFromRaw(e),
    curso:            null,
  }))
}

export const getEstudiantesParaSelector = getEstudiantesConQR

export const getCursosActivos = async (): Promise<CursoSimple[]> => {
  const data = await apiFetch<EstRaw[]>('/cursos?activo=true&limit=200')
  return data.map(c => ({
    idCurso:     c.idCurso as number,
    nombreCurso: c.nombreCurso as string,
  }))
}

export const getUsuariosSinEstudiante = async (): Promise<UsuarioSinEstudiante[]> => {
  const [usuarios, estudiantes] = await Promise.all([
    apiFetch<EstRaw[]>('/usuarios?id_rol=2&estado=true&limit=500'),
    apiFetch<EstRaw[]>('/estudiantes?limit=500'),
  ])
  const asignados = new Set(estudiantes.map(e => e.idUsuario as number))
  return usuarios
    .filter(u => !asignados.has(u.idUsuario as number))
    .map(u => ({
      idUsuario:       u.idUsuario as number,
      primerNombre:    u.primerNombre as string,
      primerApellido:  u.primerApellido as string,
      correo:          u.correo as string | null,
      numeroDocumento: u.numeroDocumento as string,
    }))
}

export const getCodigoQRByValue = async (codigoTexto: string): Promise<CodigoQRConEstudiante | null> => {
  try {
    // The FastAPI endpoint /asistencia/qr looks up by codigoEstudiante
    const data = await apiFetch<EstRaw[]>(`/estudiantes?codigo_estudiante=${encodeURIComponent(codigoTexto)}&estado=Activo&limit=1`)
    if (!data.length) return null
    const est = data[0]
    return {
      idCodigo:         est.idEstudiante as number,
      idEstudiante:     est.idEstudiante as number,
      tipo:             'ambos' as TipoQR,
      codigo:           est.codigoEstudiante as string,
      activo:           true,
      fechaCreacion:    new Date().toISOString(),
      fechaVencimiento: null,
      creadoPor:        null,
      nombreCompleto:   buildNombreFromRaw(est),
      codigoEstudiante: est.codigoEstudiante as string,
      curso:            null,
    }
  } catch {
    return null
  }
}

export const getMiCodigoQR = async (idUsuario?: number): Promise<CodigoQRConEstudiante | null> => {
  try {
    // If no idUsuario provided, read from the eys_user cookie
    let uid = idUsuario
    if (!uid && typeof document !== 'undefined') {
      const m = document.cookie.match(/(?:^|; )eys_user=([^;]*)/)
      if (m) {
        const u = JSON.parse(decodeURIComponent(m[1])) as { idUsuario: number }
        uid = u.idUsuario
      }
    }
    if (!uid) return null
    const students = await apiFetch<EstRaw[]>(`/estudiantes?id_usuario=${uid}&limit=1`)
    if (!students.length) return null
    const est = students[0]
    return {
      idCodigo:         est.idEstudiante as number,
      idEstudiante:     est.idEstudiante as number,
      tipo:             'ambos' as TipoQR,
      codigo:           est.codigoEstudiante as string,
      activo:           true,
      fechaCreacion:    new Date().toISOString(),
      fechaVencimiento: null,
      creadoPor:        null,
      nombreCompleto:   buildNombreFromRaw(est),
      codigoEstudiante: est.codigoEstudiante as string,
      curso:            null,
    }
  } catch {
    return null
  }
}

// External QR reader — unchanged
export const readQRFromImage = async (imageBlob: Blob): Promise<string | null> => {
  const formData = new FormData()
  formData.append('file', imageBlob, 'qr.jpg')
  const res = await fetch('https://api.qrserver.com/v1/read-qr-code/', {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) throw new Error('Error al contactar la API de lectura QR')
  const json = await res.json()
  const symbol = json?.[0]?.symbol?.[0]
  if (!symbol || symbol.error) return null
  return (symbol.data as string) ?? null
}

export const getRegistrosAsistencia = async (fecha?: string): Promise<RegistroAsistencia[]> => {
  const params = new URLSearchParams({ limit: '200' })
  if (fecha) params.set('fecha', fecha)
  const data = await apiFetch<EstRaw[]>(`/asistencia?${params}`)
  return data.map(r => ({
    idAsistencia:     r.idAsistencia as number,
    idEstudiante:     r.idEstudiante as number,
    estado:           r.estado as RegistroAsistencia['estado'],
    fecha:            r.fecha as string,
    fechaRegistro:    r.fechaRegistro as string,
    observacion:      r.observacion as string | null,
    registradoPor:    r.registradoPor as number,
    nombreEstudiante: '—',
    codigoEstudiante: '—',
    codigo_qr:        (r.codigoQr ?? r.codigo_qr) as string | null,
    tipo:             r.tipo as string | null,
  }))
}

export const createAsistencia = async (data: CreateAsistenciaData): Promise<void> => {
  await apiFetch('/asistencia', {
    method: 'POST',
    body: JSON.stringify({
      id_estudiante:  data.idEstudiante,
      estado:         data.estado,
      fecha:          data.fecha,
      observacion:    data.observacion ?? null,
      registrado_por: data.registradoPor,
      codigo_qr:      data.codigo_qr ?? null,
      tipo:           data.tipo      ?? null,
    }),
  })
}

export const updateAsistencia = async (
  id: number,
  data: { estado?: RegistroAsistencia['estado']; observacion?: string | null; fecha?: string }
): Promise<void> => {
  await apiFetch(`/asistencia/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export const deleteAsistencia = async (id: number): Promise<void> => {
  await apiFetch(`/asistencia/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ activo: false }),
  })
}
