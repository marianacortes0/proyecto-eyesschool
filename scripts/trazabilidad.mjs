// Genera docs/trazabilidad-ut-web.md a partir de lo que Vitest ejecuta de verdad:
// archivo → ID de la planeación → prueba → estado. Uso: node scripts/trazabilidad.mjs
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, relative, sep } from 'node:path'

const raiz = process.cwd()
const mapa = JSON.parse(readFileSync('tests/trazabilidad.json', 'utf-8'))
const salida = join(tmpdir(), `eys-traza-${process.pid}`)
mkdirSync(salida, { recursive: true })

function correr(configuracion) {
  const archivo = join(salida, `${configuracion ?? 'unit'}.json`)
  const args = ['node_modules/vitest/vitest.mjs', 'run', '--reporter=json', `--outputFile=${archivo}`]
  if (configuracion) args.push('--config', configuracion)
  try {
    execFileSync(process.execPath, args, { stdio: 'ignore', env: { ...process.env, QA_API_URL: '' } })
  } catch {
    // Una prueba fallida no impide documentarla.
  }
  return JSON.parse(readFileSync(archivo, 'utf-8'))
}

const resultados = [correr(null), correr('vitest.integration.config.mts')]
const estado = (s) => ({ passed: 'Sí', failed: 'No', skipped: 'Omitida', pending: 'Omitida', todo: 'Pendiente' })[s] ?? s

const filas = []
for (const r of resultados) {
  for (const archivo of r.testResults) {
    const ruta = relative(raiz, archivo.name).split(sep).join('/')
    for (const t of archivo.assertionResults) {
      const regla = mapa.reglas.find((x) => x.archivo === ruta && (!x.nombre || new RegExp(x.nombre).test(t.fullName)))
      filas.push({ ruta, nombre: t.fullName, estado: estado(t.status), id: regla?.id, correccion: regla?.correccion })
    }
  }
}

const esExtra = (f) => !f.id
const motivo = (ruta) => Object.entries(mapa.extras).find(([k]) => ruta.startsWith(k))?.[1] ?? 'Prueba no planeada'
const celda = (s) => String(s).replace(/\|/g, '\\|')

const tabla = (lista) =>
  lista.map((f) => `| ${f.id} | ${celda(f.correccion)} | \`${f.ruta}\` | ${celda(f.nombre)} | ${f.estado} |`).join('\n')

const planeadas = (prefijo) => filas.filter((f) => f.id?.startsWith(prefijo)).sort((a, b) => a.id.localeCompare(b.id))
const extras = filas.filter(esExtra)
const archivosExtra = [...new Set(extras.map((f) => f.ruta))].sort()
let n = 0
const filasExtra = []
for (const ruta of archivosExtra) {
  for (const f of extras.filter((x) => x.ruta === ruta)) {
    n += 1
    filasExtra.push(`| UT-WEB-EXTRA-${String(n).padStart(2, '0')} | ${celda(motivo(ruta))} | \`${ruta}\` | ${celda(f.nombre)} | ${f.estado} |`)
  }
}

const cuenta = (lista) => `${lista.filter((f) => f.estado === 'Sí').length} de ${lista.length} pasan`
const unit = planeadas('UT-WEB')
const it = planeadas('IT-WEB')

const md = `# Trazabilidad de pruebas — Frontend web

> Generado con \`node scripts/trazabilidad.mjs\` (no editar a mano). Mapeo en \`tests/trazabilidad.json\`.
> Fecha de generación: ${new Date().toISOString().slice(0, 10)}

## Resumen

| Grupo | Resultado |
|---|---|
| UT-WEB-01 a 08 (planeadas, PR-04) | ${cuenta(unit)} |
| UT-WEB-EXTRA (no planeadas) | ${cuenta(extras)} |
| IT-WEB-01 a 05 (contrato, PR-05) | ${cuenta(it)} · «Omitida» = necesita \`QA_API_URL\` |

## Pruebas unitarias y de componentes (PR-04)

| ID | Corrección | Archivo | Caso | Pasa |
|---|---|---|---|---|
${tabla(unit)}

## Pruebas extra (no estaban en la planeación)

| ID | Motivo | Archivo | Caso | Pasa |
|---|---|---|---|---|
${filasExtra.join('\n')}

## Pruebas de contrato (PR-05)

| ID | Corrección | Archivo | Caso | Pasa |
|---|---|---|---|---|
${tabla(it)}
`

mkdirSync('docs', { recursive: true })
writeFileSync('docs/trazabilidad-ut-web.md', md, 'utf-8')
console.log(`docs/trazabilidad-ut-web.md: ${filas.length} pruebas (${unit.length} UT, ${extras.length} extra, ${it.length} IT)`)
