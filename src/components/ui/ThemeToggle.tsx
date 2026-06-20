'use client';

import { useTheme } from '@/hooks/useTheme';

/** Botón de tema claro/oscuro para el riel del panel. */
export default function ThemeToggle() {
  const { isDark, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      suppressHydrationWarning
      className="group relative text-on-surface-variant hover:text-primary transition-colors"
      aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
      title={isDark ? 'Modo claro' : 'Modo oscuro'}
    >
      <span suppressHydrationWarning className="material-symbols-outlined !text-2xl">
        {isDark ? 'light_mode' : 'dark_mode'}
      </span>
      <span className="absolute left-12 top-1/2 -translate-y-1/2 bg-on-surface text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
        {isDark ? 'Modo claro' : 'Modo oscuro'}
      </span>
    </button>
  );
}
