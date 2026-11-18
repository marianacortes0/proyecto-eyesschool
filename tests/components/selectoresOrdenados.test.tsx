import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import HorariosClient from '@/app/(dashboard)/horarios/HorariosClient'
import NotasClient from '@/app/(dashboard)/notas/NotasClient'
import NovedadesClient from '@/app/(dashboard)/novedades/NovedadesClient'

// SonarCloud S2871 · los desplegables de jornada y grado se ordenaban por código
// de carácter: el grado «10» salía antes que el «6». Ahora usan porTexto. Estas
// pruebas abren las vistas reales (con los datos que entrega el servidor) y
// miran el orden que ve la persona.

const m = vi.hoisted(() => ({ actualizarNovedad: vi.fn() }))
vi.mock('@/lib/toast', () => ({ notifySuccess: vi.fn(), notifyError: vi.fn(), notifyWarning: vi.fn() }))
vi.mock('@/components/ui/ConfirmDialog', () => ({ useConfirm: () => async () => true }))
vi.mock('@/services/novedades/novedadesActions', async (orig) => ({
  ...(await orig<typeof import('@/services/novedades/novedadesActions')>()),
  updateNovedadAction: m.actualizarNovedad,
  getNovedadesBootstrapAction: vi.fn(),
}))

const curso = (idCurso: number, grado: string, jornada: string) => ({
  idCurso, nombreCurso: `${grado} ${jornada}`, grado, jornada, activo: true, idCursoActual: idCurso,
})
// Desordenados a propósito, como pueden llegar de la API.
const CURSOS = [curso(1, '10', 'Tarde'), curso(2, '6', 'Tarde'), curso(3, '7', 'Mañana'), curso(4, '11', 'Tarde')]

/** Valores de un <select>, sin la opción vacía («Todas», «Seleccione…»). */
const valores = (select: HTMLElement) => Array.from((select as HTMLSelectElement).options).map((o) => o.value).filter(Boolean)
const ultimo = (etiqueta: string) => screen.getAllByLabelText(etiqueta).at(-1)!

beforeEach(() => vi.clearAllMocks())

describe('Notas (S2871)', () => {
  const datos = { notas: [], estudiantes: [], materias: [], cursos: CURSOS } as never

  it('el filtro de jornada sale en orden', () => {
    render(<NotasClient role="docente" idUsuarioRegistrador={2} initialData={datos} />)

    expect(valores(screen.getByLabelText('Jornada'))).toEqual(['Mañana', 'Tarde'])
  })

  it('al registrar una nota, los grados de la jornada salen en orden natural', () => {
    render(<NotasClient role="docente" idUsuarioRegistrador={2} initialData={datos} />)
    fireEvent.click(screen.getByRole('button', { name: /Registrar nota/ }))

    expect(valores(ultimo('Jornada'))).toEqual(['mañana', 'tarde'])
    fireEvent.change(ultimo('Jornada'), { target: { value: 'tarde' } })
    expect(valores(ultimo('Grado'))).toEqual(['6', '10', '11'])
  })
})

describe('Novedades (S2871 y S9383)', () => {
  const NOVEDAD = {
    idNovedad: 9, fecha: '2026-11-17', descripcion: 'Llegó tarde', estado: 'Pendiente', accionTomada: null, fechaResolucion: null,
    idEstudiante: 4, idTipoNovedad: 1, registradoPor: 2, nombreEstudiante: 'Ana Ruiz', nombreTipo: 'Retardo',
  }
  const datos = {
    novedades: [NOVEDAD],
    tiposNovedad: [{ idTipoNovedad: 1, nombreTipo: 'Retardo', nivelGravedad: 'Leve' }],
    cursos: CURSOS,
    estudiantes: [],
  } as never

  it('al crear, la jornada y los grados salen en orden', () => {
    render(<NovedadesClient role="docente" registradoPor={2} initialData={datos} />)
    fireEvent.click(screen.getByRole('button', { name: /Nueva novedad/ }))

    expect(valores(ultimo('Jornada'))).toEqual(['Mañana', 'Tarde'])
    fireEvent.change(ultimo('Jornada'), { target: { value: 'Tarde' } })
    expect(valores(ultimo('Grado'))).toEqual(['6', '10', '11'])
  })

  it('al editar, guardar envía los cambios de la novedad', async () => {
    m.actualizarNovedad.mockResolvedValue(undefined)
    render(<NovedadesClient role="docente" registradoPor={2} initialData={datos} />)
    fireEvent.click(screen.getByRole('button', { name: 'Editar' }))
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() => expect(m.actualizarNovedad).toHaveBeenCalledWith(9, expect.objectContaining({ descripcion: 'Llegó tarde', idTipoNovedad: 1, estado: 'Pendiente' })))
  })
})

describe('Horarios (S2871)', () => {
  const datos = {
    horarios: [], cursos: CURSOS, materias: [], allMaterias: [], allCursos: CURSOS,
    profesores: [], especializaciones: [], asignaciones: [],
  } as never

  it('el filtro y el formulario de horario muestran las jornadas en orden', () => {
    render(<HorariosClient role="admin" initialData={datos} />)
    expect(valores(screen.getAllByLabelText('Jornada')[0])).toEqual(['Mañana', 'Tarde'])

    fireEvent.click(screen.getByRole('button', { name: /Nuevo horario/ }))
    expect(valores(ultimo('Jornada'))).toEqual(['Mañana', 'Tarde'])
  })
})
