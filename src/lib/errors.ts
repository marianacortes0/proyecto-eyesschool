// Extrae un mensaje legible de un valor capturado en un catch (de tipo `unknown`).
// Evita el uso de `any` en los bloques catch y unifica el fallback de toda la app.

/** Devuelve `e.message` si es un Error (o trae `message`), si no, el fallback. */
export function getErrorMessage(e: unknown, fallback: string): string {
  if (e instanceof Error && e.message) return e.message
  if (typeof e === 'string' && e) return e
  if (typeof e === 'object' && e !== null && 'message' in e) {
    const msg = (e as { message?: unknown }).message
    if (typeof msg === 'string' && msg) return msg
  }
  return fallback
}
