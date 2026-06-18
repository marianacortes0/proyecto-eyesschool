'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';

type NavItem = {
  label: string;
  href: string;
  icon: string;
  match: string[];
  show: boolean;
};

/** Slim glassmorphic icon rail — Luminous Ed-Tech style. */
export default function PanelSidebar() {
  const pathname = usePathname();
  const { can } = usePermissions();
  const { user, signOut } = useAuth();

  const isAdmin = can('read', 'usuarios');
  const dashboardHref = isAdmin ? '/admin' : '/general';

  const items: NavItem[] = [
    { label: 'Dashboard', href: dashboardHref, icon: 'grid_view', match: ['/admin', '/general'], show: true },
    { label: 'Usuarios', href: '/usuarios', icon: 'group', match: ['/usuarios'], show: can('read', 'usuarios') },
    { label: 'Asistencia', href: '/asistencia', icon: 'fact_check', match: ['/asistencia'], show: can('read', 'asistencia') || can('read', 'asistencia:propia') || can('read', 'asistencia:hijos') },
    { label: 'Notas', href: '/notas', icon: 'school', match: ['/notas'], show: can('read', 'notas') || can('read', 'notas:propias') },
    { label: 'Horarios', href: '/horarios', icon: 'calendar_month', match: ['/horarios'], show: can('read', 'horarios') },
    { label: 'Novedades', href: '/novedades', icon: 'campaign', match: ['/novedades'], show: can('read', 'novedades') },
    { label: 'Códigos QR', href: '/qr', icon: 'qr_code_2', match: ['/qr'], show: can('read', 'qr') },
    { label: 'Escanear', href: '/qr/escanear', icon: 'qr_code_scanner', match: ['/qr/escanear'], show: can('create', 'qr:escanear') },
    { label: 'Reportes', href: '/reportes', icon: 'analytics', match: ['/reportes'], show: can('read', 'reportes') },
  ].filter((i) => i.show);

  const initials =
    `${user?.primerNombre?.[0] ?? ''}${user?.primerApellido?.[0] ?? ''}`.toUpperCase() || 'ES';

  const isActive = (match: string[]) =>
    match.some((m) => pathname === m || pathname.startsWith(`${m}/`));

  return (
    <aside className="fixed left-0 top-0 h-screen w-20 bg-white/85 backdrop-blur-xl border-r border-glass-stroke z-50 flex flex-col items-center py-8">
      {/* Brand */}
      <Link href={dashboardHref} className="mb-10" aria-label="EyeSchool">
        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white shadow-lg shadow-primary/20">
          <span className="material-symbols-outlined fill !text-xl">visibility</span>
        </div>
      </Link>

      {/* Primary nav */}
      <nav className="flex-1 flex flex-col gap-7 items-center">
        {items.map((item) => {
          const active = isActive(item.match);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative transition-colors ${
                active ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              <span className={`material-symbols-outlined !text-2xl ${active ? 'fill' : ''}`}>
                {item.icon}
              </span>
              {active && (
                <span className="absolute -left-3 top-1/2 -translate-y-1/2 h-6 w-1 rounded-full bg-primary" />
              )}
              <span className="absolute left-12 top-1/2 -translate-y-1/2 bg-on-surface text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Footer cluster */}
      <div className="mt-auto flex flex-col gap-5 items-center">
        <Link
          href="/perfil"
          className={`group relative w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
            pathname.startsWith('/perfil')
              ? 'bg-primary-container text-primary'
              : 'text-on-surface-variant border border-glass-stroke hover:bg-surface-bg'
          }`}
        >
          <span className="material-symbols-outlined !text-xl">settings</span>
          <span className="absolute left-12 top-1/2 -translate-y-1/2 bg-on-surface text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
            Ajustes y Perfil
          </span>
        </Link>

        <button
          onClick={signOut}
          className="group relative text-on-surface-variant hover:text-primary transition-colors"
          aria-label="Cerrar sesión"
        >
          <span className="material-symbols-outlined !text-2xl">logout</span>
          <span className="absolute left-12 top-1/2 -translate-y-1/2 bg-on-surface text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
            Cerrar sesión
          </span>
        </button>

        <Link
          href="/perfil"
          className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-neon-purple flex items-center justify-center text-white font-bold text-xs shadow-md"
        >
          {initials}
        </Link>
      </div>
    </aside>
  );
}
