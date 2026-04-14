'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useSidebar } from '@/components/layout/SidebarContext';
import { useState, useEffect } from 'react';
import { createClient } from '@/services/supabase/client';
import { Menu, Bell, Search, Settings } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function DashboardHeader() {
  const { user, role, loading } = useAuth();
  const { toggleSidebar } = useSidebar();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setAvatarUrl(user?.user_metadata?.avatarUrl ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAvatarUrl(session?.user?.user_metadata?.avatarUrl ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const firstName = user?.user_metadata?.primerNombre || 'Usuario';
  const lastName  = user?.user_metadata?.primerApellido || '';
  const fullName  = `${firstName} ${lastName}`.trim();
  const initial   = firstName.charAt(0).toUpperCase() || 'U';

  const roleDisplayMap: Record<string, string> = {
    admin:      'Admin Specialist',
    docente:    'Academic Docent',
    estudiante: 'Student Profile',
    padre:      'Family / Parent',
  };
  
  const pageTitleMap: Record<string, string> = {
    '/admin': 'Panel de Administración',
    '/general': 'Vista General',
    '/usuarios': 'Gestión de Usuarios',
    '/qr': 'Códigos QR Académicos',
    '/asistencia': 'Control de Asistencia',
    '/notas': 'Registro de Notas',
    '/horarios': 'Agenda de Horarios',
    '/reportes': 'Insights & Reportes',
    '/perfil': 'Mi Perfil Personal',
  };

  const currentTitle = pageTitleMap[pathname] || 'Dashboard';
  const roleName = loading ? 'Cargando...' : (role ? roleDisplayMap[role] : 'Usuario');

  return (
    <header className="h-20 flex items-center justify-between px-8 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-b border-slate-200/50 dark:border-white/5 sticky top-0 z-30 transition-all duration-300">
      <div className="flex items-center gap-6">
        <button
          onClick={toggleSidebar}
          className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 text-slate-600 dark:text-white shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all border border-slate-200/50 dark:border-white/5 group"
          aria-label="Alternar menú"
        >
          <Menu size={20} className="group-hover:scale-110 transition-transform" />
        </button>
        
        <div className="hidden lg:flex items-center gap-3">
          <div className="w-1 h-8 bg-blue-100 dark:bg-blue-500/20 rounded-full" />
          <div>
            <h1 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">
              {currentTitle}
            </h1>
            <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase font-black tracking-widest">
              <span>Overview</span>
              <span className="w-1 h-1 bg-slate-400 rounded-full" />
              <span className="text-blue-500">{roleName}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 lg:gap-8">
        <div className="hidden md:flex items-center gap-2 bg-slate-100/50 dark:bg-white/5 px-4 py-2 rounded-2xl border border-slate-200/50 dark:border-white/5 min-w-[200px] lg:min-w-[300px]">
          <Search size={16} className="text-slate-400" />
          <input 
            type="text" 
            placeholder="Search resources, students..." 
            className="bg-transparent border-none focus:outline-none text-sm text-slate-600 dark:text-slate-300 w-full"
          />
        </div>

        <div className="flex items-center gap-2 lg:gap-3">
          <button className="p-2.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-white/5 rounded-2xl transition-all relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900" />
          </button>
          <button className="p-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 rounded-2xl transition-all">
            <Settings size={20} />
          </button>
        </div>

        <div className="h-8 w-px bg-slate-200 dark:bg-white/5 hidden md:block" />

        <Link
          href="/perfil"
          className="flex items-center gap-3 group"
        >
          <div className="text-right hidden md:block">
            {!loading ? (
              <>
                <p className="text-sm font-bold text-slate-800 dark:text-white leading-tight group-hover:text-blue-600 transition-colors uppercase tracking-tight">{fullName}</p>
                <p className="text-[10px] text-slate-500 font-extrabold uppercase">{roleName}</p>
              </>
            ) : (
              <div className="animate-pulse flex flex-col gap-1 items-end">
                <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-2 w-16 bg-slate-200 dark:bg-slate-700 rounded mt-1" />
              </div>
            )}
          </div>
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-[2px] shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full rounded-[14px] bg-white dark:bg-slate-800 overflow-hidden flex items-center justify-center text-blue-600 dark:text-blue-400 font-black text-lg">
                {loading ? (
                  <span className="animate-pulse">...</span>
                ) : avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  initial
                )}
              </div>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-4 border-white dark:border-slate-900" />
          </div>
        </Link>
      </div>
    </header>
  );
}
