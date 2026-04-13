'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useSidebar } from '@/components/layout/SidebarContext';
import { usePermissions } from '@/hooks/usePermissions';
import { 
  LayoutDashboard, 
  Users, 
  QrCode, 
  ScanLine, 
  CalendarCheck, 
  GraduationCap, 
  Bell, 
  Clock, 
  BarChart3, 
  UserCircle,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const { isOpen } = useSidebar();
  const { can } = usePermissions();

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, show: can('read', 'usuarios') },
    { name: 'Dashboard', href: '/general', icon: LayoutDashboard, show: !can('read', 'usuarios') },
    { name: 'Usuarios', href: '/usuarios', icon: Users, show: can('read', 'usuarios') },
    { name: 'Códigos QR', href: '/qr', icon: QrCode, show: can('read', 'qr') },
    { name: 'Escanear QR', href: '/qr/escanear', icon: ScanLine, show: can('create', 'qr:escanear') },
    { name: 'Asistencia', href: '/asistencia', icon: CalendarCheck, show: can('read', 'asistencia') || can('read', 'asistencia:propia') },
    { name: 'Notas', href: '/notas', icon: GraduationCap, show: can('read', 'notas') || can('read', 'notas:propias') },
    { name: 'Novedades', href: '/novedades', icon: Bell, show: can('read', 'novedades') },
    { name: 'Horarios', href: '/horarios', icon: Clock, show: can('read', 'horarios') },
    { name: 'Reportes', href: '/reportes', icon: BarChart3, show: can('read', 'reportes') },
    { name: 'Mi Perfil', href: '/perfil', icon: UserCircle, show: true },
  ].filter(item => item.show);

  return (
    <aside 
      className={`h-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-r border-slate-200/50 dark:border-white/5 flex flex-col transition-all duration-500 ease-in-out z-40 ${
        isOpen ? 'w-72' : 'w-0'
      } overflow-hidden`}
    >
      <div className="p-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
          <span className="text-white font-black text-xl">E</span>
        </div>
        <div className={`transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">
            EYESCHOOL
          </h2>
          <p className="text-[10px] text-blue-500 font-bold tracking-widest uppercase">Management</p>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar pt-2">
        {navItems.map((item, index) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative group"
            >
              <div
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-white/5 hover:text-blue-600 dark:hover:text-white'
                }`}
              >
                <Icon size={20} className={`${isActive ? 'scale-110' : 'group-hover:scale-110'} transition-transform duration-300`} />
                <span className={`font-semibold text-sm whitespace-nowrap transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
                  {item.name}
                </span>
                {isActive && isOpen && (
                  <motion.div 
                    layoutId="active-indicator"
                    className="ml-auto"
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                  >
                    <ChevronRight size={14} />
                  </motion.div>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-6">
        <div className="p-4 rounded-3xl bg-blue-50/50 dark:bg-white/5 border border-blue-100/50 dark:border-white/5 mb-4 overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 text-xs font-bold">
              ?
            </div>
            {isOpen && (
              <div>
                <p className="text-xs font-bold text-slate-700 dark:text-white">Centro de Ayuda</p>
                <p className="text-[10px] text-slate-500">¿Necesitas soporte?</p>
              </div>
            )}
          </div>
        </div>
        
        <button 
          onClick={signOut}
          className="flex items-center gap-3 w-full px-5 py-3.5 text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 rounded-2xl transition-all font-bold text-sm"
        >
          <LogOut size={20} />
          <span className={`ml-2 whitespace-nowrap transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
            Cerrar Sesión
          </span>
        </button>
      </div>
    </aside>
  );
}
