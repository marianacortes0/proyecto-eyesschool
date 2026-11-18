import { expect, test, type Page } from '@playwright/test'
import { iniciarSesion, requiere } from './utils'
import { apiQA, borrarQA, conApiCaida, requiereApiFallas, restaurarApiAlTerminar, sinTextoTecnico } from './qa'

// WC-05 · horarios: CP-SIS-058 (estudiante: su horario; curso sin horario; API
// caída) y 059 (docente: solo sus clases; sin asignaciones; API caída).
// Las cuentas de prueba (estudiante de un curso sin horario, docente sin
// asignaciones) se crean por la API y se borran al final.

restaurarApiAlTerminar()

type Curso = { id_curso: number; nombre_curso: string; activo: boolean }
const creados: string[] = []

test.afterAll(async () => {
  const usuarios = await apiQA<{ id_usuario: number; correo: string }[]>('/usuarios?limit=500')
  for (const u of usuarios.filter((u) => creados.includes(u.correo))) await borrarQA(`/usuarios/${u.id_usuario}`)
})

async function entrarCon(page: Page, correo: string) {
  await page.goto('/?login=1')
  const vista = page.locator('[data-view="login"][data-listo="true"]')
  await expect(vista).toBeAttached({ timeout: 45_000 })
  await vista.locator('input[type="email"]').fill(correo)
  await vista.locator('input[type="password"]').fill(process.env.E2E_PASSWORD!)
  await vista.locator('button').first().click()
  await expect(page).toHaveURL(/\/general$/, { timeout: 45_000 })
}

/** Crea por la API una cuenta de prueba (`rol`: 1 docente, 2 estudiante). */
async function cuentaDePrueba(rol: 1 | 2, extra: Record<string, unknown> = {}): Promise<string> {
  const correo = `${rol === 1 ? 'docente' : 'estudiante'}.e2e.${Date.now()}@example.com`
  creados.push(correo)
  const u = await apiQA<{ id_usuario: number }>('/usuarios', {
    method: 'POST',
    body: JSON.stringify({
      correo, password: process.env.E2E_PASSWORD, primer_nombre: 'Horario', primer_apellido: 'Prueba E2E',
      tipo_documento: 'CC', numero_documento: String(Date.now()).slice(-10), id_rol: rol,
    }),
  })
  if (rol === 1) {
    await apiQA('/profesores', { method: 'POST', body: JSON.stringify({ id_usuario: u.id_usuario, codigo_profesor: `PE2E${u.id_usuario}`, titulo: 'Otro', nivel_estudios: 'Universitario', fecha_vinculacion: '2026-01-01', ...extra }) })
  } else {
    await apiQA('/estudiantes', {
      method: 'POST',
      body: JSON.stringify({ id_usuario: u.id_usuario, codigo_estudiante: `E2E${u.id_usuario}`, fecha_ingreso: '2026-01-01', estado: 'Activo', ...extra }),
    })
  }
  return correo
}

test('CP-SIS-058 · el estudiante ve las clases de su curso por día y franja', async ({ page }) => {
  await iniciarSesion(page, 'estudiante')
  await page.goto('/horarios')
  const resumen = page.locator('main').getByText(/· \d+ bloques?$/)
  await expect(resumen).toBeVisible()
  await expect(page.locator('main').getByText(/^\d{2}:\d{2} – \d{2}:\d{2}$/).first()).toBeVisible()
  await expect(page.locator('main').getByText(/Lunes|Martes|Miércoles|Jueves|Viernes/).first()).toBeVisible()
})

test('CP-SIS-058 · un estudiante de un curso sin horario ve un aviso', async ({ page }) => {
  requiere('E2E_PASSWORD')
  const cursos = (await apiQA<Curso[]>('/cursos?limit=500')).filter((c) => c.activo)
  let sinHorario: Curso | undefined
  for (const c of cursos) if ((await apiQA<unknown[]>(`/cursos/${c.id_curso}/horarios`)).length === 0) { sinHorario = c; break }
  test.skip(!sinHorario, 'Dato de QA: todos los cursos activos tienen horario')

  const correo = await cuentaDePrueba(2, { id_curso_actual: sinHorario!.id_curso })
  await entrarCon(page, correo)
  await page.goto('/horarios')
  await expect(page.getByText('No hay horarios registrados para este curso.')).toBeVisible()
})

test('CP-SIS-059 · el docente ve solo sus clases', async ({ page }) => {
  // Lo que dice la API: los bloques de sus asignaciones activas.
  const usuarios = await apiQA<{ id_usuario: number; correo: string }[]>('/usuarios?limit=500')
  const idUsuario = usuarios.find((u) => u.correo === process.env.E2E_DOCENTE_EMAIL)!.id_usuario
  const prof = (await apiQA<{ id_profesor: number; id_usuario: number }[]>('/profesores?limit=500')).find((p) => p.id_usuario === idUsuario)!
  const asig = (await apiQA<{ id_profesor: number; id_curso: number; id_materia: number; activo: boolean }[]>('/asignaciones?limit=500'))
    .filter((a) => a.id_profesor === prof.id_profesor && a.activo)
  const claves = new Set(asig.map((a) => `${a.id_curso}-${a.id_materia}`))
  const suyos = (await apiQA<{ id_curso: number; id_materia: number }[]>('/horarios?limit=500')).filter((h) => claves.has(`${h.id_curso}-${h.id_materia}`))
  const todos = (await apiQA<unknown[]>('/horarios?limit=500')).length

  await iniciarSesion(page, 'docente')
  await page.goto('/horarios')
  const n = suyos.length
  await expect(page.locator('main').getByText(`${n} bloque${n !== 1 ? 's' : ''} registrado${n !== 1 ? 's' : ''}`)).toBeVisible()
  expect(n, 'el docente no dicta todos los bloques del colegio (si no, la prueba no distingue)').toBeLessThan(todos)
})

test('CP-SIS-059 · un docente sin asignaciones ve un aviso', async ({ page }) => {
  requiere('E2E_PASSWORD')
  const correo = await cuentaDePrueba(1)
  await entrarCon(page, correo)
  await page.goto('/horarios')
  await expect(page.getByText('No tienes clases asignadas.')).toBeVisible()
})

test('CP-SIS-058 y 059 · con la API caída el horario avisa y deja reintentar', async ({ page }) => {
  requiereApiFallas()
  for (const rol of ['estudiante', 'docente'] as const) {
    await iniciarSesion(page, rol)
    const aviso = page.getByRole('alert').filter({ hasText: /no se pudo/i })
    await conApiCaida(async () => {
      await page.goto('/horarios')
      await expect(aviso, rol).toBeVisible({ timeout: 60_000 })
      await sinTextoTecnico(page)
    })
    await page.getByRole('button', { name: 'Reintentar' }).click()
    await expect(aviso, rol).toHaveCount(0, { timeout: 30_000 })
    await page.context().clearCookies()
  }
})
