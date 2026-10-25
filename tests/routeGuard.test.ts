import { NextRequest } from 'next/server'
import { describe, expect, it } from 'vitest'

import { updateSession } from '@/services/supabase/middleware'

// Token con el formato del backend (solo se decodifica, no se verifica aquí:
// la firma la verifica la API en cada petición).
function token(payload: Record<string, unknown>) {
  const b64 = (o: unknown) => Buffer.from(JSON.stringify(o)).toString('base64url')
  return `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64(payload)}.firma`
}

const inOneHour = () => Math.floor(Date.now() / 1000) + 3600

function request(path: string, accessToken?: string) {
  const headers = accessToken ? { cookie: `eys_access=${accessToken}` } : undefined
  return new NextRequest(`http://localhost${path}`, { headers })
}

function redirectTarget(response: Response) {
  const location = response.headers.get('location')
  return location ? new URL(location).pathname + new URL(location).search : null
}

describe('guardia de rutas del panel', () => {
  it('las rutas públicas pasan sin sesión', async () => {
    expect(redirectTarget(await updateSession(request('/home/nosotros')))).toBeNull()
  })

  it('sin sesión /admin manda al login', async () => {
    expect(redirectTarget(await updateSession(request('/admin')))).toBe('/?login=1')
  })

  it('un token vencido manda al login', async () => {
    const expired = token({ rol: 'admin', idRol: 3, exp: Math.floor(Date.now() / 1000) - 60 })

    expect(redirectTarget(await updateSession(request('/admin', expired)))).toBe('/?login=1')
  })

  it('un token ilegible manda al login', async () => {
    expect(redirectTarget(await updateSession(request('/general', 'no-es-jwt')))).toBe('/?login=1')
  })

  it('el administrador entra a /admin', async () => {
    const admin = token({ rol: 'admin', idRol: 3, exp: inOneHour() })

    expect(redirectTarget(await updateSession(request('/admin', admin)))).toBeNull()
  })

  it('un docente que intenta /admin vuelve a su panel', async () => {
    const docente = token({ rol: 'docente', idRol: 1, exp: inOneHour() })

    expect(redirectTarget(await updateSession(request('/admin/usuarios', docente)))).toBe('/general')
  })

  it('cualquier rol con sesión entra a /general', async () => {
    const padre = token({ rol: 'padre', idRol: 4, exp: inOneHour() })

    expect(redirectTarget(await updateSession(request('/general', padre)))).toBeNull()
  })
})
