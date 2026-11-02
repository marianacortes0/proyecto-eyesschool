import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { enUnaHora, json, jwt } from './helpers'
import { cookieJar } from './setup/nextMocks'
import { getHijosAction, getNotasAsociadoAction } from '@/services/asociado/asociadoActions'

// Respuesta con la forma de GET /padres/me/hijos (BE-07).
const HIJOS_API = [
  { id_estudiante: 10, nombre: 'Ana Pérez', documento: '1001', parentesco: 'Madre', id_curso_actual: 5 },
  { id_estudiante: 11, nombre: 'Luis Pérez', documento: '1002', parentesco: 'Madre', id_curso_actual: 6 },
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

  it('si la API falla, el error llega con el detail para mostrarlo', async () => {
    fetchMock.mockImplementation(async () => json(500, { detail: 'Error interno' }))

    await expect(getHijosAction()).rejects.toThrow('Error interno')
  })
})
