import { expect, test, type Locator, type Page } from '@playwright/test'
import { credenciales, requiere } from './utils'
import { apiQA, borrarQA } from './qa'

// WC-05 · auto-registro: CP-SIS-011, 012 y 013.
// Escriben en QA: cada cuenta que se crea se borra al final por la API, y antes se
// comprueba que su correo sea de E2E. CP-SIS-012 nunca borra la cuenta original.

type Usuario = { id_usuario: number; correo: string; primer_apellido?: string }

const creados: string[] = []

async function usuariosConCorreo(correo: string): Promise<Usuario[]> {
  const todos: Usuario[] = []
  for (const estado of ['true', 'false']) todos.push(...(await apiQA<Usuario[]>(`/usuarios?estado=${estado}&limit=500`)))
  return todos.filter((u) => u.correo.toLowerCase() === correo.toLowerCase())
}

test.afterAll(async () => {
  for (const correo of creados) {
    if (!/^(estudiante|padre)\.e2e\.\d+@example\.com$/.test(correo)) continue
    for (const u of await usuariosConCorreo(correo)) await borrarQA(`/usuarios/${u.id_usuario}`)
  }
})

async function abrirRegistro(page: Page): Promise<Locator> {
  await page.goto('/?login=1')
  await page.locator('[data-view="login"][data-listo="true"]').waitFor({ state: 'attached', timeout: 45_000 })
  await page.locator('[data-go-signup]').click()
  return page.getByRole('dialog', { name: /crear cuenta/i })
}

async function llenarComunes(modal: Locator, unico: number, correo: string) {
  await modal.getByLabel('Nombre', { exact: true }).fill('Estudiante')
  await modal.getByLabel('Apellido', { exact: true }).fill(`E2E${unico}`)
  await modal.getByLabel('Número de documento').fill(String(unico).slice(-10))
  await modal.getByLabel('Correo').fill(correo)
  await modal.getByLabel('Contraseña', { exact: true }).fill(process.env.E2E_PASSWORD!)
}

test('CP-SIS-011 · un estudiante se registra con todos los datos y puede iniciar sesión', async ({ page }) => {
  requiere('E2E_PASSWORD', 'E2E_JORNADA_MASIVO', 'E2E_CURSO_MASIVO')
  const unico = Date.now()
  const correo = `estudiante.e2e.${unico}@example.com`
  creados.push(correo)

  const modal = await abrirRegistro(page)
  await llenarComunes(modal, unico, correo)
  await modal.getByLabel('Rol', { exact: true }).selectOption('2')
  // Jornada → grado → curso (los cursos se cargan al elegir el rol).
  const jornada = modal.getByRole('combobox').filter({ has: page.getByRole('option', { name: 'Jornada', exact: true }) })
  await expect(jornada.getByRole('option', { name: process.env.E2E_JORNADA_MASIVO! })).toBeAttached({ timeout: 30_000 })
  await jornada.selectOption(process.env.E2E_JORNADA_MASIVO!)
  await modal.getByRole('combobox').filter({ has: page.getByRole('option', { name: 'Grado', exact: true }) }).selectOption({ index: 1 })
  const curso = modal.locator('select[name="courseId"]')
  await curso.selectOption({ index: 1 })
  await modal.getByRole('button', { name: /crear cuenta/i }).click()

  await expect(page.getByText(/Usuario registrado exitosamente como Estudiante/)).toBeVisible({ timeout: 60_000 })

  const vista = page.locator('[data-view="login"][data-listo="true"]')
  await vista.locator('input[type="email"]').fill(correo)
  await vista.locator('input[type="password"]').fill(process.env.E2E_PASSWORD!)
  await vista.locator('button').first().click()
  await expect(page).toHaveURL(/\/general$/, { timeout: 45_000 })
})

test('CP-SIS-012 · un correo ya registrado, también en mayúsculas, no crea otra cuenta', async ({ page }) => {
  requiere('E2E_PASSWORD', 'E2E_DOCENTE_EMAIL', 'E2E_ESTUDIANTE_VINCULADO_ID')
  const existente = credenciales('docente').correo!
  const antes = (await usuariosConCorreo(existente)).map((u) => u.id_usuario)
  expect(antes).toHaveLength(1)

  for (const correo of [existente, existente.toUpperCase()]) {
    const unico = Date.now()
    const modal = await abrirRegistro(page)
    await llenarComunes(modal, unico, correo)
    await modal.getByLabel('Rol', { exact: true }).selectOption('4')
    await modal.getByLabel('ID del estudiante').fill(process.env.E2E_ESTUDIANTE_VINCULADO_ID!)
    await modal.getByLabel('Parentesco').selectOption({ index: 1 })
    await modal.getByRole('button', { name: /crear cuenta/i }).click()

    await expect(modal.getByText(/Error al registrar el usuario/), correo).toBeVisible({ timeout: 60_000 })
  }

  // Ninguna cuenta nueva con ese correo. Si la API la hubiera creado, se borra
  // la nueva (nunca la original) y la prueba falla igual.
  const despues = await usuariosConCorreo(existente)
  const nuevas = despues.filter((u) => !antes.includes(u.id_usuario))
  for (const u of nuevas) if (/E2E/.test(u.primer_apellido ?? '')) await borrarQA(`/usuarios/${u.id_usuario}`)
  expect(nuevas, 'cuentas nuevas con un correo repetido').toEqual([])
})

test('CP-SIS-013 · con un campo obligatorio vacío no se registra e indica el campo', async ({ page }) => {
  requiere('E2E_PASSWORD')
  const unico = Date.now()
  const correo = `estudiante.e2e.${unico}@example.com`
  creados.push(correo)
  let acciones = 0
  page.on('request', (r) => {
    if (r.method() === 'POST' && r.headers()['next-action'] && /registro|register/i.test(r.postData() ?? '')) acciones++
  })

  const modal = await abrirRegistro(page)
  await llenarComunes(modal, unico, correo)
  await modal.getByLabel('Rol', { exact: true }).selectOption('4')
  await modal.getByLabel('Apellido', { exact: true }).fill('')
  await modal.getByRole('button', { name: /crear cuenta/i }).click()

  // El navegador no envía el formulario y señala el campo vacío.
  const apellido = modal.getByLabel('Apellido', { exact: true })
  expect(await apellido.evaluate((e) => (e as HTMLInputElement).validity.valueMissing)).toBe(true)
  expect(await apellido.evaluate((e) => (e as HTMLInputElement).validationMessage)).not.toBe('')
  await expect(modal).toBeVisible()
  expect(acciones).toBe(0)
  expect(await usuariosConCorreo(correo)).toEqual([])
})
