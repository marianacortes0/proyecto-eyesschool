import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { writeFileSync, mkdirSync } from 'node:fs'
import { iniciarSesion, type Rol } from './utils'

// WC-06 · bloque 2: axe en 5 pantallas. Criterio: 0 violaciones serias o
// críticas (WCAG 2.1 A y AA). El detalle de cada pantalla, también las leves, se
// guarda en evidencias/PR-06/web/manuales/axe-<pantalla>.json.

const PANTALLAS: Array<{ nombre: string; ruta: string; rol?: Rol }> = [
  { nombre: 'portada-login', ruta: '/?login=1' },
  { nombre: 'inicio-docente', ruta: '/general', rol: 'docente' },
  { nombre: 'notas-docente', ruta: '/notas', rol: 'docente' },
  { nombre: 'usuarios-admin', ruta: '/usuarios', rol: 'admin' },
  { nombre: 'asistencia-padre', ruta: '/asistencia', rol: 'padre' },
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
    const graves = await analizar(page, p.nombre)
    expect(graves.map((v) => `${v.impact} · ${v.id} · ${v.help} (${v.nodes.length})`)).toEqual([])
  })
}
