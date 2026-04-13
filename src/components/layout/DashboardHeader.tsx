'use client';

import { useAuth } from '@/hooks/useAuth';
import { useSidebar } from '@/components/layout/SidebarContext';

export default function DashboardHeader() {
  const { user, loading } = useAuth();
  const { toggleSidebar } = useSidebar();
  
  const firstName = user?.user_metadata?.primerNombre || 'Usuario';
  const lastName = user?.user_metadata?.primerApellido || '';
  const fullName = `${firstName} ${lastName}`.trim();
  const initial = firstName.charAt(0).toUpperCase() || 'U';

  const roleMap: Record<number, string> = {
    1: 'Administrador',
    2: 'Docente',
    3: 'Estudiante',
    4: 'Padre/Acudiente',
  };
  const roleName = user ? roleMap[user.user_metadata?.idRol] || 'Usuario' : 'Cargando...';

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-white/80 dark:bg-[#141414]/90 backdrop-blur-xl border-b border-white/40 dark:border-white/10 shadow-sm z-10 transition-colors duration-500">
      <div className="flex items-center gap-4">
        {/* Botón de hamburguesa */}
        <button 
          onClick={toggleSidebar}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-white transition-colors"
          aria-label="Alternar menú"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
        <h1 className="text-xl font-bold text-slate-800 dark:text-white hidden sm:block">Panel de Administración</h1>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
             {!loading ? (
               <>
                 <p className="text-sm font-bold text-slate-800 dark:text-white transition-opacity duration-300">
                   {fullName}
                 </p>
                 <p className="text-xs text-slate-500 dark:text-gray-400 capitalize transition-opacity duration-300">
                   {roleName}
                 </p>
               </>
             ) : (
               <div className="animate-pulse flex flex-col gap-1 items-end">
                 <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
                 <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
               </div>
             )}
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 border-2 border-blue-500 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold shadow-md">
            {loading ? <span className="animate-pulse">...</span> : initial}
          </div>
        </div>
      </div>
    </header>
  );
}
