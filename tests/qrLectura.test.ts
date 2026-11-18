// DEF-WEB-16: el escaneo QR de la web enviaba cada foto a api.qrserver.com, que
// rechaza las imágenes (400). Ahora el QR se decodifica en el navegador con jsQR:
// estas pruebas usan QR reales generados con `qrcode` y no tocan la red.
import QRCode from 'qrcode'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { decodificarQR, readQRFromImage } from '@/services/qr/qrService'

/** Pinta un QR como RGBA (negro sobre blanco), como lo daría un canvas. */
function pixelesDeQR(texto: string, escala = 4, margen = 4) {
  const { modules } = QRCode.create(texto, { errorCorrectionLevel: 'M' })
  const lado = (modules.size + margen * 2) * escala
  const data = new Uint8ClampedArray(lado * lado * 4).fill(255)
  for (let y = 0; y < lado; y++) {
    for (let x = 0; x < lado; x++) {
      const my = Math.floor(y / escala) - margen
      const mx = Math.floor(x / escala) - margen
      const oscuro = mx >= 0 && my >= 0 && mx < modules.size && my < modules.size && modules.get(my, mx)
      if (oscuro) {
        const i = (y * lado + x) * 4
        data[i] = data[i + 1] = data[i + 2] = 0
      }
    }
  }
  return { data, width: lado, height: lado }
}

/** Simula createImageBitmap y OffscreenCanvas para que la imagen dé esos píxeles. */
function navegadorCon(pixeles: { data: Uint8ClampedArray; width: number; height: number }) {
  const fetchEspia = vi.fn()
  vi.stubGlobal('fetch', fetchEspia)
  vi.stubGlobal('createImageBitmap', vi.fn(async () => ({ width: pixeles.width, height: pixeles.height, close: vi.fn() })))
  vi.stubGlobal(
    'OffscreenCanvas',
    class {
      constructor(public width: number, public height: number) {}
      getContext() {
        return { drawImage: vi.fn(), getImageData: () => pixeles }
      }
    }
  )
  return fetchEspia
}

afterEach(() => vi.unstubAllGlobals())

describe('DEF-WEB-16 · lectura del QR en el navegador', () => {
  it('decodificarQR lee el código de un QR real', () => {
    expect(decodificarQR(pixelesDeQR('EST-2024-0001'))).toBe('EST-2024-0001')
  })

  it('decodificarQR devuelve null si la imagen no tiene un QR', () => {
    const blanco = { data: new Uint8ClampedArray(100 * 100 * 4).fill(255), width: 100, height: 100 }
    expect(decodificarQR(blanco)).toBeNull()
  })

  it('readQRFromImage lee la foto sin enviarla a ningún servicio externo', async () => {
    const fetchEspia = navegadorCon(pixelesDeQR('SYN0101'))

    expect(await readQRFromImage(new Blob(['jpeg']))).toBe('SYN0101')
    expect(fetchEspia).not.toHaveBeenCalled()
  })

  it('readQRFromImage devuelve null si la foto no tiene un QR', async () => {
    navegadorCon({ data: new Uint8ClampedArray(64 * 64 * 4).fill(255), width: 64, height: 64 })

    expect(await readQRFromImage(new Blob(['jpeg']))).toBeNull()
  })

  it('readQRFromImage avisa con un mensaje claro si la foto no se puede abrir', async () => {
    vi.stubGlobal('createImageBitmap', vi.fn(async () => { throw new Error('InvalidStateError') }))

    await expect(readQRFromImage(new Blob(['x']))).rejects.toThrow('No se pudo procesar la imagen de la cámara')
  })
})
