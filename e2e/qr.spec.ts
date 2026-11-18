import { expect, test } from '@playwright/test'
import { credenciales, iniciarSesion, type Rol } from './utils'
import { apiQA } from './qa'

// WC-05 · QR: CP-SIS-029 (el estudiante ve su QR) y CP-SIS-031 (nadie más ve el
// QR de un estudiante). El escaneo con cámara (CP-SIS-032 a 036) está en
// qr-camara.spec.ts.

test('CP-SIS-029 · el estudiante ve el QR de su código con su nombre', async ({ page }) => {
  await iniciarSesion(page, 'estudiante')
  await page.goto('/qr')

  // Lo que dice la API del estudiante que inició sesión (por su correo).
  const usuarios = await apiQA<{ id_usuario: number; correo: string }[]>('/usuarios?limit=500')
  const idUsuario = usuarios.find((u) => u.correo.toLowerCase() === credenciales('estudiante').correo!.toLowerCase())?.id_usuario
  const estudiantes = await apiQA<{ codigo_estudiante: string; primer_nombre: string; primer_apellido: string; id_usuario: number }[]>('/estudiantes?limit=500')
  const yo = estudiantes.find((e) => e.id_usuario === idUsuario)!
  expect(yo, 'estudiante de QA').toBeTruthy()

  await expect(page.getByRole('heading', { name: 'Mi Código QR' })).toBeVisible()
  const qr = page.getByRole('img', { name: `Código QR de ${yo.codigo_estudiante}` })
  await expect(qr).toBeVisible()
  // El QR es una imagen que genera api.qrserver.com con el código: que haya cargado.
  await expect.poll(() => qr.evaluate((i) => (i as HTMLImageElement).complete && (i as HTMLImageElement).naturalWidth)).toBeGreaterThan(0)
  expect(await qr.getAttribute('src')).toContain(encodeURIComponent(yo.codigo_estudiante))
  await expect(page.locator('main').getByText(yo.codigo_estudiante, { exact: true })).toBeVisible()
  await expect(page.locator('main').getByText(`${yo.primer_nombre} ${yo.primer_apellido}`)).toBeVisible()
  await expect(page.getByRole('button', { name: 'Descargar QR' })).toBeVisible()
})

for (const rol of ['padre', 'docente'] as Rol[]) {
  test(`CP-SIS-031 · el ${rol} no puede ver el QR de un estudiante`, async ({ page }) => {
    await iniciarSesion(page, rol)
    await page.goto('/qr')
    await expect(page).toHaveURL(/\/general$/)
    await expect(page.getByRole('img', { name: /Código QR de/ })).toHaveCount(0)
  })
}
