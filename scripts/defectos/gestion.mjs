// Gestión de defectos en GitHub Issues (PR-07 · D-WEB-15). Lo ejecuta
// `.github/workflows/defectos.yml`; las reglas están en `./reglas.mjs`.
//
// Uso (en Actions, con GITHUB_TOKEN y GITHUB_REPOSITORY):
//   node scripts/defectos/gestion.mjs etiquetas          crea o actualiza las etiquetas del proceso
//   node scripts/defectos/gestion.mjs evento             aplica el ciclo de vida al evento actual
//   node scripts/defectos/gestion.mjs exportar <csv>     registro de defectos para el corte del PR-07
//
// Nunca imprime el token.
import { readFileSync, writeFileSync } from 'node:fs'

import {
  COLUMNAS_CSV,
  ETIQUETAS,
  cambiosDeEtiquetas,
  etiquetasTrasEvento,
  filaCsv,
  issuesReferidos,
} from './reglas.mjs'

const { GITHUB_TOKEN, GITHUB_REPOSITORY, GITHUB_EVENT_NAME, GITHUB_EVENT_PATH } = process.env
const API = process.env.GITHUB_API_URL ?? 'https://api.github.com'
const RAMA_DE_INTEGRACION = 'develop'

if (!GITHUB_TOKEN || !GITHUB_REPOSITORY) {
  console.error('Faltan GITHUB_TOKEN o GITHUB_REPOSITORY.')
  process.exit(1)
}

async function gh(metodo, ruta, cuerpo, { permitir404 = false } = {}) {
  const r = await fetch(`${API}/repos/${GITHUB_REPOSITORY}${ruta}`, {
    method: metodo,
    headers: {
      accept: 'application/vnd.github+json',
      authorization: `Bearer ${GITHUB_TOKEN}`,
      'x-github-api-version': '2022-11-28',
      ...(cuerpo ? { 'content-type': 'application/json' } : {}),
    },
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
  })
  if (r.status === 404 && permitir404) return null
  if (!r.ok) throw new Error(`${metodo} ${ruta} → ${r.status} ${(await r.text()).slice(0, 200)}`)
  return r.status === 204 ? null : r.json()
}

const nombres = (issue) => issue.labels.map((l) => (typeof l === 'string' ? l : l.name))

async function aplicar(numero, actuales, nuevas) {
  const { agregar, quitar } = cambiosDeEtiquetas(actuales, nuevas)
  for (const e of quitar) await gh('DELETE', `/issues/${numero}/labels/${encodeURIComponent(e)}`, null, { permitir404: true })
  if (agregar.length) await gh('POST', `/issues/${numero}/labels`, { labels: agregar })
  console.log(`#${numero}: +[${agregar.join(', ')}] -[${quitar.join(', ')}]`)
}

async function etiquetas() {
  for (const { name, color, description } of ETIQUETAS) {
    const ruta = `/labels/${encodeURIComponent(name)}`
    const existe = await gh('GET', ruta, null, { permitir404: true })
    if (existe) await gh('PATCH', ruta, { new_name: name, color, description })
    else await gh('POST', '/labels', { name, color, description })
    console.log(`${existe ? 'actualizada' : 'creada'}: ${name}`)
  }
}

async function eventoDeIssue(accion, issue, cambios) {
  const actuales = nombres(issue)
  if (!actuales.includes('defecto')) return console.log(`#${issue.number} no es un defecto: sin cambios.`)

  const evento = { opened: 'abierto', edited: 'editado', reopened: 'reabierto' }[accion]
  if (!evento || (evento === 'editado' && !cambios?.body)) return
  const nuevas = etiquetasTrasEvento(evento, { etiquetas: actuales, cuerpo: issue.body })
  if (nuevas) await aplicar(issue.number, actuales, nuevas)

  if (evento === 'reabierto') {
    await gh('POST', `/issues/${issue.number}/comments`, {
      body: 'Reabierto: la corrección no pasó la verificación de QA. Vuelve a **En curso** y cuenta como reabierto en la métrica del PR-07.',
    })
  }
}

async function eventoDePr(accion, pr) {
  if (pr.base?.ref !== RAMA_DE_INTEGRACION) return
  const fusionado = accion === 'closed' && pr.merged
  if (accion === 'closed' && !fusionado) return
  const evento = fusionado ? 'pr-fusionado' : 'pr-abierto'

  for (const numero of issuesReferidos(`${pr.title}\n${pr.body ?? ''}`)) {
    const issue = await gh('GET', `/issues/${numero}`, null, { permitir404: true })
    if (!issue || issue.pull_request || !nombres(issue).includes('defecto')) continue

    // Un defecto solo lo cierra QA después de verificarlo (planeación §6). Si un
    // «Closes #N» lo cerró al fusionar, se reabre para la verificación.
    if (fusionado && issue.state === 'closed') await gh('PATCH', `/issues/${numero}`, { state: 'open' })

    const nuevas = etiquetasTrasEvento(evento, { etiquetas: nombres(issue), cuerpo: issue.body })
    if (nuevas) await aplicar(numero, nombres(issue), nuevas)

    if (fusionado) {
      await gh('POST', `/issues/${numero}/comments`, {
        body: [
          `Corrección fusionada en \`${RAMA_DE_INTEGRACION}\` con #${pr.number} (commit \`${(pr.merge_commit_sha ?? '').slice(0, 7)}\`). Pasa a **En verificación**.`,
          '',
          'Para cerrarlo, QA (planeación del PR-07, §6):',
          '- [ ] La corrección está desplegada en QA y el caso que lo detectó pasa.',
          '- [ ] La regresión del módulo pasa (pruebas automatizadas y casos de sistema).',
          '- [ ] Se anotó la causa raíz (Requisitos, Diseño, Codificación, Datos o Entorno) y el commit.',
          '',
          'Si todo pasa: **Close as completed**. Si no: **Reopen** (cuenta como reabierto). Un falso positivo o una decisión de diseño se cierra como **Close as not planned**, con la justificación.',
        ].join('\n'),
      })
    } else if (accion === 'opened') {
      await gh('POST', `/issues/${numero}/comments`, { body: `#${pr.number} lo corrige. Pasa a **En curso**.` })
    }
  }
}

async function evento() {
  const carga = JSON.parse(readFileSync(GITHUB_EVENT_PATH, 'utf8'))
  if (GITHUB_EVENT_NAME === 'issues') return eventoDeIssue(carga.action, carga.issue, carga.changes)
  if (GITHUB_EVENT_NAME === 'pull_request') return eventoDePr(carga.action, carga.pull_request)
  console.log(`Evento ${GITHUB_EVENT_NAME}: nada que hacer.`)
}

async function exportar(archivo) {
  const filas = []
  for (let pagina = 1; ; pagina++) {
    const lote = await gh('GET', `/issues?labels=defecto&state=all&per_page=100&page=${pagina}&sort=created&direction=asc`)
    filas.push(...lote.filter((i) => !i.pull_request).map(filaCsv))
    if (lote.length < 100) break
  }
  writeFileSync(archivo, [COLUMNAS_CSV.join(','), ...filas].join('\n') + '\n', 'utf8')
  console.log(`${filas.length} defectos exportados a ${archivo}.`)
}

const [modo, archivo = 'defectos.csv'] = process.argv.slice(2)
const acciones = { etiquetas, evento, exportar: () => exportar(archivo) }
if (!acciones[modo]) {
  console.error(`Modo desconocido «${modo ?? ''}». Usa: etiquetas | evento | exportar <archivo.csv>`)
  process.exit(1)
}
await acciones[modo]()
