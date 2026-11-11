// Opciones comunes de las cookies de sesión (WEB-02). Un solo lugar para que el
// inicio de sesión (Server Action) y el proxy (que renueva el acceso) no diverjan.

export const ACCESS_MAX_AGE = 30 * 60
export const REFRESH_MAX_AGE = 7 * 24 * 60 * 60

/** Cierre de sesión tras este tiempo sin actividad (CA-US017.5). */
export const INACTIVIDAD_MS = 30 * 60 * 1000

/**
 * Inactividad vigente. La regla real es de 30 min; `SESSION_IDLE_MINUTES` existe
 * solo para que el E2E de QA (CP-SIS-065) la pruebe a escala (p. ej. 1 min). Un
 * valor ausente o no positivo cae a 30.
 */
export function inactividadMs(env: string | undefined = process.env.SESSION_IDLE_MINUTES): number {
  const minutos = Number(env)
  return Number.isFinite(minutos) && minutos > 0 ? minutos * 60 * 1000 : INACTIVIDAD_MS
}

export const COOKIE_NAMES = ['eys_access', 'eys_refresh', 'eys_user', 'eys_last'] as const

export function cookieOptions(httpOnly: boolean, maxAge: number) {
  return {
    path: '/',
    maxAge,
    sameSite: 'lax' as const,
    httpOnly,
    secure: process.env.NODE_ENV === 'production',
  }
}
