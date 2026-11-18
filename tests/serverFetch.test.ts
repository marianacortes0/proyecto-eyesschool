import { afterEach, describe, expect, it, vi } from 'vitest'

import { json } from './helpers'
import { ApiError } from '@/services/api/client'
import { serverFetch } from '@/services/api/serverFetch'

afterEach(() => vi.unstubAllGlobals())

describe('serverFetch (WEB-INF-1)', () => {
  it('con datos: manda el token por parámetro y devuelve el JSON sin tocar', async () => {
    const fetchMock = vi.fn().mockResolvedValue(json(200, [{ id_nota: 1 }]))
    vi.stubGlobal('fetch', fetchMock)

    const data = await serverFetch<{ id_nota: number }[]>('/notas', { token: 'abc' })

    expect(data).toEqual([{ id_nota: 1 }])
    const [url, init] = fetchMock.mock.calls[0]
    expect(String(url)).toMatch(/\/notas$/)
    expect(init.headers.Authorization).toBe('Bearer abc')
    expect(init.cache).toBe('no-store')
  })

  it('con lista vacía devuelve []; con un 204 devuelve null', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(json(200, [])).mockResolvedValueOnce(new Response(null, { status: 204 })))

    expect(await serverFetch('/notas', { token: 't' })).toEqual([])
    expect(await serverFetch('/notas/1', { method: 'DELETE', token: 't' })).toBeNull()
  })

  it('con error lanza ApiError con status, mensaje legible y detail original', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json(422, { detail: [{ msg: 'Nota fuera de rango' }] })))

    const error = (await serverFetch('/notas', { method: 'POST', token: 't' }).catch((e: unknown) => e)) as ApiError

    expect(error).toBeInstanceOf(ApiError)
    expect(error.status).toBe(422)
    expect(error.message).toBe('Nota fuera de rango')
    expect(error.detail).toEqual([{ msg: 'Nota fuera de rango' }])
  })

  it('sin token no manda Authorization', async () => {
    const fetchMock = vi.fn().mockResolvedValue(json(200, {}))
    vi.stubGlobal('fetch', fetchMock)

    await serverFetch('/cursos')

    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBeUndefined()
  })
})
