import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import FallidosMasivo from '@/components/asistencia/FallidosMasivo'

// WEB-06 · los registros de asistencia que no se guardaron se listan por nombre
// con su motivo, para reenviar solo esos o descartarlos (CP-SIS de registro masivo).

const FALLIDOS = [
  { idEstudiante: 10, motivo: 'Ya tiene registro de entrada hoy' },
  { idEstudiante: 11, motivo: 'Error interno' },
]
const nombreDe = (id: number) => ({ 10: 'Ana Pérez', 11: 'Luis Pérez' })[id] ?? `#${id}`

describe('FallidosMasivo (WEB-06)', () => {
  it('sin fallidos no renderiza nada', () => {
    const { container } = render(
      <FallidosMasivo fallidos={[]} nombreDe={nombreDe} onReintentar={vi.fn()} onDescartar={vi.fn()} />
    )

    expect(container.innerHTML).toBe('')
  })

  it('lista cada estudiante por nombre con su motivo', () => {
    render(<FallidosMasivo fallidos={FALLIDOS} nombreDe={nombreDe} onReintentar={vi.fn()} onDescartar={vi.fn()} />)

    expect(screen.getByRole('region', { name: /registros no guardados/i })).toBeTruthy()
    expect(screen.getByText('Ana Pérez')).toBeTruthy()
    expect(screen.getByText('Luis Pérez')).toBeTruthy()
    expect(screen.getByText('Ya tiene registro de entrada hoy')).toBeTruthy()
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
  })

  it('con un solo fallido el texto va en singular', () => {
    render(<FallidosMasivo fallidos={[FALLIDOS[0]]} nombreDe={nombreDe} onReintentar={vi.fn()} onDescartar={vi.fn()} />)

    expect(screen.getByText(/1 registro no se guardó$/)).toBeTruthy()
  })

  it('Reintentar y Descartar avisan al llamador', async () => {
    const onReintentar = vi.fn()
    const onDescartar = vi.fn()
    render(<FallidosMasivo fallidos={FALLIDOS} nombreDe={nombreDe} onReintentar={onReintentar} onDescartar={onDescartar} />)

    await userEvent.click(screen.getByRole('button', { name: /reintentar/i }))
    await userEvent.click(screen.getByRole('button', { name: /descartar/i }))

    expect(onReintentar).toHaveBeenCalledTimes(1)
    expect(onDescartar).toHaveBeenCalledTimes(1)
  })

  it('mientras se reenvía, los dos botones están deshabilitados', () => {
    render(
      <FallidosMasivo fallidos={FALLIDOS} nombreDe={nombreDe} onReintentar={vi.fn()} onDescartar={vi.fn()} ocupado />
    )

    expect(screen.getByRole('button', { name: /reintentar/i })).toHaveProperty('disabled', true)
    expect(screen.getByRole('button', { name: /descartar/i })).toHaveProperty('disabled', true)
  })
})
