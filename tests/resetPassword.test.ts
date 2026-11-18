import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { resetPassword } from '@/auth/actions'

function form(campos: Record<string, string>) {
  const f = new FormData()
  for (const [k, v] of Object.entries(campos)) f.set(k, v)
  return f
}

const valido = { token: 'tok-123', password: 'Colegio#2026', confirmPassword: 'Colegio#2026' }

let fetchMock: ReturnType<typeof vi.fn>

beforeEach(() => {
  fetchMock = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }))
  vi.stubGlobal('fetch', fetchMock)
})
afterEach(() => vi.unstubAllGlobals())

describe('resetPassword (WEB-05)', () => {
  it('no llama a la API si la contraseña no tiene carácter especial (Colegio2026)', async () => {
    const r = await resetPassword(null, form({ ...valido, password: 'Colegio2026', confirmPassword: 'Colegio2026' }))

    expect(r).toHaveProperty('error')
    expect((r as { error: string }).error).toMatch(/carácter especial/i)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('con una contraseña válida y confirmación igual llama POST /auth/reset-password y devuelve success', async () => {
    const r = await resetPassword(null, form(valido))

    expect(r).toHaveProperty('success')
    const [url, init] = fetchMock.mock.calls[0]
    expect(String(url)).toMatch(/\/auth\/reset-password$/)
    expect(init.method).toBe('POST')
    expect(JSON.parse(init.body)).toEqual({ token: 'tok-123', new_password: 'Colegio#2026' })
  })

  it("con confirmación distinta devuelve 'Las contraseñas no coinciden.'", async () => {
    const r = await resetPassword(null, form({ ...valido, confirmPassword: 'Colegio#2027' }))

    expect(r).toEqual({ error: 'Las contraseñas no coinciden.' })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('sin token devuelve el error de enlace inválido', async () => {
    const r = await resetPassword(null, form({ ...valido, token: '' }))

    expect(r).toEqual({ error: 'Enlace inválido o incompleto. Solicita uno nuevo.' })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('si la API responde 401 (enlace ya usado) devuelve el mensaje de la API', async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ detail: 'El enlace ya fue utilizado' }), { status: 401 }))

    const r = await resetPassword(null, form(valido))

    expect(r).toEqual({ error: 'El enlace ya fue utilizado' })
  })
})
