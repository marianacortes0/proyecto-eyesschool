'use client';

import { useTheme } from '@/hooks/useTheme';

/** Botón de tema claro/oscuro para el riel del panel. */
export default function ThemeToggle() {
  const { toggle } = useTheme();

  // Servidor y cliente renderizan el MISMO HTML: la visibilidad de cada
  // icono/texto la decide la clase `.dark` del <html> (que el script
  // anti-flash aplica antes del primer paint). Así no hay mismatch de
  // hidratación ni flash de icono.
  return (
    <button
      onClick={toggle}
      className="group relative text-on-surface-variant hover:text-primary transition-colors"
      aria-label="Cambiar tema claro u oscuro"
    >
      <span className="material-symbols-outlined !text-2xl inline dark:hidden">dark_mode</span>
      <span className="material-symbols-outlined !text-2xl hidden dark:inline">light_mode</span>
      <span className="absolute left-12 top-1/2 -translate-y-1/2 bg-on-surface text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
        <span className="inline dark:hidden">Modo oscuro</span>
        <span className="hidden dark:inline">Modo claro</span>
      </span>
    </button>
  );
}
