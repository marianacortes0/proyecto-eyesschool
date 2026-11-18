import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

// Cámara falsa de Chromium para los E2E de escaneo QR (CP-SIS-032 a 036): un
// video MJPEG con la imagen del QR repetida, que Chromium reproduce en bucle.
// Firefox no tiene esa opción; estos specs corren solo en Chromium.

export const DIR_CAMARA = resolve('e2e/.camara')

export function camara(archivo: string) {
  return {
    permissions: ['camera'],
    launchOptions: {
      args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', `--use-file-for-fake-video-capture=${resolve(DIR_CAMARA, archivo)}`],
    },
  }
}

/** Escribe el MJPEG del QR con `texto` (la imagen la genera api.qrserver.com, el mismo servicio que usa la app). */
export async function videoDeQR(texto: string, archivo: string) {
  mkdirSync(DIR_CAMARA, { recursive: true })
  const r = await fetch(`https://api.qrserver.com/v1/create-qr-code/?size=480x480&format=jpg&margin=40&data=${encodeURIComponent(texto)}`)
  const jpg = Buffer.from(await r.arrayBuffer())
  writeFileSync(resolve(DIR_CAMARA, archivo), Buffer.concat(Array.from({ length: 30 }, () => jpg)))
}
