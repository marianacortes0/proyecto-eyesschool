import { expect, test } from '@playwright/test'
import { iniciarSesion, requiere } from './utils'
import { apiQA, borrarQA, conApiCaida, requiereApiFallas, restaurarApiAlTerminar, sinTextoTecnico } from './qa'

// WC-05 · el padre consulta: CP-SIS-052 (asistencia del hijo), 053 (novedades)
// y 061 (padre sin hijos vinculados). 061 crea una cuenta de padre sin vínculo
// por la API y la borra al final.

restaurarApiAlTerminar()

type Registro = { fecha: string; tipo: string | null; activo?: boolean }

let correoSinHijos: string | null = null
test.afterAll(async () => {
  if (!correoSinHijos) return
  const usuarios = await apiQA<{ id_usuario: number; correo: string }[]>('/usuarios?limit=500')
  for (const u of usuarios.filter((u) => u.correo === correoSinHijos)) await borrarQA(`/usuarios/${u.id_usuario}`)
})

test('CP-SIS-052 · el padre ve la asistencia de su hijo por fecha y tipo', async ({ page }) => {
  requiere('E2E_PADRE_EMAIL')
  await iniciarSesion(page, 'padre')
  await page.goto('/asistencia')
  const selector = page.getByRole('combobox', { name: /estudiante/i })
  await expect(selector).toBeVisible()

  const id = Number(await selector.inputValue())
  const registros = (await apiQA<Registro[]>(`/estudiantes/${id}/asistencia?limit=500`)).filter((r) => r.activo !== false)
  const filas = page.locator('main table tbody tr')
  if (registros.length === 0) {
    await expect(page.getByText(/no hay registros|sin registros|no tiene registros/i).first()).toBeVisible()
  } else {
    await expect(filas.first()).toBeVisible()
    // Cada fila trae fecha y tipo (entrada/salida).
    await expect(filas.first()).toContainText(/\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2}/)
    await expect(filas.first()).toContainText(/entrada|salida|—/i)
  }
})

test('CP-SIS-052 · con la API caída la asistencia del hijo avisa y deja reintentar', async ({ page }) => {
  requiereApiFallas()
  await iniciarSesion(page, 'padre')
  const aviso = page.getByRole('alert').filter({ hasText: /no se pudo/i })
  await conApiCaida(async () => {
    await page.goto('/asistencia')
    await expect(aviso).toBeVisible({ timeout: 60_000 })
    await sinTextoTecnico(page)
  })
  await page.getByRole('button', { name: 'Reintentar' }).click()
  await expect(aviso).toHaveCount(0, { timeout: 30_000 })
})

test('CP-SIS-053 · el padre ve las novedades de su hijo, o un aviso si no tiene', async ({ page }) => {
  requiere('E2E_PADRE_EMAIL')
  await iniciarSesion(page, 'padre')
  await page.goto('/novedades')
  const selector = page.getByRole('combobox', { name: /estudiante/i })
  await expect(selector).toBeVisible()

  for (const opcion of await selector.locator('option').evaluateAll((os) => os.map((o) => (o as HTMLOptionElement).value))) {
    if (opcion !== (await selector.inputValue())) {
      await selector.selectOption(opcion)
      await expect(page).toHaveURL(new RegExp(`[?&]hijo=${opcion}`))
    }
    const novedades = await apiQA<unknown[]>(`/estudiantes/${opcion}/novedades?limit=500`)
    if (novedades.length === 0) await expect(page.getByText('No hay novedades registradas.')).toBeVisible()
    else await expect(page.locator('main table tbody tr, main li').first()).toBeVisible()
  }
})

test('CP-SIS-061 · un padre sin hijos vinculados ve «No hay estudiantes vinculados»', async ({ page }) => {
  requiere('E2E_PASSWORD')
  const correo = `padre.e2e.${Date.now()}@example.com`
  correoSinHijos = correo
  await apiQA('/usuarios', {
    method: 'POST',
    body: JSON.stringify({
      correo, password: process.env.E2E_PASSWORD, primer_nombre: 'Padre', primer_apellido: 'SinHijos E2E',
      tipo_documento: 'CC', numero_documento: String(Date.now()).slice(-10), id_rol: 4,
    }),
  })

  await page.goto('/?login=1')
  const vista = page.locator('[data-view="login"][data-listo="true"]')
  await expect(vista).toBeAttached({ timeout: 45_000 })
  await vista.locator('input[type="email"]').fill(correo)
  await vista.locator('input[type="password"]').fill(process.env.E2E_PASSWORD!)
  await vista.locator('button').first().click()
  await expect(page).toHaveURL(/\/general$/, { timeout: 45_000 })

  for (const ruta of ['/notas', '/asistencia', '/novedades']) {
    await page.goto(ruta)
    await expect(page.getByText('No hay estudiantes vinculados').first(), ruta).toBeVisible()
  }
})
