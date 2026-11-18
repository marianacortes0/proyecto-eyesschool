import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { json } from './helpers'
import { cookieJar } from './setup/nextMocks'
import { DELETE, GET, OPTIONS, POST } from '@/app/api/proxy/[...path]/route'

const ctx = (...path: string[]) => ({ params: Promise.resolve({ path }) })

beforeEach(() => cookieJar.reset())
afterEach(() => vi.unstubAllGlobals())

describe('proxy /api/proxy (WEB-02: el token nunca viaja por JavaScript)', () => {
  it('agrega el Bearer desde la cookie httpOnly y reenvía la consulta', async () => {
    cookieJar.seed({ eys_access: 'tok-servidor' })
    const fetchMock = vi.fn().mockResolvedValue(json(200, [{ id: 1 }]))
    vi.stubGlobal('fetch', fetchMock)

    const res = await GET(new NextRequest('http://localhost/api/proxy/notas?limit=500'), ctx('notas'))

    const [url, init] = fetchMock.mock.calls[0]
    expect(String(url)).toMatch(/\/notas\?limit=500$/)
    expect(init.headers.Authorization).toBe('Bearer tok-servidor')
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual([{ id: 1 }])
  })

  it('sin cookie de acceso responde 401 y no llama a la API', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const res = await GET(new NextRequest('http://localhost/api/proxy/notas'), ctx('notas'))

    expect(res.status).toBe(401)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('reenvía el cuerpo y el tipo de contenido de un POST', async () => {
    cookieJar.seed({ eys_access: 't' })
    const fetchMock = vi.fn().mockResolvedValue(json(201, { ok: true }))
    vi.stubGlobal('fetch', fetchMock)

    const res = await POST(
      new NextRequest('http://localhost/api/proxy/notas', {
        method: 'POST',
        body: JSON.stringify({ nota: 4.5 }),
        headers: { 'content-type': 'application/json' },
      }),
      ctx('notas')
    )

    const init = fetchMock.mock.calls[0][1]
    expect(init.method).toBe('POST')
    expect(init.headers['Content-Type']).toBe('application/json')
    expect(res.status).toBe(201)
  })

  it('conserva el tipo y Content-Disposition de una descarga', async () => {
    cookieJar.seed({ eys_access: 't' })
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response('%PDF-1.4', {
          status: 200,
          headers: { 'content-type': 'application/pdf', 'content-disposition': 'attachment; filename="boletin.pdf"' },
        })
      )
    )

    const res = await GET(
      new NextRequest('http://localhost/api/proxy/notas/estudiantes/3/boletin/pdf'),
      ctx('notas', 'estudiantes', '3', 'boletin', 'pdf')
    )

    expect(res.headers.get('content-type')).toBe('application/pdf')
    expect(res.headers.get('content-disposition')).toContain('boletin.pdf')
  })

  it('un 404 de la API llega con su detail', async () => {
    cookieJar.seed({ eys_access: 't' })
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json(404, { detail: 'No hay datos disponibles para generar el boletín.' })))

    const res = await DELETE(new NextRequest('http://localhost/api/proxy/notas/9', { method: 'DELETE' }), ctx('notas', '9'))

    expect(res.status).toBe(404)
    expect((await res.json()).detail).toMatch(/No hay datos/)
  })

  it('no permite salir hacia otra ruta con ..', async () => {
    cookieJar.seed({ eys_access: 't' })
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const res = await GET(new NextRequest('http://localhost/api/proxy/x'), ctx('..', 'admin'))

    expect(res.status).toBe(400)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  describe('endurecimiento (D-WEB-03)', () => {
    beforeEach(() => cookieJar.seed({ eys_access: 't' }))

    const postear = (url: string, init: ConstructorParameters<typeof NextRequest>[1] = {}) => POST(new NextRequest(url, { method: 'POST', ...init }), ctx('notas'))

    it('rechaza una ruta que intenta salir de /api/v1', async () => {
      const fetchMock = vi.fn()
      vi.stubGlobal('fetch', fetchMock)

      for (const path of [['..', 'x'], ['https://evil.test'], ['a\\b'], ['']]) {
        const res = await GET(new NextRequest('http://localhost/api/proxy/x'), ctx(...path))
        expect(res.status, path.join('/')).toBe(400)
      }
      expect(fetchMock).not.toHaveBeenCalled()
    })

    it('rechaza %2e%2e y %2f', async () => {
      const fetchMock = vi.fn()
      vi.stubGlobal('fetch', fetchMock)

      for (const path of [['%2e%2e', 'admin'], ['notas%2f..%2fusuarios']]) {
        const res = await GET(new NextRequest('http://localhost/api/proxy/x'), ctx(...path))
        expect(res.status, path.join('/')).toBe(400)
      }
      expect(fetchMock).not.toHaveBeenCalled()
    })

    it('OPTIONS y TRACE → 405', async () => {
      const fetchMock = vi.fn()
      vi.stubGlobal('fetch', fetchMock)

      const res = await OPTIONS(new NextRequest('http://localhost/api/proxy/notas', { method: 'OPTIONS' }), ctx('notas'))

      expect(res.status).toBe(405)
      expect(fetchMock).not.toHaveBeenCalled()
    })

    it('cuerpo de 6 MB → 413', async () => {
      const fetchMock = vi.fn()
      vi.stubGlobal('fetch', fetchMock)

      const res = await postear('http://localhost/api/proxy/notas', { body: new Uint8Array(6 * 1024 * 1024) })

      expect(res.status).toBe(413)
      expect(fetchMock).not.toHaveBeenCalled()
    })

    it('ignora un Authorization, una cookie y un host enviados por el navegador', async () => {
      const fetchMock = vi.fn().mockResolvedValue(json(200, {}))
      vi.stubGlobal('fetch', fetchMock)

      await GET(
        new NextRequest('http://localhost/api/proxy/notas', {
          headers: { authorization: 'Bearer falso', cookie: 'x=1', 'x-forwarded-host': 'evil.test', accept: 'application/json' },
        }),
        ctx('notas')
      )

      const headers = fetchMock.mock.calls[0][1].headers
      const nombres = Object.keys(headers).map((k) => k.toLowerCase())
      expect(headers.Authorization).toBe('Bearer t')
      expect(headers.accept).toBe('application/json')
      expect(nombres).not.toContain('cookie')
      expect(nombres).not.toContain('x-forwarded-host')
    })

    it('no devuelve set-cookie de la API', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(
          new Response('{}', { status: 200, headers: { 'content-type': 'application/json', 'set-cookie': 'a=b', 'x-interno': '1' } })
        )
      )

      const res = await GET(new NextRequest('http://localhost/api/proxy/notas'), ctx('notas'))

      expect(res.headers.get('set-cookie')).toBeNull()
      expect(res.headers.get('x-interno')).toBeNull()
    })

    it('POST con Origin ajeno → 403', async () => {
      const fetchMock = vi.fn()
      vi.stubGlobal('fetch', fetchMock)

      const res = await postear('http://localhost/api/proxy/notas', { body: '{}', headers: { origin: 'https://evil.test' } })

      expect(res.status).toBe(403)
      expect(fetchMock).not.toHaveBeenCalled()
    })

    it('POST con el Origin de la web pasa', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json(201, {})))

      const res = await postear('http://localhost/api/proxy/notas', { body: '{}', headers: { origin: 'http://localhost' } })

      expect(res.status).toBe(201)
    })

    it('sin cookie no llama a fetch', async () => {
      cookieJar.reset()
      const fetchMock = vi.fn()
      vi.stubGlobal('fetch', fetchMock)

      const res = await GET(new NextRequest('http://localhost/api/proxy/notas'), ctx('notas'))

      expect(res.status).toBe(401)
      expect(fetchMock).not.toHaveBeenCalled()
    })

    it('API caída → 502 con detail, sin stack', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('ECONNREFUSED 10.0.0.1')))

      const res = await GET(new NextRequest('http://localhost/api/proxy/notas'), ctx('notas'))

      expect(res.status).toBe(502)
      expect(await res.json()).toEqual({ detail: 'No se pudo contactar el servidor.' })
    })

    it('el destino siempre queda bajo la API configurada', async () => {
      const fetchMock = vi.fn().mockResolvedValue(json(200, {}))
      vi.stubGlobal('fetch', fetchMock)

      await GET(new NextRequest('http://localhost/api/proxy/notas?limit=5'), ctx('notas'))

      expect(String(fetchMock.mock.calls[0][0])).toMatch(/^http:\/\/localhost:8000\/api\/v1\/notas\?limit=5$/)
    })
  })
})
