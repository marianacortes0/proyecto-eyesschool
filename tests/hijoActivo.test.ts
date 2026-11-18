import { describe, expect, it } from 'vitest'

import { elegirHijoActivo, MSG_SIN_HIJOS, type Hijo } from '@/lib/utils/hijoActivo'

const hijo = (idEstudiante: number): Hijo => ({
  idEstudiante,
  nombre: `Hijo ${idEstudiante}`,
  documento: `100${idEstudiante}`,
  parentesco: 'Madre',
  idCursoActual: 5,
})

describe('elegirHijoActivo (WEB-03)', () => {
  const hijos = [hijo(10), hijo(11)]

  it('con hijos [10, 11] y el id 11 devuelve el 11', () => {
    expect(elegirHijoActivo(hijos, 11)?.idEstudiante).toBe(11)
  })

  it('con un id ajeno devuelve el primero (10)', () => {
    expect(elegirHijoActivo(hijos, 999)?.idEstudiante).toBe(10)
  })

  it('sin id devuelve el primero (10)', () => {
    expect(elegirHijoActivo(hijos)?.idEstudiante).toBe(10)
  })

  it('con el id como texto de la URL (?hijo=11) también lo encuentra', () => {
    expect(elegirHijoActivo(hijos, '11')?.idEstudiante).toBe(11)
  })

  it('sin hijos devuelve null', () => {
    expect(elegirHijoActivo([], 10)).toBeNull()
  })

  it("el mensaje para un padre sin vínculos es 'No hay estudiantes vinculados'", () => {
    expect(MSG_SIN_HIJOS).toBe('No hay estudiantes vinculados')
  })
})
