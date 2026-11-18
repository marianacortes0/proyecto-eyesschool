import { describe, expect, it } from 'vitest'

import { porFechaReciente } from '@/services/novedades/novedadesService'

// DEF-WEB-13 · CP-SIS-049: el historial de novedades va ordenado por fecha. La
// tabla las mostraba en el orden en que llegaban de la API (14/6, 13/6, 16/6…).

describe('porFechaReciente (DEF-WEB-13)', () => {
  it('ordena de la más reciente a la más antigua y, en el mismo día, la última registrada primero', () => {
    const lista = [
      { idNovedad: 1, fecha: '2026-06-14' },
      { idNovedad: 2, fecha: '2026-06-16' },
      { idNovedad: 3, fecha: '2026-06-12' },
      { idNovedad: 4, fecha: '2026-06-16' },
    ]
    expect([...lista].sort(porFechaReciente).map((n) => n.idNovedad)).toEqual([4, 2, 1, 3])
  })

  it('una fecha con hora se compara por su día', () => {
    const lista = [{ idNovedad: 1, fecha: '2026-06-14T08:00:00Z' }, { idNovedad: 2, fecha: '2026-06-15' }]
    expect([...lista].sort(porFechaReciente)[0].idNovedad).toBe(2)
  })
})
