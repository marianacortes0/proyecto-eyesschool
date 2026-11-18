// Elige el estudiante para los E2E de cámara (e2e/qr-camara.spec.ts): uno activo,
// fuera del curso del registro masivo y sin registros de asistencia hoy (hora de
// Colombia). Imprime E2E_QR_CODIGO_VALIDO=<código> para el entorno de la corrida.
// Uso: node scripts/qr-camara.mjs
import { existsSync } from 'node:fs'

if (existsSync('.env.test.local')) process.loadEnvFile('.env.test.local')
const API = (process.env.QA_API_URL ?? '').replace(/\/$/, '')
const hoy = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota' }).format(new Date())

const login = await fetch(`${API}/auth/login`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ correo: process.env.E2E_ADMIN_EMAIL, password: process.env.QA_PASSWORD }),
})
const token = (await login.json()).access_token
const get = async (p) => (await fetch(`${API}${p}`, { headers: { authorization: `Bearer ${token}` } })).json()

const [estudiantes, registros, cursos] = await Promise.all([get('/estudiantes?limit=500'), get(`/asistencia?fecha=${hoy}&limit=500`), get('/cursos?limit=500')])
const conRegistro = new Set(registros.map((r) => r.id_estudiante))
const masivo = cursos.find((c) => c.nombre_curso === process.env.E2E_CURSO_MASIVO)?.id_curso
const elegido = estudiantes.find((e) => e.estado === 'Activo' && e.codigo_estudiante && e.id_curso_actual !== masivo && !conRegistro.has(e.id_estudiante))
if (!elegido) {
  console.error('No hay un estudiante activo sin registros hoy fuera del curso del registro masivo.')
  process.exit(2)
}
console.log(`E2E_QR_CODIGO_VALIDO=${elegido.codigo_estudiante}`)
