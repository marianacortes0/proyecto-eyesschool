'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useSidebar } from '@/components/layout/SidebarContext';
import { usePermissions } from '@/hooks/usePermissions';

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const { isOpen } = useSidebar();
  const { can } = usePermissions();

  // Opciones de navegación dinámicas, filtradas por los permisos del usuario
  const navItems = [
    { name: 'Dashboard', href: '/admin', show: can('read', 'usuarios') },
    { name: 'Dashboard', href: '/general', show: !can('read', 'usuarios') },
    { name: 'Usuarios', href: '/usuarios', show: can('read', 'usuarios') },
    { name: 'Códigos QR', href: '/qr', show: can('read', 'qr') },
    { name: 'Escanear QR', href: '/qr/escanear', show: can('create', 'qr:escanear') },
    { name: 'Asistencia', href: '/asistencia', show: can('read', 'asistencia') || can('read', 'asistencia:propia') },
    { name: 'Notas', href: '/notas', show: can('read', 'notas') || can('read', 'notas:propias') },
    { name: 'Novedades', href: '/novedades', show: can('read', 'novedades') },
    { name: 'Horarios', href: '/horarios', show: can('read', 'horarios') },
    { name: 'Reportes', href: '/reportes', show: can('read', 'reportes') },
    { name: 'Mi Perfil', href: '/perfil', show: true },
  ].filter(item => item.show);

  return (
    <aside 
      className={`h-full bg-white/80 dark:bg-[#141414]/90 backdrop-blur-xl border-r border-white/40 dark:border-white/10 shadow-xl flex flex-col transition-all duration-300 overflow-hidden ${
        isOpen ? 'w-64 opacity-100' : 'w-0 opacity-0 pointer-events-none'
      }`}
    >
      <div className="p-6 border-b border-white/20 dark:border-white/10 flex items-center justify-center min-w-max">
        <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tighter uppercase">
          EyeSchool
        </h2>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto overflow-x-hidden min-w-max">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                  : 'text-slate-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-white/5 hover:text-blue-600 dark:hover:text-white'
              }`}
            >
              <span className="font-semibold whitespace-nowrap">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/20 dark:border-white/10 min-w-max">
        <button 
          onClick={signOut}
          className="flex items-center gap-3 w-full px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all font-semibold"
        >
          <span className="text-xl">🚪</span>
          <span className="whitespace-nowrap">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
