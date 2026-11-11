import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const useAuthMock = vi.fn()
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => useAuthMock() }))

import { usePermissions } from '@/hooks/usePermissions'
import { PERMISSIONS, type Action, type Resource, type Role } from '@/lib/utils/permissions'

const ROLES: Role[] = ['admin', 'docente', 'estudiante', 'padre']
const ACCIONES: Action[] = ['create', 'read', 'update', 'delete', 'download']
const RECURSOS = Array.from(new Set(ROLES.flatMap((r) => Object.keys(PERMISSIONS[r])))) as Resource[]

function permisosDe(role: Role | null) {
  useAuthMock.mockReturnValue({ role })
  return renderHook(() => usePermissions()).result.current
}

describe('UT-WEB-01 · usePermissions (WEB-04)', () => {
  beforeEach(() => useAuthMock.mockReset())

  it.each(ROLES)('%s: el hook devuelve lo mismo que PERMISSIONS para cada recurso y acción', (rol) => {
    const { can } = permisosDe(rol)

    for (const recurso of RECURSOS) {
      for (const accion of ACCIONES) {
        const esperado = PERMISSIONS[rol][recurso]?.includes(accion) ?? false
        expect(can(accion, recurso), `${rol} ${accion} ${recurso}`).toBe(esperado)
      }
    }
  })

  it('docente no puede borrar asistencia', () => {
    expect(permisosDe('docente').can('delete', 'asistencia')).toBe(false)
  })

  it('docente puede crear asistencia', () => {
    expect(permisosDe('docente').can('create', 'asistencia')).toBe(true)
  })

  it('padre no puede crear usuarios', () => {
    expect(permisosDe('padre').can('create', 'usuarios')).toBe(false)
  })

  it('sin rol no puede nada', () => {
    const { can } = permisosDe(null)

    for (const recurso of RECURSOS) {
      for (const accion of ACCIONES) expect(can(accion, recurso), `${accion} ${recurso}`).toBe(false)
    }
  })
})
