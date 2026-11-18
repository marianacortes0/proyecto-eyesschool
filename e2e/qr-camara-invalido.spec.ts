import { expect, test } from '@playwright/test'
import { iniciarSesion } from './utils'
import { apiQA, hoy } from './qa'
import { camara, videoDeQR } from './camara'

// WC-05 · CP-SIS-033: un QR que no es de un estudiante muestra un error claro y
// no registra. Cámara falsa de Chromium (ver e2e/camara.ts).

test.use(camara('invalido.mjpeg'))

test.beforeAll(async ({ browserName }) => {
  test.skip(browserName !== 'chromium', 'La cámara falsa con archivo solo existe en Chromium')
  await videoDeQR('NO-ES-UN-ESTUDIANTE-E2E', 'invalido.mjpeg')
})

test('CP-SIS-033 · un QR inválido muestra un error claro y no registra', async ({ page }) => {
  const antes = (await apiQA<unknown[]>(`/asistencia?fecha=${hoy()}&limit=500`)).length
  await iniciarSesion(page, 'docente')
  await page.goto('/qr/escanear')
  await page.getByRole('button', { name: /Activar cámara/ }).click()
  await expect(page.locator('main video')).toBeVisible()
  await page.getByRole('button', { name: /Escanear$/ }).click()

  await expect(page.getByText('Código QR inválido').first()).toBeVisible({ timeout: 45_000 })
  await expect(page.getByRole('button', { name: /Registrar (Entrada|Salida)/ })).toHaveCount(0)
  expect((await apiQA<unknown[]>(`/asistencia?fecha=${hoy()}&limit=500`)).length).toBe(antes)
})
