import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const accion = vi.fn()
vi.mock('@/services/asistencia/asistenciaActions', () => ({
  crearRegistrosMasivoAction: (...args: unknown[]) => accion(...args),
}))
vi.mock('@/lib/toast', () => ({
  notifySuccess: vi.fn(),
  notifyError: vi.fn(),
  notifyWarning: vi.fn(),
}))

import RegistroMasivo from '@/components/qr/RegistroMasivo'

const cursos = [{ idCurso: 5, nombreCurso: '6A', jornada: 'mañana' }]
const estudiantes = [
  { idEstudiante: 1, codigoEstudiante: 'EST001', nombreCompleto: 'Ana Pérez', curso: null, jornada: null, idCurso: 5 },
  { idEstudiante: 2, codigoEstudiante: 'EST002', nombreCompleto: 'Luis Gómez', curso: null, jornada: null, idCurso: 5 },
]

async function enviarLote() {
  render(<RegistroMasivo cursos={cursos} estudiantes={estudiantes} idUsuarioRegistrador={9} />)
  const [jornada, curso] = screen.getAllByRole('combobox')
  await userEvent.selectOptions(jornada, 'mañana')
  await userEvent.selectOptions(curso, '5')
  await userEvent.click(screen.getByRole('button', { name: /Registrar 2 asistencias/ }))
}

beforeEach(() => accion.mockReset())

describe('RegistroMasivo (WEB-06)', () => {
  it('lista a cada fallido por nombre con los botones Reintentar y Descartar', async () => {
    accion.mockResolvedValue({ guardados: [1], duplicados: [], fallidos: [{ idEstudiante: 2, motivo: 'HTTP 500' }] })

    await enviarLote()

    const fallidos = await screen.findByRole('region', { name: /no guardados/i })
    expect(within(fallidos).getByText('Luis Gómez')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Descartar' })).toBeTruthy()
  })

  it('Reintentar reenvía solo al estudiante fallido', async () => {
    accion
      .mockResolvedValueOnce({ guardados: [1], duplicados: [], fallidos: [{ idEstudiante: 2, motivo: 'HTTP 500' }] })
      .mockResolvedValueOnce({ guardados: [2], duplicados: [], fallidos: [] })

    await enviarLote()
    await userEvent.click(await screen.findByRole('button', { name: 'Reintentar' }))

    await waitFor(() => expect(accion).toHaveBeenCalledTimes(2))
    expect(accion.mock.calls[1][0].items).toEqual([{ idEstudiante: 2, estado: 'Presente' }])
  })

  it('Descartar quita al fallido de la lista sin llamar a la API', async () => {
    accion.mockResolvedValue({ guardados: [1], duplicados: [], fallidos: [{ idEstudiante: 2, motivo: 'HTTP 500' }] })

    await enviarLote()
    await userEvent.click(await screen.findByRole('button', { name: 'Descartar' }))

    await waitFor(() => expect(screen.queryByRole('button', { name: 'Reintentar' })).toBeNull())
    expect(accion).toHaveBeenCalledTimes(1)
  })

  it('cuando todos ya estaban registrados dice «ya registrado» y no ofrece reintentar', async () => {
    accion.mockResolvedValue({ guardados: [], duplicados: [1, 2], fallidos: [] })

    await enviarLote()

    expect(await screen.findAllByText(/ya registrado/i)).not.toHaveLength(0)
    expect(screen.queryByRole('button', { name: 'Reintentar' })).toBeNull()
  })
})
