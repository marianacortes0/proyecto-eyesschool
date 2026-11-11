import { beforeAll, describe, expect, it } from 'vitest'

import { cookieJar } from '../setup/nextMocks'

/**
 * PR-05 · contrato web ↔ API real de QA (IT-WEB-03, IT-WEB-04 e IT-WEB-05).
 * Inicia sesión con cada rol y llama a las Server Actions de la web —las mismas
 * que usan las páginas— contra la API de QA. Comprueba que los campos obligatorios
 * de cada tipo TypeScript llegan definidos tras el mapeo (riesgo R-07 del PR-01).
 *
 * Variables (en `.env.test.local`, fuera del repositorio):
 *   QA_API_URL, QA_PASSWORD,
 *   E2E_ADMIN_EMAIL, E2E_DOCENTE_EMAIL, E2E_ESTUDIANTE_EMAIL, E2E_PADRE_EMAIL
 * Sin QA_API_URL el archivo entero se omite.
 */

const API = process.env.QA_API_URL
const PASSWORD = process.env.QA_PASSWORD
const hay = Boolean(API && PASSWORD)

type Rol = 'admin' | 'docente' | 'estudiante' | 'padre'
const CORREO: Record<Rol, string | undefined> = {
  admin: process.env.E2E_ADMIN_EMAIL,
  docente: process.env.E2E_DOCENTE_EMAIL,
  estudiante: process.env.E2E_ESTUDIANTE_EMAIL,
  padre: process.env.E2E_PADRE_EMAIL,
}

type Sesion = { access: string; user: Record<string, unknown> }

