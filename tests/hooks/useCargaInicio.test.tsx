import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useCargaInicio } from '@/hooks/useCargaInicio'

// DEF-WEB-08 · el inicio con la API caída muestra un error y deja reintentar,
// en vez de ceros. useCargaInicio es la carga común de los tres inicios.

describe('useCargaInicio (DEF-WEB-08)', () => {
  it('con los datos del servidor no vuelve a pedirlos', () => {
    const cargar = vi.fn(async () => ({ total: 9 }))
    const { result } = renderHook(() => useCargaInicio(cargar, { total: 3 }))

    expect(result.current).toMatchObject({ data: { total: 3 }, loading: false, error: null })
    expect(cargar).not.toHaveBeenCalled()
  })

  it('sin datos del servidor los pide al montar', async () => {
    const cargar = vi.fn(async () => ({ total: 5 }))
    const { result } = renderHook(() => useCargaInicio(cargar))

    expect(result.current.loading).toBe(true)
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).toEqual({ total: 5 })
    expect(cargar).toHaveBeenCalledTimes(1)
  })

  it('un fallo deja un mensaje para la persona, sin datos inventados', async () => {
    const cargar = vi.fn(async () => {
      throw new Error('fetch failed')
    })
    const { result } = renderHook(() => useCargaInicio(cargar))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).toBeNull()
    expect(result.current.error).toBe('No se pudo cargar la información. Intenta de nuevo.')
  })

  it('reintentar limpia el error y vuelve a pedir los datos', async () => {
    const cargar = vi
      .fn<() => Promise<{ total: number }>>()
      .mockRejectedValueOnce(new Error('fetch failed'))
      .mockResolvedValueOnce({ total: 7 })
    const { result } = renderHook(() => useCargaInicio(cargar))
    await waitFor(() => expect(result.current.error).not.toBeNull())

    act(() => result.current.reintentar())
    expect(result.current).toMatchObject({ loading: true, error: null })

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current).toMatchObject({ data: { total: 7 }, error: null })
    expect(cargar).toHaveBeenCalledTimes(2)
  })
})
