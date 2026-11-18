// WC-06 · bloque 6: Brave. Login, recarga y descarga del boletín con el navegador
// Brave del equipo (Playwright lo maneja porque está basado en Chromium).
// Limitación: Brave corre con un perfil nuevo y los escudos por defecto
// («Estándar»); el nivel «Agresivo» se configura en su interfaz, no por línea de
// comandos. Uso: node scripts/brave.mjs http://localhost:3100 <salida.json>
import { existsSync, writeFileSync } from 'node:fs'
import { chromium } from '@playwright/test'

if (existsSync('.env.test.local')) process.loadEnvFile('.env.test.local')
const [base = 'http://localhost:3100', salida = 'evidencias/PR-06/web/manuales/brave.json'] = process.argv.slice(2)
const BRAVE = 'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe'

const pasos = []
const paso = async (nombre, fn) => {
  const t0 = Date.now()
  try {
    const detalle = await fn()
    pasos.push({ paso: nombre, resultado: 'OK', segundos: (Date.now() - t0) / 1000, detalle })
  } catch (e) {
    pasos.push({ paso: nombre, resultado: 'FALLA', segundos: (Date.now() - t0) / 1000, detalle: String(e.message).split('\n')[0] })
  }
}

const navegador = await chromium.launch({ executablePath: BRAVE, headless: true })
const version = navegador.version()
const page = await navegador.newPage({ baseURL: base, acceptDownloads: true })

await paso('Inicio de sesión del padre', async () => {
  await page.goto('/?login=1')
  const vista = page.locator('[data-view="login"][data-listo="true"]')
  await vista.waitFor({ state: 'attached', timeout: 60_000 })
  await vista.locator('input[type="email"]').fill(process.env.E2E_PADRE_DOS_HIJOS_EMAIL)
  await vista.locator('input[type="password"]').fill(process.env.QA_PASSWORD ?? process.env.E2E_PASSWORD)
  await vista.locator('button').first().click()
  await page.waitForURL(/\/general$/, { timeout: 60_000 })
  return page.url().replace(base, '')
})

await paso('Recarga de /notas sin perder la sesión', async () => {
  await page.goto('/notas')
  await page.reload()
  await page.getByRole('heading', { name: 'Notas', exact: true }).waitFor({ timeout: 30_000 })
  if (/login=1/.test(page.url())) throw new Error('la recarga pidió iniciar sesión')
  return page.url().replace(base, '')
})

await paso('Descarga del boletín (PDF)', async () => {
  const descarga = page.waitForEvent('download', { timeout: 60_000 })
  await page.getByRole('button', { name: /descargar boletín/i }).click()
  const d = await descarga
  const ruta = await d.path()
  const { readFileSync } = await import('node:fs')
  const cabecera = readFileSync(ruta).subarray(0, 5).toString()
  if (cabecera !== '%PDF-') throw new Error(`el archivo no es un PDF (${cabecera})`)
  return d.suggestedFilename()
})

await navegador.close()
const informe = { navegador: `Brave ${version} (escudos por defecto, perfil nuevo)`, base, fecha: new Date().toISOString(), pasos }
writeFileSync(salida, JSON.stringify(informe, null, 2))
console.log(JSON.stringify(informe, null, 2))
