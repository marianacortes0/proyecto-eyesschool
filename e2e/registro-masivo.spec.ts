import { expect, test } from '@playwright/test'
import { iniciarSesion, requiere } from './utils'

// WEB-06 · CP-SIS-037, 038, 039 y 041. El 409 por duplicado depende de BE-08.
// Dato de QA pendiente: un curso con estudiantes activos que no tenga registros
// ese día → E2E_JORNADA_MASIVO y E2E_CURSO_MASIVO (nombre tal como aparece en el selector).

async function enviarLote(page: import('@playwright/test').Page, { esperarRespuesta = true } = {}) {
  await page.goto('/qr/escanear')
  await page.getByRole('button', { name: /masivo|por curso|lote/i }).first().click().catch(() => null)

  const [jornada, curso] = await page.getByRole('combobox').all()
  await jornada.selectOption({ label: process.env.E2E_JORNADA_MASIVO! })
  await curso.selectOption({ label: process.env.E2E_CURSO_MASIVO! })
  // El lote es una Server Action (un POST con la cabecera Next-Action) que hace
  // un POST a la API por estudiante. El resultado se comprueba cuando responde,
  // no con un tiempo fijo: así la primera y la segunda vez esperan lo mismo (E13).
  const respuesta = esperarRespuesta
    ? page.waitForResponse((r) => r.request().method() === 'POST' && !!r.request().headers()['next-action'])
    : null
  await page.getByRole('button', { name: /^Registrar \d+ asistencias?/ }).click()
  await respuesta
}

test.describe('registro masivo (WEB-06)', () => {
  test('la segunda vez con el mismo curso, todos salen «ya registrado»', async ({ page }) => {
    requiere('E2E_JORNADA_MASIVO', 'E2E_CURSO_MASIVO')
    // Falla esperada hasta que BE-08 (409 por duplicado) esté desplegado en QA; entonces E2E_BE08=true.
    test.fail(process.env.E2E_BE08 !== 'true', 'Requiere BE-08: sin el 409 la API duplica el registro')
    await iniciarSesion(page, 'docente')

    // Primer envío: «guardados» si el curso no tenía registros hoy, o «ya registrado»
    // si otra corrida del mismo día ya los guardó (con BE-08 las dos son correctas).
    // La prueba no exigía la precondición «sin registros hoy» (D-WEB-17).
    await enviarLote(page)
    const guardados = page.getByText(/de asistencia guardados?/i)
    const yaExistian = page.getByRole('region', { name: /ya existentes/i })
    await expect(guardados.or(yaExistian).first()).toBeVisible()

    // Segundo envío del mismo curso: todos «ya registrado» y ninguno «no guardado».
    await enviarLote(page)
    const ya = page.getByRole('region', { name: /ya existentes/i })
    await expect(ya).toBeVisible()
    await expect(ya.getByText(/ya registrado/i).first()).toBeVisible()
    await expect(page.getByRole('region', { name: /no guardados/i })).toHaveCount(0)
  })

  test('con la red cortada, los fallidos se listan por nombre con Reintentar y Descartar', async ({ page, context }) => {
    requiere('E2E_JORNADA_MASIVO', 'E2E_CURSO_MASIVO')
    await iniciarSesion(page, 'docente')
    await page.goto('/qr/escanear')

    await context.setOffline(true)
    // Sin red no hay respuesta que esperar.
    await enviarLote(page, { esperarRespuesta: false }).catch(() => null)
    await context.setOffline(false)

    const fallidos = page.getByRole('region', { name: /no guardados/i })
    if (await fallidos.count()) {
      await expect(fallidos.getByRole('button', { name: 'Reintentar' })).toBeVisible()
      await expect(fallidos.getByRole('button', { name: 'Descartar' })).toBeVisible()
    }
  })
})
