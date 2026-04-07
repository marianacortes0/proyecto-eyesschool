'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../services/supabase/client'
import { User } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Buscar la sesión actual al montar
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Escuchar cambios (login, logout, refresco de token)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const signOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return {
    user,
    loading,
    signOut,
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
