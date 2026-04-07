import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { mapRolToKey, type Role } from '@/lib/utils/permissions'

/** Routes that require authentication */
const PROTECTED_ROUTES = ['/admin', '/teacher', '/student', '/parents']

/** Roles allowed for each protected route */
const ROUTE_ROLES: Record<string, Role> = {
  '/admin':   'admin',
  '/teacher': 'docente',
  '/student': 'estudiante',
  '/parents': 'padre',
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

  // Resolve the user's role from JWT metadata
  const role = mapRolToKey(
    user.app_metadata?.rol as string | undefined,
    user.user_metadata?.idRol as number | undefined
  )

  // Find the base route that matched
  const matchedRoute = PROTECTED_ROUTES.find(r => pathname.startsWith(r))
  if (matchedRoute) {
    const requiredRole = ROUTE_ROLES[matchedRoute]
    if (role !== requiredRole) {
      // Redirect to the user's own dashboard
      const url = request.nextUrl.clone()
      url.pathname = getRoleDashboard(role)
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

function getRoleDashboard(role: Role | null): string {
  switch (role) {
    case 'admin':       return '/admin'
    case 'docente':     return '/teacher'
    case 'estudiante':  return '/student'
    case 'padre':       return '/parents'
    default:            return '/login'
  }
}
