import { expect, test, type Page } from '@playwright/test'
import { credenciales, iniciarSesion, requiere } from './utils'
import { apiQA, borrarQA, conApiCaida, requiereApiFallas, restaurarApiAlTerminar, sinTextoTecnico } from './qa'

// US001–US004 · CP-SIS-019 a 028. El administrador crea, edita, filtra y elimina un
// docente de prueba con un correo único por corrida.

const unico = () => String(Date.now())

// Los avisos salen cuando termina la Server Action, que en QA tarda varios
// segundos (D-WEB-16): los 5 s por defecto no alcanzan. La comprobación es la misma.
const AVISO = { timeout: 30_000 }

async function abrirNuevoUsuario(page: Page) {
  await page.goto('/usuarios')
  await page.getByRole('button', { name: /nuevo|crear|agregar/i }).first().click()
}

async function llenarDocente(page: Page, correo: string, nombre = 'Docente') {
  await page.getByPlaceholder('Juan').fill(nombre)
  await page.getByPlaceholder('García').fill('Prueba E2E')
  await page.getByPlaceholder('1234567890').fill(unico().slice(-10))
  await page.getByPlaceholder('correo@ejemplo.com').fill(correo)
  await page.getByPlaceholder('Mínimo 6 caracteres').fill('Colegio#2026')
}

test.describe('gestión de usuarios (admin)', () => {
  test('crear, filtrar, editar y eliminar un docente de prueba', async ({ page }) => {
    await iniciarSesion(page, 'admin')
    const correo = `docente.e2e.${unico()}@example.com`

    // Crear (CP-SIS-019)
    await abrirNuevoUsuario(page)
    await page.getByRole('combobox').filter({ hasText: /docente|profesor/i }).first().selectOption({ label: 'Profesor' }).catch(() => null)
    await llenarDocente(page, correo)
    // Tras el aviso, la app recarga la tabla en segundo plano (otra Server Action).
    // Filtrar antes de que termine mostraba «No se encontraron usuarios» (E20):
    // se espera esa segunda respuesta, no un tiempo fijo.
    let acciones = 0
    const recarga = page.waitForResponse(
      (r) => r.request().method() === 'POST' && !!r.request().headers()['next-action'] && ++acciones === 2
    )
    await page.getByRole('button', { name: 'Crear Usuario' }).click()
    await expect(page.getByText('Usuario creado exitosamente')).toBeVisible(AVISO)
    await recarga

    // Filtrar (CP-SIS-027)
    await page.getByPlaceholder('Buscar por nombre, correo o documento...').fill(correo)
    await expect(page.getByText(correo)).toBeVisible()

    // Editar (CP-SIS-022)
    await page.getByTitle('Editar').first().click()
    await page.getByPlaceholder('Juan').fill('Docente Editado')
    await page.getByRole('button', { name: 'Guardar Cambios' }).click()
    await expect(page.getByText('Usuario editado exitosamente')).toBeVisible(AVISO)

    // Eliminar: primero cancela, luego confirma (CP-SIS-025)
    await page.getByTitle('Eliminar').first().click()
    await page.getByRole('button', { name: /cancelar/i }).click()
    await expect(page.getByText(correo)).toBeVisible()

    await page.getByTitle('Eliminar').first().click()
    await page.getByRole('button', { name: /eliminar|confirmar/i }).last().click()
    await expect(page.getByText('Usuario eliminado exitosamente')).toBeVisible(AVISO)
  })

  test('crear con un campo vacío no guarda e indica el campo (CP-SIS-021)', async ({ page }) => {
    await iniciarSesion(page, 'admin')
    await abrirNuevoUsuario(page)

    await page.getByRole('button', { name: 'Crear Usuario' }).click()

    await expect(page.getByText('Usuario creado exitosamente')).toHaveCount(0)
  })

  test('un filtro sin coincidencias muestra un mensaje informativo (CP-SIS-028)', async ({ page }) => {
    await iniciarSesion(page, 'admin')
    await page.goto('/usuarios')

    await page.getByPlaceholder('Buscar por nombre, correo o documento...').fill(`no-existe-${unico()}`)

    await expect(page.getByText(/no se encontr|sin resultados|no hay/i).first()).toBeVisible()
  })
})

