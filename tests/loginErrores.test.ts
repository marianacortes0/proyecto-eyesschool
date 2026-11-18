import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { cookieJar } from './setup/nextMocks'
import { login } from '@/auth/actions'
import { deleteUsuarioAction } from '@/app/(dashboard)/usuarios/actions'
import { LIMITE_API_MS } from '@/services/api/conLimite'

// CP-SIS-005 y DEF-WEB-07 · con la API caída o colgada, el login lo dice con un
// mensaje para la persona. CP-SIS-026 · si la API responde un 5xx sin JSON
// (página de error del alojamiento), la acción falla sin mostrar ese HTML y deja
// el método y la ruta en el log del servidor.

function form(campos: Record<string, string>) {
  const f = new FormData()
  for (const [k, v] of Object.entries(campos)) f.set(k, v)
  return f
}
const CREDENCIALES = form({ email: 'luz@colegio.edu', password: 'Colegio#2026' })

beforeEach(() => cookieJar.reset())
afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('login con la API caída (CP-SIS-005)', () => {
  it('sin conexión con la API: «No se pudo conectar con el servidor»', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('fetch failed') }))

    expect(await login(null, CREDENCIALES)).toEqual({ error: 'No se pudo conectar con el servidor. Intenta de nuevo.' })
  })

  it('si la API no responde en los dos intentos: «El servidor no respondió a tiempo»', async () => {
    vi.useFakeTimers()
    vi.stubGlobal('fetch', vi.fn((_u: unknown, init?: RequestInit) => new Promise<Response>((_, rechazar) => {
      init?.signal?.addEventListener('abort', () => rechazar(init.signal!.reason))
    })))

    const r = login(null, CREDENCIALES)
    await vi.advanceTimersByTimeAsync(LIMITE_API_MS * 2 + 10)

    expect(await r).toEqual({ error: 'El servidor no respondió a tiempo. Intenta de nuevo.' })
  })
})

describe('acciones de usuarios ante un 5xx sin JSON (CP-SIS-026)', () => {
  it('falla sin pasar el HTML al usuario y registra método y ruta', async () => {
    cookieJar.seed({ eys_access: 'tok' })
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.stubGlobal('fetch', vi.fn(async () => new Response('<html>Service Unavailable</html>', { status: 503 })))

    const error = await deleteUsuarioAction(7).then(() => null, (e: Error) => e)

    expect(error).toBeInstanceOf(Error)
    expect(error!.message).not.toMatch(/<html>/)
    expect(log).toHaveBeenCalledWith(expect.stringMatching(/^API 503 \(DELETE \/usuarios\/7\)/), expect.any(String))
  })
})
