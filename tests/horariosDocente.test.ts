import { describe, expect, it } from 'vitest'

import { horariosDelDocente } from '@/services/horarios/horariosService'
import type { Asignacion, Horario } from '@/services/horarios/horariosService'

// DEF-WEB-14 · CP-SIS-059: el docente ve solo sus clases. Antes /horarios le
// mostraba los bloques de todos los profesores (la vista de gestión del admin).
// Sus clases son los bloques cuyo curso y materia están entre sus asignaciones
// activas.

const bloque = (idHorario: number, idCurso: number, idMateria: number): Horario => ({
  idHorario, idCurso, idMateria, dia: 'Lunes', horaInicio: '07:00', horaFin: '08:00', salon: 'A', activo: true,
})
const asig = (idProfesor: number, idCurso: number, idMateria: number, activo = true): Asignacion => ({
  idAsignacion: idProfesor * 100 + idCurso * 10 + idMateria, idProfesor, idCurso, idMateria,
  fechaAsignacion: '2026-01-01', fechaFinalizacion: null, activo,
})

const HORARIOS = [bloque(1, 3, 10), bloque(2, 3, 11), bloque(3, 4, 10), bloque(4, 5, 12)]
const ASIGNACIONES = [asig(1, 3, 10), asig(1, 4, 10), asig(2, 3, 11), asig(1, 5, 12, false)]

describe('horariosDelDocente (DEF-WEB-14)', () => {
  it('deja solo los bloques de las asignaciones activas del docente', () => {
    const r = horariosDelDocente({ horarios: HORARIOS, asignaciones: ASIGNACIONES }, 1)

    expect(r.horarios.map((h) => h.idHorario)).toEqual([1, 3])
    expect(r.asignaciones.every((a) => a.idProfesor === 1 && a.activo)).toBe(true)
  })

  it('una asignación inactiva no cuenta', () => {
    expect(horariosDelDocente({ horarios: HORARIOS, asignaciones: ASIGNACIONES }, 1).horarios.map((h) => h.idHorario)).not.toContain(4)
  })

  it('un docente sin asignaciones (o sin registro de profesor) no ve ningún bloque', () => {
    expect(horariosDelDocente({ horarios: HORARIOS, asignaciones: ASIGNACIONES }, 9).horarios).toEqual([])
    expect(horariosDelDocente({ horarios: HORARIOS, asignaciones: ASIGNACIONES }, null).horarios).toEqual([])
  })
})