// ── WC-05 · CP-SIS-020, 023, 024, 026, 027 y 028 (error) ───────────────────────
// Cada caso que crea un docente de prueba lo borra al final por la API.

type Usuario = { id_usuario: number; correo: string }
const creados: string[] = []

async function usuariosConCorreo(correo: string): Promise<Usuario[]> {
  const todos: Usuario[] = []
  for (const estado of ['true', 'false']) todos.push(...(await apiQA<Usuario[]>(`/usuarios?estado=${estado}&limit=500`)))
  return todos.filter((u) => u.correo.toLowerCase() === correo.toLowerCase())
}

/** Crea por la interfaz un docente de prueba y lo deja filtrado en la tabla. */
async function crearDocenteDePrueba(page: Page): Promise<string> {
  const correo = `docente.e2e.${unico()}@example.com`
  creados.push(correo)
  await abrirNuevoUsuario(page)
  await page.getByRole('combobox').filter({ hasText: /docente|profesor/i }).first().selectOption({ label: 'Profesor' }).catch(() => null)
  await llenarDocente(page, correo)
  let acciones = 0
  const recarga = page.waitForResponse((r) => r.request().method() === 'POST' && !!r.request().headers()['next-action'] && ++acciones === 2)
  await page.getByRole('button', { name: 'Crear Usuario' }).click()
  await expect(page.getByText('Usuario creado exitosamente')).toBeVisible(AVISO)
  await recarga
  await page.getByPlaceholder('Buscar por nombre, correo o documento...').fill(correo)
  await expect(page.getByText(correo)).toBeVisible()
  return correo
}

