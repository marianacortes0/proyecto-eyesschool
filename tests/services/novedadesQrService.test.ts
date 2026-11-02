import { afterEach, describe, expect, it, vi } from 'vitest'

import { json } from '../helpers'
import * as n from '@/services/novedades/novedadesService'
import * as q from '@/services/qr/qrService'

function stub(respuesta: () => Response) {
  const m = vi.fn(async (_url: string, _init?: RequestInit) => respuesta())
  vi.stubGlobal('fetch', m)
  return m
}
const ruta = (m: ReturnType<typeof stub>, i = 0) => {
  const u = new URL(m.mock.calls[i][0])
  return u.pathname.replace('/api/v1', '') + u.search
}
const init = (m: ReturnType<typeof stub>, i = 0) => (m.mock.calls[i][1] ?? {}) as RequestInit

afterEach(() => vi.unstubAllGlobals())

describe('Servicios · novedadesService', () => {
  it('getNovedades mapea y arma código y nombre provisionales del estudiante', async () => {
    const m = stub(() =>
      json(200, [{ id_novedad: 1, fecha: '2026-03-01', descripcion: 'Llegó tarde', estado: 'Pendiente', accion_tomada: null, fecha_resolucion: null, id_estudiante: 7, id_tipo_novedad: 2, registrado_por: 3 }])
    )

    const r = await n.getNovedades()

    expect(ruta(m)).toBe('/novedades?limit=500')
    expect(r[0]).toMatchObject({ idNovedad: 1, codigoEstudiante: 'EST007', nombreEstudiante: 'Estudiante #7', registradoPor: 3 })
  })

  it('con lista vacía devuelve [] en novedades, tipos, cursos y estudiantes', async () => {
    stub(() => json(200, []))

    expect(await n.getNovedades()).toEqual([])
    expect(await n.getTiposNovedad()).toEqual([])
    expect(await n.getCursosParaNovedades()).toEqual([])
    expect(await n.getEstudiantesParaNovedades()).toEqual([])
  })

  it('tipos, cursos y estudiantes se mapean a camelCase', async () => {
    stub(() => json(200, [{ id_tipo_novedad: 1, nombre_tipo: 'Disciplinaria', nivel_gravedad: 'Alta', requiere_accion: true, activo: true, id_curso: 5, nombre_curso: 'Sexto A', grado: '6', jornada: 'Mañana', id_estudiante: 9, codigo_estudiante: 'EST009', id_curso_actual: null }]))

    expect((await n.getTiposNovedad())[0]).toEqual({ idTipoNovedad: 1, nombreTipo: 'Disciplinaria', nivelGravedad: 'Alta', requiereAccion: true, activo: true })
    expect((await n.getCursosParaNovedades())[0]).toMatchObject({ idCurso: 5, jornada: 'Mañana' })
    expect((await n.getEstudiantesParaNovedades())[0]).toEqual({ idEstudiante: 9, nombre: 'Estudiante #9', codigo: 'EST009', idCursoActual: null })
  })

  it('crear, actualizar y borrar una novedad', async () => {
    const m = stub(() => json(200, {}))

    await n.createNovedad({ descripcion: 'x', idEstudiante: 1, idTipoNovedad: 2, registradoPor: 3 })
    await n.updateNovedad(10, { estado: 'Completado', accionTomada: 'Citación' })
    await n.deleteNovedad(10)

    expect(JSON.parse(String(init(m, 0).body))).toEqual({ descripcion: 'x', id_estudiante: 1, id_tipo_novedad: 2, registrado_por: 3 })
    expect(JSON.parse(String(init(m, 1).body))).toEqual({ estado: 'Completado', accion_tomada: 'Citación' })
    expect([init(m, 0).method, init(m, 1).method, init(m, 2).method]).toEqual(['POST', 'PUT', 'DELETE'])
    expect(ruta(m, 2)).toBe('/novedades/10')
  })

  it('un 403 lanza con el detail', async () => {
    stub(() => json(403, { detail: 'No autorizado' }))

    await expect(n.getNovedades()).rejects.toMatchObject({ status: 403, message: 'No autorizado' })
  })
})

describe('Servicios · qrService', () => {
  it('getQRImageUrl codifica el código y fija el tamaño', () => {
    expect(q.getQRImageUrl('EST 001', 150)).toBe('https://api.qrserver.com/v1/create-qr-code/?data=EST%20001&size=150x150&ecc=M&margin=2')
    expect(q.getQRImageUrl('A')).toContain('size=200x200')
  })

  it('readQRFromImage devuelve el contenido leído', async () => {
    stub(() => json(200, [{ symbol: [{ data: 'EST001', error: null }] }]))

    expect(await q.readQRFromImage(new Blob(['x']))).toBe('EST001')
  })

  it('readQRFromImage devuelve null si no hay símbolo o trae error', async () => {
    stub(() => json(200, [{ symbol: [{ data: null, error: 'could not find QR code' }] }]))
    expect(await q.readQRFromImage(new Blob(['x']))).toBeNull()

    stub(() => json(200, []))
    expect(await q.readQRFromImage(new Blob(['x']))).toBeNull()
  })

  it('readQRFromImage lanza si el servicio externo falla', async () => {
    stub(() => json(500, {}))

    await expect(q.readQRFromImage(new Blob(['x']))).rejects.toThrow('Error al contactar la API de lectura QR')
  })
})
