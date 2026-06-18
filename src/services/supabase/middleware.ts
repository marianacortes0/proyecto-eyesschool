import { NextResponse, type NextRequest } from 'next/server'
import { mapRolToKey, type Role } from '@/lib/utils/permissions'

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

function getRoleDashboard(role: Role | null): string {
  if (role === 'admin') return '/admin'
  if (role) return '/general'
  return '/login'
}

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const isProtected = PROTECTED_ROUTES.some(r => pathname.startsWith(r))

  if (!isProtected) return NextResponse.next({ request })

  const token = request.cookies.get('eys_access')?.value
  if (!token) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  const payload = decodeJwtPayload(token)
  if (!payload) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Check token expiry
  const exp = payload.exp as number | undefined
  if (exp && Date.now() / 1000 > exp) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  const role = mapRolToKey(
    (payload.rol ?? payload.nombre_rol) as string | undefined,
    (payload.idRol ?? payload.id_rol) as number | undefined
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

  return NextResponse.next({ request })
}
