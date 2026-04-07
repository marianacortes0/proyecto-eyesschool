'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/services/supabase/client'
import { can, mapRolToKey, type Role, type Action, type Resource } from '@/lib/utils/permissions'
import { User } from '@supabase/supabase-js'

export function useAuth() {
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<Role | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user)
        const rol = mapRolToKey(
          session.user.app_metadata?.rol as string | undefined,
          session.user.user_metadata?.idRol as number | undefined
        )
        setRole(rol)
        setUserId(session.user.id)
      } else {
        setUser(null)
        setRole(null)
        setUserId(null)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user)
        const rol = mapRolToKey(
          session.user.app_metadata?.rol as string | undefined,
          session.user.user_metadata?.idRol as number | undefined
        )
        setRole(rol)
        setUserId(session.user.id)
      } else {
        setUser(null)
        setRole(null)
        setUserId(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
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