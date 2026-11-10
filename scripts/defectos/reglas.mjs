// Reglas de la gestión de defectos en GitHub Issues (PR-07 · D-WEB-15).
//
// Funciones puras, sin red: las usa `scripts/defectos/gestion.mjs` (workflow
// `.github/workflows/defectos.yml`) y las prueba `tests/defectos.test.ts`.
// El proceso completo está en
// planeacion/tests/GestionDefectos/planeacion-gestion-defectos-frontend-web.md.

/** Etiquetas del proceso. `grupo` marca las que son excluyentes entre sí. */
export const ETIQUETAS = [
  { name: 'defecto', color: 'd73a4a', description: 'Defecto registrado con la ficha del PR-07' },
  { name: 'reabierto', color: 'b60205', description: 'Falló la verificación de QA y se reabrió (métrica del PR-07)' },

  { grupo: 'componente', name: 'web', color: '1d76db', description: 'Componente: frontend web (este repositorio)' },
  { grupo: 'componente', name: 'backend', color: '5319e7', description: 'Componente: API FastAPI' },
  { grupo: 'componente', name: 'app', color: '0e8a16', description: 'Componente: aplicación móvil' },

  { grupo: 'origen', name: 'revision-codigo', color: 'c5def5', description: 'Origen: revisión de código' },
  { grupo: 'origen', name: 'analisis-estatico', color: 'c5def5', description: 'Origen: ESLint, SonarQube, gitleaks o npm audit' },
  { grupo: 'origen', name: 'pruebas-unitarias', color: 'c5def5', description: 'Origen: pruebas unitarias y de componentes (PR-04)' },
  { grupo: 'origen', name: 'pruebas-integracion', color: 'c5def5', description: 'Origen: pruebas de integración (PR-05)' },
  { grupo: 'origen', name: 'pruebas-sistema', color: 'c5def5', description: 'Origen: pruebas de sistema y E2E (PR-06)' },
  { grupo: 'origen', name: 'uat', color: 'c5def5', description: 'Origen: pruebas de aceptación' },

  { grupo: 'severidad', name: 'severidad:critica', color: 'b60205', description: 'La define QA · corrección ≤ 24 h' },
  { grupo: 'severidad', name: 'severidad:alta', color: 'd93f0b', description: 'La define QA · corrección ≤ 3 días' },
  { grupo: 'severidad', name: 'severidad:media', color: 'fbca04', description: 'La define QA · corrección en el mismo sprint' },
  { grupo: 'severidad', name: 'severidad:baja', color: 'c2e0c6', description: 'La define QA · va al backlog' },

  { grupo: 'prioridad', name: 'P1', color: 'b60205', description: 'Prioridad 1 (la confirma el PO)' },
  { grupo: 'prioridad', name: 'P2', color: 'd93f0b', description: 'Prioridad 2 (la confirma el PO)' },
  { grupo: 'prioridad', name: 'P3', color: 'fbca04', description: 'Prioridad 3 (la confirma el PO)' },
  { grupo: 'prioridad', name: 'P4', color: 'c2e0c6', description: 'Prioridad 4 (la confirma el PO)' },

  { grupo: 'estado', name: 'estado:nuevo', color: 'ededed', description: 'Registrado por QA, sin aprobar' },
  { grupo: 'estado', name: 'estado:aprobado', color: 'bfdadc', description: 'El PO confirmó la prioridad' },
  { grupo: 'estado', name: 'estado:en-curso', color: '0052cc', description: 'Un PR abierto lo corrige' },
  { grupo: 'estado', name: 'estado:en-verificacion', color: '5319e7', description: 'Corrección fusionada en develop: QA repite el caso y la regresión' },
]

/** Títulos de los campos de la plantilla `.github/ISSUE_TEMPLATE/defecto.yml`. */
export const CAMPOS = {
  id: 'ID del registro',
  componente: 'Componente',
  origen: 'Origen',
  severidad: 'Severidad',
  prioridad: 'Prioridad propuesta',
  caso: 'Caso que lo detectó',
  correccion: 'Corrección planeada',
}

const OPCIONES = {
  componente: { Web: 'web', Backend: 'backend', App: 'app' },
  origen: {
    'Revisión de código': 'revision-codigo',
    'Análisis estático': 'analisis-estatico',
    'Pruebas unitarias': 'pruebas-unitarias',
    'Pruebas de integración': 'pruebas-integracion',
    'Pruebas de sistema': 'pruebas-sistema',
    UAT: 'uat',
  },
  severidad: { Crítica: 'severidad:critica', Alta: 'severidad:alta', Media: 'severidad:media', Baja: 'severidad:baja' },
  prioridad: { P1: 'P1', P2: 'P2', P3: 'P3', P4: 'P4' },
}

