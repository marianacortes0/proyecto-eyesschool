'use client'

import { useEffect, useState } from 'react'
import { can, mapRolToKey, type Role, type Action, type Resource } from '@/lib/utils/permissions'

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
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    if (typeof window === 'undefined') return null
    return readUserCookie()
  })
  const loading = false

  // Re-sync on focus (handles login in another tab)
  useEffect(() => {
    const sync = () => setAuthUser(readUserCookie())
    window.addEventListener('focus', sync)
    return () => window.removeEventListener('focus', sync)
  }, [])

  const role: Role | null = authUser
    ? mapRolToKey(authUser.nombreRol, authUser.idRol)
    : null

  const signOut = async () => {
    // Clear cookies and redirect — actual API call handled by logout action
    document.cookie = 'eys_access=; path=/; max-age=0'
    document.cookie = 'eys_refresh=; path=/; max-age=0'
    document.cookie = 'eys_user=; path=/; max-age=0'
    window.location.href = '/login'
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
