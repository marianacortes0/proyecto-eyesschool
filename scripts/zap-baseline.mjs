// WC-06 · bloque 3: línea base de ZAP (equivalente a zap-baseline: araña + reglas
// pasivas, SIN escaneo activo) contra la web, usando la API de un ZAP ya
// arrancado en modo daemon:
//
//   java -jar "C:\Program Files\ZAP\Zed Attack Proxy\zap-2.17.0.jar" -daemon -port 8090 -config api.disablekey=true
//   node scripts/zap-baseline.mjs http://localhost:3100 evidencias/PR-06/web/manuales/zap
//
// Escribe <salida>-alertas.json (alertas agrupadas por regla) y <salida>.html.
import { writeFileSync } from 'node:fs'

const [objetivo = 'http://localhost:3100', salida = 'zap'] = process.argv.slice(2)
const ZAP = process.env.ZAP_URL ?? 'http://localhost:8090'
const api = async (ruta) => {
  const r = await fetch(`${ZAP}${ruta}`)
  if (!r.ok) throw new Error(`${ruta} → ${r.status}`)
  return ruta.startsWith('/OTHER/') ? r.text() : r.json()
}
const esperar = (ms) => new Promise((r) => setTimeout(r, ms))

console.log('ZAP', (await api('/JSON/core/view/version/')).version, '→', objetivo)
// Pasivo de verdad: la araña no envía formularios (el registro escribiría en QA).
await api('/JSON/spider/action/setOptionProcessForm/?Boolean=false')
await api('/JSON/spider/action/setOptionPostForm/?Boolean=false')
await api(`/JSON/core/action/accessUrl/?url=${encodeURIComponent(objetivo)}&followRedirects=true`)
const { scan } = await api(`/JSON/spider/action/scan/?url=${encodeURIComponent(objetivo)}&maxChildren=20&recurse=true`)
for (;;) {
  const { status } = await api(`/JSON/spider/view/status/?scanId=${scan}`)
  if (Number(status) >= 100) break
  await esperar(2000)
}
for (;;) {
  const { recordsToScan } = await api('/JSON/pscan/view/recordsToScan/')
  if (Number(recordsToScan) === 0) break
  await esperar(2000)
}

const { alerts } = await api(`/JSON/core/view/alerts/?baseurl=${encodeURIComponent(objetivo)}&start=0&count=5000`)
const porRegla = new Map()
for (const a of alerts) {
  const k = `${a.pluginId} ${a.alert}`
  const g = porRegla.get(k) ?? { regla: a.alert, pluginId: a.pluginId, riesgo: a.risk, confianza: a.confidence, urls: new Set(), solucion: a.solution }
  g.urls.add(a.url)
  porRegla.set(k, g)
}
const resumen = [...porRegla.values()]
  .map((g) => ({ ...g, urls: [...g.urls].slice(0, 5), total: g.urls.size }))
  .sort((a, b) => ['High', 'Medium', 'Low', 'Informational'].indexOf(a.riesgo) - ['High', 'Medium', 'Low', 'Informational'].indexOf(b.riesgo))
const conteo = Object.fromEntries(['High', 'Medium', 'Low', 'Informational'].map((r) => [r, resumen.filter((g) => g.riesgo === r).length]))
writeFileSync(`${salida}-alertas.json`, JSON.stringify({ objetivo, fecha: new Date().toISOString(), reglasPorRiesgo: conteo, alertas: resumen }, null, 2))
writeFileSync(`${salida}.html`, await api('/OTHER/core/other/htmlreport/'))
console.log('reglas con alerta por riesgo:', JSON.stringify(conteo))
for (const g of resumen) console.log(`${g.riesgo.padEnd(13)} ${g.regla} (${g.total} URL)`)