/** Opciones de cada desplegable de la plantilla (para comprobar que coinciden). */
export const OPCIONES_DEL_FORMULARIO = Object.fromEntries(Object.entries(OPCIONES).map(([k, v]) => [k, Object.keys(v)]))

/** Prioridad que QA propone según la severidad (planeación §3). */
export const PRIORIDAD_POR_SEVERIDAD = {
  'severidad:critica': 'P1',
  'severidad:alta': 'P2',
  'severidad:media': 'P3',
  'severidad:baja': 'P4',
}

const SIN_RESPUESTA = '_No response_'

/**
 * Lee el cuerpo de un issue creado con la plantilla. GitHub lo escribe como
 * `### <título del campo>` seguido del valor.
 * @param {string | null | undefined} cuerpo
 * @returns {Record<string, string>} título del campo → valor (vacío si no se respondió)
 */
export function leerFormulario(cuerpo) {
  /** @type {Record<string, string>} */
  const campos = {}
  const partes = (cuerpo ?? '').replace(/\r\n/g, '\n').split(/^### +/m).slice(1)
  for (const parte of partes) {
    const salto = parte.indexOf('\n')
    const titulo = (salto === -1 ? parte : parte.slice(0, salto)).trim()
    const valor = salto === -1 ? '' : parte.slice(salto + 1).trim()
    campos[titulo] = valor === SIN_RESPUESTA ? '' : valor
  }
  return campos
}

/**
 * Etiquetas que corresponden a lo que se respondió en la plantilla.
 * La prioridad solo se toma al abrir el issue: después la cambia el PO con la etiqueta.
 * @param {Record<string, string>} campos resultado de `leerFormulario`
 * @param {{ conPrioridad?: boolean }} [opciones]
 * @returns {string[]}
 */
export function etiquetasDelFormulario(campos, { conPrioridad = true } = {}) {
  const grupos = /** @type {const} */ (['componente', 'origen', 'severidad', 'prioridad'])
  /** @type {string[]} */
  const etiquetas = []
  for (const grupo of grupos) {
    if (grupo === 'prioridad' && !conPrioridad) continue
    /** @type {Record<string, string>} */
    const opciones = OPCIONES[grupo]
    const etiqueta = opciones[campos[CAMPOS[grupo]] ?? '']
    if (etiqueta) etiquetas.push(etiqueta)
  }
  const severidad = etiquetas.find((e) => e.startsWith('severidad:'))
  if (conPrioridad && severidad && !etiquetas.some((e) => /^P[1-4]$/.test(e))) {
    etiquetas.push(PRIORIDAD_POR_SEVERIDAD[/** @type {keyof typeof PRIORIDAD_POR_SEVERIDAD} */ (severidad)])
  }
  return etiquetas
}

/** @param {string} nombre */
function grupoDe(nombre) {
  return ETIQUETAS.find((e) => e.name === nombre)?.grupo
}

/**
 * Cambios para dejar `nuevas` en el issue sin dejar dos etiquetas del mismo grupo
 * (una sola severidad, una sola prioridad, un solo estado…).
 * @param {string[]} actuales etiquetas que ya tiene el issue
 * @param {string[]} nuevas etiquetas que debe tener
 * @returns {{ agregar: string[], quitar: string[] }}
 */
export function cambiosDeEtiquetas(actuales, nuevas) {
  const grupos = new Set(nuevas.map(grupoDe).filter(Boolean))
  const quitar = actuales.filter((a) => !nuevas.includes(a) && grupos.has(grupoDe(a)))
  const agregar = nuevas.filter((n, i) => !actuales.includes(n) && nuevas.indexOf(n) === i)
  return { agregar, quitar }
}

/**
 * Etiquetas que debe tener un defecto después de un evento del ciclo de vida
 * (planeación §2). Devuelve `null` si el evento no cambia nada.
 *   - `abierto`: Nuevo, con la clasificación del formulario.
 *   - `editado`: vuelve a leer componente, origen y severidad.
 *   - `pr-abierto`: En curso, salvo que ya esté en verificación.
 *   - `pr-fusionado`: En verificación (QA repite el caso y cierra o reabre).
 *   - `reabierto`: En curso y se marca como reabierto.
 * @param {'abierto' | 'editado' | 'pr-abierto' | 'pr-fusionado' | 'reabierto'} evento
 * @param {{ etiquetas: string[], cuerpo?: string | null }} issue
 * @returns {string[] | null}
 */
export function etiquetasTrasEvento(evento, { etiquetas, cuerpo }) {
  switch (evento) {
    case 'abierto':
      return ['estado:nuevo', ...etiquetasDelFormulario(leerFormulario(cuerpo))]
    case 'editado': {
      const nuevas = etiquetasDelFormulario(leerFormulario(cuerpo), { conPrioridad: false })
      return nuevas.length ? nuevas : null
    }
    case 'pr-abierto':
      return etiquetas.includes('estado:en-verificacion') || etiquetas.includes('estado:en-curso') ? null : ['estado:en-curso']
    case 'pr-fusionado':
      return ['estado:en-verificacion']
    case 'reabierto':
      return ['estado:en-curso', 'reabierto']
    default:
      return null
  }
}

/**
 * Números de issue que un PR dice corregir: «Corrige #12», «Defecto #12»,
 * «Refs #12» y también las palabras de cierre de GitHub («Closes #12», «Fixes #12»…),
 * para poder reabrir el defecto si GitHub lo cerró antes de que QA lo verificara.
 * @param {string | null | undefined} texto título y descripción del PR
 * @returns {number[]}
 */
export function issuesReferidos(texto) {
  const patron = /\b(?:corrige|corregido|defecto|def|refs?|verifica|close[sd]?|fix(?:e[sd])?|resolve[sd]?)\s*:?\s+#(\d+)\b/gi
  const numeros = [...(texto ?? '').matchAll(patron)].map((m) => Number(m[1]))
  return [...new Set(numeros)].sort((a, b) => a - b)
}

const ESTADOS = {
  'estado:nuevo': 'Nuevo',
  'estado:aprobado': 'Aprobado',
  'estado:en-curso': 'En curso',
  'estado:en-verificacion': 'En verificación',
}

/**
 * Estado del defecto para el registro del PR-07.
 * @param {{ state: string, state_reason?: string | null, etiquetas: string[] }} issue
 */
export function estadoDe({ state, state_reason, etiquetas }) {
  if (state === 'closed') return state_reason === 'not_planned' ? 'Descartado' : 'Cerrado'
  const estado = etiquetas.find((e) => e in ESTADOS)
  return estado ? ESTADOS[/** @type {keyof typeof ESTADOS} */ (estado)] : 'Nuevo'
}

/** @param {unknown} v */
function celda(v) {
  const s = v == null ? '' : String(v)
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export const COLUMNAS_CSV = [
  'Issue',
  'ID del registro',
  'Título',
  'Severidad',
  'Prioridad',
  'Componente',
  'Origen',
  'Estado',
  'Reabierto',
  'Caso',
  'Corrección',
  'Abierto',
  'Cerrado',
  'Días abierto',
]

/**
 * Una fila del CSV que se anexa al PR-07 en cada corte (21 y 28 nov).
 * @param {{ number: number, title: string, body?: string | null, state: string, state_reason?: string | null,
 *           created_at: string, closed_at?: string | null, labels: Array<{ name: string } | string> }} issue
 */
export function filaCsv(issue) {
  const etiquetas = issue.labels.map((l) => (typeof l === 'string' ? l : l.name))
  const campos = leerFormulario(issue.body)
  const del = (/** @type {string} */ grupo) => etiquetas.find((e) => grupoDe(e) === grupo) ?? ''
  const fecha = (/** @type {string | null | undefined} */ iso) => (iso ? iso.slice(0, 10) : '')
  const fin = issue.closed_at ? Date.parse(issue.closed_at) : null
  const dias = fin === null ? '' : Math.round((fin - Date.parse(issue.created_at)) / 86_400_000)
  return [
    `#${issue.number}`,
    campos[CAMPOS.id] ?? '',
    issue.title,
    del('severidad').replace('severidad:', ''),
    del('prioridad'),
    del('componente'),
    del('origen'),
    estadoDe({ state: issue.state, state_reason: issue.state_reason, etiquetas }),
    etiquetas.includes('reabierto') ? 'sí' : 'no',
    campos[CAMPOS.caso] ?? '',
    campos[CAMPOS.correccion] ?? '',
    fecha(issue.created_at),
    fecha(issue.closed_at),
    dias,
  ]
    .map(celda)
    .join(',')
}
