import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { writeFileSync, mkdirSync } from 'node:fs'
import { iniciarSesion, type Rol } from './utils'

// WC-06 · bloque 2: axe en las 5 pantallas de docs/pruebas-manuales-pr06-web.md.
// Criterio: 0 violaciones serias o críticas (WCAG 2.1 A y AA). El detalle de cada
// pantalla, también las leves, queda en evidencias/PR-06/web/manuales/axe-<pantalla>.json.

type Pantalla = { nombre: string; ruta: string; rol?: Rol; preparar?: (page: Page) => Promise<void> }

const PANTALLAS: Pantalla[] = [
  {
    nombre: 'login-y-registro',
    ruta: '/?login=1',
    preparar: async (page) => {
      await page.locator('[data-view="login"][data-listo="true"]').waitFor({ state: 'attached', timeout: 45_000 })
    },
  },
  {
    nombre: 'registro-modal',
    ruta: '/?login=1',
    preparar: async (page) => {
      await page.locator('[data-view="login"][data-listo="true"]').waitFor({ state: 'attached', timeout: 45_000 })
      await page.locator('[data-go-signup]').click()
      await page.getByRole('dialog', { name: /crear cuenta/i }).getByLabel('Rol', { exact: true }).selectOption('4')
    },
  },
  {
    nombre: 'usuarios-y-modal',
    ruta: '/usuarios',
    rol: 'admin',
    preparar: async (page) => {
      await page.getByRole('button', { name: '+ Nuevo Usuario' }).click()
      await page.getByPlaceholder('Juan').waitFor()
    },
  },
  { nombre: 'qr-escanear-docente', ruta: '/qr/escanear', rol: 'docente' },
  { nombre: 'notas-padre', ruta: '/notas', rol: 'padre' },
  {
    nombre: 'reset-password',
    ruta: '/reset-password?token=e2e-sin-uso',
    preparar: async (page) => {
      await page.getByPlaceholder('Mínimo 8 caracteres').fill('Colegio2026')
    },
  },
]

async function analizar(page: Page, nombre: string) {
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
  mkdirSync('evidencias/PR-06/web/manuales', { recursive: true })
  const resumen = r.violations.map((v) => ({ id: v.id, impacto: v.impact, ayuda: v.help, nodos: v.nodes.length, ejemplo: v.nodes[0]?.target }))
  writeFileSync(`evidencias/PR-06/web/manuales/axe-${nombre}.json`, JSON.stringify({ url: page.url(), fecha: new Date().toISOString(), violaciones: resumen }, null, 2))
  return r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
}

for (const p of PANTALLAS) {
  test(`WC-06 axe · ${p.nombre} sin violaciones serias ni críticas`, async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'axe se corre una vez (Chromium)')
    if (p.rol) await iniciarSesion(page, p.rol)
    await page.goto(p.ruta)
    await page.waitForLoadState('networkidle').catch(() => null)
    if (p.preparar) await p.preparar(page)
    const graves = await analizar(page, p.nombre)
    expect(graves.map((v) => `${v.impact} · ${v.id} · ${v.help} (${v.nodes.length}) ${JSON.stringify(v.nodes[0]?.target)}`)).toEqual([])
  })
}
