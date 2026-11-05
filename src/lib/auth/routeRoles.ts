import type { Role } from '@/lib/utils/permissions'

/**
 * Mapa único ruta → roles del panel. Lo consumen el proxy (guardia de rutas) y
 * el PanelSidebar (enlaces visibles), así que no pueden contradecirse.
 * Una subruta hereda la regla de su prefijo más largo.
 */

const TODOS: Role[] = ['admin', 'docente', 'estudiante', 'padre']

export const ROUTE_ROLES: { prefijo: string; roles: Role[] }[] = [
  { prefijo: '/admin', roles: ['admin'] },
  { prefijo: '/usuarios', roles: ['admin'] },
  { prefijo: '/reportes', roles: ['admin'] },
  { prefijo: '/qr/escanear', roles: ['admin', 'docente'] },
  // Códigos QR: el admin los gestiona y el estudiante ve el suyo (permissions.ts: `qr`).
  { prefijo: '/qr', roles: ['admin', 'estudiante'] },
  { prefijo: '/notas', roles: TODOS },
  { prefijo: '/asistencia', roles: TODOS },
  { prefijo: '/novedades', roles: TODOS },
  { prefijo: '/horarios', roles: TODOS },
  { prefijo: '/perfil', roles: TODOS },
  { prefijo: '/general', roles: TODOS },
]

const coincide = (pathname: string, prefijo: string) => pathname === prefijo || pathname.startsWith(`${prefijo}/`)

/** Roles que pueden entrar a la ruta, o `null` si la ruta no es del panel (pública). */
export function rolesDeRuta(pathname: string): Role[] | null {
  let mejor: { prefijo: string; roles: Role[] } | null = null
  for (const regla of ROUTE_ROLES) {
    if (coincide(pathname, regla.prefijo) && (!mejor || regla.prefijo.length > mejor.prefijo.length)) mejor = regla
  }
  return mejor ? mejor.roles : null
}

/** Una ruta pública (fuera del mapa) la puede abrir cualquiera. */
export function puedeEntrar(rol: Role, pathname: string): boolean {
  const roles = rolesDeRuta(pathname)
  return roles === null || roles.includes(rol)
}

/** Inicio al que se devuelve a quien intenta entrar a una ruta que no es de su rol. */
export function inicioDeRol(rol: Role | null): string {
  if (rol === 'admin') return '/admin'
  return rol ? '/general' : '/'
}
