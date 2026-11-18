import { expect, test } from '@playwright/test'
import { iniciarSesion } from './utils'

// WC-06 · CP-NF-013 y bloque 3: las cookies de sesión llevan HttpOnly y Secure,
// y las respuestas traen las cabeceras de seguridad (src/lib/seguridad/cabeceras.ts).

test('CP-NF-013 · eys_access y eys_refresh son HttpOnly y Secure; eys_user no lleva el token', async ({ page, context }) => {
  await iniciarSesion(page, 'docente')
  const cookies = Object.fromEntries((await context.cookies()).map((c) => [c.name, c]))
  for (const nombre of ['eys_access', 'eys_refresh']) {
    expect(cookies[nombre], nombre).toBeTruthy()
    expect(cookies[nombre].httpOnly, `${nombre} HttpOnly`).toBe(true)
    expect(cookies[nombre].secure, `${nombre} Secure`).toBe(true)
    expect(cookies[nombre].sameSite, `${nombre} SameSite`).toBe('Lax')
  }
  expect(cookies.eys_user.value).not.toMatch(/eyJ[\w-]+\.[\w-]+\./)
})

test('WC-06 · las respuestas traen CSP, anti-clickjacking, nosniff, Referrer-Policy, Permissions-Policy y HSTS', async ({ request }) => {
  for (const ruta of ['/', '/?login=1', '/forgot-password']) {
    const r = await request.get(ruta)
    const h = r.headers()
    expect(h['content-security-policy'], ruta).toContain("frame-ancestors 'none'")
    expect(h['x-frame-options'], ruta).toBe('DENY')
    expect(h['x-content-type-options'], ruta).toBe('nosniff')
    expect(h['referrer-policy'], ruta).toBe('strict-origin-when-cross-origin')
    expect(h['permissions-policy'], ruta).toContain('camera=(self)')
    expect(h['strict-transport-security'], ruta).toContain('max-age=')
  }
})
