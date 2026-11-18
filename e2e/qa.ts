import { expect, test, type Page } from '@playwright/test'
import { requiere } from './utils'

// Ayudas de los E2E de WC-05 que necesitan preparar o borrar datos en QA, o
// simular la API caída. Nada de esto toca la web: va directo a la API de QA con
// la cuenta de admin de pruebas (QA_PASSWORD, nunca en el código).

const API = () => (process.env.QA_API_URL ?? '').replace(/\/$/, '')

type Cuenta = 'admin' | 'docente'
const tokens: Partial<Record<Cuenta, string>> = {}

async function token(cuenta: Cuenta): Promise<string> {
  const guardado = tokens[cuenta]
  if (guardado) return guardado
  const correo = cuenta === 'admin' ? process.env.E2E_ADMIN_EMAIL : process.env.E2E_DOCENTE_EMAIL
  const r = await fetch(`${API()}/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ correo, password: process.env.QA_PASSWORD ?? process.env.E2E_PASSWORD }),
  })
  if (!r.ok) throw new Error(`login de ${cuenta} en QA → ${r.status}`)
  const t = ((await r.json()) as { access_token: string }).access_token
  tokens[cuenta] = t
  return t
}

/**
 * Llamada a la API de QA (por defecto como admin). Devuelve el JSON (o null en
 * un 204). Las notas solo las borra el docente que las registró: `cuenta: 'docente'`.
 */
export async function apiQA<T = unknown>(ruta: string, init: RequestInit = {}, cuenta: Cuenta = 'admin'): Promise<T> {
  const pedir = async () =>
    fetch(`${API()}${ruta}`, {
      ...init,
      headers: { 'content-type': 'application/json', authorization: `Bearer ${await token(cuenta)}`, ...(init.headers ?? {}) },
    })
  let r = await pedir()
  // El token de acceso dura 30 min y una corrida completa dura más (E25): se
  // vuelve a iniciar sesión una vez.
  if (r.status === 401) {
    delete tokens[cuenta]
    r = await pedir()
  }
  if (!r.ok) throw new Error(`${init.method ?? 'GET'} ${ruta} → ${r.status} ${(await r.text()).slice(0, 200)}`)
  return (r.status === 204 ? null : await r.json()) as T
}

/** Borra sin fallar si ya no existe (limpieza al final de un spec). */
export async function borrarQA(ruta: string, cuenta: Cuenta = 'admin'): Promise<void> {
  await apiQA(ruta, { method: 'DELETE' }, cuenta).catch((e: Error) => {
    if (!/→ 404/.test(e.message)) throw e
  })
}

/** Fecha de hoy en la zona de Colombia (la de QA), AAAA-MM-DD. */
export function hoy(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota' }).format(new Date())
}

// ── API caída (scripts/api-fallas.mjs) ────────────────────────────────────────

const FALLAS = () => process.env.E2E_API_FALLAS_URL ?? ''

async function modo(valor: 'normal' | 'caida') {
  const r = await fetch(`${FALLAS()}/__fallas?modo=${valor}`, { method: 'POST' })
  if (!r.ok) throw new Error(`api-fallas → ${r.status}`)
}

/**
 * Corre `fn` con la API caída y la restaura siempre. Solo existe cuando la web
 * se construyó contra el proxy de fallas (E2E_API_FALLAS_URL); en el deploy de QA
 * el escenario se omite con su motivo.
 */
export async function conApiCaida(fn: () => Promise<void>): Promise<void> {
  await modo('caida')
  try {
    await fn()
  } finally {
    await modo('normal')
  }
}

/** Omite el escenario si no hay proxy de fallas (deploy de QA). */
export function requiereApiFallas() {
  requiere('E2E_API_FALLAS_URL')
}

/** Restaura la API por si una prueba se cortó a mitad. */
export function restaurarApiAlTerminar() {
  test.afterEach(async () => {
    if (FALLAS()) await modo('normal').catch(() => null)
  })
}

/** Ningún texto técnico o enmascarado a la vista del usuario (DEF-WEB-10). */
export async function sinTextoTecnico(page: Page) {
  await expect(page.getByText(/Minified React error|react\.dev\/errors|Server Components render|fetch failed/i)).toHaveCount(0)
}
