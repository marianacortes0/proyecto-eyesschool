import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'

import { navigationMock } from '../setup/nextMocks'
import SelectorHijo from '@/components/asociado/SelectorHijo'
import type { Hijo } from '@/lib/utils/hijoActivo'

const hijo = (idEstudiante: number, nombre: string): Hijo => ({
  idEstudiante,
  nombre,
  documento: `100${idEstudiante}`,
  parentesco: 'Madre',
  idCursoActual: 5,
})

beforeEach(() => {
  navigationMock.push.mockReset()
  navigationMock.replace.mockReset()
  navigationMock.pathname = '/notas'
  navigationMock.params = new URLSearchParams()
})

describe('SelectorHijo (WEB-03)', () => {
  it('con un solo hijo no se ve', () => {
    const { container } = render(<SelectorHijo hijos={[hijo(10, 'Ana')]} activoId={10} />)

    expect(container.innerHTML).toBe('')
  })

  it('con dos hijos se ve y al elegir el segundo cambia ?hijo=', async () => {
    render(<SelectorHijo hijos={[hijo(10, 'Ana'), hijo(11, 'Luis')]} activoId={10} />)

    await userEvent.selectOptions(screen.getByRole('combobox', { name: /estudiante/i }), '11')

    const destino = [...navigationMock.push.mock.calls, ...navigationMock.replace.mock.calls][0]?.[0] as string
    expect(destino).toBe('/notas?hijo=11')
  })

  it('muestra al hijo activo como seleccionado', () => {
    render(<SelectorHijo hijos={[hijo(10, 'Ana'), hijo(11, 'Luis')]} activoId={11} />)

    expect((screen.getByRole('combobox', { name: /estudiante/i }) as HTMLSelectElement).value).toBe('11')
  })

  it('conserva los demás parámetros de la URL', async () => {
    navigationMock.params = new URLSearchParams('periodo=2')
    render(<SelectorHijo hijos={[hijo(10, 'Ana'), hijo(11, 'Luis')]} activoId={10} />)

    await userEvent.selectOptions(screen.getByRole('combobox', { name: /estudiante/i }), '11')

    const destino = [...navigationMock.push.mock.calls, ...navigationMock.replace.mock.calls][0]?.[0] as string
    expect(destino).toContain('periodo=2')
    expect(destino).toContain('hijo=11')
  })
})
