'use client'

import { useAuth } from '@/hooks/useAuth'
import type { Role } from '@/lib/utils/permissions'

interface ProtectedProps {
  /** Roles que pueden ver el contenido */
  rolesPermitidos: Role[]
  children: React.ReactNode
  /** Qué mostrar si el usuario no tiene permiso (por defecto null) */
  fallback?: React.ReactNode
}

/**
 * Envuelve contenido que solo deben ver ciertos roles.
 *
 * @example — Un solo rol
 * <Protected rolesPermitidos={['admin']}>
 *   <button>Eliminar usuario</button>
 * </Protected>
 *
 * @example — Múltiples roles
 * <Protected rolesPermitidos={['admin', 'docente']}>
 *   <button>Crear nota</button>
 * </Protected>
 *
 * @example — Con fallback
 * <Protected rolesPermitidos={['admin']} fallback={<p>Sin permiso</p>}>
 *   <PanelAdmin />
 * </Protected>
 */
export function Protected({ rolesPermitidos, children, fallback = null }: ProtectedProps) {
  const { role, loading } = useAuth()

  if (loading) return null
  if (!role || !rolesPermitidos.includes(role)) return <>{fallback}</>
  return <>{children}</>
}
