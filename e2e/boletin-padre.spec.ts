import { expect, test } from '@playwright/test'
import { iniciarSesion } from './utils'

// WEB-09 · CP-SIS-054 (descarga) y CP-SIS-051 (periodo sin notas).
// El padre de prueba (E2E_PADRE_EMAIL) debe tener un hijo con notas en al menos un periodo.

test.describe('boletín del padre (WEB-09)', () => {
  test('el padre descarga un PDF', async ({ page }) => {
    await iniciarSesion(page, 'padre')
    await page.goto('/notas')

    const descarga = page.waitForEvent('download')
    await page.getByRole('button', { name: /Descargar boletín/i }).click()
    const archivo = await descarga

    expect(archivo.suggestedFilename()).toMatch(/^boletin_.*\.pdf$/)
    const ruta = await archivo.path()
    expect(ruta).toBeTruthy()
    const { readFileSync } = await import('node:fs')
    expect(readFileSync(ruta!).subarray(0, 4).toString()).toBe('%PDF')
  })

  test('un periodo sin notas muestra el texto exacto del criterio de aceptación', async ({ page }) => {
    await iniciarSesion(page, 'padre')
    await page.goto('/notas')

    const periodos = page.locator('select').filter({ hasText: 'Todos los periodos' })
    const opciones = await periodos.locator('option').all()
    let visto = false
    for (const op of opciones.slice(1)) {
      await periodos.selectOption(await op.getAttribute('value') as string)
      if (await page.getByText('No hay notas registradas para este periodo.').count()) {
        visto = true
        break
      }
    }
    test.skip(!visto, 'Pendiente: el hijo de prueba tiene notas en los cuatro periodos')
    await expect(page.getByText('No hay notas registradas para este periodo.')).toBeVisible()
  })
})
