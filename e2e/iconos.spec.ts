import { expect, test, type Page } from '@playwright/test'
import { iniciarSesion, type Rol } from './utils'
import { ICONOS } from '../src/lib/iconos'

// DEF-WEB-17 · la fuente de iconos se pide solo con los iconos de ICONOS. Esta
// prueba hace la «revisión visual» pantalla por pantalla: en cada página de cada
// rol, todo icono pintado debe estar en la lista y dibujarse como glifo (≈1 em
// de ancho), no como su nombre en texto («fact_check» ocupa varios em).

const PUBLICAS = ['/', '/home/beneficios', '/home/nosotros', '/home/support', '/forgot-password', '/reset-password?token=e2e']

const PANEL: Record<Rol, string[]> = {
  admin: ['/admin', '/usuarios', '/reportes', '/qr', '/qr/escanear', '/notas', '/asistencia', '/novedades', '/horarios', '/perfil'],
  docente: ['/general', '/qr/escanear', '/notas', '/asistencia', '/novedades', '/horarios', '/perfil'],
  estudiante: ['/general', '/qr', '/notas', '/asistencia', '/novedades', '/horarios', '/perfil'],
  padre: ['/general', '/notas', '/asistencia', '/novedades', '/horarios', '/perfil'],
}

type Pintado = { nombre: string; ancho: number; em: number }

async function revisarIconos(page: Page, ruta: string) {
  await page.goto(ruta)
  await page.waitForLoadState('load')
  await page.evaluate(() => document.fonts.ready)
  const pintados = await page.locator('.material-symbols-outlined').evaluateAll((els) =>
    els.map((el) => ({
      nombre: (el.textContent ?? '').trim(),
      ancho: el.getBoundingClientRect().width,
      em: Number.parseFloat(getComputedStyle(el).fontSize),
    }))
  )
  const fuera = pintados.filter((i: Pintado) => i.nombre && !(ICONOS as readonly string[]).includes(i.nombre)).map((i) => i.nombre)
  expect(fuera, `${ruta}: iconos que no están en src/lib/iconos.ts`).toEqual([])
  // Un nombre sin glifo se ve como texto: mucho más ancho que el propio icono
  // (los ocultos miden 0 y solo se revisa su nombre).
  const comoTexto = pintados.filter((i: Pintado) => i.nombre.length > 2 && i.ancho > 0 && i.ancho > i.em * 1.6).map((i) => `${i.nombre} (${Math.round(i.ancho)}px)`)
  expect(comoTexto, `${ruta}: iconos que se ven como texto`).toEqual([])
  return pintados.length
}

test.describe('DEF-WEB-17 · iconos con la fuente reducida', () => {
  // Hoy las páginas públicas no usan la fuente (la portada usa emojis): se
  // revisan igual, por si se agrega un icono sin sumarlo a la lista.
  for (const ruta of PUBLICAS) {
    test(`página pública ${ruta}`, async ({ page }) => {
      await revisarIconos(page, ruta)
    })
  }

  for (const rol of Object.keys(PANEL) as Rol[]) {
    test(`panel del ${rol}`, async ({ page }) => {
      await iniciarSesion(page, rol)
      let total = 0
      for (const ruta of PANEL[rol]) total += await revisarIconos(page, ruta)
      expect(total).toBeGreaterThan(0)
    })
  }
})
