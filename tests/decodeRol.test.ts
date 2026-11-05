import { beforeEach, describe, expect, it } from 'vitest'

import { jwt, enUnaHora } from './helpers'
import { cookieJar } from './setup/nextMocks'
import { decodeRol } from '@/lib/auth/decodeRol'
import { getServerUser, userToRole } from '@/lib/auth/server'

beforeEach(() => cookieJar.reset())

describe('decodeRol (WEB-02: el rol sale del token, no de eys_user)', () => {
  it('un token con rol padre devuelve padre', () => {
    expect(decodeRol(jwt({ rol: 'padre', exp: enUnaHora() }))).toBe('padre')
  })

  it('entiende nombre_rol e id_rol del backend', () => {
    expect(decodeRol(jwt({ nombre_rol: 'Profesor' }))).toBe('docente')
    expect(decodeRol(jwt({ id_rol: 3 }))).toBe('admin')
  })

  it('un token ilegible o sin rol devuelve null', () => {
    expect(decodeRol('no-es-jwt')).toBeNull()
    expect(decodeRol(jwt({ sub: '1' }))).toBeNull()
    expect(decodeRol(undefined)).toBeNull()
  })

  it('getServerUser toma el rol del token aunque eys_user diga admin', async () => {
    cookieJar.seed({
      eys_access: jwt({ rol: 'padre', exp: enUnaHora() }),
      eys_user: JSON.stringify({ idUsuario: 7, idRol: 3, nombreRol: 'admin', primerNombre: 'Ana', primerApellido: 'Ruiz' }),
    })

    const user = await getServerUser()

    expect(user && userToRole(user)).toBe('padre')
    expect(user?.primerNombre).toBe('Ana') // eys_user sigue sirviendo para mostrar el nombre
  })

  it('sin token de acceso no hay usuario aunque exista eys_user', async () => {
    cookieJar.seed({ eys_user: JSON.stringify({ idUsuario: 7, idRol: 3, nombreRol: 'admin' }) })

    expect(await getServerUser()).toBeNull()
  })
})
