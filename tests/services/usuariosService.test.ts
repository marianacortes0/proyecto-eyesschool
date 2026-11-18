import { afterEach, describe, expect, it, vi } from 'vitest'

import { json } from '../helpers'
import * as s from '@/services/usuarios/usuariosService'

function stub(respuesta: () => Response) {
  const fetchMock = vi.fn(async () => respuesta())
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}
const llamada = (m: ReturnType<typeof stub>, i = 0) => {
  const [url, init] = m.mock.calls[i] as unknown as [string, RequestInit]
  const u = new URL(url)
  return { path: u.pathname.replace('/api/v1', '') + u.search, method: init?.method ?? 'GET', body: init?.body ? JSON.parse(String(init.body)) : undefined }
}

afterEach(() => vi.unstubAllGlobals())

const USUARIO_API = {
  id_usuario: 5, tipo_documento: 'CC', numero_documento: '123', primer_nombre: 'Ana', primer_apellido: 'Gómez',
  correo: 'ana@x.co', estado: true, fecha_registro: '2026-01-01', id_rol: 1,
}

describe('Servicios · usuariosService', () => {
  it('getUsuarios pide los activos y agrega el nombre del rol', async () => {
    const m = stub(() => json(200, [USUARIO_API, { ...USUARIO_API, id_usuario: 6, id_rol: 99 }]))

    const r = await s.getUsuarios()

    expect(llamada(m).path).toBe('/usuarios?estado=true&limit=500')
    expect(r[0]).toMatchObject({ idUsuario: 5, rolNombre: 'Profesor' })
    expect(r[1].rolNombre).toBe('Desconocido')
  })

  it('getPendingUsuarios pide los inactivos y con lista vacía devuelve []', async () => {
    const m = stub(() => json(200, []))

    expect(await s.getPendingUsuarios()).toEqual([])
    expect(llamada(m).path).toBe('/usuarios?estado=false&limit=500')
  })

  it('getUsuarioById devuelve el usuario y null si la API falla', async () => {
    stub(() => json(200, USUARIO_API))
    expect((await s.getUsuarioById(5))?.primerNombre).toBe('Ana')

    stub(() => json(404, { detail: 'No existe' }))
    expect(await s.getUsuarioById(5)).toBeNull()
  })

  it('createUsuario manda el cuerpo en snake_case con nulos para lo opcional', async () => {
    const m = stub(() => json(201, {}))

    await s.createUsuario({
      primerNombre: 'Ana', primerApellido: 'Gómez', tipoDocumento: 'CC', numeroDocumento: '123',
      correo: 'ana@x.co', password: 'Colegio#2026', idRol: 1,
    })

    expect(llamada(m)).toMatchObject({
      path: '/usuarios', method: 'POST',
      body: { primer_nombre: 'Ana', segundo_nombre: null, telefono: null, id_rol: 1, numero_documento: '123' },
    })
  })

  it('updateUsuario manda solo lo que cambió', async () => {
    const m = stub(() => json(200, {}))

    await s.updateUsuario(5, { primerNombre: 'Luisa', telefono: '300', segundoNombre: undefined })

    expect(llamada(m)).toMatchObject({ path: '/usuarios/5', method: 'PUT', body: { primer_nombre: 'Luisa', telefono: '300' } })
    expect(Object.keys(llamada(m).body)).not.toContain('primer_apellido')
  })

  it('toggleUsuarioEstado manda el estado como query param', async () => {
    const m = stub(() => new Response(null, { status: 204 }))

    await s.toggleUsuarioEstado(5, false)

    expect(llamada(m)).toMatchObject({ path: '/usuarios/5/estado?estado=false', method: 'PATCH' })
  })

  it('validarUsuario cambia el rol y luego activa', async () => {
    const m = stub(() => json(200, {}))

    await s.validarUsuario(5, 2)

    expect(llamada(m, 0)).toMatchObject({ method: 'PUT', body: { id_rol: 2 } })
    expect(llamada(m, 1)).toMatchObject({ path: '/usuarios/5/estado?estado=true', method: 'PATCH' })
  })

  it('deleteUsuario y rechazarUsuario hacen DELETE', async () => {
    const m = stub(() => new Response(null, { status: 204 }))

    await s.deleteUsuario(5)
    await s.rechazarUsuario(6)

    expect(llamada(m, 0)).toMatchObject({ path: '/usuarios/5', method: 'DELETE' })
    expect(llamada(m, 1)).toMatchObject({ path: '/usuarios/6', method: 'DELETE' })
  })

  it('un 409 por correo duplicado lanza con el detail', async () => {
    stub(() => json(409, { detail: 'El correo ya está registrado' }))

    await expect(
      s.createUsuario({ primerNombre: 'A', primerApellido: 'B', tipoDocumento: 'CC', numeroDocumento: '1', correo: 'a@b.co', password: 'x', idRol: 1 })
    ).rejects.toMatchObject({ status: 409, message: 'El correo ya está registrado' })
  })
})
