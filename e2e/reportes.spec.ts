import { expect, test } from '@playwright/test'
import { iniciarSesion } from './utils'
import { apiQA, borrarQA, conApiCaida, hoy, requiereApiFallas, restaurarApiAlTerminar, sinTextoTecnico } from './qa'

// WC-05 · reportes: CP-SIS-056 (crear un reporte de asistencia con un PDF y
// descargarlo) y 057 (filtro sin datos; API caída). El reporte se borra al final.

restaurarApiAlTerminar()

const NOMBRE = `E2E Reporte ${Date.now()}`

test.afterAll(async () => {
  const reportes = await apiQA<{ id_reporte: number; nombre_reporte: string }[]>('/reportes?limit=500')
  for (const r of reportes.filter((r) => r.nombre_reporte === NOMBRE)) await borrarQA(`/reportes/${r.id_reporte}`)
})

/** Un PDF mínimo y válido de una página. */
function pdfDePrueba(): Buffer {
  const cuerpo = ['%PDF-1.4', '1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj', '2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj',
    '3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 200 200]>>endobj', 'trailer<</Root 1 0 R>>', '%%EOF'].join('\n')
  return Buffer.from(cuerpo)
}

test('CP-SIS-056 · el admin crea un reporte de asistencia con un PDF y lo descarga', async ({ page }) => {
  await iniciarSesion(page, 'admin')
  await page.goto('/reportes')
  await page.getByRole('button', { name: '+ Nuevo reporte' }).click()

  const form = page.locator('form').filter({ has: page.getByPlaceholder('Ej: Asistencia Primer Trimestre 2026') })
  await form.getByPlaceholder('Ej: Asistencia Primer Trimestre 2026').fill(NOMBRE)
  await form.locator('select').first().selectOption('Asistencia')
  const fechas = form.locator('input[type="date"]')
  await fechas.nth(0).fill('2026-11-01')
  await fechas.nth(1).fill(hoy())
  await form.locator('input[type="file"]').setInputFiles({ name: 'asistencia-e2e.pdf', mimeType: 'application/pdf', buffer: pdfDePrueba() })
  await expect(form.getByText('Subiendo archivo…')).toHaveCount(0, { timeout: 60_000 })
  await form.getByRole('button', { name: 'Crear' }).click()
  await expect(page.getByText('Reporte generado correctamente').first()).toBeVisible({ timeout: 30_000 })

  const tarjeta = page.locator('main').locator('div').filter({ hasText: NOMBRE }).filter({ has: page.getByRole('button', { name: 'Descargar' }) }).last()
  await expect(tarjeta).toContainText('Asistencia')
  await expect(tarjeta).toContainText(/Pendiente|Generado|Completado/)

  const descarga = page.waitForEvent('download')
  await tarjeta.getByRole('button', { name: 'Descargar' }).click()
  const archivo = await descarga
  const ruta = await archivo.path()
  const { readFileSync } = await import('node:fs')
  expect(readFileSync(ruta).subarray(0, 5).toString()).toBe('%PDF-')
})

test('CP-SIS-057 · un filtro sin datos muestra un aviso', async ({ page }) => {
  await iniciarSesion(page, 'admin')
  await page.goto('/reportes')
  await page.getByPlaceholder('Buscar por nombre...').fill(`no-existe-${Date.now()}`)
  await expect(page.getByText('No hay reportes que coincidan con los filtros.')).toBeVisible()
})

test('CP-SIS-057 · con la API caída los reportes avisan y dejan reintentar', async ({ page }) => {
  requiereApiFallas()
  await iniciarSesion(page, 'admin')
  const aviso = page.getByRole('alert').filter({ hasText: /no se pudo/i })
  await conApiCaida(async () => {
    await page.goto('/reportes')
    await expect(aviso).toBeVisible({ timeout: 60_000 })
    await sinTextoTecnico(page)
    await expect(page.getByText(/^0 reportes en total$/)).toHaveCount(0)
  })
  await page.getByRole('button', { name: 'Reintentar' }).click()
  await expect(aviso).toHaveCount(0, { timeout: 30_000 })
})
