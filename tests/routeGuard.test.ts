import { NextRequest } from 'next/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { inactividadMs } from '@/lib/auth/cookies'
import { updateSession } from '@/lib/auth/sessionMiddleware'

// Token con el formato del backend (solo se decodifica, no se verifica aquí:
// la firma la verifica la API en cada petición).
function token(payload: Record<string, unknown>) {
  const b64 = (o: unknown) => Buffer.from(JSON.stringify(o)).toString('base64url')
  return `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64(payload)}.firma`
}

const AHORA = Date.UTC(2026, 10, 2, 15, 0, 0) // instante fijo que controla la prueba
const MIN = 60_000
const segundos = (ms: number) => Math.floor(ms / 1000)

const vigente = (rol: string, idRol: number) => token({ rol, idRol, exp: segundos(AHORA + 30 * MIN) })
const vencido = (rol: string, idRol: number) => token({ rol, idRol, exp: segundos(AHORA - MIN) })

type Cookies = { access?: string; refresh?: string; last?: number }

function request(path: string, c: Cookies = {}) {
  const partes = [
    c.access && `eys_access=${c.access}`,
    c.refresh && `eys_refresh=${c.refresh}`,
    c.last !== undefined && `eys_last=${c.last}`,
  ].filter(Boolean)
  return new NextRequest(`http://localhost${path}`, {
    headers: partes.length ? { cookie: partes.join('; ') } : undefined,
  })
}

function redirectTarget(response: Response) {
  const location = response.headers.get('location')
  return location ? new URL(location).pathname + new URL(location).search : null
}

const run = (path: string, c: Cookies = {}) => updateSession(request(path, c), { ahora: AHORA })

