// Extrae un mensaje legible de un valor capturado en un catch (de tipo `unknown`).
// Evita el uso de `any` en los bloques catch y unifica el fallback de toda la app.

// DEF-WEB-10 · En producción, React reemplaza el mensaje de cualquier error que
// lance una Server Action por «Minified React error #441…», y los fallos de red
// llegan como «fetch failed» o «Failed to fetch». Ninguno sirve al usuario: en su
// lugar se muestra el mensaje de la pantalla (`fallback`).
const TECNICOS = [
  /Minified React error/i,
  /react\.dev\/errors\//i,
  /Server Components render/i,
  /omitted in production/i,
  /^fetch failed$/i,
  /^Failed to fetch$/i,
  /^NetworkError\b/i,
  /^Load failed$/i,
]

function legible(msg: string): boolean {
  return msg.trim() !== '' && !TECNICOS.some((r) => r.test(msg))
}

/** Devuelve el mensaje del error si sirve al usuario; si no, el fallback. */
export function getErrorMessage(e: unknown, fallback: string): string {
  let msg: unknown
  if (typeof e === 'string') msg = e
  else if (typeof e === 'object' && e !== null && 'message' in e) msg = (e as { message?: unknown }).message
  return typeof msg === 'string' && legible(msg) ? msg : fallback
}
