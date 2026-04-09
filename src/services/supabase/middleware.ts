import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { mapRolToKey, type Role } from '@/lib/utils/permissions'

/** Routes that require authentication */
const PROTECTED_ROUTES = ['/admin', '/general']

/**
 * Roles permitidos por ruta.
 * - null  → cualquier usuario autenticado puede entrar
 * - Role[] → solo esos roles (agrega más según necesites)
 */
const ROUTE_ROLES: Record<string, Role[] | null> = {
  '/admin':   ['admin'],
  '/general': null, // docente, estudiante, padre
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isProtectedRoute = PROTECTED_ROUTES.some(r => pathname.startsWith(r))

  if (!isProtectedRoute) return supabaseResponse

  // Not authenticated → redirect to login
  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Resolver rol desde el JWT: app_metadata.rol (hook) → user_metadata.rol (registro) → user_metadata.idRol
  const nombreRol =
    (user.app_metadata?.rol as string | undefined) ??
    (user.user_metadata?.rol as string | undefined)
  const role = mapRolToKey(nombreRol, user.user_metadata?.idRol as number | undefined)

  // Find the base route that matched
  const matchedRoute = PROTECTED_ROUTES.find(r => pathname.startsWith(r))
  if (matchedRoute) {
    const allowedRoles = ROUTE_ROLES[matchedRoute]
    // null = cualquier usuario autenticado puede entrar
    if (allowedRoles !== null && (!role || !allowedRoles.includes(role))) {
      const url = request.nextUrl.clone()
      url.pathname = getRoleDashboard(role)
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

function getRoleDashboard(role: Role | null): string {
  if (role === 'admin') return '/admin'
  if (role) return '/general'
  return '/login'
}
