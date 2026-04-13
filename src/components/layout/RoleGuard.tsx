'use client'

import { useAuth } from '@/hooks/useAuth'
import type { Role } from '@/lib/utils/permissions'

export function RoleGuard({
  roles,
  children,
  fallback = null,
}: {
  roles: Role[]
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const { role, loading } = useAuth()
  if (loading) return null
  if (!role || !roles.includes(role)) return <>{fallback}</>
  return <>{children}</>
}
