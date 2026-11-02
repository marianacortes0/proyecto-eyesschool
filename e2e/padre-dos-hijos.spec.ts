import { expect, test } from '@playwright/test'
import { iniciarSesion, requiere } from './utils'

// WEB-03 · CP-SIS-060. Depende de BE-07 (GET /padres/me/hijos).
// Dato de QA pendiente: un padre (DS-03) con dos hijos vinculados. Se indican los
// nombres con E2E_HIJO_1_NOMBRE y E2E_HIJO_2_NOMBRE; el padre es E2E_PADRE_DOS_HIJOS_EMAIL.
// Los nombres se buscan por coincidencia parcial (basta el primer nombre).

test('el padre de prueba cambia de hijo y cambian notas, asistencia y novedades', async ({ page }) => {
  requiere('E2E_HIJO_1_NOMBRE', 'E2E_HIJO_2_NOMBRE')
  // Falla esperada hasta que BE-07 (GET /padres/me/hijos) esté desplegado en QA; entonces E2E_BE07=true.
  test.fail(process.env.E2E_BE07 !== 'true', 'Requiere BE-07: sin /padres/me/hijos el padre solo ve un hijo')
  const hijo1 = process.env.E2E_HIJO_1_NOMBRE!
  const hijo2 = process.env.E2E_HIJO_2_NOMBRE!
  await iniciarSesion(page, 'padre')

  for (const modulo of ['/notas', '/asistencia', '/novedades']) {
    await page.goto(modulo)
    const selector = page.getByRole('combobox', { name: /estudiante/i })

    // Ve solo sus dos hijos.
    await expect(selector.locator('option')).toHaveText([new RegExp(hijo1, 'i'), new RegExp(hijo2, 'i')])

    // Con el primero activo, el módulo habla de él; al cambiar, habla del segundo.
    await expect(page.getByText(new RegExp(hijo1, 'i')).first()).toBeVisible()
    const etiquetaHijo2 = (await selector.locator('option', { hasText: new RegExp(hijo2, 'i') }).textContent()) ?? hijo2
    await selector.selectOption({ label: etiquetaHijo2 })
    await expect(page).toHaveURL(/[?&]hijo=\d+/)
    await expect(page.getByText(new RegExp(hijo2, 'i')).first()).toBeVisible()
  }
})

test('un padre con un solo hijo no ve el selector', async ({ page }) => {
  requiere('E2E_PADRE_UN_HIJO_EMAIL', 'E2E_PASSWORD')
  await page.goto('/?login=1')
  const vista = page.locator('[data-view="login"]')
  await vista.locator('input[type="email"]').fill(process.env.E2E_PADRE_UN_HIJO_EMAIL!)
  await vista.locator('input[type="password"]').fill(process.env.E2E_PASSWORD!)
  await vista.locator('button').first().click()
  await expect(page).toHaveURL(/\/general$/)

  await page.goto('/notas')
  await expect(page.getByRole('combobox', { name: /estudiante/i })).toHaveCount(0)
})
