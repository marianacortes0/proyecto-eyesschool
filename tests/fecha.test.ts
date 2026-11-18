import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { hoyColegio } from '@/lib/utils/fecha'

// DEF-WEB-11 · «hoy» salía de new Date().toISOString(), que es la fecha UTC. En
// Colombia (UTC−5), lo registrado después de las 19:00 quedaba con la fecha del
// día siguiente: el registro masivo del 16/11 a las 21:52 quedó del 17/11.

afterEach(() => vi.useRealTimers())

describe('hoyColegio (DEF-WEB-11)', () => {
  it('a las 21:52 del 16/11 en Colombia (02:52 UTC del 17/11) es el 16/11', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-11-17T02:52:49Z'))
    expect(hoyColegio()).toBe('2026-11-16')
  })

  it('a mediodía coincide con la fecha UTC', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-11-17T17:00:00Z'))
    expect(hoyColegio()).toBe('2026-11-17')
  })

  it('justo después de la medianoche de Colombia ya es el día nuevo', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-11-18T05:00:01Z'))
    expect(hoyColegio()).toBe('2026-11-18')
  })

  it('nadie calcula «hoy» con la fecha UTC', () => {
    const archivos = (readdirSync('src', { recursive: true }) as string[])
      .filter((f) => /\.tsx?$/.test(f))
      .map((f) => join('src', f))
    const conUtc = archivos.filter((f: string) => /toISOString\(\)\.(split\('T'\)\[0\]|slice\(0, 10\)|substring\(0, 10\))/.test(readFileSync(f, 'utf8')))
    expect(conUtc).toEqual([])
  })
})
