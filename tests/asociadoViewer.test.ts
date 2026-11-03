import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { enUnaHora, json, jwt } from './helpers'
import { cookieJar } from './setup/nextMocks'
import {
  getAsociadoAction,
  getHorarioAsociadoAction,
  getNotasAsociadoAction,
  getNovedadesAsociadoAction,
} from '@/services/asociado/asociadoActions'

/**
 * WEB-03 · lo que ve en solo lectura el estudiante asociado: el padre sobre su
 * hijo activo y el estudiante sobre sí mismo. Completa a `asociadoActions.test.ts`
 * (que cubre el respaldo de `/padres/me`) con el mapeo de notas, novedades y
 * horario, y con el camino del rol estudiante.
 */

const HIJO = {
  id_estudiante: 10,
  nombre: 'Ana Pérez',
  documento: '1001',
  parentesco: 'Madre',
  id_curso_actual: 5,
  codigo_estudiante: 'EST010',
}

const MATERIAS = [
  { id_materia: 3, nombre_materia: 'Matemáticas' },
  { id_materia: 4, nombre_materia: 'Lenguaje' },
]

const sesion = (rol: 'padre' | 'estudiante', idRol: number) =>
  cookieJar.seed({
    eys_access: jwt({ rol, id_rol: idRol, exp: enUnaHora() }),
    eys_user: JSON.stringify({ idUsuario: 20, idRol, nombreRol: rol, primerNombre: 'Marta', primerApellido: 'Pérez' }),
  })

let fetchMock: ReturnType<typeof vi.fn>

/** Responde por ruta; lo que no esté en el mapa devuelve una lista vacía. */
function responder(mapa: Record<string, [number, unknown]>) {
  fetchMock.mockImplementation(async (url: string) => {
    const ruta = new URL(String(url)).pathname.replace(/^\/api\/v1/, '')
    const entrada = Object.entries(mapa).find(([k]) => ruta === k)
    return entrada ? json(entrada[1][0], entrada[1][1]) : json(200, [])
  })
}

const rutas = () =>
  fetchMock.mock.calls.map(([u]) => {
    const url = new URL(String(u))
    return url.pathname.replace(/^\/api\/v1/, '') + url.search
  })

beforeEach(() => {
  fetchMock = vi.fn(async () => json(200, []))
  vi.stubGlobal('fetch', fetchMock)
  sesion('padre', 4)
})
afterEach(() => vi.unstubAllGlobals())

describe('notas del estudiante asociado (WEB-03)', () => {
  it('resuelve el nombre de la materia y la etiqueta del periodo', async () => {
    responder({
      '/padres/me/hijos': [200, [HIJO]],
      '/estudiantes/10/notas': [200, [
        { id_nota: 1, nota: '4.5', observacion: null, fecha_registro: '2026-10-01', id_materia: 3, id_periodo: 1 },
        { id_nota: 2, nota: '3.0', observacion: 'Mejorar', fecha_registro: '2026-10-02', id_materia: 99, id_periodo: 9 },
      ]],
      '/materias': [200, MATERIAS],
    })

    const r = await getNotasAsociadoAction()

    expect(r.info).toMatchObject({ idEstudiante: 10, nombre: 'Ana Pérez', codigo: 'EST010' })
    expect(r.notas[0]).toMatchObject({ nota: 4.5, nombreMateria: 'Matemáticas' })
    expect(r.notas[0].periodoLabel).toBeTruthy()
    // Una materia o un periodo que la API no entrega no deja la pantalla en blanco.
    expect(r.notas[1].nombreMateria).toBe('Materia #99')
    expect(r.notas[1].periodoLabel).toBe('Periodo 9')
    expect(r.materias).toHaveLength(2)
  })
})

describe('novedades del estudiante asociado (WEB-03)', () => {
  it('resuelve el tipo y la gravedad desde /tipos-novedad', async () => {
    responder({
      '/padres/me/hijos': [200, [HIJO]],
      '/estudiantes/10/novedades': [200, [
        { id_novedad: 7, fecha: '2026-10-05', descripcion: 'Llegó tarde', estado: 'abierta', accion_tomada: null, fecha_resolucion: null, id_tipo_novedad: 2 },
        { id_novedad: 8, fecha: '2026-10-06', descripcion: 'Otra', estado: 'cerrada', accion_tomada: 'Citación', fecha_resolucion: '2026-10-07', id_tipo_novedad: 77 },
      ]],
      '/tipos-novedad': [200, [{ id_tipo_novedad: 2, nombre_tipo: 'Retardo', nivel_gravedad: 'leve' }]],
    })

    const r = await getNovedadesAsociadoAction()

    expect(r.novedades[0]).toMatchObject({ idNovedad: 7, nombreTipo: 'Retardo', nivelGravedad: 'leve' })
    expect(r.novedades[1]).toMatchObject({ nombreTipo: 'Tipo #77', nivelGravedad: '', accionTomada: 'Citación' })
  })

  it('un padre sin hijos no pide novedades', async () => {
    responder({ '/padres/me/hijos': [200, []] })

    const r = await getNovedadesAsociadoAction()

    expect(r.info).toBeNull()
    expect(r.novedades).toEqual([])
    expect(rutas().some((p) => p.includes('/novedades'))).toBe(false)
  })
})

