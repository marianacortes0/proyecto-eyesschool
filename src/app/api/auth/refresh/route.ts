import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { ACCESS_MAX_AGE, cookieOptions } from '@/lib/auth/cookies'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

/**
 * Renueva el access token usando el refresh token (cookie httpOnly).
 * Lo puede llamar el cliente al recibir 401; el proxy (proxy.ts) ya renueva de forma proactiva.
 */
export async function POST() {
  const store = await cookies()
  const refresh = store.get('eys_refresh')?.value
  if (!refresh) {
    return NextResponse.json({ error: 'no_refresh_token' }, { status: 401 })
  }

  const res = await fetch(`${API}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refresh }),
    cache: 'no-store',
  }).catch(() => null)

  if (!res || !res.ok) {
    // refresh inválido/expirado → limpiar sesión
    store.delete('eys_access')
    store.delete('eys_refresh')
    store.delete('eys_user')
    store.delete('eys_last')
    return NextResponse.json({ error: 'refresh_failed' }, { status: 401 })
  }

  const { access_token } = (await res.json()) as { access_token: string }
  store.set('eys_access', access_token, cookieOptions(true, ACCESS_MAX_AGE))
  return NextResponse.json({ ok: true })
}
