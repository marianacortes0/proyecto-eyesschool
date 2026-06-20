// Service layer — I/O del tema (DOM + localStorage). Sin React, sin estado.

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'eys_theme';

/** Lee el tema guardado; cae al preferido del sistema si no hay nada. */
export function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** Aplica el tema al <html> (clase `dark`) y lo persiste. */
export function applyTheme(theme: Theme): void {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', theme === 'dark');
  window.localStorage.setItem(STORAGE_KEY, theme);
}