describe('horario del estudiante asociado (WEB-03)', () => {
  it('ordena por día y hora, nombra la materia y trae el curso', async () => {
    responder({
      '/padres/me/hijos': [200, [HIJO]],
      '/horarios': [200, [
        { id_horario: 2, dia: 'Martes', hora_inicio: '07:00:00', hora_fin: '08:00:00', salon: '102', id_materia: 4 },
        { id_horario: 1, dia: 'Lunes', hora_inicio: '09:00:00', hora_fin: '10:00:00', salon: '101', id_materia: 3 },
        { id_horario: 3, dia: 'Lunes', hora_inicio: '07:00:00', hora_fin: '08:00:00', salon: '101', id_materia: 99 },
      ]],
      '/materias': [200, MATERIAS],
      '/cursos/5': [200, { id_curso: 5, nombre_curso: 'Sexto A', grado: 'Sexto', jornada: 'mañana' }],
    })

    const r = await getHorarioAsociadoAction()

    expect(r.error).toBeUndefined()
    expect(r.curso).toMatchObject({ nombreCurso: 'Sexto A', grado: 'Sexto', jornada: 'mañana' })
    expect(r.horarios.map((h) => h.idHorario)).toEqual([3, 1, 2])
    expect(r.horarios[1].nombreMateria).toBe('Matemáticas')
    expect(r.horarios[0].nombreMateria).toBe('Materia #99')
    expect(rutas().some((p) => p.startsWith('/horarios?id_curso=5'))).toBe(true)
  })

  it('si /cursos/{id} falla, el horario se muestra igual sin los datos del curso', async () => {
    responder({
      '/padres/me/hijos': [200, [HIJO]],
      '/horarios': [200, [{ id_horario: 1, dia: 'Lunes', hora_inicio: '07:00:00', hora_fin: '08:00:00', salon: '101', id_materia: 3 }]],
      '/materias': [200, MATERIAS],
      '/cursos/5': [500, { detail: 'Error interno' }],
    })

    const r = await getHorarioAsociadoAction()

    expect(r.error).toBeUndefined()
    expect(r.curso).toBeNull()
    expect(r.horarios).toHaveLength(1)
  })
})

describe('estudiante que entra a su propia información (WEB-03)', () => {
  beforeEach(() => sesion('estudiante', 2))

  it('usa /estudiantes/me y no pide hijos', async () => {
    responder({
      '/estudiantes/me': [200, { id_estudiante: 30, id_curso_actual: 7, codigo_estudiante: 'EST030' }],
      '/estudiantes/30/notas': [200, []],
      '/materias': [200, MATERIAS],
    })

    const r = await getNotasAsociadoAction()

    expect(r.info).toMatchObject({ idEstudiante: 30, codigo: 'EST030' })
    expect(r.hijos).toEqual([])
    expect(rutas().some((p) => p.includes('/padres'))).toBe(false)
  })

  it('si /estudiantes/me no trae id, no hay estudiante asociado', async () => {
    responder({ '/estudiantes/me': [200, {}] })

    const r = await getAsociadoAction()

    expect(r.info).toBeNull()
  })
})

describe('otros roles no tienen estudiante asociado', () => {
  it('un docente recibe info null sin llamar a la API', async () => {
    cookieJar.seed({
      eys_access: jwt({ rol: 'docente', id_rol: 1, exp: enUnaHora() }),
      eys_user: JSON.stringify({ idUsuario: 5, idRol: 1, nombreRol: 'Docente' }),
    })

    const r = await getAsociadoAction()

    expect(r).toEqual({ info: null, hijos: [] })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('sin sesión tampoco', async () => {
    cookieJar.seed({})

    const r = await getAsociadoAction()

    expect(r.info).toBeNull()
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
