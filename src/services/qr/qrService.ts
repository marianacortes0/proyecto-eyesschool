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

// External QR reader — unchanged. El resto del acceso a datos vive en qrActions.ts
// (server actions con toCamel); las funciones de fetch de este módulo quedaron
// obsoletas y se eliminaron.
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
