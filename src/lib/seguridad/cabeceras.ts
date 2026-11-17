// WC-06 · bloque 3 (ZAP / OWASP A05): cabeceras de seguridad de todas las
// respuestas. Antes no había ninguna (ni CSP, ni HSTS, ni anti-clickjacking).
//
// La CSP permite solo lo que la web usa: Google Fonts (iconos y tipografías),
// el reproductor de YouTube de la portada y api.qrserver.com (lectura de QR).
// Next inyecta scripts y estilos en línea, por eso 'unsafe-inline' en script-src
// y style-src; sin nonces es lo que se puede exigir sin romper la hidratación.
// En desarrollo (`next dev`) no se aplica: Fast Refresh necesita 'unsafe-eval'.

/** Origen de la API (las imágenes de perfil y los archivos salen de ahí). */
function origenApi(): string {
  try {
    return new URL(process.env.NEXT_PUBLIC_API_URL ?? '').origin
  } catch {
    return ''
  }
}

export const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  // Sin comodín «https:» (alerta de ZAP): solo la API y el generador de QR.
  `img-src 'self' data: blob: https://api.qrserver.com ${origenApi()}`.trim(),
  "media-src 'self' blob:",
  "connect-src 'self' https://api.qrserver.com",
  'frame-src https://www.youtube.com https://www.youtube-nocookie.com',
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ')

export function cabecerasDeSeguridad(produccion = process.env.NODE_ENV === 'production') {
  const comunes = [
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    // La cámara solo para la propia web (escaneo de QR); nada de micrófono ni ubicación.
    { key: 'Permissions-Policy', value: 'camera=(self), microphone=(), geolocation=()' },
    { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  ]
  return produccion ? [...comunes, { key: 'Content-Security-Policy', value: CSP }] : comunes
}