test.describe('gestión de usuarios · errores (WC-05)', () => {
  restaurarApiAlTerminar()

  // Por patrón y no por la lista `creados`: si un caso falla, Playwright reinicia
  // el proceso y esa lista se pierde (en E25 quedaron 3 cuentas). Toda cuenta
  // docente.e2e.<n>@example.com es de estas pruebas.
  test.afterAll(async () => {
    const todos: Usuario[] = []
    for (const estado of ['true', 'false']) todos.push(...(await apiQA<Usuario[]>(`/usuarios?estado=${estado}&limit=500`)))
    for (const u of todos.filter((u) => /^docente\.e2e\.\d+@example\.com$/.test(u.correo))) await borrarQA(`/usuarios/${u.id_usuario}`)
  })

  test('CP-SIS-020 · crear con un correo ya registrado no guarda', async ({ page }) => {
    requiere('E2E_DOCENTE_EMAIL')
    const existente = credenciales('docente').correo!
    const antes = (await usuariosConCorreo(existente)).map((u) => u.id_usuario)
    await iniciarSesion(page, 'admin')
    await abrirNuevoUsuario(page)
    await page.getByRole('combobox').filter({ hasText: /docente|profesor/i }).first().selectOption({ label: 'Profesor' }).catch(() => null)
    await llenarDocente(page, existente)
    await page.getByRole('button', { name: 'Crear Usuario' }).click()

    // El motivo de la API, no un texto técnico (DEF-WEB-10: antes salía «Minified React error #441»).
    await expect(page.getByText('El correo ya está registrado').first()).toBeVisible(AVISO)
    await sinTextoTecnico(page)
    await expect(page.getByText('Usuario creado exitosamente')).toHaveCount(0)
    expect((await usuariosConCorreo(existente)).map((u) => u.id_usuario)).toEqual(antes)
  })

  // El formulario de edición bloquea el correo a propósito («El documento y el
  // correo no se pueden modificar por seguridad»), así que no se puede poner el de
  // otro usuario. Que la planeación pida editar el correo (CP-SIS-022) es DEF-WEB-09.
  test('CP-SIS-023 · al editar, el correo está bloqueado y no se puede poner el de otro usuario', async ({ page }) => {
    await iniciarSesion(page, 'admin')
    const correo = await crearDocenteDePrueba(page)

    await page.getByTitle('Editar').first().click()
    await expect(page.locator(`input[value="${correo}"]:not([placeholder^="Buscar"])`)).toBeDisabled()
    await expect(page.getByText(/el correo no se pueden? modificar/i)).toBeVisible()
    expect(await usuariosConCorreo(correo)).toHaveLength(1)
  })

  test('CP-SIS-024 · editar dejando el nombre vacío no guarda', async ({ page }) => {
    await iniciarSesion(page, 'admin')
    const correo = await crearDocenteDePrueba(page)

    await page.getByTitle('Editar').first().click()
    await page.getByPlaceholder('Juan').fill('')
    await page.getByRole('button', { name: 'Guardar Cambios' }).click()

    await expect(page.getByText('Usuario editado exitosamente')).toHaveCount(0)
    const nombre = page.getByPlaceholder('Juan')
    const invalido = await nombre.evaluate((e) => (e as HTMLInputElement).validity.valueMissing)
    // O lo marca el navegador (required) o la app muestra un mensaje.
    if (!invalido) await expect(page.getByText(/nombre.*(obligatorio|requerido)|completa/i).first()).toBeVisible()
    const [u] = await usuariosConCorreo(correo)
    const guardado = await apiQA<{ primer_nombre: string }>(`/usuarios/${u.id_usuario}`)
    expect(guardado.primer_nombre).toBe('Docente')
  })

  test('CP-SIS-026 · eliminar con la API caída avisa que no se pudo y no elimina', async ({ page }) => {
    requiereApiFallas()
    await iniciarSesion(page, 'admin')
    const correo = await crearDocenteDePrueba(page)

    await conApiCaida(async () => {
      await page.getByTitle('Eliminar').first().click()
      await page.getByRole('button', { name: /eliminar|confirmar/i }).last().click()
      await expect(page.getByText(/No fue posible eliminar el usuario/).first()).toBeVisible({ timeout: 60_000 })
      await sinTextoTecnico(page)
      await expect(page.getByText('Usuario eliminado exitosamente')).toHaveCount(0)
    })
    expect(await usuariosConCorreo(correo), 'el usuario sigue existiendo').toHaveLength(1)
  })

  test('CP-SIS-027 · filtrar por rol y por nombre; el estado se ve por secciones', async ({ page }) => {
    await iniciarSesion(page, 'admin')
    await page.goto('/usuarios')
    const filas = page.locator('table tbody tr')

    await page.getByRole('button', { name: 'Profesores', exact: true }).click()
    await expect(filas.first()).toBeVisible()
    for (const rol of await filas.locator('td:nth-child(4)').allTextContents()) expect(rol.trim()).toMatch(/profesor|docente/i)

    await page.getByRole('button', { name: 'Todos', exact: true }).click()
    await page.getByPlaceholder('Buscar por nombre, correo o documento...').fill('Mateo')
    await expect(filas.first()).toBeVisible()
    for (const nombre of await filas.locator('td:nth-child(1)').allTextContents()) expect(nombre).toMatch(/Mateo/i)

    // Estado: la tabla solo lista activos; los inactivos van a «Validación Pendiente».
    for (const estado of await filas.locator('td:nth-child(6)').allTextContents()) expect(estado.trim()).toBe('Activo')
    await expect(page.getByRole('heading', { name: 'Validación Pendiente' })).toBeVisible()
  })

  test('CP-SIS-028 · con la API caída la lista avisa y deja reintentar', async ({ page }) => {
    requiereApiFallas()
    await iniciarSesion(page, 'admin')
    await conApiCaida(async () => {
      await page.goto('/usuarios')
      await expect(page.getByRole('alert').filter({ hasText: /No se pudo cargar la lista de usuarios/ })).toBeVisible({ timeout: 60_000 })
      await sinTextoTecnico(page)
      // Sin datos no se afirma nada falso: ni «0 usuarios» ni «Sin pendientes».
      await expect(page.getByText(/^0 usuarios registrados$/)).toHaveCount(0)
      await expect(page.getByText('Sin pendientes')).toHaveCount(0)
      await expect(page.getByText('No se encontraron usuarios')).toHaveCount(0)
    })
    await page.getByRole('button', { name: /reintentar/i }).first().click()
    await expect(page.locator('table tbody tr').first()).toBeVisible({ timeout: 30_000 })
  })
})