function fetchRefresh(status: number, accessNuevo?: string) {
  const fetchMock = vi
    .fn()
    .mockResolvedValue(
      new Response(JSON.stringify(accessNuevo ? { access_token: accessNuevo } : { detail: 'no' }), { status })
    )
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

afterEach(() => vi.unstubAllGlobals())

describe('guardia de rutas del panel', () => {
  it('las rutas públicas pasan sin sesión', async () => {
    expect(redirectTarget(await run('/home/nosotros'))).toBeNull()
  })

  it('sin sesión /admin manda al login', async () => {
    expect(redirectTarget(await run('/admin'))).toBe('/?login=1')
  })

  it('un token ilegible manda al login', async () => {
    expect(redirectTarget(await run('/general', { access: 'no-es-jwt' }))).toBe('/?login=1')
  })

  it('el administrador entra a /admin', async () => {
    expect(redirectTarget(await run('/admin', { access: vigente('admin', 3) }))).toBeNull()
  })

  it('un docente que intenta /admin vuelve a su panel', async () => {
    expect(redirectTarget(await run('/admin/usuarios', { access: vigente('docente', 1) }))).toBe('/general')
  })

  it('cualquier rol con sesión entra a /general', async () => {
    expect(redirectTarget(await run('/general', { access: vigente('padre', 4) }))).toBeNull()
  })

  it('un token vencido y sin refresh manda al login', async () => {
    expect(redirectTarget(await run('/admin', { access: vencido('admin', 3) }))).toBe('/?login=1')
  })
})

describe('WEB-01 · renovación de la sesión', () => {
  it('con el acceso vencido y un refresco válido pide /auth/refresh y entrega la cookie eys_access nueva', async () => {
    const nuevo = vigente('padre', 4)
    const fetchMock = fetchRefresh(200, nuevo)

    const res = await run('/notas', { access: vencido('padre', 4), refresh: 'refresh-ok', last: AHORA - 5 * MIN })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(String(fetchMock.mock.calls[0][0])).toMatch(/\/auth\/refresh$/)
    expect(redirectTarget(res)).toBeNull()
    expect(res.cookies.get('eys_access')?.value).toBe(nuevo)
  })

  it('con el refresco inválido (401) redirige a /?login=1 y borra las tres cookies', async () => {
    fetchRefresh(401)

    const res = await run('/notas', { access: vencido('padre', 4), refresh: 'refresh-malo', last: AHORA - MIN })

    expect(redirectTarget(res)).toBe('/?login=1')
    const borradas = res.headers.getSetCookie().join('\n')
    for (const nombre of ['eys_access', 'eys_refresh', 'eys_user']) {
      expect(borradas).toMatch(new RegExp(`${nombre}=;`))
    }
  })

  it('sin cookies redirige a /?login=1', async () => {
    expect(redirectTarget(await run('/notas'))).toBe('/?login=1')
  })

  it('un padre que entra a /usuarios vuelve a /general', async () => {
    expect(redirectTarget(await run('/usuarios', { access: vigente('padre', 4) }))).toBe('/general')
  })

  it('un docente puede entrar a /qr/escanear', async () => {
    expect(redirectTarget(await run('/qr/escanear', { access: vigente('docente', 1) }))).toBeNull()
  })

  it('un estudiante no entra a /qr/escanear', async () => {
    expect(redirectTarget(await run('/qr/escanear', { access: vigente('estudiante', 2) }))).toBe('/general')
  })

  it('todas las rutas del panel están protegidas, no solo /admin y /general', async () => {
    for (const ruta of ['/usuarios', '/reportes', '/notas', '/asistencia', '/novedades', '/horarios', '/perfil', '/qr']) {
      expect(redirectTarget(await run(ruta)), ruta).toBe('/?login=1')
    }
  })

  it('con 31 minutos sin actividad no pide /auth/refresh: redirige y borra las cookies', async () => {
    const fetchMock = fetchRefresh(200, vigente('docente', 1))

    const res = await run('/notas', { access: vencido('docente', 1), refresh: 'refresh-ok', last: AHORA - 31 * MIN })

    expect(fetchMock).not.toHaveBeenCalled()
    expect(redirectTarget(res)).toBe('/?login=1')
    expect(res.headers.getSetCookie().join('\n')).toMatch(/eys_access=;/)
  })

  it('con 10 minutos de actividad y el acceso vencido renueva y actualiza eys_last', async () => {
    const fetchMock = fetchRefresh(200, vigente('docente', 1))

    const res = await run('/notas', { access: vencido('docente', 1), refresh: 'refresh-ok', last: AHORA - 10 * MIN })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(redirectTarget(res)).toBeNull()
    expect(res.cookies.get('eys_last')?.value).toBe(String(AHORA))
  })

  it('eys_last es httpOnly para que ningún script pueda estirar la sesión', async () => {
    const res = await run('/notas', { access: vigente('docente', 1), last: AHORA - MIN })

    expect(res.cookies.get('eys_last')?.httpOnly).toBe(true)
  })

  it('el refresco deja la cookie nueva también en la petición que ve la página', async () => {
    const nuevo = vigente('padre', 4)
    fetchRefresh(200, nuevo)

    const res = await run('/notas', { access: vencido('padre', 4), refresh: 'refresh-ok', last: AHORA - MIN })

    // NextResponse.next({ request: { headers } }) publica los encabezados que
    // verá el servidor en `x-middleware-request-*`.
    expect(res.headers.get('x-middleware-request-cookie')).toContain(`eys_access=${nuevo}`)
  })
})

describe('WEB-01 · inactividad configurable (CP-SIS-065 a escala)', () => {
  it('sin variable o con un valor inválido la regla es de 30 minutos', () => {
    for (const valor of [undefined, '', '0', '-5', 'abc']) expect(inactividadMs(valor), String(valor)).toBe(30 * 60 * 1000)
  })

  it('SESSION_IDLE_MINUTES=1 la reduce a 1 minuto', () => {
    expect(inactividadMs('1')).toBe(60 * 1000)
  })
})
