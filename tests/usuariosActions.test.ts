import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { json } from './helpers'
import { cookieJar } from './setup/nextMocks'
import { createUsuarioConAuth, updateUsuarioAction } from '@/app/(dashboard)/usuarios/actions'

// DEF-WEB-10 · en producción el mensaje de un error lanzado en una Server Action
// no llega al navegador («Minified React error #441»). Crear y editar usuario
// devuelven el motivo de la API como valor, para que el admin lea, por ejemplo,
// «El correo ya está registrado» (CP-SIS-020). Un error del servidor (5xx) se
// sigue lanzando: no es un dato que el usuario pueda corregir.

const DATOS = {
  correo: 'repetido@example.com',
  password: 'Colegio#2026',
  primerNombre: 'Ana',
  primerApellido: 'Mora',
  tipoDocumento: 'CC' as const,
  numeroDocumento: '1001',
  idRol: 3,
}

beforeEach(() => cookieJar.seed({ eys_access: 'tok' }))
afterEach(() => vi.unstubAllGlobals())

describe('usuarios · el motivo de la API llega como valor (DEF-WEB-10)', () => {
  it('crear con un correo repetido devuelve el motivo y no lanza', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => json(409, { detail: 'El correo ya está registrado' })))

    await expect(createUsuarioConAuth(DATOS)).resolves.toEqual({ error: 'El correo ya está registrado' })
  })

  it('crear con datos inválidos (422) devuelve el primer mensaje de validación', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => json(422, { detail: [{ loc: ['body', 'correo'], msg: 'value is not a valid email address' }] })))

    await expect(createUsuarioConAuth(DATOS)).resolves.toEqual({ error: 'value is not a valid email address' })
  })

  it('un error del servidor (5xx) se sigue lanzando', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => json(500, { detail: 'boom' })))

    await expect(createUsuarioConAuth(DATOS)).rejects.toThrow()
  })

  it('editar con un dato rechazado devuelve el motivo', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => json(409, { detail: 'El correo ya está registrado' })))

    await expect(updateUsuarioAction(7, { primerNombre: 'Ana' })).resolves.toEqual({ error: 'El correo ya está registrado' })
  })

  it('cuando todo sale bien no devuelve error', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => json(200, { id_usuario: 9 })))

    expect(await updateUsuarioAction(7, { primerNombre: 'Ana' })).toEqual({})
  })
})
