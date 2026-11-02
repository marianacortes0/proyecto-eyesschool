import { expect, test, type Page } from '@playwright/test'

export type Rol = 'admin' | 'docente' | 'estudiante' | 'padre'

const CORREO: Record<Rol, string | undefined> = {
  admin: process.env.E2E_ADMIN_EMAIL,
  docente: process.env.E2E_DOCENTE_EMAIL,
  estudiante: process.env.E2E_ESTUDIANTE_EMAIL,
  padre: process.env.E2E_PADRE_EMAIL,
}

/** Inicio al que debe llegar cada rol. */
export const INICIO: Record<Rol, string> = {
  admin: '/admin',
  docente: '/general',
  estudiante: '/general',
  padre: '/general',
}

/** Omite el escenario si falta algún dato de QA (se anota como «Pendiente»). */
export function requiere(...variables: string[]) {
  const faltan = variables.filter((v) => !process.env[v])
  test.skip(faltan.length > 0, `Pendiente: falta el dato de QA ${faltan.join(', ')}`)
}

export function credenciales(rol: Rol) {
  return { correo: CORREO[rol], password: process.env.E2E_PASSWORD }
}

/** Inicia sesión por el modal de la página principal y espera el inicio del rol. */
export async function iniciarSesion(page: Page, rol: Rol, opciones: { esperarInicio?: boolean } = {}) {
  const { correo, password } = credenciales(rol)
  requiere(`E2E_${rol.toUpperCase()}_EMAIL`, 'E2E_PASSWORD')

  await page.goto('/?login=1')
  const vista = page.locator('[data-view="login"]')
  await vista.locator('input[type="email"]').fill(correo!)
  await vista.locator('input[type="password"]').fill(password!)
  await vista.locator('button').first().click()

  if (opciones.esperarInicio !== false) await expect(page).toHaveURL(new RegExp(`${INICIO[rol]}$`), { timeout: 20_000 })
}

export async function cerrarSesion(page: Page) {
  await page.getByRole('button', { name: 'Cerrar sesión' }).click()
  // El diálogo de confirmación repite el texto del botón.
  await page.getByRole('button', { name: 'Cerrar sesión' }).last().click()
  await expect(page).toHaveURL(/\/$/)
}

/** Enlaces del riel de navegación que se ven en pantalla. */
export async function enlacesDelMenu(page: Page): Promise<string[]> {
  const hrefs = await page.locator('aside nav a').evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).getAttribute('href') ?? ''))
  return hrefs.filter(Boolean)
}
