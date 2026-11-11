import { NextResponse, type NextRequest } from 'next/server'
import { COOKIE_NAMES, ACCESS_MAX_AGE, inactividadMs, cookieOptions } from './cookies'
import { decodeRol } from './decodeRol'
import { decodeJwtPayload, isExpired } from './jwt'
import { inicioDeRol, rolesDeRuta } from './routeRoles'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

/** Llama al backend para renovar el access token a partir del refresh token. */
async function refreshAccessToken(refresh: string): Promise<string | null> {
  try {
    const res = await fetch(`${API}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refresh }),
      cache: 'no-store',
    })
    if (!res.ok) return null
    const data = (await res.json()) as { access_token?: string }
    return data.access_token ?? null
  } catch {
    return null
  }
}

function borrarSesion(res: NextResponse) {
  for (const nombre of COOKIE_NAMES) res.cookies.delete(nombre)
  return res
}

function loginRedirect(request: NextRequest) {
  const url = request.nextUrl.clone()
  url.pathname = '/'
  url.search = '?login=1'
  return borrarSesion(NextResponse.redirect(url))
}

/**
 * Guardia de rutas y renovación de la sesión (WEB-01). Corre antes de cada página
 * y de cada llamada a /api/proxy:
 *  - cierra la sesión tras 30 min sin actividad (cookie `eys_last`, httpOnly);
 *  - renueva el access token con el refresh token cuando venció, y deja la cookie
 *    nueva también en la petición para que la página la lea ya renovada;
 *  - protege todas las rutas del panel según el mapa único `routeRoles`.
 *
 * `ahora` (ms) llega por parámetro para que las pruebas controlen el reloj.
 */
export async function updateSession(request: NextRequest, opciones: { ahora?: number } = {}) {
  const ahora = opciones.ahora ?? Date.now()
  const pathname = request.nextUrl.pathname
  const permitidos = rolesDeRuta(pathname)
  const protegida = permitidos !== null

  const access = request.cookies.get('eys_access')?.value
  const refresh = request.cookies.get('eys_refresh')?.value
  const ultima = Number(request.cookies.get('eys_last')?.value)

  // 1. Inactividad: no se renueva, se cierra.
  if (Number.isFinite(ultima) && ultima > 0 && ahora - ultima > inactividadMs()) {
    return protegida ? loginRedirect(request) : borrarSesion(NextResponse.next({ request }))
  }

  // 2. Renovación del acceso vencido.
  let payload = decodeJwtPayload(access)
  let accesoNuevo: string | null = null
  if (isExpired(payload, ahora) && refresh) {
    accesoNuevo = await refreshAccessToken(refresh)
    if (!accesoNuevo) {
      return protegida ? loginRedirect(request) : borrarSesion(NextResponse.next({ request }))
    }
    payload = decodeJwtPayload(accesoNuevo)
    request.cookies.set('eys_access', accesoNuevo)
  }

  const haySesion = !isExpired(payload, ahora)

  // 3. Ruta del panel sin sesión válida → login.
  if (protegida && !haySesion) return loginRedirect(request)

  // 4. Ruta de otro rol → inicio del rol.
  const rol = decodeRol(accesoNuevo ?? access)
  let respuesta: NextResponse
  if (protegida && (!rol || !permitidos.includes(rol))) {
    const url = request.nextUrl.clone()
    url.pathname = inicioDeRol(rol)
    url.search = ''
    respuesta = NextResponse.redirect(url)
  } else {
    respuesta = NextResponse.next({ request })
  }

  if (accesoNuevo) respuesta.cookies.set('eys_access', accesoNuevo, cookieOptions(true, ACCESS_MAX_AGE))
  if (haySesion) respuesta.cookies.set('eys_last', String(ahora), cookieOptions(true, 7 * 24 * 60 * 60))
  return respuesta
}
