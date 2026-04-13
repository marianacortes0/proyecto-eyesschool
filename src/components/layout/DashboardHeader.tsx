'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useSidebar } from '@/components/layout/SidebarContext';
import { useState, useEffect } from 'react';
import { createClient } from '@/services/supabase/client';

export default function DashboardHeader() {
  const { user, role, loading } = useAuth();
  const { toggleSidebar } = useSidebar();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setAvatarUrl(user?.user_metadata?.avatarUrl ?? null);
    });
    // Escuchar cambios de sesión para actualizar el avatar tras upload
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
    admin:      'Administrador',
    docente:    'Profesor',
    estudiante: 'Estudiante',
    padre:      'Padre / Acudiente',
  };
  const roleName = loading ? 'Cargando...' : (role ? roleDisplayMap[role] : 'Usuario');

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-white/80 dark:bg-[#141414]/90 backdrop-blur-xl border-b border-white/40 dark:border-white/10 shadow-sm z-10 transition-colors duration-500">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-white transition-colors"
          aria-label="Alternar menú"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-slate-800 dark:text-white hidden sm:block">Panel de Administración</h1>
      </div>

      <div className="flex items-center gap-6">
        <Link
          href="/perfil"
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="text-right hidden md:block">
            {!loading ? (
              <>
                <p className="text-sm font-bold text-slate-800 dark:text-white">{fullName}</p>
                <p className="text-xs text-slate-500 dark:text-gray-400 capitalize">{roleName}</p>
              </>
            ) : (
              <div className="animate-pulse flex flex-col gap-1 items-end">
                <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
              </div>
            )}
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 border-2 border-blue-500 overflow-hidden flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold shadow-md">
            {loading ? (
              <span className="animate-pulse">...</span>
            ) : avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              initial
            )}
          </div>
        </Link>
      </div>
    </header>
  );
}
