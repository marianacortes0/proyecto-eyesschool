import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/auth/sessionMiddleware'

// Next.js 16 renombra `middleware.ts` a `proxy.ts` (misma lógica, función `proxy`).
// Va en src/, junto a src/app: Next solo carga el proxy al mismo nivel que `app`
// y uno en la raíz se ignora sin aviso (DEF-WEB-04).
export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
