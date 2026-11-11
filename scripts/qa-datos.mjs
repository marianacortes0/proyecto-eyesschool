// Imprime los datos del estudiante sintético SYN0101 que piden los E2E:
// E2E_ESTUDIANTE_VINCULADO_ID y E2E_ESTUDIANTE_VINCULADO_NOMBRE, para copiarlos
// a .env.test.local. Uso: node scripts/qa-datos.mjs
//
// Lee QA_API_URL, E2E_ADMIN_EMAIL y QA_PASSWORD de .env.test.local (ese archivo
// no se versiona). NUNCA imprime la contraseña ni el token.
import { existsSync } from 'node:fs'

const ARCHIVO = '.env.test.local'
if (existsSync(ARCHIVO)) process.loadEnvFile(ARCHIVO)

const API = (process.env.QA_API_URL ?? '').replace(/\/$/, '')
const EMAIL = process.env.E2E_ADMIN_EMAIL
const PASSWORD = process.env.QA_PASSWORD
const CODIGO = process.argv[2] ?? 'SYN0101'

const faltan = Object.entries({ QA_API_URL: API, E2E_ADMIN_EMAIL: EMAIL, QA_PASSWORD: PASSWORD })
  .filter(([, v]) => !v)
  .map(([k]) => k)
if (faltan.length) {
  console.error(`Faltan variables en ${ARCHIVO}: ${faltan.join(', ')}. Copiá .env.test.example y completalas.`)
  process.exit(1)
}

async function pedir(path, init) {
  const r = await fetch(`${API}${path}`, init)
  if (!r.ok) {
    const cuerpo = await r.text().catch(() => '')
    const detalle = cuerpo.slice(0, 300).replace(/ey[A-Za-z0-9._-]{20,}/g, '<token>')
    throw new Error(`${init?.method ?? 'GET'} ${path} → ${r.status}. ${detalle}`)
  }
  return r.json()
}

const login = await pedir('/auth/login', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  // La API espera `correo`, igual que `login` en src/auth/actions.ts.
  body: JSON.stringify({ correo: EMAIL, password: PASSWORD }),
})
const token = login.access_token ?? login.accessToken
if (!token) throw new Error('El login no devolvió access_token.')

const estudiantes = await pedir('/estudiantes?limit=500', { headers: { authorization: `Bearer ${token}` } })
const lista = Array.isArray(estudiantes) ? estudiantes : (estudiantes.items ?? [])
const buscado = lista.find((e) => (e.codigo_estudiante ?? e.codigoEstudiante) === CODIGO)

if (!buscado) {
  console.error(`No hay ningún estudiante con código ${CODIGO} entre los ${lista.length} que devolvió la API.`)
  console.error('Si la base de QA no tiene el seed de estudiantes sintéticos, corré los SQL del seed (acción externa 6).')
  process.exit(2)
}

const id = buscado.id_estudiante ?? buscado.idEstudiante
const nombre = buscado.nombre ?? [buscado.primer_nombre, buscado.primer_apellido].filter(Boolean).join(' ')

console.log(`# ${CODIGO} en ${new URL(API).host} · pegar en ${ARCHIVO}`)
console.log(`E2E_ESTUDIANTE_VINCULADO_ID=${id}`)
console.log(`E2E_ESTUDIANTE_VINCULADO_NOMBRE=${nombre}`)
