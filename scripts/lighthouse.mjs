// WC-06 · bloque 1: Lighthouse en las 7 páginas de docs/pruebas-manuales-pr06-web.md,
// en escritorio y en móvil. Uso:
//   node scripts/lighthouse.mjs http://localhost:3100 evidencias/PR-06/web/manuales/lighthouse
// Las páginas con sesión se miden con la cookie de una sesión real (login por la
// portada con Playwright); `eys_last` se renueva en cada medición para que el
// cierre por inactividad no cuente el tiempo entre una medición y otra.
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { chromium } from '@playwright/test'

if (existsSync('.env.test.local')) process.loadEnvFile('.env.test.local')
const [base = 'http://localhost:3100', salida = 'evidencias/PR-06/web/manuales/lighthouse'] = process.argv.slice(2)
mkdirSync(salida, { recursive: true })

const CORREO = { admin: process.env.E2E_ADMIN_EMAIL, docente: process.env.E2E_DOCENTE_EMAIL, estudiante: process.env.E2E_ESTUDIANTE_EMAIL, padre: process.env.E2E_PADRE_DOS_HIJOS_EMAIL }
const PAGINAS = [
  { nombre: 'portada', ruta: '/' },
  { nombre: 'beneficios', ruta: '/home/beneficios' },
  { nombre: 'admin', ruta: '/admin', rol: 'admin' },
  { nombre: 'general-docente', ruta: '/general', rol: 'docente' },
  { nombre: 'general-estudiante', ruta: '/general', rol: 'estudiante' },
  { nombre: 'general-padre', ruta: '/general', rol: 'padre' },
  { nombre: 'notas-padre', ruta: '/notas', rol: 'padre' },
]

async function cookiesDe(rol) {
  const navegador = await chromium.launch()
  const page = await navegador.newPage({ baseURL: base })
  await page.goto('/?login=1')
  const vista = page.locator('[data-view="login"][data-listo="true"]')
  await vista.waitFor({ state: 'attached', timeout: 60_000 })
  await vista.locator('input[type="email"]').fill(CORREO[rol])
  await vista.locator('input[type="password"]').fill(process.env.QA_PASSWORD ?? process.env.E2E_PASSWORD)
  await vista.locator('button').first().click()
  await page.waitForURL(/\/(general|admin)$/, { timeout: 60_000 })
  const cookies = await page.context().cookies()
  await navegador.close()
  return cookies.filter((c) => c.name.startsWith('eys_'))
}

const cabeceras = join(tmpdir(), `lh-cabeceras-${process.pid}.json`)
const sesiones = {}
const filas = []
const solo = process.env.LH_SOLO ? process.env.LH_SOLO.split(',') : null
for (const p of PAGINAS.filter((x) => !solo || solo.includes(x.nombre))) {
  if (p.rol && !sesiones[p.rol]) sesiones[p.rol] = await cookiesDe(p.rol)
  for (const modo of ['escritorio', 'movil']) {
    const archivo = `${salida}/${p.nombre}-${modo}`
    const args = ['--yes', 'lighthouse@12.8.2', base + p.ruta, '--output=json', '--output=html', `--output-path=${archivo}`, '--quiet',
      '--chrome-flags=--headless=new', '--only-categories=performance,accessibility,best-practices,seo']
    if (modo === 'escritorio') args.push('--preset=desktop')
    if (p.rol) {
      const cookie = sesiones[p.rol].map((c) => `${c.name}=${c.name === 'eys_last' ? Date.now() : c.value}`).join('; ')
      // Por archivo (en Windows el JSON se rompe en la línea de comandos), FUERA
      // del repositorio y borrado después: lleva la cookie de sesión.
      args.push(`--extra-headers=${cabeceras}`)
      writeFileSync(cabeceras, JSON.stringify({ Cookie: cookie }))
    }
    // Lighthouse busca Chrome en CHROME_PATH: se usa el Chromium de Playwright.
    try {
      execFileSync('npx', args, { stdio: 'pipe', shell: true, env: { ...process.env, CHROME_PATH: chromium.executablePath() } })
    } finally {
      rmSync(cabeceras, { force: true })
    }
    // Lighthouse copia las cabeceras extra dentro del informe: se quitan la cookie y cualquier JWT.
    for (const ext of ['json', 'html']) {
      const ruta = `${archivo}.report.${ext}`
      writeFileSync(ruta, readFileSync(ruta, 'utf8')
        .replace(/eys_(access|refresh|user|last)=[^;"\\\s]*/g, 'eys_$1=[redactado]')
        .replace(/eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]+/g, '[jwt-redactado]'))
    }
    const r = JSON.parse(readFileSync(`${archivo}.report.json`, 'utf8'))
    const c = r.categories
    const fila = { pagina: p.ruta, rol: p.rol ?? 'sin sesión', modo, urlFinal: r.finalDisplayedUrl,
      rendimiento: Math.round(c.performance.score * 100), accesibilidad: Math.round(c.accessibility.score * 100),
      buenasPracticas: Math.round(c['best-practices'].score * 100), seo: Math.round(c.seo.score * 100),
      lcp: r.audits['largest-contentful-paint'].displayValue, tbt: r.audits['total-blocking-time'].displayValue }
    filas.push(fila)
    console.log(JSON.stringify(fila))
  }
}
// El resumen junta lo medido ahora con lo que ya estaba (LH_SOLO repite solo algunas páginas).
const previo = existsSync(`${salida}/resumen.json`) ? JSON.parse(readFileSync(`${salida}/resumen.json`, 'utf8')).filas : []
const clave = (f) => `${f.pagina}|${f.rol}|${f.modo}`
const todas = [...previo.filter((f) => !filas.some((n) => clave(n) === clave(f))), ...filas]
writeFileSync(`${salida}/resumen.json`, JSON.stringify({ base, fecha: new Date().toISOString(), filas: todas }, null, 2))
