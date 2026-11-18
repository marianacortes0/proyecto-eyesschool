import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { json } from './helpers'
import { cookieJar } from './setup/nextMocks'
import { getCodigoQRByValueAction } from '@/services/qr/qrActions'

// DEF-WEB-18 · la API ignora `codigo_estudiante` (no está en su contrato) y
// devuelve la lista de estudiantes: la web tomaba el primero, así que cualquier
// QR —también uno inválido o el de otro estudiante— registraba a EST002.

const est = (id: number, codigo: string) => ({
  id_estudiante: id, codigo_estudiante: codigo, estado: 'Activo',
  primer_nombre: 'Ana', segundo_nombre: null, primer_apellido: `Apellido${id}`, segundo_apellido: null,
})

/** Simula la API real: ignora cualquier filtro y pagina con skip/limit. */
function apiQueIgnoraElFiltro(todos: ReturnType<typeof est>[]) {
  const m = vi.fn(async (url: string) => {
    const u = new URL(url)
    const skip = Number(u.searchParams.get('skip') ?? 0)
    const limit = Number(u.searchParams.get('limit') ?? 100)
    return json(200, todos.slice(skip, skip + limit))
  })
  vi.stubGlobal('fetch', m)
  return m
}

beforeEach(() => cookieJar.seed({ eys_access: 'tok' }))
afterEach(() => vi.unstubAllGlobals())

describe('getCodigoQRByValueAction (DEF-WEB-18)', () => {
  it('un QR que no es de ningún estudiante no resuelve a nadie', async () => {
    apiQueIgnoraElFiltro([est(2, 'EST002'), est(3, 'EST003')])

    expect(await getCodigoQRByValueAction('NO-ES-UN-ESTUDIANTE-E2E')).toBeNull()
  })

  it('resuelve al estudiante con ese código exacto, no al primero de la lista', async () => {
    apiQueIgnoraElFiltro([est(2, 'EST002'), est(3, 'EST003'), est(4, 'SYN0101')])

    expect(await getCodigoQRByValueAction('SYN0101')).toMatchObject({ idEstudiante: 4, codigoEstudiante: 'SYN0101', nombreCompleto: 'Ana Apellido4' })
  })

  it('busca en todas las páginas', async () => {
    const todos = Array.from({ length: 1203 }, (_, i) => est(i + 1, `C${i + 1}`))
    const m = apiQueIgnoraElFiltro(todos)

    expect(await getCodigoQRByValueAction('C1203')).toMatchObject({ idEstudiante: 1203 })
    expect(m).toHaveBeenCalledTimes(3)
  })

  it('no confunde un código con otro que lo contiene', async () => {
    apiQueIgnoraElFiltro([est(10, 'EST0021'), est(11, 'XEST002')])

    expect(await getCodigoQRByValueAction('EST002')).toBeNull()
  })

  it('ignora espacios alrededor del texto leído', async () => {
    apiQueIgnoraElFiltro([est(2, 'EST002')])

    expect(await getCodigoQRByValueAction('  EST002\n')).toMatchObject({ idEstudiante: 2 })
  })
})
