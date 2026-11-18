import { describe, expect, it } from 'vitest'

import { porTexto } from '@/lib/utils/orden'

// SonarCloud S2871 (10 bugs en develop): `.sort()` sin comparador ordena por
// código de carácter. Las jornadas, grados y cursos de los selectores quedaban
// con «Álvarez» después de «Zapata» y «10» antes que «6».

describe('porTexto', () => {
  it('ordena en español: tildes y mayúsculas no rompen el orden', () => {
    expect(['Zapata', 'Álvarez', 'mañana', 'Tarde'].sort(porTexto)).toEqual(['Álvarez', 'mañana', 'Tarde', 'Zapata'])
  })

  it('los números van en orden natural (grados y cursos)', () => {
    expect(['10', '6', '11', '7'].sort(porTexto)).toEqual(['6', '7', '10', '11'])
    expect(['Grado 10 A', 'Grado 6 B', 'Grado 6 A'].sort(porTexto)).toEqual(['Grado 6 A', 'Grado 6 B', 'Grado 10 A'])
  })

  it('un valor null va primero, sin romper', () => {
    expect(['Tarde', null, 'Mañana'].sort(porTexto)).toEqual([null, 'Mañana', 'Tarde'])
  })
})
