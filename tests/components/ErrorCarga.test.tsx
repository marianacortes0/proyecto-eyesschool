import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import ErrorCarga from '@/components/ui/ErrorCarga'

// DEF-WEB-12 · aviso común de «no se pudo cargar» con Reintentar.
describe('ErrorCarga (DEF-WEB-12)', () => {
  it('muestra el mensaje como alerta y Reintentar vuelve a pedir los datos', async () => {
    const reintentar = vi.fn()
    render(<ErrorCarga mensaje="No se pudo cargar la asistencia." onReintentar={reintentar} />)

    expect(screen.getByRole('alert').textContent).toContain('No se pudo cargar la asistencia.')
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(reintentar).toHaveBeenCalledTimes(1)
  })
})
