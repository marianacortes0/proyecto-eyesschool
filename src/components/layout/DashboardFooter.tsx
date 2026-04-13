'use client';

export default function DashboardFooter() {
  return (
    <footer className="h-12 flex items-center justify-center px-6 bg-white/50 dark:bg-[#141414]/50 backdrop-blur-md border-t border-white/40 dark:border-white/10 text-xs text-slate-500 dark:text-gray-400 mt-auto transition-colors duration-500">
      <p>© {new Date().getFullYear()} EyesSchool. Todos los derechos reservados.</p>
    </footer>
  );
}
