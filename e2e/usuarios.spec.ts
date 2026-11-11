import { expect, test, type Page } from '@playwright/test'
import { iniciarSesion } from './utils'

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
    await page.getByRole('button', { name: 'Crear Usuario' }).click()
    await expect(page.getByText('Usuario creado exitosamente')).toBeVisible(AVISO)

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