async function iniciarSesion(rol: Rol): Promise<Sesion> {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ correo: CORREO[rol], password: PASSWORD }),
  })
  if (!res.ok) throw new Error(`Login de ${rol} falló: HTTP ${res.status}`)
  const { access_token } = (await res.json()) as { access_token: string }
  const me = (await (await fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${access_token}` } })).json()) as Record<string, unknown>
  return {
    access: access_token,
    user: {
      idUsuario: me.id_usuario,
      idRol: me.id_rol,
      nombreRol: me.nombre_rol,
      primerNombre: me.primer_nombre,
      primerApellido: me.primer_apellido,
    },
  }
}

function conSesion(s: Sesion) {
  cookieJar.seed({ eys_access: s.access, eys_user: JSON.stringify(s.user) })
}

/** Falla con el campo exacto si alguno obligatorio llega `undefined`. */
function exigirCampos(nombre: string, fila: unknown, campos: string[]) {
  expect(fila, `${nombre}: la API no devolvió filas para comprobar`).toBeTruthy()
  const faltan = campos.filter((c) => (fila as Record<string, unknown>)[c] === undefined)
  expect(faltan, `${nombre}: campos sin definir ${JSON.stringify(faltan)}`).toEqual([])
}

describe.skipIf(!hay)('IT-WEB-03 · contrato de lectura por rol', () => {
  beforeAll(() => {
    process.env.NEXT_PUBLIC_API_URL = API // los módulos leen la URL al cargarse
  })

  it('admin: usuarios, asistencia del día y reportes', async () => {
    conSesion(await iniciarSesion('admin'))
    const { getUsuariosAction } = await import('@/app/(dashboard)/usuarios/actions')
    const { getRegistrosAction } = await import('@/services/asistencia/asistenciaActions')
    const { getReportesAction } = await import('@/services/reportes/reportesActions')

    const usuarios = await getUsuariosAction()
    exigirCampos('usuarios', usuarios[0], ['idUsuario', 'primerNombre', 'primerApellido', 'numeroDocumento'])

    const hoy = new Date().toISOString().split('T')[0]
    const asistencia = await getRegistrosAction({ fecha: hoy })
    if (asistencia[0]) exigirCampos('asistencia', asistencia[0], ['idAsistencia', 'idEstudiante', 'estado', 'fecha'])

    const reportes = await getReportesAction()
    if (reportes[0]) exigirCampos('reportes', reportes[0], ['idReporte', 'nombreReporte', 'tipoReporte', 'estado'])
  })

  it('docente: notas, novedades, horarios y asignaciones', async () => {
    conSesion(await iniciarSesion('docente'))
    const { getNotasBootstrapAction } = await import('@/services/notas/notasActions')
    const { getNovedadesBootstrapAction } = await import('@/services/novedades/novedadesActions')
    const { getHorariosBootstrapAction } = await import('@/services/horarios/horariosActions')

    const notas = await getNotasBootstrapAction()
    if (notas.notas[0]) exigirCampos('notas', notas.notas[0], ['idNota', 'nota', 'idEstudiante', 'idMateria', 'idPeriodo'])

    const novedades = await getNovedadesBootstrapAction()
    if (novedades.novedades[0]) exigirCampos('novedades', novedades.novedades[0], ['idNovedad', 'fecha', 'descripcion', 'estado'])

    const horarios = await getHorariosBootstrapAction()
    if (horarios.horarios[0]) exigirCampos('horarios', horarios.horarios[0], ['idHorario', 'dia', 'horaInicio', 'horaFin'])
    if (horarios.asignaciones[0]) exigirCampos('asignaciones', horarios.asignaciones[0], ['idAsignacion', 'idProfesor', 'idCurso', 'idMateria'])
  })

  for (const rol of ['estudiante', 'padre'] as const) {
    it(`${rol}: notas, novedades y horario del estudiante asociado`, async () => {
      conSesion(await iniciarSesion(rol))
      const { getNotasAsociadoAction, getNovedadesAsociadoAction, getHorarioAsociadoAction } = await import('@/services/asociado/asociadoActions')

      const notas = await getNotasAsociadoAction()
      exigirCampos('asociado', notas.info, ['idEstudiante', 'nombre'])
      if (notas.notas[0]) exigirCampos('notas', notas.notas[0], ['idNota', 'nota', 'idMateria', 'idPeriodo', 'nombreMateria'])

      const novedades = await getNovedadesAsociadoAction()
      if (novedades.novedades[0]) exigirCampos('novedades', novedades.novedades[0], ['idNovedad', 'fecha', 'descripcion', 'nombreTipo'])

      const horario = await getHorarioAsociadoAction()
      if (horario.horarios[0]) exigirCampos('horario', horario.horarios[0], ['idHorario', 'dia', 'horaInicio', 'horaFin'])
    })
  }

  // DEF-WEB-03: exigir que el campo «esté definido» no basta, porque aHijo llena
  // `nombre` con el respaldo «Estudiante #<id>» cuando no reconoce el campo de la API.
  it('padre: los hijos de /padres/me/hijos llegan con su nombre real, no con el respaldo', async () => {
    conSesion(await iniciarSesion('padre'))
    const { getHijosAction } = await import('@/services/asociado/asociadoActions')

    const hijos = await getHijosAction()
    expect(hijos.length, 'el padre de prueba no tiene hijos vinculados').toBeGreaterThan(0)
    expect(hijos.filter((h) => /^Estudiante #\d+$/.test(h.nombre)).map((h) => h.idEstudiante), 'hijos sin nombre').toEqual([])
    expect(hijos.filter((h) => !h.documento).map((h) => h.idEstudiante), 'hijos sin documento').toEqual([])
  })
})

describe.skipIf(!hay)('IT-WEB-04 · inicio del estudiante (BE-03)', () => {
  it('GET /dashboard/estudiante responde 200 y el inicio carga', async () => {
    const { access } = await iniciarSesion('estudiante')
    const res = await fetch(`${API}/dashboard/estudiante`, { headers: { Authorization: `Bearer ${access}` } })

    // Falla esperada mientras BE-03 no esté corregido (hoy responde 500).
    expect(res.status).toBe(200)
  })
})

describe.skipIf(!hay)('IT-WEB-05 · errores reales de la API llegan como mensaje', () => {
  async function llamar(path: string, token: string | null, init: RequestInit = {}) {
    const { serverFetch } = await import('@/services/api/serverFetch')
    process.env.NEXT_PUBLIC_API_URL = API
    return serverFetch(path, { token, ...init }).catch((e: unknown) => e as Error & { status?: number })
  }

  const esTexto = (e: Error) => {
    expect(e).toBeInstanceOf(Error)
    expect(e.message).not.toContain('[object Object]')
    expect(e.message.length).toBeGreaterThan(0)
  }

  it('401: sin token', async () => {
    const e = (await llamar('/usuarios', null)) as Error & { status?: number }
    expect(e.status).toBe(401)
    esTexto(e)
  })

  it('403: un padre pide la lista de usuarios', async () => {
    const { access } = await iniciarSesion('padre')
    const e = (await llamar('/usuarios', access)) as Error & { status?: number }
    expect(e.status).toBe(403)
    esTexto(e)
  })

  it('404: un recurso que no existe', async () => {
    const { access } = await iniciarSesion('admin')
    const e = (await llamar('/usuarios/999999999', access)) as Error & { status?: number }
    expect(e.status).toBe(404)
    esTexto(e)
  })

  it('422: cuerpo inválido, con el primer mensaje de validación', async () => {
    const { access } = await iniciarSesion('admin')
    const e = (await llamar('/usuarios', access, { method: 'POST', body: JSON.stringify({}) })) as Error & { status?: number }
    expect(e.status).toBe(422)
    esTexto(e)
  })
})
