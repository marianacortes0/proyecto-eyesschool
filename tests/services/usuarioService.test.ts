import { afterEach, describe, expect, it, vi } from 'vitest'

import { json } from '../helpers'
import * as s from '@/services/usuario/usuarioService'

type Ruta = (path: string, init: RequestInit) => Response
function stub(ruta: Ruta) {
  const m = vi.fn(async (url: string, init: RequestInit) => {
    const u = new URL(url)
    return ruta(u.pathname.replace('/api/v1', '') + u.search, init ?? {})
  })
  vi.stubGlobal('fetch', m)
  return m
}
const cuerpo = (m: ReturnType<typeof stub>, i = 0) => JSON.parse(String((m.mock.calls[i][1] as RequestInit).body))

afterEach(() => vi.unstubAllGlobals())

describe('Servicios · usuarioService (perfil)', () => {
  it('getMiPerfil mapea el perfil y resuelve la foto relativa contra el backend', async () => {
    stub(() => json(200, { id_usuario: 5, primer_nombre: 'Ana', primer_apellido: 'Gómez', nombre_rol: 'Docente', foto_perfil: '/static/a.png' }))

    const p = await s.getMiPerfil(5)

    expect(p).toMatchObject({ idUsuario: 5, primerNombre: 'Ana', rolNombre: 'Docente' })
    expect(p?.fotoPerfil).toMatch(/^http:\/\/localhost:8000\/static\/a\.png$/)
  })

  it('getMiPerfil devuelve null si la API falla', async () => {
    stub(() => json(403, { detail: 'No autorizado' }))

    expect(await s.getMiPerfil(5)).toBeNull()
  })

  it('updateMiPerfil manda solo los campos informados', async () => {
    const m = stub(() => json(200, {}))

    await s.updateMiPerfil(5, { telefono: '300', genero: 'F' })

    expect(cuerpo(m)).toEqual({ telefono: '300', genero: 'F' })
  })

  it('uploadAvatar acepta un texto o un objeto con la URL', async () => {
    stub(() => json(200, '/static/avatars/1.png'))
    expect(await s.uploadAvatar(new File(['x'], 'a.png'))).toBe('http://localhost:8000/static/avatars/1.png')

    stub(() => json(200, { url: 'https://cdn.test/a.png' }))
    expect(await s.uploadAvatar(new File(['x'], 'a.png'))).toBe('https://cdn.test/a.png')

    stub(() => json(200, {}))
    expect(await s.uploadAvatar(new File(['x'], 'a.png'))).toBe('')
  })

  it('getAvatarUrl no inventa una URL', () => {
    expect(s.getAvatarUrl({})).toBeNull()
  })

  it('getMiPerfilProfesor busca al profesor por idUsuario en la lista y trae sus especializaciones', async () => {
    const m = stub((path) =>
      path.startsWith('/profesores?')
        ? json(200, [{ id_profesor: 1, id_usuario: 99 }, { id_profesor: 2, id_usuario: 5, titulo: 'Lic.', codigo_profesor: 'P2' }])
        : json(200, [{ id_especializacion: 7, especializacion: { nombre_especializacion: 'Álgebra' }, institucion: 'UN' }])
    )

    const p = await s.getMiPerfilProfesor(5)

    expect(p).toMatchObject({ idProfesor: 2, titulo: 'Lic.' })
    expect(p?.especializaciones).toEqual([{ idEspecializacion: 7, nombreEspecializacion: 'Álgebra', institucion: 'UN' }])
    expect(m.mock.calls.map(([u]) => new URL(u).pathname)).toContain('/api/v1/profesores/2/especializaciones')
  })

  it('getMiPerfilProfesor devuelve null si no hay fila para ese usuario o falla la API', async () => {
    stub(() => json(200, [{ id_profesor: 1, id_usuario: 99 }]))
    expect(await s.getMiPerfilProfesor(5)).toBeNull()

    stub(() => json(500, {}))
    expect(await s.getMiPerfilProfesor(5)).toBeNull()
  })

  it('getMiPerfilAdmin busca en la lista; null si no está', async () => {
    stub(() => json(200, [{ id_administrador: 3, id_usuario: 5, cargo: 'Rector', nivel_acceso: 'Alto', estado: 'Activo' }]))
    expect(await s.getMiPerfilAdmin(5)).toMatchObject({ idAdministrador: 3, cargo: 'Rector' })
    expect(await s.getMiPerfilAdmin(6)).toBeNull()
  })

  it('actualizar profesor y administrador usa snake_case', async () => {
    const m = stub(() => json(200, {}))

    await s.updateMiPerfilProfesor(2, { nivelEstudios: 'Maestría' })
    await s.updateMiPerfilAdmin(3, { nivelAcceso: 'Alto', cargo: 'Rector' })

    expect(cuerpo(m, 0)).toEqual({ nivel_estudios: 'Maestría' })
    expect(cuerpo(m, 1)).toEqual({ nivel_acceso: 'Alto', cargo: 'Rector' })
  })

  it('insertAdminPerfil crea el perfil Activo con la fecha de hoy', async () => {
    const m = stub(() => json(201, { id_administrador: 4, cargo: 'Coord', nivel_acceso: 'Medio', estado: 'Activo', fecha_asignacion: '2026-11-02' }))

    const r = await s.insertAdminPerfil(5, { cargo: 'Coord', nivelAcceso: 'Medio' })

    expect(cuerpo(m)).toMatchObject({ id_usuario: 5, estado: 'Activo' })
    expect(cuerpo(m).fecha_asignacion).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(r.idAdministrador).toBe(4)
  })

  it('getMiEPS usa /estudiantes/me y luego /ips; [] si no hay estudiante o falla', async () => {
    stub((path) =>
      path === '/estudiantes/me'
        ? json(200, { id_estudiante: 8 })
        : json(200, [{ id_ips: 101, nombre_ips: 'SURA', tipo_afiliacion: 'Contributivo', fecha_afiliacion: '2026-01-01', fecha_vencimiento: null, activo: true }])
    )
    expect(await s.getMiEPS(5)).toEqual([
      { idIPS: 101, nombreIPS: 'SURA', tipoAfiliacion: 'Contributivo', fechaAfiliacion: '2026-01-01', fechaVencimiento: null, activo: true },
    ])

    stub(() => json(200, {}))
    expect(await s.getMiEPS(5)).toEqual([])

    stub(() => json(403, {}))
    expect(await s.getMiEPS(5)).toEqual([])
  })

  it('upsertMiEPS manda la afiliación activa con fecha de hoy', async () => {
    const m = stub(() => json(201, {}))

    await s.upsertMiEPS(8, { idIPS: 101, nombreIPS: 'SURA', tipoAfiliacion: 'Contributivo' })

    expect(cuerpo(m)).toMatchObject({ id_ips: 101, nombre_ips: 'SURA', activo: true })
  })

  it('getMiEstudianteInfo devuelve id y curso; null si la lista viene vacía', async () => {
    stub(() => json(200, [{ id_estudiante: 8, id_curso_actual: 3 }]))
    expect(await s.getMiEstudianteInfo(5)).toEqual({ idEstudiante: 8, idCursoActual: 3 })

    stub(() => json(200, []))
    expect(await s.getMiEstudianteInfo(5)).toBeNull()
  })

  it('updateEstudianteCurso y getCursosParaPerfil', async () => {
    const m = stub((path) => (path.startsWith('/cursos') ? json(200, [{ id_curso: 1, nombre_curso: 'Sexto A', grado: '6', jornada: 'Mañana' }]) : json(200, {})))

    await s.updateEstudianteCurso(8, 3)
    const cursos = await s.getCursosParaPerfil()

    expect(cuerpo(m, 0)).toEqual({ id_curso_actual: 3 })
    expect(cursos).toEqual([{ idCurso: 1, nombreCurso: 'Sexto A', grado: '6', jornada: 'Mañana' }])
  })
})
