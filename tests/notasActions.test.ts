import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { json } from './helpers'
import { cookieJar } from './setup/nextMocks'
import { createNotaAction } from '@/services/notas/notasActions'

// DEF-WEB-10 · al registrar una nota, el motivo del rechazo de la API llega al
// docente (antes salía el mensaje genérico, o #441 en producción).

const NOTA = { idEstudiante: 1, idMateria: 2, idPeriodo: 4, nota: 4.5, observacion: null, registradoPor: 2 }

beforeEach(() => cookieJar.seed({ eys_access: 'tok' }))
afterEach(() => vi.unstubAllGlobals())

describe('createNotaAction (DEF-WEB-10)', () => {
  it('un 403 devuelve el motivo de la API', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => json(403, { detail: 'No tiene asignada esta materia en el curso del estudiante' })))

    expect(await createNotaAction(NOTA)).toEqual({ error: 'No tiene asignada esta materia en el curso del estudiante' })
  })

  it('si se guarda, no devuelve error', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => json(201, { id_nota: 9 })))

    expect(await createNotaAction(NOTA)).toEqual({})
  })

  it('un 5xx se sigue lanzando', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => json(500, { detail: 'boom' })))

    await expect(createNotaAction(NOTA)).rejects.toThrow()
  })
})
