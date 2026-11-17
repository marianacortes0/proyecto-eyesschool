import { expect, test, type Page } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { iniciarSesion, type Rol } from './utils'

// WC-06 · bloque «responsive»: 5 pantallas a 375, 768 y 1920 px. Criterio: sin
// desborde horizontal y sin elementos tapados; en particular, el aviso de
// cookies no tapa «CREAR CUENTA» (observación de DEF-WEB-05, a 1280×720).
// Capturas en evidencias/PR-06/web/manuales/responsive-<pantalla>-<ancho>.png.

const ANCHOS = [375, 768, 1920]
const PANTALLAS: Array<{ nombre: string; ruta: string; rol?: Rol }> = [
  { nombre: 'portada', ruta: '/' },
  { nombre: 'inicio-docente', ruta: '/general', rol: 'docente' },
  { nombre: 'notas-docente', ruta: '/notas', rol: 'docente' },
  { nombre: 'usuarios-admin', ruta: '/usuarios', rol: 'admin' },
  { nombre: 'asistencia-padre', ruta: '/asistencia', rol: 'padre' },
]

async function sinDesborde(page: Page) {
  const { ancho, contenido } = await page.evaluate(() => ({ ancho: window.innerWidth, contenido: document.documentElement.scrollWidth }))
  expect(contenido, `el contenido (${contenido}px) no debe pasar el ancho de la ventana (${ancho}px)`).toBeLessThanOrEqual(ancho + 1)
}

for (const p of PANTALLAS) {
  for (const ancho of ANCHOS) {
    test(`WC-06 responsive · ${p.nombre} a ${ancho}px sin desborde`, async ({ page, browserName }) => {
      test.skip(browserName !== 'chromium', 'Se revisa una vez (Chromium)')
      await page.setViewportSize({ width: ancho, height: ancho < 800 ? 812 : 1080 })
      if (p.rol) await iniciarSesion(page, p.rol)
      await page.goto(p.ruta)
      await page.waitForLoadState('networkidle').catch(() => null)
      await sinDesborde(page)
      mkdirSync('evidencias/PR-06/web/manuales', { recursive: true })
      await page.screenshot({ path: `evidencias/PR-06/web/manuales/responsive-${p.nombre}-${ancho}.png` })
    })
  }
}

for (const [ancho, alto] of [[375, 812], [1280, 720], [1920, 1080]]) {
  test(`WC-06 responsive · el aviso de cookies no tapa «CREAR CUENTA» a ${ancho}×${alto}`, async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Se revisa una vez (Chromium)')
    await page.setViewportSize({ width: ancho, height: alto })
    await page.goto('/?login=1')
    await page.locator('[data-view="login"][data-listo="true"]').waitFor({ state: 'attached', timeout: 45_000 })
    await page.locator('[data-go-signup]').click()
    const boton = page.getByRole('dialog', { name: /crear cuenta/i }).getByRole('button', { name: /crear cuenta/i })
    await boton.scrollIntoViewIfNeeded()
    // El elemento que está encima del centro del botón debe ser el propio botón.
    const encima = await boton.evaluate((b) => {
      const r = b.getBoundingClientRect()
      const e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
      return e === b || b.contains(e)
    })
    expect(encima, 'el botón no queda tapado').toBe(true)
  })
}

for (const [ancho, alto] of [[375, 812], [1280, 720]]) {
  test(`WC-06 responsive · el aviso de cookies no tapa «ENTRAR» a ${ancho}×${alto}`, async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Se revisa una vez (Chromium)')
    await page.setViewportSize({ width: ancho, height: alto })
    await page.goto('/?login=1')
    const vista = page.locator('[data-view="login"][data-listo="true"]')
    await vista.waitFor({ state: 'attached', timeout: 45_000 })
    const boton = vista.locator('button').first()
    await boton.scrollIntoViewIfNeeded()
    const encima = await boton.evaluate((b) => {
      const r = b.getBoundingClientRect()
      const e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
      return e === b || b.contains(e)
    })
    expect(encima, 'el botón no queda tapado').toBe(true)
  })
}
