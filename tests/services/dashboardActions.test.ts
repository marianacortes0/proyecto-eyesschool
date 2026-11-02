import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { json } from '../helpers'
import { cookieJar } from '../setup/nextMocks'
import * as d from '@/services/dashboard/dashboardActions'

const DATOS: Record<string, unknown[]> = {
  '/estudiantes': [
    { id_estudiante: 1, id_curso_actual: 5 },
    { id_estudiante: 2, id_curso_actual: 5 },
    { id_estudiante: 3, id_curso_actual: 6 },
    { id_estudiante: 4 },
  ],
  '/profesores': [{ id_profesor: 1 }],
  '/cursos': [{ id_curso: 5, nombre_curso: 'Sexto A' }, { id_curso: 6, nombre_curso: 'Sexto B' }],
  '/notas': [
    { nota: '4.0', id_materia: 1 },
    { nota: '2.0', id_materia: 1 },
    { nota: '5.0', id_materia: 2 },
    { nota: 'x', id_materia: 2 },
  ],
  '/asistencia': [{ estado: 'Presente' }, { estado: 'Tarde' }, { estado: 'Ausente' }, { estado: 'Excusa' }],
  '/novedades': [{ estado: 'Pendiente' }, { estado: 'Completado' }, { estado: 'pendiente' }],
  '/usuarios': [{ id_rol: 2 }, { id_rol: 2 }, { id_rol: 1 }, { id_rol: 9 }, {}],
  '/materias': [{ id_materia: 1, nombre_materia: 'Matemáticas' }],
}

function stubApi(sobrescribir: Record<string, Response | Error> = {}) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      const path = new URL(url).pathname.replace('/api/v1', '')
      const especial = sobrescribir[path]
      if (especial instanceof Error) throw especial
      if (especial) return especial.clone()
      return json(200, DATOS[path] ?? [])
    })
  )
}

beforeEach(() => cookieJar.seed({ eys_access: 'tok' }))
afterEach(() => vi.unstubAllGlobals())

describe('Servicios · dashboardActions (KPI del administrador)', () => {
  it('calcula totales, promedio, aprobación, asistencia y novedades activas', async () => {
    stubApi()

    const r = await d.getAdminDashboardAction()

    expect(r).toMatchObject({
      totalEstudiantes: 4,
      totalProfesores: 1,
      totalCursos: 2,
      promedioGeneral: 3.67,
      tasaAprobacion: 66.7,
      porcentajeAsistencia: 50,
      totalNovedadesActivas: 2,
    })
  })

  it('arma las gráficas: estudiantes por curso, usuarios por rol y promedio por materia', async () => {
    stubApi()

    const r = await d.getAdminDashboardAction()

    expect(r?.estudiantesPorCurso).toEqual([{ curso: 'Sexto A', estudiantes: 2 }, { curso: 'Sexto B', estudiantes: 1 }])
    expect(r?.usuariosPorRol).toEqual([{ name: 'Estudiantes', value: 2 }, { name: 'Docentes', value: 1 }, { name: 'Rol 9', value: 1 }])
    expect(r?.promedioPorMateria).toEqual([{ materia: 'Matemáticas', promedio: 3 }, { materia: 'Materia 2', promedio: 5 }])
  })

  it('sin datos devuelve ceros y promedios nulos, no lanza', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => json(200, [])))

    const r = await d.getAdminDashboardAction()

    expect(r).toMatchObject({ totalEstudiantes: 0, promedioGeneral: null, tasaAprobacion: null, porcentajeAsistencia: null })
    expect(r?.estudiantesPorCurso).toEqual([])
  })

  it('si un endpoint falla (500 o sin red) esa lista cuenta como vacía', async () => {
    stubApi({ '/notas': json(500, {}), '/estudiantes': new Error('red caída'), '/profesores': json(200, { no: 'es lista' }) })

    const r = await d.getAdminDashboardAction()

    expect(r).toMatchObject({ totalEstudiantes: 0, totalProfesores: 0, promedioGeneral: null, totalCursos: 2 })
  })

  it('los atajos devuelven el valor del KPI y 0 si no hay dato', async () => {
    stubApi()
    expect(await d.getPromedioGeneralAction()).toBe(3.67)
    expect(await d.getAprobacionAction()).toBe(66.7)
    expect(await d.getEstudiantesActivosAction()).toBe(4)
    expect(await d.getAsistenciaPromedioAction()).toBe(50)

    vi.stubGlobal('fetch', vi.fn(async () => json(200, [])))
    expect(await d.getPromedioGeneralAction()).toBe(0)
    expect(await d.getAsistenciaPromedioAction()).toBe(0)
  })

  it('las series sin endpoint dedicado devuelven []', async () => {
    expect(await d.getNotasPorPeriodoAction()).toEqual([])
    expect(await d.getDistribucionUsuariosAction()).toEqual([])
  })
})
