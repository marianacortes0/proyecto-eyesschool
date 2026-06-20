'use client';

import { useCallback, useState } from 'react';
import { applyTheme, type Theme } from '@/services/theme/themeService';

/** Lee la clase que el script anti-flash ya aplicó al <html> (cliente). */
function readAppliedTheme(): Theme {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

/** Estado reactivo del tema claro/oscuro. Orquesta el themeService. */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(readAppliedTheme);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      return next;
    });
  }, []);

  return { theme, isDark: theme === 'dark', toggle };
}
