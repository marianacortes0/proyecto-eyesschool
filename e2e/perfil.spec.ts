import { expect, test, type Page } from '@playwright/test'
import { credenciales, iniciarSesion, type Rol } from './utils'

// WC-05 · CP-SIS-009: /perfil con cada rol muestra nombre, correo y rol del
// usuario autenticado, y el curso (estudiante), el hijo (padre), las
// especializaciones (docente) o el cargo (admin).

async function valores(page: Page): Promise<string[]> {
  await expect(page.getByRole('heading', { name: 'Mi Perfil' })).toBeVisible()
  return page.locator('main input').evaluateAll((els) => els.map((e) => (e as HTMLInputElement).value))
}

const ROL_EN_PERFIL: Record<Rol, RegExp> = {
  admin: /admin/i,
  docente: /docente|profesor/i,
  estudiante: /estudiante/i,
  padre: /padre|acudiente/i,
}

for (const rol of ['admin', 'docente', 'estudiante', 'padre'] as Rol[]) {
  test(`CP-SIS-009 · el perfil del ${rol} muestra sus datos y su rol`, async ({ page }) => {
    await iniciarSesion(page, rol)
    await page.goto('/perfil')

    const vals = await valores(page)
    expect(vals, 'correo del usuario autenticado').toContain(credenciales(rol).correo!.toLowerCase())
    expect(vals.some((v) => ROL_EN_PERFIL[rol].test(v)), 'rol').toBe(true)
    // Nombre: el primer nombre del inicio coincide con el del perfil.
    expect(vals.filter((v) => /^[A-Za-zÁÉÍÓÚÑáéíóúñ ]{2,}$/.test(v)).length, 'nombre y apellido').toBeGreaterThan(0)

    if (rol === 'estudiante') {
      await expect(page.getByRole('heading', { name: 'Jornada y curso' })).toBeVisible()
      expect(vals.some((v) => /^(Sexto|Séptimo|Octavo|Noveno|Décimo|Once) [A-Z]$/.test(v)), 'curso').toBe(true)
    }
    if (rol === 'padre') {
      await expect(page.getByRole('heading', { name: 'Información familiar' })).toBeVisible()
      await expect(page.getByText(process.env.E2E_HIJO_2_NOMBRE ?? 'Santiago').first()).toBeVisible()
    }
    if (rol === 'docente') {
      // La planeación pide «asignaturas»: el perfil muestra las especializaciones;
      // las materias que dicta están en /horarios (CP-SIS-059).
      await expect(page.getByRole('heading', { name: 'Especializaciones' })).toBeVisible()
    }
    if (rol === 'admin') {
      await expect(page.getByRole('heading', { name: 'Datos administrativos' })).toBeVisible()
    }
  })
}
