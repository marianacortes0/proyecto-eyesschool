import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { json } from '../helpers'
import { cookieJar } from '../setup/nextMocks'
import * as notas from '@/services/notas/notasActions'
import * as novedades from '@/services/novedades/novedadesActions'
import * as reportes from '@/services/reportes/reportesActions'

type Ruta = (path: string, init: RequestInit) => Response
let fetchMock: ReturnType<typeof vi.fn>

function stub(ruta: Ruta) {
  fetchMock = vi.fn(async (url: string, init: RequestInit) => {
    const u = new URL(url)
    return ruta(u.pathname.replace('/api/v1', '') + u.search, init ?? {})
  })
  vi.stubGlobal('fetch', fetchMock)
}
const llamadas = () => fetchMock.mock.calls.map(([u, i]) => ({ path: new URL(u).pathname.replace('/api/v1', '') + new URL(u).search, init: (i ?? {}) as RequestInit }))
const cuerpo = (i = 0) => JSON.parse(String(llamadas()[i].init.body))

beforeEach(() => cookieJar.seed({ eys_access: 'tok' }))
afterEach(() => vi.unstubAllGlobals())

describe('Servicios · notasActions', () => {
  it('getNotasAction manda el Bearer del servidor y mapea la nota a número', async () => {
    stub(() => json(200, [{ id_nota: 1, nota: '4.5', observacion: null, fecha_registro: '2026-03-01', id_estudiante: 7, id_materia: 2, id_periodo: 1, registrado_por: 3 }]))

    const r = await notas.getNotasAction()

    expect((llamadas()[0].init.headers as Record<string, string>).Authorization).toBe('Bearer tok')
    expect(r[0]).toMatchObject({ idNota: 1, nota: 4.5, codigoEstudiante: 'EST007' })
  })

  it('con lista vacía devuelve []', async () => {
    stub(() => json(200, []))

    expect(await notas.getNotasAction()).toEqual([])
    expect(await notas.getEstudiantesAction()).toEqual([])
    expect(await notas.getMateriasAction()).toEqual([])
    expect(await notas.getCursosAction()).toEqual([])
  })

  it('getEstudiantesAction arma el nombre completo o uno provisional', async () => {
    stub(() => json(200, [
      { id_estudiante: 1, codigo_estudiante: 'EST001', primer_nombre: 'Ana', segundo_nombre: 'Luz', primer_apellido: 'Gómez', segundo_apellido: 'Paz', id_curso_actual: 5 },
      { id_estudiante: 2, codigo_estudiante: 'EST002' },
    ]))

    const r = await notas.getEstudiantesAction()

    expect(r.map((e) => e.nombre)).toEqual(['Ana Luz Gómez Paz', 'Estudiante #2'])
    expect(r[1].idCursoActual).toBeNull()
  })

  it('createNotaAction manda el cuerpo en snake_case', async () => {
    stub(() => json(201, {}))

    await notas.createNotaAction({ idEstudiante: 1, idMateria: 2, idPeriodo: 3, nota: 4, observacion: undefined as never, registradoPor: 9 })

    expect(cuerpo()).toEqual({ id_estudiante: 1, id_materia: 2, id_periodo: 3, nota: 4, observacion: null, registrado_por: 9 })
  })

  it('getNotasBootstrapAction junta las cuatro consultas', async () => {
    stub(() => json(200, []))

    const r = await notas.getNotasBootstrapAction()

    expect(Object.keys(r)).toEqual(['notas', 'estudiantes', 'materias', 'cursos'])
    expect(llamadas()).toHaveLength(4)
  })

  it('un error de la API lanza con su detail', async () => {
    stub(() => json(422, { detail: 'Nota fuera de rango' }))

    await expect(notas.createNotaAction({ idEstudiante: 1, idMateria: 2, idPeriodo: 3, nota: 9, observacion: null, registradoPor: 9 })).rejects.toThrow('Nota fuera de rango')
  })

  it('un 500 sin cuerpo lanza HTTP 500', async () => {
    stub(() => new Response('', { status: 500 }))

    await expect(notas.getMateriasAction()).rejects.toThrow('HTTP 500')
  })
})

