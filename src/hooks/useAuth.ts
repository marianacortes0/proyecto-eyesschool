'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/services/supabase/client'
import { can, mapRolToKey, type Role, type Action, type Resource } from '@/lib/utils/permissions'

export function useAuth() {
  const supabase = createClient()
  const [role, setRole]     = useState<Role | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const rol = mapRolToKey(
          session.user.app_metadata?.rol as string | undefined,
          session.user.user_metadata?.idRol as number | undefined
        )
        setRole(rol)
        setUserId(session.user.id)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        const rol = mapRolToKey(
          session.user.app_metadata?.rol as string | undefined,
          session.user.user_metadata?.idRol as number | undefined
        )
        setRole(rol)
        setUserId(session.user.id)
      } else {
        setRole(null)
        setUserId(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return {
    role,
    userId,
    loading,
    can: (action: Action, resource: Resource) =>
      role ? can(role, action, resource) : false,
  }
}
