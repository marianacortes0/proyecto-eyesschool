'use client'

import { useAuth } from './useAuth'
import { can, type Action, type Resource } from '@/lib/utils/permissions'

export function usePermissions() {
  const { role } = useAuth()
  return {
    can: (action: Action, resource: Resource) =>
      role ? can(role, action, resource) : false,
  }
}
