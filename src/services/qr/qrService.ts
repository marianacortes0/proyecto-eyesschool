import jsQR from 'jsqr'

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

export type Pixeles = { data: Uint8ClampedArray; width: number; height: number }

/** Decodifica un QR a partir de los píxeles RGBA de una imagen; null si no hay QR. */
export const decodificarQR = (pixeles: Pixeles): string | null => {
  const qr = jsQR(pixeles.data, pixeles.width, pixeles.height, { inversionAttempts: 'attemptBoth' })
  return qr?.data ? qr.data : null
}

const MSG_IMAGEN = 'No se pudo procesar la imagen de la cámara. Intente nuevamente.'

async function pixelesDe(imagen: Blob): Promise<Pixeles> {
  try {
    const bitmap = await createImageBitmap(imagen)
    const { width, height } = bitmap
    const canvas: OffscreenCanvas | HTMLCanvasElement =
      typeof OffscreenCanvas === 'undefined'
        ? Object.assign(document.createElement('canvas'), { width, height })
        : new OffscreenCanvas(width, height)
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null
    if (!ctx) throw new Error('sin contexto 2d')
    ctx.drawImage(bitmap, 0, 0)
    bitmap.close?.()
    return ctx.getImageData(0, 0, width, height)
  } catch {
    throw new Error(MSG_IMAGEN)
  }
}

// DEF-WEB-16: el QR se lee en el navegador con jsQR. Antes cada foto de la cámara
// se enviaba a api.qrserver.com, que dejó de aceptar imágenes (400) y además
// recibía datos de los estudiantes. El resto del acceso a datos vive en qrActions.ts.
export const readQRFromImage = async (imageBlob: Blob): Promise<string | null> =>
  decodificarQR(await pixelesDe(imageBlob))
