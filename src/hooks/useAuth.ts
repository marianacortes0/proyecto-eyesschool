'use client'

import { useEffect, useState } from 'react'
import { can, mapRolToKey, type Role, type Action, type Resource } from '@/lib/utils/permissions'
import { logout } from '@/auth/actions'

export type AuthUser = {
  idUsuario: number
  idRol: number
  nombreRol: string
  primerNombre: string
  primerApellido: string
}

function readUserCookie(): AuthUser | null {
  if (typeof document === 'undefined') return null
  const m = document.cookie.match(/(?:^|; )eys_user=([^;]*)/)
  if (!m) return null
  try {
    return JSON.parse(decodeURIComponent(m[1])) as AuthUser
  } catch {
    return null
  }
}

export function useAuth() {
  // Empezamos en null para que el primer render del cliente coincida con el SSR
  // (la cookie solo existe en el navegador). Evita el hydration mismatch.
  const [authUser, setAuthUser] = useState<AuthUser | null>(null)
  const loading = false

  // Leemos la cookie tras el montaje y re-sincronizamos al volver al foco
  // (maneja login en otra pestaña).
  useEffect(() => {
    setAuthUser(readUserCookie())
    const sync = () => setAuthUser(readUserCookie())
    window.addEventListener('focus', sync)
    return () => window.removeEventListener('focus', sync)
  }, [])

  const role: Role | null = authUser
    ? mapRolToKey(authUser.nombreRol, authUser.idRol)
    : null

  const signOut = async () => {
    // Invalida la sesión en el backend, limpia las cookies httpOnly y
    // redirige a la página de inicio. (El server action hace el redirect a '/').
    setAuthUser(null)
    await logout()
  }

  return {
    user: authUser,
    // Keep a `userId` number (was Supabase UUID string) for backward compat
    userId: authUser?.idUsuario ?? null,
    role,
    loading,
    signOut,
    can: (action: Action, resource: Resource) =>
      role ? can(role, action, resource) : false,
  }
}
