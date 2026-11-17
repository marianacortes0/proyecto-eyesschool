import { describe, expect, it } from 'vitest'

import { getErrorMessage } from '@/lib/errors'

// DEF-WEB-10 · en producción, React reemplaza el mensaje de un error lanzado en
// una Server Action por «Minified React error #441…». La app lo mostraba tal cual
// («❌ Minified React error #441; visit https://react.dev/errors/441…»). Ningún
// mensaje técnico o enmascarado debe llegar al usuario: se usa el de la pantalla.

const PROD_441 =
  'Minified React error #441; visit https://react.dev/errors/441 for the full message or use the non-minified dev environment for full errors and additional helpful warnings.'

describe('getErrorMessage (DEF-WEB-10)', () => {
  it('el error enmascarado de una Server Action se cambia por el mensaje de la pantalla', () => {
    expect(getErrorMessage(new Error(PROD_441), 'No se pudo crear el usuario.')).toBe('No se pudo crear el usuario.')
  })

  it('tampoco pasan los mensajes técnicos de red o de render del servidor', () => {
    for (const tecnico of [
      'An error occurred in the Server Components render. The specific message is omitted in production builds to avoid leaking sensitive details.',
      'fetch failed',
      'Failed to fetch',
      'NetworkError when attempting to fetch resource.',
      'Load failed',
    ]) {
      expect(getErrorMessage(new Error(tecnico), 'Por defecto'), tecnico).toBe('Por defecto')
    }
  })

  it('un mensaje pensado para el usuario se respeta', () => {
    expect(getErrorMessage(new Error('El correo ya está registrado'), 'Por defecto')).toBe('El correo ya está registrado')
    expect(getErrorMessage('Sin conexión con el colegio', 'Por defecto')).toBe('Sin conexión con el colegio')
  })

  it('sin mensaje usa el de la pantalla', () => {
    expect(getErrorMessage(new Error(''), 'Por defecto')).toBe('Por defecto')
    expect(getErrorMessage(null, 'Por defecto')).toBe('Por defecto')
  })
})
