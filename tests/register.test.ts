import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { RedirectError } from './setup/nextMocks'
import { register } from '@/auth/actions'

// WEB-05/WEB-06 · `register` valida antes de llamar a la API: campos comunes,
// política de contraseña y los campos propios de cada rol (id_rol 1 docente,
// 2 estudiante, 3 admin, 4 padre).

function form(campos: Record<string, string>) {
  const f = new FormData()
  for (const [k, v] of Object.entries(campos)) f.set(k, v)
  return f
}

const COMUNES = {
  email: 'Nuevo.Usuario@Eyes.Edu.Co',
  password: 'Colegio#2026',
  firstName: 'Ana',
  lastName: 'Pérez',
  docType: 'CC',
  docNumber: '1001',
}

let fetchMock: ReturnType<typeof vi.fn>
const cuerpoEnviado = () => JSON.parse(String(fetchMock.mock.calls[0][1].body)) as Record<string, unknown>

/** Un registro correcto termina en `redirect()`, que en las pruebas lanza. */
async function registrar(campos: Record<string, string>): Promise<string> {
  try {
    const r = await register(null, form(campos))
    throw new Error(`se esperaba una redirección, pero devolvió ${JSON.stringify(r)}`)
  } catch (e) {
    if (e instanceof RedirectError) return e.destino
    throw e
  }
}

beforeEach(() => {
  fetchMock = vi.fn().mockResolvedValue(new Response('{}', { status: 201 }))
  vi.stubGlobal('fetch', fetchMock)
})
afterEach(() => vi.unstubAllGlobals())

describe('register (WEB-05 · validación antes de llamar a la API)', () => {
  it.each([
    ['sin correo', { ...COMUNES, email: '' }],
    ['sin contraseña', { ...COMUNES, password: '' }],
    ['sin nombre', { ...COMUNES, firstName: '' }],
    ['sin apellido', { ...COMUNES, lastName: '' }],
    ['sin tipo de documento', { ...COMUNES, docType: '' }],
    ['sin número de documento', { ...COMUNES, docNumber: '' }],
    ['sin rol', { ...COMUNES }],
  ])('%s pide completar los campos y no llama a la API', async (_caso, campos) => {
    const r = await register(null, form({ ...campos, roleId: 'roleId' in campos ? String(campos.roleId) : '' }))

    expect(r).toMatchObject({ error: 'Por favor, completa todos los campos' })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('un rol que no es un número tampoco pasa (Number.isNaN)', async () => {
    const r = await register(null, form({ ...COMUNES, roleId: 'docente' }))

    expect(r).toMatchObject({ error: 'Por favor, completa todos los campos' })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('una contraseña sin carácter especial se rechaza con el motivo', async () => {
    const r = await register(null, form({ ...COMUNES, password: 'Colegio2026', roleId: '3', cargo: 'Rectoría' }))

    expect((r as { error: string }).error).toMatch(/carácter especial/i)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('un rol desconocido se rechaza', async () => {
    const r = await register(null, form({ ...COMUNES, roleId: '9' }))

    expect(r).toMatchObject({ error: 'Rol inválido.' })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it.each([
    ['estudiante sin curso', { roleId: '2' }, /curso/i],
    ['padre sin id del estudiante', { roleId: '4' }, /ID del estudiante/i],
    ['padre sin parentesco', { roleId: '4', idEstudianteVinculado: '10' }, /parentesco/i],
    ['docente sin especialización', { roleId: '1' }, /especializaci/i],
    ['admin sin cargo', { roleId: '3' }, /cargo/i],
  ])('%s se rechaza con su motivo', async (_caso, extra, mensaje) => {
    const r = await register(null, form({ ...COMUNES, ...extra }))

    expect((r as { error: string }).error).toMatch(mensaje)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('estudiante válido manda id_curso_actual como número y el correo en minúsculas', async () => {
    const destino = await registrar({ ...COMUNES, roleId: '2', courseId: '5' })

    expect(destino).toContain('registered=true')
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const cuerpo = cuerpoEnviado()
    expect(cuerpo.correo).toBe('nuevo.usuario@eyes.edu.co')
    expect(cuerpo.id_rol).toBe(2)
    expect(cuerpo).toMatchObject({ id_curso_actual: 5 })
  })

  it('padre válido manda id_estudiante_vinculado y parentesco', async () => {
    await registrar({ ...COMUNES, roleId: '4', idEstudianteVinculado: '10', parentesco: 'Madre' })

    expect(cuerpoEnviado()).toMatchObject({ id_estudiante_vinculado: 10, parentesco: 'Madre' })
  })

  it('docente válido manda id_especializacion y la institución si viene', async () => {
    await registrar({ ...COMUNES, roleId: '1', especializacionId: '3', institucion: 'Universidad X' })

    expect(cuerpoEnviado()).toMatchObject({ id_especializacion: 3, institucion: 'Universidad X' })
  })

  it('si la API responde con error, el detail llega al formulario', async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ detail: 'El correo ya está registrado' }), { status: 409 }))

    const r = await register(null, form({ ...COMUNES, roleId: '3', cargo: 'Rectoría' }))

    expect((r as { error: string }).error).toContain('El correo ya está registrado')
  })
})
