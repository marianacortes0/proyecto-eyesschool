import { expect, test } from '@playwright/test'
import { credenciales, requiere } from './utils'

// WC-05 · recuperación de contraseña: CP-SIS-015 y 017.
// CP-SIS-016 y 018 necesitan abrir el enlace que llega al correo: quedan
// pendientes del buzón de QA (planeación del backend, BC-12). Se registran como
// omitidos con su motivo para que la trazabilidad los encuentre.

test('CP-SIS-015 · pedir recuperación con un correo registrado y con uno no registrado da el mismo mensaje', async ({ page }) => {
  requiere('E2E_DOCENTE_EMAIL')
  const mensajes: string[] = []
  for (const correo of [credenciales('docente').correo!, `nadie.${Date.now()}@example.com`]) {
    await page.goto('/forgot-password')
    await page.getByPlaceholder('tu@correo.com').fill(correo)
    await page.getByRole('button').filter({ hasText: /enviar|recuperar|restablecer/i }).click()
    const ok = page.getByText(/Si tu correo está registrado, recibirás un enlace/)
    await expect(ok, correo).toBeVisible({ timeout: 45_000 })
    mensajes.push((await ok.textContent())!.trim())
  }
  expect(mensajes[1]).toBe(mensajes[0])
})

test('CP-SIS-016 · restablecer con el enlace del correo', async () => {
  test.skip(true, 'Pendiente del buzón de QA (BC-12): el enlace llega por correo')
})

test('CP-SIS-017 · una contraseña débil se rechaza antes de enviar y dice qué regla falta', async ({ page }) => {
  let acciones = 0
  page.on('request', (r) => {
    if (r.method() === 'POST' && r.headers()['next-action']) acciones++
  })
  // La validación es del formulario: con un token cualquiera la página se puede abrir.
  await page.goto('/reset-password?token=e2e-sin-uso')
  await page.getByPlaceholder('Mínimo 8 caracteres').fill('Colegio2026')
  await page.getByPlaceholder('Repite la contraseña').fill('Colegio2026')

  const regla = page.locator('li').filter({ hasText: 'Un carácter especial' })
  await expect(regla).toContainText('pendiente')
  for (const cumplida of ['Mínimo 8 caracteres', 'Una mayúscula', 'Una minúscula', 'Un número']) {
    await expect(page.locator('li').filter({ hasText: cumplida })).toContainText('cumplida')
  }
  await expect(page.getByRole('button', { name: /actualizar|restablecer|guardar/i })).toBeDisabled()
  expect(acciones).toBe(0)
})

test('CP-SIS-018 · un enlace de recuperación ya usado', async () => {
  test.skip(true, 'Pendiente del buzón de QA (BC-12) y de BE-13: hace falta un enlace real usado una vez')
})
