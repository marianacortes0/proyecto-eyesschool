// DEF-WEB-07 · Llamadas del servidor a la API con tiempo máximo.
//
// Sin límite, una petición a la API que no responde deja colgada la Server Action
// que la hace: el inicio de sesión quedaba en «ENTRANDO…» más de 45 s. La API de QA
// responde en 1–5 s; un intento que pasa de LIMITE_API_MS se corta y se repite una
// vez. Solo para llamadas que se pueden repetir sin efectos (login, lecturas).

/** Tiempo máximo de cada intento. */
export const LIMITE_API_MS = 10_000

/** Errores que justifican otro intento: tiempo agotado o fallo de red, no una respuesta. */
function esReintentable(error: unknown): boolean {
  const nombre = (error as { name?: string } | null)?.name
  return nombre === 'TimeoutError' || nombre === 'AbortError' || error instanceof TypeError
}

export async function fetchConLimite(
  url: string,
  init: RequestInit,
  { intentos = 2, limiteMs = LIMITE_API_MS }: { intentos?: number; limiteMs?: number } = {}
): Promise<Response> {
  let ultimo: unknown
  for (let i = 0; i < intentos; i++) {
    // Igual que AbortSignal.timeout, pero con setTimeout (las pruebas usan relojes falsos).
    const control = new AbortController()
    const reloj = setTimeout(() => control.abort(new DOMException('La API no respondió a tiempo', 'TimeoutError')), limiteMs)
    try {
      return await fetch(url, { ...init, signal: control.signal })
    } catch (error) {
      ultimo = error
      if (!esReintentable(error)) throw error
    } finally {
      clearTimeout(reloj)
    }
  }
  throw ultimo
}

/** ¿El error es un tiempo agotado (después de los reintentos)? */
export function esTiempoAgotado(error: unknown): boolean {
  const nombre = (error as { name?: string } | null)?.name
  return nombre === 'TimeoutError' || nombre === 'AbortError'
}
