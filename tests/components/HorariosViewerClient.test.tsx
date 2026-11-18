import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'

import { navigationMock } from '../setup/nextMocks'
import HorariosViewerClient from '@/app/(dashboard)/horarios/HorariosViewerClient'
import { MSG_HORARIO_ERROR } from '@/services/asociado/mensajes'
import type { Hijo } from '@/lib/utils/hijoActivo'

const hijo: Hijo = {
  idEstudiante: 10,
  nombre: 'Ana Pérez',
  documento: '1001',
  parentesco: 'Madre',
  idCursoActual: 5,
}
const info = { idEstudiante: 10, nombre: 'Ana Pérez', codigo: 'EST010' }

beforeEach(() => navigationMock.refresh.mockReset())

describe('HorariosViewerClient (WEB-03 · horario del estudiante asociado)', () => {
  it('con error muestra el mensaje y un botón de reintentar, no una pantalla vacía', () => {
    render(<HorariosViewerClient info={info} hijos={[hijo]} curso={null} horarios={[]} error={MSG_HORARIO_ERROR} />)

    expect(screen.getByRole('alert').textContent).toContain(MSG_HORARIO_ERROR)
    expect(screen.getByRole('button', { name: /reintentar/i })).toBeTruthy()
    // El mensaje de «sin curso» no debe aparecer: no se sabe si tiene curso.
    expect(screen.queryByText(/no está asignado a un curso/i)).toBeNull()
  })

  it('reintentar vuelve a pedir los datos al servidor', async () => {
    render(<HorariosViewerClient info={info} hijos={[hijo]} curso={null} horarios={[]} error={MSG_HORARIO_ERROR} />)

    await userEvent.click(screen.getByRole('button', { name: /reintentar/i }))

    expect(navigationMock.refresh).toHaveBeenCalledTimes(1)
  })

  it('sin error y sin curso avisa que el estudiante no tiene curso', () => {
    render(<HorariosViewerClient info={info} hijos={[hijo]} curso={null} horarios={[]} />)

    expect(screen.getByText(/no está asignado a un curso/i)).toBeTruthy()
    expect(screen.queryByRole('button', { name: /reintentar/i })).toBeNull()
  })

  it('con bloques muestra la grilla del curso', () => {
    const curso = { idCurso: 5, nombreCurso: 'Sexto A', grado: 'Sexto', jornada: 'mañana' }
    const horarios = [
      { idHorario: 1, dia: 'Lunes', horaInicio: '07:00:00', horaFin: '08:00:00', salon: '101', idMateria: 3, nombreMateria: 'Matemáticas' },
    ]

    render(<HorariosViewerClient info={info} hijos={[hijo]} curso={curso} horarios={horarios} />)

    expect(screen.getByText('Sexto A')).toBeTruthy()
    expect(screen.getAllByText('Matemáticas').length).toBeGreaterThan(0)
    expect(screen.queryByRole('alert')).toBeNull()
  })
})