describe('Servicios · novedadesActions', () => {
  it('getNovedadesAction cruza el estudiante por id y usa uno provisional si falta', async () => {
    stub((path) =>
      path.startsWith('/novedades')
        ? json(200, [
            { id_novedad: 1, fecha: '2026-03-01', descripcion: 'a', estado: 'Pendiente', id_estudiante: 1, id_tipo_novedad: 2, registrado_por: 3 },
            { id_novedad: 2, fecha: '2026-03-02', descripcion: 'b', estado: 'Pendiente', id_estudiante: 99, id_tipo_novedad: 2, registrado_por: 3 },
          ])
        : json(200, [{ id_estudiante: 1, codigo_estudiante: 'EST001', primer_nombre: 'Ana', primer_apellido: 'Gómez' }])
    )

    const r = await novedades.getNovedadesAction()

    expect(r[0]).toMatchObject({ nombreEstudiante: 'Ana Gómez', codigoEstudiante: 'EST001' })
    expect(r[1]).toMatchObject({ nombreEstudiante: 'Estudiante #99', codigoEstudiante: 'EST099' })
  })

  it('getNovedadesBootstrapAction resuelve nombre y gravedad del tipo', async () => {
    stub((path) => {
      if (path.startsWith('/novedades')) return json(200, [{ id_novedad: 1, fecha: 'f', descripcion: 'a', estado: 'Pendiente', id_estudiante: 1, id_tipo_novedad: 2, registrado_por: 3 }])
      if (path.startsWith('/tipos-novedad')) return json(200, [{ id_tipo_novedad: 2, nombre_tipo: 'Disciplinaria', nivel_gravedad: 'Alta', requiere_accion: true, activo: true }])
      return json(200, [])
    })

    const r = await novedades.getNovedadesBootstrapAction()

    expect(r.novedades[0]).toMatchObject({ nombreTipo: 'Disciplinaria', nivelGravedad: 'Alta' })
    expect(r.tiposNovedad).toHaveLength(1)
  })

  it('cursos y estudiantes con lista vacía devuelven []', async () => {
    stub(() => json(200, []))

    expect(await novedades.getCursosParaNovedadesAction()).toEqual([])
    expect(await novedades.getEstudiantesParaNovedadesAction()).toEqual([])
    expect(await novedades.getTiposNovedadAction()).toEqual([])
  })

  it('crear manda la fecha de hoy; actualizar solo lo informado; borrar hace DELETE', async () => {
    stub(() => json(200, {}))

    await novedades.createNovedadAction({ descripcion: 'x', idEstudiante: 1, idTipoNovedad: 2, registradoPor: 3 })
    await novedades.updateNovedadAction(10, { estado: 'Completado', fechaResolucion: '2026-03-05' })
    await novedades.deleteNovedadAction(10)

    expect(cuerpo(0).fecha).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(cuerpo(1)).toEqual({ estado: 'Completado', fecha_resolucion: '2026-03-05' })
    expect(llamadas()[2]).toMatchObject({ path: '/novedades/10', init: { method: 'DELETE' } })
  })

  it('un 403 lanza con su detail', async () => {
    stub(() => json(403, { detail: 'No autorizado' }))

    await expect(novedades.getTiposNovedadAction()).rejects.toThrow('No autorizado')
  })
})

describe('Servicios · reportesActions', () => {
  it('getReportesAction mapea y completa parametros vacío', async () => {
    stub(() => json(200, [{ id_reporte: 1, nombre_reporte: 'R', tipo_reporte: 'Academico', estado: 'Completado', fecha_inicio: 'a', fecha_fin: 'b', fecha_generacion: 'c', archivo_generado: null, id_administrador: 3 }]))

    const r = await reportes.getReportesAction()

    expect(r[0]).toMatchObject({ idReporte: 1, parametros: '', idAdministrador: 3 })
  })

  it('con lista vacía devuelve []', async () => {
    stub(() => json(200, []))

    expect(await reportes.getReportesAction()).toEqual([])
  })

  it('crear, actualizar estado y borrar', async () => {
    stub(() => json(200, {}))

    await reportes.createReporteAction({ nombreReporte: 'R', tipoReporte: 'Academico', fechaInicio: 'a', fechaFin: 'b', parametros: '{}', idAdministrador: 3, archivoGenerado: '/static/reportes/r.pdf' })
    await reportes.updateReporteAction(5, {})
    await reportes.deleteReporteAction(5)

    expect(cuerpo(0)).toMatchObject({ nombre_reporte: 'R', archivo_generado: '/static/reportes/r.pdf' })
    expect(llamadas()[1]).toMatchObject({ path: '/reportes/5/estado', init: { method: 'PATCH' } })
    expect(cuerpo(1)).toEqual({ estado: 'Pendiente', archivo_generado: null })
    expect(llamadas()[2].init.method).toBe('DELETE')
  })

  it('un 404 lanza con su detail', async () => {
    stub(() => json(404, { detail: 'Reporte no encontrado' }))

    await expect(reportes.deleteReporteAction(1)).rejects.toThrow('Reporte no encontrado')
  })
})
