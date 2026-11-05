// Comprueba que TODAS las rutas que la web llama existan en el openapi.json de
// la API de QA. Es una verificación estática del contrato (riesgo R-07): no
// necesita base de datos, credenciales ni datos de prueba, así que sirve cuando
// la API está arriba pero su base todavía no responde.
//
// Uso: node scripts/contrato-rutas.mjs [url-del-openapi]
//      node scripts/contrato-rutas.mjs --json evidencias/PR-05/web/I1_contrato_rutas.json
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const args = process.argv.slice(2)
const salida = args.includes('--json') ? args[args.indexOf('--json') + 1] : null
const url =
  args.find((a) => a.startsWith('http')) ??
  process.env.QA_API_URL?.replace(/\/api\/v1\/?$/, '') + '/openapi.json'

// ── Rutas que la web llama ───────────────────────────────────────────────────
// Se leen de los literales de plantilla de los servicios y Server Actions.
function archivos(dir) {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n)
    return statSync(p).isDirectory() ? archivos(p) : p.endsWith('.ts') || p.endsWith('.tsx') ? [p] : []
  })
}

const LLAMADA = /\b(?:apiFetch|serverFetch|apiFetchClient)\s*(?:<[^>]*>)?\s*\(\s*(['"`])([^'"`]+)\1/g
const encontradas = new Map() // ruta normalizada → [archivos]
for (const archivo of archivos('src')) {
  const texto = readFileSync(archivo, 'utf8')
  for (const [, , ruta] of texto.matchAll(LLAMADA)) {
    if (!ruta.startsWith('/')) continue
    // `/estudiantes/${id}/notas?x=1` → `/estudiantes/{}/notas`
    const limpia = ruta.split('?')[0].replace(/\$\{[^}]*\}/g, '{}').replace(/\/$/, '')
    if (!encontradas.has(limpia)) encontradas.set(limpia, [])
    encontradas.get(limpia).push(archivo.split('\\').join('/'))
  }
}

// ── Rutas que la API publica ────────────────────────────────────────────────
const spec = await (await fetch(url)).json()
const publicadas = new Set(
  Object.keys(spec.paths).map((p) => p.replace(/^\/api\/v1/, '').replace(/\{[^}]*\}/g, '{}'))
)

const filas = [...encontradas.entries()]
  .map(([ruta, archivos]) => ({ ruta, existe: publicadas.has(ruta), archivos: [...new Set(archivos)] }))
  .sort((a, b) => Number(a.existe) - Number(b.existe) || a.ruta.localeCompare(b.ruta))

const faltan = filas.filter((f) => !f.existe)
for (const f of filas) console.log(`${f.existe ? 'OK  ' : 'FALTA'} ${f.ruta}${f.existe ? '' : `  ← ${f.archivos.join(', ')}`}`)
console.log(`\n${filas.length - faltan.length} de ${filas.length} rutas de la web existen en ${new URL(url).host}.`)

if (salida) {
  writeFileSync(
    salida,
    JSON.stringify({ api: new URL(url).host, fecha: new Date().toISOString(), total: filas.length, faltan: faltan.length, rutas: filas }, null, 2)
  )
  console.log(`Informe: ${salida}`)
}

process.exit(faltan.length ? 1 : 0)
