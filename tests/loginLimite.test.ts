import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { enUnaHora, json, jwt } from './helpers'
import { cookieJar, RedirectError } from './setup/nextMocks'
import { login } from '@/auth/actions'
import { fetchConLimite, LIMITE_API_MS } from '@/services/api/conLimite'

// DEF-WEB-07 · el inicio de sesión se quedaba en «ENTRANDO…» más de 45 s cuando
// una llamada del servidor a la API no respondía: ninguna tenía tiempo máximo.
// Ahora cada llamada que se puede repetir tiene un límite por intento y un
// segundo intento; si tampoco responde, el login lo dice en vez de esperar.

function form(campos: Record<string, string>) {
  const f = new FormData()
  for (const [k, v] of Object.entries(campos)) f.set(k, v)
  return f
}

/** Un fetch que nunca responde: solo termina cuando se aborta su señal. */
function colgado(_url: unknown, init?: RequestInit) {
  return new Promise<Response>((_, rechazar) => {
    init?.signal?.addEventListener('abort', () => rechazar(init.signal!.reason))
  })
}

const ACCESS = jwt({ sub: '9', rol: 'docente', id_rol: 1, nombre_rol: 'Profesor', exp: enUnaHora() })
const CREDENCIALES = { email: 'luz@colegio.edu', password: 'Colegio#2026' }

beforeEach(() => {
  cookieJar.reset()
  vi.useFakeTimers()
})
afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('fetchConLimite (DEF-WEB-07)', () => {
  it('si el primer intento no responde a tiempo, hace un segundo y devuelve su respuesta', async () => {
    const fetchMock = vi.fn().mockImplementationOnce(colgado).mockImplementationOnce(async () => json(200, { ok: true }))
    vi.stubGlobal('fetch', fetchMock)

    const r = fetchConLimite('https://api/x', {})
    await vi.advanceTimersByTimeAsync(LIMITE_API_MS)

    expect((await r).status).toBe(200)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('si ningún intento responde, falla con TimeoutError (no espera para siempre)', async () => {
    vi.stubGlobal('fetch', vi.fn(colgado))

    const r = fetchConLimite('https://api/x', {})
    const resultado = expect(r).rejects.toMatchObject({ name: 'TimeoutError' })
    await vi.advanceTimersByTimeAsync(2 * LIMITE_API_MS)
    await resultado
  })

  it('una respuesta de error de la API no se repite: se devuelve tal cual', async () => {
    const fetchMock = vi.fn(async () => json(401, { detail: 'Credenciales inválidas' }))
    vi.stubGlobal('fetch', fetchMock)

    expect((await fetchConLimite('https://api/x', {})).status).toBe(401)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})

describe('login con la API lenta (DEF-WEB-07)', () => {
  it('si /auth/login nunca responde, devuelve un mensaje en vez de quedarse esperando', async () => {
    vi.stubGlobal('fetch', vi.fn(colgado))

    const r = login(null, form(CREDENCIALES))
    await vi.advanceTimersByTimeAsync(2 * LIMITE_API_MS)

    expect(await r).toEqual({ error: expect.stringMatching(/no respondió a tiempo/i) })
  })

  it('si /auth/me no responde, igual guarda la sesión con los datos del token y entra', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string, init?: RequestInit) =>
        String(url).endsWith('/auth/login')
          ? Promise.resolve(json(200, { access_token: ACCESS, refresh_token: 'refresh-1' }))
          : colgado(url, init)
      )
    )

    const r = login(null, form(CREDENCIALES))
    const resultado = expect(r).rejects.toBeInstanceOf(RedirectError)
    await vi.advanceTimersByTimeAsync(2 * LIMITE_API_MS)
    await resultado

    expect(cookieJar.store.get('eys_access')?.value).toBe(ACCESS)
    expect(JSON.parse(cookieJar.store.get('eys_user')!.value).idRol).toBe(1)
  })
})
