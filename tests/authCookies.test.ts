import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { enUnaHora, json, jwt } from './helpers'
import { cookieJar, RedirectError } from './setup/nextMocks'
import { login } from '@/auth/actions'

function form(campos: Record<string, string>) {
  const f = new FormData()
  for (const [k, v] of Object.entries(campos)) f.set(k, v)
  return f
}

async function iniciarSesion() {
  const access = jwt({ sub: '9', rol: 'docente', id_rol: 1, exp: enUnaHora() })
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) =>
      String(url).endsWith('/auth/login')
        ? json(200, { access_token: access, refresh_token: 'refresh-1' })
        : json(200, { id_usuario: 9, id_rol: 1, nombre_rol: 'Profesor', primer_nombre: 'Luz', primer_apellido: 'Mora' })
    )
  )
  // login() termina con redirect(), que en Next lanza una excepción.
  await expect(login(null, form({ email: 'luz@colegio.edu', password: 'Colegio#2026' }))).rejects.toBeInstanceOf(RedirectError)
}

beforeEach(() => cookieJar.reset())
afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

describe('cookies de sesión (WEB-02)', () => {
  it('eys_access y eys_refresh son httpOnly', async () => {
    await iniciarSesion()

    expect(cookieJar.options('eys_access')?.httpOnly).toBe(true)
    expect(cookieJar.options('eys_refresh')?.httpOnly).toBe(true)
  })

  it('todas las cookies llevan secure en producción y sameSite lax', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    await iniciarSesion()

    for (const nombre of ['eys_access', 'eys_refresh', 'eys_user', 'eys_last']) {
      expect(cookieJar.options(nombre)?.secure, nombre).toBe(true)
      expect(cookieJar.options(nombre)?.sameSite, nombre).toBe('lax')
    }
  })

  it('fuera de producción no exige secure (desarrollo en http://localhost)', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    await iniciarSesion()

    expect(cookieJar.options('eys_access')?.secure).toBe(false)
  })

  it('el inicio de sesión abre la ventana de inactividad con eys_last httpOnly', async () => {
    await iniciarSesion()

    expect(cookieJar.options('eys_last')?.httpOnly).toBe(true)
    expect(Number(cookieJar.store.get('eys_last')?.value)).toBeGreaterThan(0)
  })

  it('eys_user guarda solo lo necesario para mostrar el nombre, sin token', async () => {
    await iniciarSesion()

    const user = JSON.parse(cookieJar.store.get('eys_user')!.value)
    expect(user.primerNombre).toBe('Luz')
    expect(JSON.stringify(user)).not.toContain('access')
  })
})
