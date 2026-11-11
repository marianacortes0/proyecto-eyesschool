// Base de la API para el proxy (WEB-02). Vive aparte del route handler para
// poder probarse: un archivo `route.ts` solo debe exportar métodos HTTP.

/** Quita las barras finales sin regex: `/a///` → `/a`, `/` y `''` → `''`. */
export function quitarBarrasFinales(s: string): string {
  let fin = s.length
  while (fin > 0 && s[fin - 1] === '/') fin -= 1
  return s.slice(0, fin)
}

export const API_POR_DEFECTO = 'http://localhost:8000/api/v1'

/**
 * `?? API_POR_DEFECTO` no alcanza: una variable definida pero vacía deja pasar
 * `''`, y `new URL('')` lanza en medio del build (pasó en Netlify). Aquí la
 * cadena vacía o con espacios cuenta como no definida, y un valor que no sea
 * URL se rechaza con un mensaje que nombra la variable.
 */
export function apiBase(valor = process.env.NEXT_PUBLIC_API_URL): URL {
  const texto = valor?.trim() ? valor.trim() : API_POR_DEFECTO
  try {
    return new URL(texto)
  } catch {
    throw new Error('NEXT_PUBLIC_API_URL no es una URL válida (debe incluir el protocolo, p. ej. https://…/api/v1).')
  }
}
