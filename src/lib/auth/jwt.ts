// Lectura (sin verificar firma) del payload de un JWT. La firma la verifica la API
// en cada petición; aquí solo hace falta el rol y el vencimiento. Funciona en Node
// y en el runtime Edge del proxy (usa `atob`).

export type JwtPayload = Record<string, unknown>

export function decodeJwtPayload(token: string | undefined | null): JwtPayload | null {
  if (!token) return null
  try {
    const part = token.split('.')[1]
    if (!part) return null
    const padded = part + '='.repeat((4 - (part.length % 4)) % 4)
    const bytes = Uint8Array.from(atob(padded.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0))
    return JSON.parse(new TextDecoder().decode(bytes)) as JwtPayload
  } catch {
    return null
  }
}

/** Sin payload, o con `exp` en el pasado respecto de `ahora` (ms), el token no sirve. */
export function isExpired(payload: JwtPayload | null, ahora: number = Date.now()): boolean {
  if (!payload) return true
  const exp = payload.exp
  return typeof exp === 'number' && ahora / 1000 > exp
}
