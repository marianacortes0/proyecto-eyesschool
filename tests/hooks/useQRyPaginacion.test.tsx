import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { usePagination } from '@/hooks/usePagination'
import { useQR } from '@/hooks/useQR'

// useQR (vista del admin y del docente en /qr): carga del día con su error, y
// la paginación de las tablas, que se ajusta si la lista se encoge al filtrar.

const m = vi.hoisted(() => ({ bootstrap: vi.fn(), registros: vi.fn() }))
vi.mock('@/services/qr/qrActions', () => ({
  getQRBootstrapAction: m.bootstrap,
  getRegistrosAsistenciaAction: m.registros,
  getEstudiantesConQRAction: vi.fn(),
  getUsuariosSinEstudianteAction: vi.fn(),
}))
vi.mock('@/auth/actions', () => ({ asignarQR: vi.fn() }))
vi.mock('@/lib/utils/fecha', () => ({ hoyColegio: () => '2026-11-17' }))

const RED = new Error('fetch failed')
const DATOS = { estudiantes: [{ idEstudiante: 1 }], asistencia: [], sinAsignar: [], cursos: [] }

beforeEach(() => vi.clearAllMocks())

describe('useQR', () => {
  it('el admin sin datos del servidor carga los del día de hoy (hora de Colombia)', async () => {
    m.bootstrap.mockResolvedValue(DATOS)
    const { result } = renderHook(() => useQR('admin'))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(m.bootstrap).toHaveBeenCalledWith('2026-11-17')
    expect(result.current.error).toBeNull()
  })

  it('si la carga falla, queda el error y no se cuelga la carga', async () => {
    m.bootstrap.mockRejectedValue(new Error('Sin permisos'))
    const { result } = renderHook(() => useQR('docente'))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('Sin permisos')
  })

  it('refrescar la asistencia con la API caída da un mensaje claro', async () => {
    m.registros.mockRejectedValue(RED)
    const { result } = renderHook(() => useQR('admin', DATOS as never))

    await act(() => result.current.refetchAsistencia())

    expect(result.current.error).toBe('Error al cargar asistencia')
    expect(m.bootstrap).not.toHaveBeenCalled()
  })

  it('otros roles no cargan la vista de gestión', () => {
    renderHook(() => useQR('estudiante'))

    expect(m.bootstrap).not.toHaveBeenCalled()
  })
})

describe('usePagination', () => {
  const lista = Array.from({ length: 23 }, (_, i) => i + 1)

  it('pagina de 10 en 10 e informa el rango', () => {
    const { result } = renderHook(() => usePagination(lista))
    act(() => result.current.setPage(3))

    expect(result.current).toMatchObject({ page: 3, totalPages: 3, from: 21, to: 23, total: 23 })
    expect(result.current.pageItems).toEqual([21, 22, 23])
  })

  it('si la lista se encoge, muestra la última página válida', () => {
    const { result, rerender } = renderHook(({ items }) => usePagination(items, 10), { initialProps: { items: lista } })
    act(() => result.current.setPage(3))

    rerender({ items: lista.slice(0, 5) })

    expect(result.current).toMatchObject({ page: 1, totalPages: 1, from: 1, to: 5 })
  })

  it('una lista vacía no rompe el rango', () => {
    expect(renderHook(() => usePagination([])).result.current).toMatchObject({ page: 1, totalPages: 1, from: 0, to: 0 })
  })
})
