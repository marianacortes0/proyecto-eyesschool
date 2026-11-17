import { expect, test } from '@playwright/test'
import { iniciarSesion } from './utils'
import { conApiCaida, requiereApiFallas, restaurarApiAlTerminar, sinTextoTecnico } from './qa'

// WC-06 · casos de docs/pruebas-manuales-pr06-web.md que se pueden automatizar:
// bloque 5 (API caída al descargar el boletín) y bloque 4 (permiso de cámara negado).
// El login y /notas con la API caída están en login-errores.spec.ts (CP-SIS-005)
// y en los casos de «API caída» de cada módulo.

restaurarApiAlTerminar()

test('WC-06 bloque 5 · con la API caída, descargar el boletín avisa y no baja un archivo dañado', async ({ page }) => {
  requiereApiFallas()
  await iniciarSesion(page, 'padre')
  await page.goto('/notas')
  const boton = page.getByRole('button', { name: /descargar boletín/i })
  await expect(boton).toBeVisible()

  let descargas = 0
  page.on('download', () => descargas++)
  await conApiCaida(async () => {
    await boton.click()
    await expect(page.locator('.Toastify__toast, [role="alert"]').filter({ hasText: /boletín|no se pudo|intenta/i }).first()).toBeVisible({ timeout: 60_000 })
    await sinTextoTecnico(page)
  })
  expect(descargas, 'no se descarga ningún archivo').toBe(0)
})

test.describe('cámara sin permiso', () => {
  // Sin la cámara falsa ni el permiso: Chromium sin interfaz niega el acceso.
  test.use({ permissions: [] })

  test('WC-06 bloque 4 · si se niega la cámara, el escáner lo dice con claridad', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Se revisa una vez (Chromium)')
    await iniciarSesion(page, 'docente')
    await page.goto('/qr/escanear')
    await page.getByRole('button', { name: /Activar cámara/ }).click()
    await expect(page.getByText('No se pudo acceder a la cámara. Verifica los permisos del navegador.')).toBeVisible({ timeout: 30_000 })
    await sinTextoTecnico(page)
  })
})
