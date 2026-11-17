// DEF-WEB-11 · Fechas del colegio.
//
// `new Date().toISOString()` da la fecha UTC: en Colombia (UTC−5), lo que se
// registraba después de las 19:00 quedaba con la fecha del día siguiente. El
// servidor corre en UTC y el navegador en la zona del usuario, así que «hoy» se
// calcula siempre en la zona del colegio, igual en los dos.

/** Zona horaria del colegio. */
export const ZONA_COLEGIO = 'America/Bogota'

/** Fecha de hoy en el colegio, AAAA-MM-DD (lo que la API espera en `fecha`). */
export function hoyColegio(ahora: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: ZONA_COLEGIO, year: 'numeric', month: '2-digit', day: '2-digit' }).format(ahora)
}
