import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { enUnaHora, json, jwt } from './helpers'
import { cookieJar } from './setup/nextMocks'
import { getHijosAction, getHorarioAsociadoAction, getNotasAsociadoAction } from '@/services/asociado/asociadoActions'
import { MSG_HORARIO_ERROR } from '@/services/asociado/mensajes'

// Respuesta con la forma REAL de GET /padres/me/hijos (BE-07, `HijoOut` del backend):
// el nombre y el documento llegan como nombre_estudiante y documento_estudiante
// (DEF-WEB-03: antes este fixture usaba `nombre`/`documento` y escondía el defecto).
const HIJOS_API = [
  { id_estudiante: 10, nombre_estudiante: 'Ana Pérez', documento_estudiante: '1001', parentesco: 'Madre', id_curso_actual: 5 },
  { id_estudiante: 11, nombre_estudiante: 'Luis Pérez', documento_estudiante: '1002', parentesco: 'Madre', id_curso_actual: 6 },
]

let fetchMock: ReturnType<typeof vi.fn>

beforeEach(() => {
  cookieJar.seed({
    eys_access: jwt({ rol: 'padre', id_rol: 4, exp: enUnaHora() }),
    eys_user: JSON.stringify({ idUsuario: 20, idRol: 4, nombreRol: 'Padre', primerNombre: 'Marta', primerApellido: 'Pérez' }),
  })
  fetchMock = vi.fn(async (url: string) => (String(url).includes('/padres/me/hijos') ? json(200, HIJOS_API) : json(200, [])))
  vi.stubGlobal('fetch', fetchMock)
})
afterEach(() => vi.unstubAllGlobals())

const rutas = () =>
  fetchMock.mock.calls.map(([u]) => {
    const url = new URL(String(u))
    return url.pathname.replace(/^\/api\/v1/, '') + url.search
  })

