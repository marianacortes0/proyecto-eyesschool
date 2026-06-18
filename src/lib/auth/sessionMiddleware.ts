import { NextResponse, type NextRequest } from 'next/server'
import { mapRolToKey, type Role } from '@/lib/utils/permissions'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

const PROTECTED_ROUTES = ['/admin', '/general']

const ROUTE_ROLES: Record<string, Role[] | null> = {
  '/admin':   ['admin'],
  '/general': null,
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const part = token.split('.')[1]
    const padded = part + '='.repeat((4 - (part.length % 4)) % 4)
    const json = atob(padded.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(json) as Record<string, unknown>
  } catch {
    return null
  }
}

function isExpired(payload: Record<string, unknown> | null): boolean {
  if (!payload) return true
  const exp = payload.exp as number | undefined
  return !!exp && Date.now() / 1000 > exp
}

function getRoleDashboard(role: Role | null): string {
  if (role === 'admin') return '/admin'
  if (role) return '/general'
  return '/login'
}

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

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const isProtected = PROTECTED_ROUTES.some(r => pathname.startsWith(r))

  const access = request.cookies.get('eys_access')?.value
  const refresh = request.cookies.get('eys_refresh')?.value
  let payload = access ? decodeJwtPayload(access) : null

  // Refresco proactivo: si el access expiró/falta pero hay refresh válido, renueva
  // y deja la cookie nueva en la respuesta (mantiene la sesión sin re-login).
  let refreshedResponse: NextResponse | null = null
  if (isExpired(payload) && refresh) {
    const newAccess = await refreshAccessToken(refresh)
    if (newAccess) {
      payload = decodeJwtPayload(newAccess)
      refreshedResponse = NextResponse.next({ request })
      refreshedResponse.cookies.set('eys_access', newAccess, {
        path: '/',
        maxAge: 30 * 60,
        sameSite: 'lax',
        httpOnly: false,
      })
    }
  }

  if (!isProtected) {
    return refreshedResponse ?? NextResponse.next({ request })
  }

  // Ruta protegida sin sesión válida → login
  if (isExpired(payload)) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  const role = mapRolToKey(
    (payload!.rol ?? payload!.nombre_rol) as string | undefined,
    (payload!.idRol ?? payload!.id_rol) as number | undefined
  )

  const matched = PROTECTED_ROUTES.find(r => pathname.startsWith(r))
  if (matched) {
    const allowed = ROUTE_ROLES[matched]
    if (allowed !== null && (!role || !allowed.includes(role))) {
      const url = request.nextUrl.clone()
      url.pathname = getRoleDashboard(role)
      return NextResponse.redirect(url)
    }
  }

  return refreshedResponse ?? NextResponse.next({ request })
}
