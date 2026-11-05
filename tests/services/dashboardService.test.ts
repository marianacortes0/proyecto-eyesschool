import { afterEach, describe, expect, it, vi } from 'vitest'

import { json } from '../helpers'
import * as s from '@/services/dashboard/dashboardService'

afterEach(() => vi.unstubAllGlobals())

const stub = (respuesta: Response | Error) => {
  const m = vi.fn(async () => {
    if (respuesta instanceof Error) throw respuesta
    return respuesta.clone()
  })
  vi.stubGlobal('fetch', m)
  return m
}

describe('Servicios · dashboardService', () => {
  it('rutaPadre agrega id_estudiante solo cuando hay un hijo activo', () => {
    expect(s.rutaPadre()).toBe('/dashboard/padre')
    expect(s.rutaPadre(11)).toBe('/dashboard/padre?id_estudiante=11')
  })

  it('docente: mapea los contadores (cliente y servidor)', async () => {
    const m = stub(json(200, { total_cursos_asignados: 3, total_estudiantes: 90, notas_registradas_hoy: 4, asistencias_registradas_hoy: 12 }))

    const cliente = await s.getDashboardDocente()
    const servidor = await s.getDashboardDocenteServer('tok')

    expect(cliente).toMatchObject({ cursosAsignados: 3, estudiantesCount: 90, notasHoy: 4, asistenciasHoy: 12 })
    expect(servidor).toEqual(cliente)
    expect((m.mock.calls[1] as unknown as [string, RequestInit])[1].headers).toMatchObject({ Authorization: 'Bearer tok' })
  })

  it('estudiante: promedios nulos pasan a 0', async () => {
    stub(json(200, { promedio_general: null, porcentaje_asistencia: null, novedades_pendientes: 2, periodo_actual: 3 }))

    const r = await s.getDashboardEstudiante()

    expect(r).toMatchObject({ promedioGeneral: 0, porcentajeAsistencia: 0, novedadesActivas: 2, periodoActual: 3 })
    expect(await s.getDashboardEstudianteServer('t')).toEqual(r)
  })

  it('padre: arma un hijo con el id pedido', async () => {
    const m = stub(json(200, { id_estudiante: 11, nombre_estudiante: 'Luis', promedio_general: 4.2, porcentaje_asistencia: 90, novedades_pendientes: 0 }))

    const r = await s.getDashboardPadre(11)
    const srv = await s.getDashboardPadreServer('t', 11)

    expect(String((m.mock.calls[0] as unknown as [string])[0])).toContain('/api/proxy/dashboard/padre?id_estudiante=11')
    expect(r.hijos[0]).toMatchObject({ idEstudiante: 11, nombreCompleto: 'Luis', promedioGeneral: 4.2 })
    expect(srv).toEqual(r)
  })

  it('con error de la API o sin red devuelve el estado vacío, no lanza', async () => {
    stub(json(500, {}))
    expect((await s.getDashboardDocente()).cursosAsignados).toBe(0)
    expect((await s.getDashboardEstudianteServer('t')).promedioGeneral).toBe(0)
    expect(await s.getDashboardPadre()).toEqual({ hijos: [] })

    stub(new Error('red caída'))
    expect((await s.getDashboardDocenteServer('t')).estudiantesCount).toBe(0)
    expect((await s.getDashboardEstudiante()).porcentajeAsistencia).toBe(0)
    expect(await s.getDashboardPadreServer('t')).toEqual({ hijos: [] })
  })

  it('los helpers heredados devuelven valores neutros', async () => {
    expect(await s.getPromedioGeneral()).toBe(0)
    expect(await s.getNotasPorPeriodo()).toEqual([])
  })
})
