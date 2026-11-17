import { describe, expect, it } from 'vitest'

import { cabecerasDeSeguridad, CSP } from '@/lib/seguridad/cabeceras'

// WC-06 · bloque 3: cabeceras de seguridad (antes no había ninguna).
const mapa = (produccion: boolean) => Object.fromEntries(cabecerasDeSeguridad(produccion).map((h) => [h.key, h.value]))

describe('cabeceras de seguridad (WC-06)', () => {
  it('en producción van la CSP, el anti-clickjacking, nosniff, Referrer-Policy, Permissions-Policy y HSTS', () => {
    const h = mapa(true)
    expect(h['X-Frame-Options']).toBe('DENY')
    expect(h['X-Content-Type-Options']).toBe('nosniff')
    expect(h['Referrer-Policy']).toBe('strict-origin-when-cross-origin')
    expect(h['Permissions-Policy']).toContain('camera=(self)')
    expect(h['Strict-Transport-Security']).toMatch(/max-age=\d{8}/)
    expect(h['Content-Security-Policy']).toBe(CSP)
  })

  it('la CSP no deja incrustar la web ni cargar plugins, y limita formularios y base', () => {
    for (const d of ["frame-ancestors 'none'", "object-src 'none'", "form-action 'self'", "base-uri 'self'", "default-src 'self'"]) expect(CSP).toContain(d)
    expect(CSP).not.toMatch(/unsafe-eval/)
  })

  it('en desarrollo no hay CSP (Fast Refresh necesita eval)', () => {
    expect(mapa(false)['Content-Security-Policy']).toBeUndefined()
  })
})
