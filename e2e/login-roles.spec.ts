import { expect, test } from '@playwright/test'
import { puedeEntrar } from '../src/lib/auth/routeRoles'
import { enlacesDelMenu, iniciarSesion, type Rol } from './utils'

// CP-SIS-001 (inicio por rol, depende de BE-03) y CP-SIS-006 (módulos por rol).
// El oráculo de CP-SIS-006 es el mapa `routeRoles` (planeación de sistema): el
// menú no puede traer un enlace al que el rol no puede entrar. Además se fijan a
// mano los módulos clave de cada rol. El admin puede entrar a todo el panel
// (`/notas` es de TODOS: lee notas y descarga boletines), así que no tiene
// lista de prohibidos (D-WEB-17).

const MENU: Record<Rol, { debe: string[]; noDebe: string[] }> = {
  admin: { debe: ['/admin', '/usuarios', '/reportes', '/qr/escanear'], noDebe: [] },
  docente: { debe: ['/general', '/notas', '/asistencia', '/novedades', '/qr/escanear'], noDebe: ['/usuarios', '/reportes'] },
  estudiante: { debe: ['/general', '/notas', '/asistencia', '/horarios', '/qr'], noDebe: ['/usuarios', '/reportes', '/qr/escanear'] },
  padre: { debe: ['/general', '/notas', '/asistencia', '/novedades', '/horarios'], noDebe: ['/usuarios', '/reportes', '/qr/escanear'] },
}

for (const rol of ['admin', 'docente', 'estudiante', 'padre'] as Rol[]) {
  test.describe(`inicio de sesión · ${rol}`, () => {
    test(`el ${rol} llega a su inicio con los datos cargados`, async ({ page }) => {
      await iniciarSesion(page, rol)

      // «Con los datos cargados»: ninguna alerta de error y la página no queda en blanco.
      await expect(page.locator('main')).not.toBeEmpty()
      await expect(page.getByText(/error al cargar|HTTP 500/i)).toHaveCount(0)
    })

    test(`el menú del ${rol} solo trae los módulos de su rol`, async ({ page }) => {
      await iniciarSesion(page, rol)

      const enlaces = await enlacesDelMenu(page)
      for (const ruta of MENU[rol].debe) expect(enlaces, `falta ${ruta}`).toContain(ruta)
      for (const ruta of MENU[rol].noDebe) expect(enlaces, `sobra ${ruta}`).not.toContain(ruta)
      for (const ruta of enlaces) expect(puedeEntrar(rol, ruta), `sobra ${ruta}: routeRoles no deja entrar al ${rol}`).toBe(true)
    })
  })
}
