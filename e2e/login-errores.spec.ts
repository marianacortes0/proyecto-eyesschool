import { expect, test, type Page } from '@playwright/test'
import { cerrarSesion, credenciales, INICIO, iniciarSesion, requiere } from './utils'
import { conApiCaida, requiereApiFallas, restaurarApiAlTerminar } from './qa'

// WC-05 · login y sesión: CP-SIS-002, 003, 005, 007, 008 y 010.
// 005 y 008 necesitan la API caída: corren contra el build local con el proxy de
// fallas (scripts/api-fallas.mjs); en el deploy de QA se omiten con su motivo.

restaurarApiAlTerminar()

/** Abre el modal de inicio de sesión ya conectado (marca data-listo). */
async function abrirLogin(page: Page) {
  await page.goto('/?login=1')
  const vista = page.locator('[data-view="login"][data-listo="true"]')
  await expect(vista).toBeAttached({ timeout: 45_000 })
  return vista
}

/** Cuenta las llamadas a Server Actions (el login es una). */
function contarAcciones(page: Page) {
  let n = 0
  page.on('request', (r) => {
    if (r.method() === 'POST' && r.headers()['next-action']) n++
  })
  return () => n
}

test('CP-SIS-002 · contraseña errada y correo inexistente dan el mismo mensaje genérico', async ({ page }) => {
  const { correo } = credenciales('docente')
  requiere('E2E_DOCENTE_EMAIL')
  const vista = await abrirLogin(page)
  const mensaje = vista.locator('p').filter({ hasText: /credenciales|correo|contraseña/i }).last()

  await vista.locator('input[type="email"]').fill(correo!)
  await vista.locator('input[type="password"]').fill('Equivocada#2026')
  await vista.locator('button').first().click()
  await expect(vista.locator('button').first()).toHaveText(/entrar/i, { timeout: 45_000 })
  const conCorreoReal = (await mensaje.textContent())?.trim()

  await vista.locator('input[type="email"]').fill(`nadie.${Date.now()}@example.com`)
  await vista.locator('input[type="password"]').fill('Equivocada#2026')
  await vista.locator('button').first().click()
  await expect(vista.locator('button').first()).toHaveText(/entrar/i, { timeout: 45_000 })
  const conCorreoInexistente = (await mensaje.textContent())?.trim()

  expect(conCorreoReal).toBeTruthy()
  // El mismo texto: no revela si el correo existe.
  expect(conCorreoInexistente).toBe(conCorreoReal)
  await expect(page).toHaveURL(/\/\?login=1$/)
})

test('CP-SIS-003 · con el correo o la contraseña vacíos no se envía y lo indica', async ({ page }) => {
  const vista = await abrirLogin(page)
  const acciones = contarAcciones(page)
  const boton = vista.locator('button').first()

  await vista.locator('input[type="password"]').fill('Colegio#2026')
  await boton.click()
  await expect(vista.getByText(/ingresa tu correo/i)).toBeVisible()

  await vista.locator('input[type="password"]').fill('')
  await vista.locator('input[type="email"]').fill('alguien@example.com')
  await boton.click()
  await expect(vista.getByText(/contraseña/i).last()).toBeVisible()

  expect(acciones(), 'no debe llamar a la Server Action de login').toBe(0)
  await expect(page).toHaveURL(/\/\?login=1$/)
})

test('CP-SIS-005 · con la API caída el login avisa y deja reintentar', async ({ page }) => {
  requiereApiFallas()
  const { correo, password } = credenciales('docente')
  const vista = await abrirLogin(page)
  await vista.locator('input[type="email"]').fill(correo!)
  await vista.locator('input[type="password"]').fill(password!)
  const boton = vista.locator('button').first()

  await conApiCaida(async () => {
    await boton.click()
    await expect(vista.getByText(/no se pudo conectar|no respondió|intenta de nuevo/i)).toBeVisible({ timeout: 60_000 })
    await expect(boton).toHaveText(/entrar/i)
    await expect(page).toHaveURL(/\/\?login=1$/)
  })

  // Reintentar: con la API de vuelta, el mismo botón entra.
  await boton.click()
  await expect(page).toHaveURL(/\/general$/, { timeout: 45_000 })
})

test('CP-SIS-007 · el padre no entra por URL a módulos de otros roles', async ({ page }) => {
  await iniciarSesion(page, 'padre')
  for (const ruta of ['/usuarios', '/reportes', '/qr/escanear']) {
    await page.goto(ruta)
    await expect(page, ruta).toHaveURL(/\/general$/)
  }
})

test('CP-SIS-008 · con la API caída el inicio muestra un error y deja reintentar', async ({ page }) => {
  requiereApiFallas()
  await iniciarSesion(page, 'docente')

  // El aviso tiene texto: el `role="alert"` vacío de Next (anunciador de rutas) no cuenta.
  const aviso = page.getByRole('alert').filter({ hasText: /no se pudo cargar/i })
  await conApiCaida(async () => {
    await page.goto(INICIO.docente)
    await expect(aviso).toBeVisible({ timeout: 60_000 })
    // Sin datos no se muestran ceros (DEF-WEB-08): «—».
    await expect(page.getByText('Estudiantes a tu cargo')).toBeVisible()
    await expect(page.locator('main').getByText(/^0$/)).toHaveCount(0)
  })

  // Reintentar con la API de vuelta: el aviso desaparece y llegan los datos.
  await page.getByRole('button', { name: 'Reintentar' }).click()
  await expect(aviso).toHaveCount(0, { timeout: 30_000 })
  await expect(page.locator('main').getByText('—')).toHaveCount(0)
})

test('CP-SIS-010 · al cerrar sesión, «atrás» no devuelve al panel', async ({ page }) => {
  await iniciarSesion(page, 'docente')
  await page.goto('/notas')
  await cerrarSesion(page)

  await page.goBack()
  // La página protegida pide iniciar sesión (no se muestra el panel desde la caché).
  await expect(page).toHaveURL(/\/\?login=1$/, { timeout: 20_000 })
  await expect(page.getByRole('heading', { name: 'Notas', exact: true })).toHaveCount(0)
})
