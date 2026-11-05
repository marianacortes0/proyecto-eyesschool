import { afterEach, describe, expect, it, vi } from 'vitest'

import { json } from '../helpers'
import * as s from '@/services/horarios/horariosService'

function stub(respuesta: Response | (() => Response)) {
  const fetchMock = vi.fn(async () => (typeof respuesta === 'function' ? respuesta() : respuesta.clone()))
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}
const llamada = (m: ReturnType<typeof stub>, i = 0) => {
  const [url, init] = m.mock.calls[i] as unknown as [string, RequestInit]
  return { path: new URL(url).pathname.replace('/api/v1', '') + new URL(url).search, method: init?.method ?? 'GET', body: init?.body ? JSON.parse(String(init.body)) : undefined }
}

afterEach(() => vi.unstubAllGlobals())

describe('Servicios · horariosService', () => {
  it('getHorarios mapea a camelCase y ordena por día y hora', async () => {
    const m = stub(
      json(200, [
        { id_horario: 2, dia: 'Martes', hora_inicio: '07:00', hora_fin: '08:00', salon: 'A1', activo: true, id_curso: 1, id_materia: 1 },
        { id_horario: 3, dia: 'Lunes', hora_inicio: '09:00', hora_fin: '10:00', salon: 'A1', activo: true, id_curso: 1, id_materia: 2 },
        { id_horario: 1, dia: 'Lunes', hora_inicio: '07:00', hora_fin: '08:00', salon: 'A2', activo: true, id_curso: 1, id_materia: 3 },
      ])
    )

    const r = await s.getHorarios()

    expect(llamada(m).path).toBe('/horarios?limit=500')
    expect(r.map((h) => h.idHorario)).toEqual([1, 3, 2])
  })

  it('con lista vacía devuelve []', async () => {
    stub(json(200, []))

    expect(await s.getHorarios()).toEqual([])
    expect(await s.getCursos()).toEqual([])
    expect(await s.getMaterias()).toEqual([])
    expect(await s.getEspecializaciones()).toEqual([])
    expect(await s.getAsignaciones()).toEqual([])
  })

  it('cursos y materias activos/todos usan su consulta y mapean los campos', async () => {
    const m = stub(json(200, [{ id_curso: 1, nombre_curso: 'Sexto A', grado: '6', jornada: 'Mañana', ano: 2026, activo: true }]))
    const cursos = await s.getCursos()
    await s.getAllCursos()
    expect(llamada(m, 0).path).toBe('/cursos?activo=true&limit=200')
    expect(llamada(m, 1).path).toBe('/cursos?limit=200')
    expect(cursos[0]).toEqual({ idCurso: 1, nombreCurso: 'Sexto A', grado: '6', jornada: 'Mañana', ano: 2026, activo: true })

    const mm = stub(json(200, [{ id_materia: 4, nombre_materia: 'Mate', codigo_materia: 'MAT', activa: true }]))
    const materias = await s.getMaterias()
    await s.getAllMaterias()
    expect(llamada(mm, 0).path).toBe('/materias?activa=true&limit=200')
    expect(llamada(mm, 1).path).toBe('/materias?limit=200')
    expect(materias[0].codigoMateria).toBe('MAT')
  })

  it('crear curso, materia y especialización manda el cuerpo en snake_case', async () => {
    const m = stub(json(201, {}))

    await s.createCurso({ nombreCurso: 'Sexto A', grado: '6', jornada: 'Mañana', ano: 2026, activo: true })
    await s.createMateria({ nombreMateria: 'Mate', codigoMateria: 'MAT', activa: true })
    await s.createEspecializacion({ nombreEspecializacion: 'Álgebra', activo: true })

    expect(llamada(m, 0)).toMatchObject({ path: '/cursos', method: 'POST', body: { nombre_curso: 'Sexto A', jornada: 'Mañana' } })
    expect(llamada(m, 1)).toMatchObject({ path: '/materias', method: 'POST', body: { nombre_materia: 'Mate', codigo_materia: 'MAT' } })
    expect(llamada(m, 2)).toMatchObject({ path: '/especializaciones', method: 'POST', body: { nombre_especializacion: 'Álgebra' } })
  })

  it('actualizar manda solo los campos informados', async () => {
    const m = stub(json(200, {}))

    await s.updateCurso(1, { grado: '7' })
    await s.updateMateria(2, { activa: false })
    await s.updateEspecializacion(3, { nombreEspecializacion: 'Geometría' })
    await s.updateHorario(4, { salon: 'B2', horaInicio: '08:00' })
    await s.updateAsignacion(5, { activo: false })

    expect(llamada(m, 0).body).toEqual({ grado: '7' })
    expect(llamada(m, 1).body).toEqual({ activa: false })
    expect(llamada(m, 2).body).toEqual({ nombre_especializacion: 'Geometría' })
    expect(llamada(m, 3)).toMatchObject({ path: '/horarios/4', method: 'PUT', body: { salon: 'B2', hora_inicio: '08:00' } })
    expect(llamada(m, 4)).toMatchObject({ path: '/asignaciones/5', body: { activo: false } })
  })

  it('eliminar es una baja lógica (PUT activo=false)', async () => {
    const m = stub(json(200, {}))

    await s.deleteCurso(1)
    await s.deleteMateria(2)
    await s.deleteEspecializacion(3)
    await s.deleteHorario(4)
    await s.deleteAsignacion(5)

    for (let i = 0; i < 5; i++) expect(llamada(m, i).method).toBe('PUT')
    expect(llamada(m, 1).body).toEqual({ activa: false })
    expect(llamada(m, 3).body).toEqual({ activo: false })
  })

  it('crear horario devuelve el id y asignar profesor lo vincula', async () => {
    const m = stub(json(201, { id_horario: 77 }))

    const r = await s.createHorario({ dia: 'Lunes', horaInicio: '07:00', horaFin: '08:00', salon: 'A1', activo: true, idCurso: 1, idMateria: 2 })
    await s.asignarProfesorHorario(9, 77)

    expect(r).toEqual({ idHorario: 77 })
    expect(llamada(m, 0).body).toMatchObject({ hora_inicio: '07:00', id_curso: 1, id_materia: 2 })
    expect(llamada(m, 1)).toMatchObject({ path: '/horarios/77/profesores', body: { id_profesor: 9 } })
  })

  it('getProfesores arma el nombre y ordena alfabéticamente', async () => {
    stub(
      json(200, [
        { id_profesor: 2, usuario: { primer_nombre: 'Carlos', primer_apellido: 'Jiménez' } },
        { id_profesor: 3 },
        { id_profesor: 1, usuario: { primer_nombre: 'Ana', primer_apellido: 'Gómez' } },
      ])
    )

    const r = await s.getProfesores()

    expect(r.map((p) => p.nombre)).toEqual(['Ana Gómez', 'Carlos Jiménez', 'Profesor #3'])
  })

  it('asignaciones: lista, crea con fecha_finalizacion nula y getAsignacionesProfesores es vacío', async () => {
    const m = stub(json(200, [{ id_asignacion: 1, id_profesor: 2, id_curso: 3, id_materia: 4, fecha_asignacion: '2026-01-01', fecha_finalizacion: null, activo: true }]))

    const lista = await s.getAsignaciones()
    await s.createAsignacion({ idProfesor: 2, idCurso: 3, idMateria: 4, fechaAsignacion: '2026-01-01', fechaFinalizacion: null, activo: true })

    expect(lista[0]).toMatchObject({ idAsignacion: 1, idProfesor: 2 })
    expect(llamada(m, 1).body).toMatchObject({ id_profesor: 2, fecha_finalizacion: null })
    expect(await s.getAsignacionesProfesores()).toEqual([])
  })

  it('un 422 lanza con el detail de la API', async () => {
    stub(json(422, { detail: [{ msg: 'Campo requerido' }] }))

    await expect(s.createCurso({ nombreCurso: '', grado: '', jornada: '', ano: 2026, activo: true })).rejects.toThrow('Campo requerido')
  })

  it('un 500 lanza HTTP 500', async () => {
    stub(json(500, {}))

    await expect(s.getHorarios()).rejects.toThrow('HTTP 500')
  })
})
