import { describe, expect, it } from 'vitest'

import { API_POR_DEFECTO, apiBase, quitarBarrasFinales } from '@/lib/utils/apiBase'

// Arreglos de SonarQube en el proxy (D-WEB-13): la regex `/\/+$/` tenía
// backtracking super-lineal y `'' ?? fallback` dejaba pasar la cadena vacía,
// con lo que `new URL('')` rompía el build en Netlify.

describe('quitarBarrasFinales (sin regex)', () => {
  it.each([
    ['/a/', '/a'],
    ['/a///', '/a'],
    ['/api/v1', '/api/v1'],
    ['/', ''],
    ['', ''],
    ['///', ''],
  ])('%j → %j', (entrada, esperado) => {
    expect(quitarBarrasFinales(entrada)).toBe(esperado)
  })

  it('una cadena larga de barras no tarda más que una corta', () => {
    const inicio = performance.now()
    expect(quitarBarrasFinales('/a' + '/'.repeat(50_000))).toBe('/a')
    expect(performance.now() - inicio).toBeLessThan(100)
  })
})

describe('apiBase', () => {
  it('con una URL válida la devuelve', () => {
    expect(apiBase('https://api.ejemplo.test/api/v1').origin).toBe('https://api.ejemplo.test')
  })

  it('recorta los espacios', () => {
    expect(apiBase('  https://api.ejemplo.test/api/v1  ').pathname).toBe('/api/v1')
  })

  it.each([undefined, '', '   '])('con %j usa el valor por defecto y no lanza', (valor) => {
    expect(apiBase(valor).href).toBe(new URL(API_POR_DEFECTO).href)
  })

  it('con un valor que no es URL avisa nombrando la variable', () => {
    expect(() => apiBase('sin-protocolo')).toThrow(/NEXT_PUBLIC_API_URL/)
  })
})
