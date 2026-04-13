'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/services/supabase/client'
import { can, mapRolToKey, type Role, type Action, type Resource } from '@/lib/utils/permissions'
import { User } from '@supabase/supabase-js'

export function useAuth() {
  // Instancia estable: una sola por montaje del hook, evita el AbortError de Web Locks
  const supabaseRef = useRef(createClient())
  const supabase = supabaseRef.current

  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<Role | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const applySession = (session: { user: User } | null) => {
      if (!mounted) return
      if (session) {
        setUser(session.user)
        const nombreRol =
          (session.user.app_metadata?.rol as string | undefined) ??
          (session.user.user_metadata?.rol as string | undefined)
        setRole(mapRolToKey(nombreRol, session.user.user_metadata?.idRol as number | undefined))
        setUserId(session.user.id)
      } else {
        setUser(null)
        setRole(null)
        setUserId(null)
      }
      setLoading(false)
    }

    // Refrescar la sesión al montar para obtener app_metadata actualizado
    supabase.auth.refreshSession().then(({ data: { session } }) => applySession(session))

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(session)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return {
    user,
    role,
    userId,
    loading,
    signOut,
    can: (action: Action, resource: Resource) =>
      role ? can(role, action, resource) : false,
  }
}