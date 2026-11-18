import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import MinimalDashboard from '@/components/panel/MinimalDashboard'

// DEF-WEB-08 / CP-SIS-008 · si el inicio no carga, se ve un error con «Reintentar».

const base = {
  greetingName: 'Ana',
  subtitle: 'Resumen',
  primary: { label: 'Estudiantes a tu cargo', value: '—', caption: '' },
  kpis: [],
}

describe('MinimalDashboard · error al cargar (DEF-WEB-08)', () => {
  it('muestra el error como alerta con un botón Reintentar que vuelve a pedir los datos', async () => {
    const reintentar = vi.fn()
    render(<MinimalDashboard {...base} error="No se pudo cargar tu inicio." onReintentar={reintentar} />)

    expect(screen.getByRole('alert').textContent).toContain('No se pudo cargar tu inicio.')
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(reintentar).toHaveBeenCalledTimes(1)
  })

  it('sin error no muestra alerta ni botón', () => {
    render(<MinimalDashboard {...base} onReintentar={vi.fn()} />)

    expect(screen.queryByRole('alert')).toBeNull()
    expect(screen.queryByRole('button', { name: 'Reintentar' })).toBeNull()
  })
})
