import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { json } from './helpers'
import { cookieJar } from './setup/nextMocks'
import { crearRegistrosMasivoAction } from '@/services/asistencia/asistenciaActions'
import { clasificarResultados, itemsParaReintento } from '@/services/asistencia/asistenciaService'
import { ApiError } from '@/services/api/client'

const items = [
  { idEstudiante: 1, estado: 'Presente' as const },
  { idEstudiante: 2, estado: 'Presente' as const },
  { idEstudiante: 3, estado: 'Tarde' as const },
  { idEstudiante: 4, estado: 'Presente' as const },
]

beforeEach(() => cookieJar.seed({ eys_access: 'tok' }))
afterEach(() => vi.unstubAllGlobals())

describe('clasificarResultados (WEB-06)', () => {
  it('2 éxitos, un 409 y un 500 → 2 guardados, 1 duplicado y 1 fallido', () => {
    const resultados: PromiseSettledResult<unknown>[] = [
      { status: 'fulfilled', value: {} },
      { status: 'rejected', reason: new ApiError(409, 'El estudiante ya tiene registro de entrada hoy') },
      { status: 'fulfilled', value: {} },
      { status: 'rejected', reason: new ApiError(500, 'HTTP 500') },
    ]

    expect(clasificarResultados(items, resultados)).toEqual({
      guardados: [1, 3],
      duplicados: [2],
      fallidos: [{ idEstudiante: 4, motivo: 'HTTP 500' }],
    })
  })

  it('un error sin status (red caída) va a fallidos con un motivo legible', () => {
    const r = clasificarResultados([items[0]], [{ status: 'rejected', reason: new TypeError('fetch failed') }])

    expect(r.fallidos).toEqual([{ idEstudiante: 1, motivo: 'fetch failed' }])
  })

  it('con una lista vacía devuelve tres listas vacías', () => {
    expect(clasificarResultados([], [])).toEqual({ guardados: [], duplicados: [], fallidos: [] })
  })
})

describe('reintento (WEB-06)', () => {
  it('itemsParaReintento deja solo los estudiantes fallidos, con su estado original', () => {
    expect(itemsParaReintento(items, [{ idEstudiante: 3, motivo: 'x' }])).toEqual([{ idEstudiante: 3, estado: 'Tarde' }])
  })

  it('Reintentar envía a la API solo el fallido', async () => {
    const fetchMock = vi.fn().mockResolvedValue(json(201, {}))
    vi.stubGlobal('fetch', fetchMock)

    const reintento = itemsParaReintento(items, [{ idEstudiante: 4, motivo: 'HTTP 500' }])
    const r = await crearRegistrosMasivoAction({ items: reintento, fecha: '2026-11-02', tipo: 'entrada', registradoPor: 1 })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).id_estudiante).toBe(4)
    expect(r.guardados).toEqual([4])
  })
})

describe('crearRegistrosMasivoAction (WEB-06)', () => {
  it('manda un POST /asistencia por estudiante y clasifica 409 y 500', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(json(201, {}))
      .mockResolvedValueOnce(json(409, { detail: 'ya registrado' }))
      .mockResolvedValueOnce(json(201, {}))
      .mockResolvedValueOnce(json(500, {}))
    vi.stubGlobal('fetch', fetchMock)

    const r = await crearRegistrosMasivoAction({ items, fecha: '2026-11-02', tipo: 'entrada', registradoPor: 1 })

    expect(fetchMock).toHaveBeenCalledTimes(4)
    expect(r.guardados).toEqual([1, 3])
    expect(r.duplicados).toEqual([2])
    expect(r.fallidos).toEqual([{ idEstudiante: 4, motivo: 'HTTP 500' }])
  })

  it('el segundo envío del mismo curso deja a todos como duplicados (409)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json(409, { detail: 'ya registrado' })))

    const r = await crearRegistrosMasivoAction({ items, fecha: '2026-11-02', tipo: 'entrada', registradoPor: 1 })

    expect(r.duplicados).toEqual([1, 2, 3, 4])
    expect(r.guardados).toEqual([])
    expect(r.fallidos).toEqual([])
  })
})
