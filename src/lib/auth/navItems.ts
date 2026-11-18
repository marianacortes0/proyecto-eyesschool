import { can, type Role } from '@/lib/utils/permissions'
import { inicioDeRol } from './routeRoles'

export type NavItem = {
  label: string
  href: string
  icon: string
  match: string[]
}

/**
 * Enlaces del riel de navegación según el rol. Es una función pura para poder
 * comprobar, contra `routeRoles`, que nunca se muestra un enlace al que el rol
 * no puede entrar.
 */
export function getNavItems(role: Role | null): NavItem[] {
  const ok = (accion: Parameters<typeof can>[1], recurso: Parameters<typeof can>[2]) =>
    role ? can(role, accion, recurso) : false

  const dashboardHref = role === 'admin' ? inicioDeRol('admin') : '/general'

  const items: (NavItem & { show: boolean })[] = [
    { label: 'Dashboard', href: dashboardHref, icon: 'grid_view', match: ['/admin', '/general'], show: true },
    { label: 'Usuarios', href: '/usuarios', icon: 'group', match: ['/usuarios'], show: ok('read', 'usuarios') },
    {
      label: 'Asistencia', href: '/asistencia', icon: 'fact_check', match: ['/asistencia'],
      show: ok('read', 'asistencia') || ok('read', 'asistencia:propia') || ok('read', 'asistencia:hijos'),
    },
    { label: 'Notas', href: '/notas', icon: 'school', match: ['/notas'], show: ok('read', 'notas') || ok('read', 'notas:propias') },
    { label: 'Horarios', href: '/horarios', icon: 'calendar_month', match: ['/horarios'], show: ok('read', 'horarios') },
    { label: 'Novedades', href: '/novedades', icon: 'campaign', match: ['/novedades'], show: ok('read', 'novedades') },
    { label: 'Códigos QR', href: '/qr', icon: 'qr_code_2', match: ['/qr'], show: ok('read', 'qr') },
    { label: 'Escanear', href: '/qr/escanear', icon: 'qr_code_scanner', match: ['/qr/escanear'], show: ok('create', 'qr:escanear') },
    { label: 'Reportes', href: '/reportes', icon: 'analytics', match: ['/reportes'], show: ok('read', 'reportes') },
  ]

  return items.filter((i) => i.show).map(({ show: _show, ...item }) => item)
}
