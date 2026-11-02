import { afterEach, describe, expect, it, vi } from 'vitest'

import { apiFetch, errorMessage, toCamel } from '@/services/api/client'

function jsonResponse(status: number, body: unknown) {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

afterEach(() => vi.unstubAllGlobals())

describe('toCamel', () => {
  it('convierte llaves anidadas y en listas, sin tocar los valores', () => {
    expect(
      toCamel({ id_usuario: 1, rol: { nombre_rol: 'admin' }, notas: [{ id_materia: 3, valor: 'a_b' }] })
    ).toEqual({ idUsuario: 1, rol: { nombreRol: 'admin' }, notas: [{ idMateria: 3, valor: 'a_b' }] })
  })

  it('deja intactos null y primitivos', () => {
    expect(toCamel(null)).toBeNull()
    expect(toCamel('primer_nombre')).toBe('primer_nombre')
  })
})

describe('apiFetch', () => {
  it('envía el token como Bearer y devuelve la respuesta en camelCase', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, { primer_nombre: 'Ana' }))
    vi.stubGlobal('fetch', fetchMock)

    const data = await apiFetch<{ primerNombre: string }>('/auth/me', {}, 'token-123')

    expect(data.primerNombre).toBe('Ana')
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toMatch(/\/auth\/me$/)
    expect(init.headers.Authorization).toBe('Bearer token-123')
    expect(init.headers['Content-Type']).toBe('application/json')
  })

  it('sin token no envía Authorization', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, []))
    vi.stubGlobal('fetch', fetchMock)

    await apiFetch('/cursos')

    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBeUndefined()
  })

  it('un 204 devuelve null', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 204 })))

    expect(await apiFetch('/notas/1', { method: 'DELETE' }, 't')).toBeNull()
  })

  it('un error usa el detail de FastAPI', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(401, { detail: 'Credenciales inválidas' })))

    await expect(apiFetch('/auth/login', { method: 'POST' })).rejects.toThrow('Credenciales inválidas')
  })

  it('un 422 muestra el primer error de validación, no "[object Object]"', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse(422, { detail: [{ loc: ['body', 'correo'], msg: 'Correo inválido', type: 'value_error' }] })
      )
    )

    await expect(apiFetch('/auth/register', { method: 'POST' })).rejects.toThrow('Correo inválido')
  })
})

describe('errorMessage', () => {
  it('cae al código HTTP cuando no hay detail utilizable', () => {
    expect(errorMessage(undefined, 500)).toBe('HTTP 500')
    expect(errorMessage([], 422)).toBe('HTTP 422')
    expect(errorMessage({ raro: true }, 400)).toBe('HTTP 400')
  })
})

// ── WEB-02: sin token en el navegador ────────────────────────────────────────
import { readFileSync } from 'node:fs'
import * as cliente from '@/services/api/client'

describe('WEB-02 · sin token en el navegador', () => {
  it('getClientToken ya no existe', () => {
    expect('getClientToken' in cliente).toBe(false)
  })

  it('en el navegador apiFetch llama al proxy del servidor y no manda Authorization', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, { primer_nombre: 'Ana' }))
    vi.stubGlobal('fetch', fetchMock)
    vi.stubGlobal('window', {})

    const data = await apiFetch<{ primerNombre: string }>('/auth/me')

    expect(data.primerNombre).toBe('Ana')
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/proxy/auth/me')
    expect(init.headers.Authorization).toBeUndefined()
  })

  it('el error 409 de la API llega como ApiError con status', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(409, { detail: 'Ya existe' })))

    const error = (await apiFetch('/asistencia', { method: 'POST' }, 't').catch((e: unknown) => e)) as InstanceType<typeof cliente.ApiError>

    expect(error).toBeInstanceOf(cliente.ApiError)
    expect(error.status).toBe(409)
    expect(error.message).toBe('Ya existe')
  })

  it.each([
    'src/services/dashboard/dashboardService.ts',
    'src/services/notas/notasService.ts',
    'src/services/reportes/reportesService.ts',
  ])('%s no lee el token desde el navegador', (archivo) => {
    const codigo = readFileSync(archivo, 'utf-8')
    expect(codigo).not.toMatch(/getClientToken|document\.cookie|eys_access/)
  })
})
