import { expect, test } from '@playwright/test'
import { iniciarSesion, requiere } from './utils'

// CP-SIS-014 · comportamiento por diseño (decisión del PO del 30/10/2026): cualquier
// persona puede registrarse como padre o acudiente y queda vinculada al estudiante
// que indique; luego ve sus datos. No es un defecto.
// Datos de QA pendientes: E2E_ESTUDIANTE_VINCULADO_ID (id de un estudiante de DS-02)
// y E2E_ESTUDIANTE_VINCULADO_NOMBRE.

// Cuenta creada por la prueba; el administrador la borra al terminar.
let correoCreado: string | null = null

test.afterAll(async ({ browser }) => {
  if (!correoCreado) return
  const page = await browser.newPage({ baseURL: process.env.E2E_BASE_URL })
  try {
    await iniciarSesion(page, 'admin')
    await page.goto('/usuarios')
    await page.getByPlaceholder('Buscar por nombre, correo o documento...').fill(correoCreado)
    await page.getByTitle('Eliminar').first().click()
    await page.getByRole('button', { name: /eliminar|confirmar/i }).last().click()
    await expect(page.getByText('Usuario eliminado exitosamente')).toBeVisible()
  } finally {
    await page.close()
  }
})

test('el padre que se registra ve los datos de su hijo vinculado', async ({ page }) => {
  requiere('E2E_ESTUDIANTE_VINCULADO_ID', 'E2E_ESTUDIANTE_VINCULADO_NOMBRE', 'E2E_PASSWORD')
  const unico = Date.now()
  const correo = `e2e+${unico}@eyeschool.test`
  const password = process.env.E2E_PASSWORD!
  correoCreado = correo

  await page.goto('/?login=1')
  await page.locator('[data-go-signup]').click()
  const modal = page.getByRole('dialog', { name: /crear cuenta/i })

  await modal.getByLabel('Nombre', { exact: true }).fill('Padre')
  await modal.getByLabel('Apellido', { exact: true }).fill(`E2E${unico}`)
  await modal.getByLabel('Tipo de documento').selectOption('CC')
  await modal.getByLabel('Número de documento').fill(String(unico).slice(-10))
  await modal.getByLabel('Rol', { exact: true }).selectOption('4')
  await modal.getByLabel('ID del estudiante').fill(process.env.E2E_ESTUDIANTE_VINCULADO_ID!)
  await modal.getByLabel('Parentesco').selectOption({ index: 1 })
  await modal.getByLabel('Correo').fill(correo)
  await modal.getByLabel('Contraseña', { exact: true }).fill(password)
  await modal.getByRole('button', { name: /crear cuenta|registr/i }).click()

  // Cuenta creada: vuelve al inicio de sesión (el padre no requiere aprobación).
  await expect(page).toHaveURL(/registered=true/)

  const vista = page.locator('[data-view="login"]')
  await vista.locator('input[type="email"]').fill(correo)
  await vista.locator('input[type="password"]').fill(password)
  await vista.locator('button').first().click()
  await expect(page).toHaveURL(/\/general$/)

  for (const modulo of ['/notas', '/asistencia', '/novedades']) {
    await page.goto(modulo)
    await expect(page.getByText(process.env.E2E_ESTUDIANTE_VINCULADO_NOMBRE!).first()).toBeVisible()
  }
})
