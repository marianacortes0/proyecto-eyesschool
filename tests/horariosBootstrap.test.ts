import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { json } from './helpers'
import { cookieJar } from './setup/nextMocks'

// DEF-WEB-14 · CP-SIS-059: el filtro del docente se aplica en el servidor, en
// getHorariosBootstrapAction, para que no le lleguen los horarios de los demás.

const usuario = vi.hoisted(() => ({ actual: null as { idUsuario: number; rol: string } | null }))
vi.mock('@/lib/auth/server', () => ({
  getServerUser: async () => usuario.actual,
  userToRole: (u: { rol: string }) => u.rol,
}))

const { getHorariosBootstrapAction } = await import('@/services/horarios/horariosActions')

const API: Record<string, unknown[]> = {
  '/horarios': [
    { id_horario: 1, dia: 'Lunes', hora_inicio: '07:00', hora_fin: '08:00', salon: 'A', activo: true, id_curso: 3, id_materia: 10 },
    { id_horario: 2, dia: 'Lunes', hora_inicio: '08:00', hora_fin: '09:00', salon: 'B', activo: true, id_curso: 3, id_materia: 11 },
  ],
  '/asignaciones': [
    { id_asignacion: 1, id_profesor: 7, id_curso: 3, id_materia: 10, fecha_asignacion: '2026-01-01', fecha_finalizacion: null, activo: true },
    { id_asignacion: 2, id_profesor: 8, id_curso: 3, id_materia: 11, fecha_asignacion: '2026-01-01', fecha_finalizacion: null, activo: true },
  ],
  '/profesores': [
    { id_profesor: 7, id_usuario: 20, primer_nombre: 'Carlos', primer_apellido: 'Jiménez' },
    { id_profesor: 8, id_usuario: 21, primer_nombre: 'Ana', primer_apellido: 'Ruiz' },
  ],
}

beforeEach(() => {
  cookieJar.seed({ eys_access: 'tok' })
  vi.stubGlobal('fetch', vi.fn(async (url: string) => json(200, API[new URL(url).pathname.replace('/api/v1', '')] ?? [])))
})
afterEach(() => {
  vi.unstubAllGlobals()
  usuario.actual = null
})

describe('getHorariosBootstrapAction (DEF-WEB-14)', () => {
  it('el docente recibe solo los bloques de sus asignaciones', async () => {
    usuario.actual = { idUsuario: 20, rol: 'docente' }

    const r = await getHorariosBootstrapAction()

    expect(r.horarios.map((h) => h.idHorario)).toEqual([1])
    expect(r.asignaciones.map((a) => a.idProfesor)).toEqual([7])
  })

  it('un docente sin registro de profesor no recibe ningún bloque', async () => {
    usuario.actual = { idUsuario: 99, rol: 'docente' }

    expect((await getHorariosBootstrapAction()).horarios).toEqual([])
  })

  it('el admin recibe todos los bloques', async () => {
    usuario.actual = { idUsuario: 1, rol: 'admin' }

    expect((await getHorariosBootstrapAction()).horarios.map((h) => h.idHorario)).toEqual([1, 2])
  })
})
