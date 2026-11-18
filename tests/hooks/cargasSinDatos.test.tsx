import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useDashboard } from '@/hooks/useDashboard'
import { useNovedades } from '@/hooks/useNovedades'

// SonarCloud S9383 · cargas iniciales que ahora se lanzan con `void`: el panel
// del admin y las novedades sin datos del servidor piden los suyos al montar, y
// un fallo no deja la carga colgada.

const m = vi.hoisted(() => ({ admin: vi.fn(), novedades: vi.fn() }))
vi.mock('@/services/dashboard/dashboardActions', () => ({ getAdminDashboardAction: m.admin }))
vi.mock('@/services/novedades/novedadesActions', () => ({
  getNovedadesBootstrapAction: m.novedades,
  createNovedadAction: vi.fn(),
  updateNovedadAction: vi.fn(),
  deleteNovedadAction: vi.fn(),
}))
vi.mock('@/lib/toast', () => ({ notifySuccess: vi.fn(), notifyError: vi.fn() }))
vi.mock('@/components/ui/ConfirmDialog', () => ({ useConfirm: () => async () => true }))

beforeEach(() => vi.clearAllMocks())

describe('useDashboard (admin)', () => {
  it('pide los datos al montar', async () => {
    m.admin.mockResolvedValue({ promedioPorMateria: [{ materia: 'Matemáticas', promedio: 4.1 }] })
    const { result } = renderHook(() => useDashboard())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(m.admin).toHaveBeenCalledTimes(1)
    expect(result.current.promedioPorMateria).toEqual([{ materia: 'Matemáticas', promedio: 4.1 }])
  })

  it('si falla, termina la carga sin romper', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    m.admin.mockRejectedValue(new Error('fetch failed'))
    const { result } = renderHook(() => useDashboard())

    await waitFor(() => expect(result.current.loading).toBe(false))
  })
})

describe('useNovedades sin datos del servidor', () => {
  it('pide las novedades al montar', async () => {
    m.novedades.mockResolvedValue({ novedades: [], tiposNovedad: [], cursos: [], estudiantes: [] })
    const { result } = renderHook(() => useNovedades(2))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(m.novedades).toHaveBeenCalledTimes(1)
  })
})
