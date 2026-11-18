import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const descargar = vi.fn()
vi.mock('@/services/notas/notasService', async (original) => ({
  ...(await original<typeof import('@/services/notas/notasService')>()),
  downloadBoletinPdf: (...args: unknown[]) => descargar(...args),
}))
const notifyError = vi.fn()
vi.mock('@/lib/toast', () => ({ notifyError: (m: string) => notifyError(m), notifySuccess: vi.fn(), notifyWarning: vi.fn() }))

import NotasViewerClient from '@/app/(dashboard)/notas/NotasViewerClient'
import { MSG_SIN_BOLETIN, MSG_SIN_NOTAS_PERIODO } from '@/services/notas/notasService'

const info = { idEstudiante: 11, nombre: 'Luis Pérez', codigo: 'EST011' }
const nota = {
  idNota: 1, nota: 4.2, observacion: null, fechaRegistro: '2026-10-01T10:00:00',
  idMateria: 3, idPeriodo: 1, nombreMateria: 'Matemáticas', periodoLabel: 'Periodo 1',
}
const materias = [{ idMateria: 3, nombreMateria: 'Matemáticas' }]

beforeEach(() => {
  descargar.mockReset()
  notifyError.mockReset()
})

describe('NotasViewerClient (WEB-09)', () => {
  it('con rol padre aparece «Descargar boletín» y llama downloadBoletinPdf con el id del hijo', async () => {
    descargar.mockResolvedValue(undefined)
    render(<NotasViewerClient hijos={[]} info={info} notas={[nota]} materias={materias} />)

    await userEvent.click(screen.getByRole('button', { name: /Descargar boletín/i }))

    expect(descargar).toHaveBeenCalledWith(11, 'Luis Pérez')
  })

  it('al elegir un periodo sin notas muestra el texto exacto del criterio de aceptación', async () => {
    render(<NotasViewerClient hijos={[]} info={info} notas={[nota]} materias={materias} />)

    await userEvent.selectOptions(screen.getByDisplayValue('Todos los periodos'), '2')

    expect(screen.getByText(MSG_SIN_NOTAS_PERIODO)).toBeTruthy()
    expect(MSG_SIN_NOTAS_PERIODO).toBe('No hay notas registradas para este periodo.')
  })

  it('un periodo con notas no muestra el mensaje de periodo vacío', async () => {
    render(<NotasViewerClient hijos={[]} info={info} notas={[nota]} materias={materias} />)

    await userEvent.selectOptions(screen.getByDisplayValue('Todos los periodos'), '1')

    expect(screen.queryByText(MSG_SIN_NOTAS_PERIODO)).toBeNull()
    expect(screen.getByText('Matemáticas', { selector: 'td' })).toBeTruthy()
  })

  it('si el boletín no tiene datos muestra el mensaje de la API con notifyError', async () => {
    descargar.mockRejectedValue(new Error(MSG_SIN_BOLETIN))
    render(<NotasViewerClient hijos={[]} info={info} notas={[]} materias={materias} />)

    await userEvent.click(screen.getByRole('button', { name: /Descargar boletín/i }))

    await waitFor(() => expect(notifyError).toHaveBeenCalledWith('No hay datos disponibles para generar el boletín.'))
  })

  it('sin estudiante asociado no ofrece el boletín', () => {
    render(<NotasViewerClient hijos={[]} info={null} notas={[]} materias={[]} />)

    expect(screen.queryByRole('button', { name: /Descargar boletín/i })).toBeNull()
    expect(screen.getByText(/No encontramos un estudiante asociado/)).toBeTruthy()
  })
})