describe('asociadoActions (WEB-03 · IT-WEB-02)', () => {
  it('si /padres/me/hijos responde 404, usa /padres/me y devuelve un solo hijo', async () => {
    fetchMock.mockImplementation(async (url: string) => {
      const u = String(url)
      if (u.includes('/padres/me/hijos')) return json(404, { detail: 'Not Found' })
      if (u.includes('/padres/me')) return json(200, { id_estudiante: 10, parentesco: 'Madre', nombre_estudiante: 'Ana Pérez', documento_estudiante: '1001' })
      if (u.includes('/estudiantes/10')) return json(200, { id_estudiante: 10, id_curso_actual: 5 })
      return json(200, [])
    })

    const hijos = await getHijosAction()

    expect(rutas()).toContain('/padres/me')
    expect(hijos).toHaveLength(1)
    expect(hijos[0]).toMatchObject({ idEstudiante: 10, nombre: 'Ana Pérez', idCursoActual: 5 })
  })

  it('si /padres/me/hijos responde 500, no usa /padres/me y propaga el error', async () => {
    fetchMock.mockImplementation(async () => json(500, { detail: 'Error interno' }))

    await expect(getHijosAction()).rejects.toMatchObject({ status: 500 })
    expect(rutas()).not.toContain('/padres/me')
  })

  it('con /padres/me/hijos disponible, no llama a /padres/me', async () => {
    await getHijosAction()

    expect(rutas()).toEqual(['/padres/me/hijos'])
  })

  it('getHijosAction llama GET /padres/me/hijos y devuelve los hijos en camelCase', async () => {
    const hijos = await getHijosAction()

    expect(rutas()).toEqual(['/padres/me/hijos'])
    expect(hijos.map((h) => h.idEstudiante)).toEqual([10, 11])
    expect(hijos[1].idCursoActual).toBe(6)
  })

  it('DEF-WEB-03: el nombre y el documento salen de nombre_estudiante y documento_estudiante', async () => {
    const hijos = await getHijosAction()

    expect(hijos.map((h) => h.nombre)).toEqual(['Ana Pérez', 'Luis Pérez'])
    expect(hijos.map((h) => h.documento)).toEqual(['1001', '1002'])
  })

  it('DEF-WEB-03: también acepta nombre y documento sin sufijo, y sin nombre usa el respaldo', async () => {
    fetchMock.mockImplementation(async () =>
      json(200, [
        { id_estudiante: 12, nombre: 'Eva Ruiz', documento: '1003', parentesco: 'Padre', id_curso_actual: 7 },
        { id_estudiante: 13, parentesco: 'Padre', id_curso_actual: 7 },
      ])
    )

    const hijos = await getHijosAction()

    expect(hijos.map((h) => [h.nombre, h.documento])).toEqual([['Eva Ruiz', '1003'], ['Estudiante #13', '']])
  })

  it('con el hijo 11 llama /padres/me/hijos y luego /estudiantes/11/notas', async () => {
    await getNotasAsociadoAction(11)

    const llamadas = rutas()
    expect(llamadas[0]).toBe('/padres/me/hijos')
    expect(llamadas.indexOf('/estudiantes/11/notas')).toBeGreaterThan(0)
  })

  it('sin id pedido usa el primer hijo (10)', async () => {
    const r = await getNotasAsociadoAction()

    expect(r.info?.idEstudiante).toBe(10)
    expect(rutas()).toContain('/estudiantes/10/notas')
  })

  it('un padre sin hijos recibe info null y no pide notas', async () => {
    fetchMock.mockImplementation(async () => json(200, []))

    const r = await getNotasAsociadoAction()

    expect(r.info).toBeNull()
    expect(rutas().some((p) => p.includes('/notas'))).toBe(false)
  })

  it('horario del padre muestra error si /estudiantes/{id} falla', async () => {
    // Sin BE-07 el curso sale de /estudiantes/{id}: si esa consulta falla no se
    // puede decir que el estudiante no tenga curso.
    fetchMock.mockImplementation(async (url: string) => {
      const u = String(url)
      if (u.includes('/padres/me/hijos')) return json(404, { detail: 'Not Found' })
      if (u.includes('/padres/me')) return json(200, { id_estudiante: 10, parentesco: 'Madre', nombre_estudiante: 'Ana Pérez', documento_estudiante: '1001' })
      if (u.includes('/estudiantes/10')) return json(500, { detail: 'Error interno' })
      return json(200, [])
    })

    const r = await getHorarioAsociadoAction()

    expect(r.error).toBe(MSG_HORARIO_ERROR)
    expect(r.info?.idEstudiante).toBe(10)
    expect(r.horarios).toEqual([])
    // No se pide el horario de un curso que no se conoce.
    expect(rutas().some((p) => p.startsWith('/horarios'))).toBe(false)
  })

  it('horario del padre muestra error si /horarios falla', async () => {
    fetchMock.mockImplementation(async (url: string) => {
      const u = String(url)
      if (u.includes('/padres/me/hijos')) return json(200, [HIJOS_API[0]])
      if (u.includes('/horarios')) return json(500, { detail: 'Error interno' })
      return json(200, [])
    })

    const r = await getHorarioAsociadoAction()

    expect(r.error).toBe(MSG_HORARIO_ERROR)
    expect(r.horarios).toEqual([])
  })

  it('horario del padre sin curso asignado no es un error', async () => {
    fetchMock.mockImplementation(async (url: string) =>
      String(url).includes('/padres/me/hijos')
        ? json(200, [{ ...HIJOS_API[0], id_curso_actual: null }])
        : json(200, [])
    )

    const r = await getHorarioAsociadoAction()

    expect(r.error).toBeUndefined()
    expect(r.curso).toBeNull()
  })

  it('si la API falla, el error llega con el detail para mostrarlo', async () => {
    fetchMock.mockImplementation(async () => json(500, { detail: 'Error interno' }))

    await expect(getHijosAction()).rejects.toThrow('Error interno')
  })
})
