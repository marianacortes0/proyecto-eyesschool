import { expect, test } from '@playwright/test'
import { iniciarSesion, requiere } from './utils'

// WEB-01 · CP-SIS-004 (sesión vencida) y CP-SIS-065 (sesión larga).
// Las cookies se manipulan directamente para no esperar 30 o 40 minutos reales.

const MIN = 60_000

function jwtVencido() {
  const b64 = (o: unknown) => Buffer.from(JSON.stringify(o)).toString('base64url')
  return `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ rol: 'docente', id_rol: 1, exp: Math.floor(Date.now() / 1000) - 60 })}.firma`
}

test.describe('sesión (WEB-01)', () => {
  test('con 31 minutos sin actividad se cierra la sesión y vuelve al inicio de sesión', async ({ page, context, baseURL }) => {
    await iniciarSesion(page, 'docente')

    await context.addCookies([{ name: 'eys_last', value: String(Date.now() - 31 * MIN), url: baseURL!, httpOnly: true }])
    await page.goto('/notas')

    await expect(page).toHaveURL(/\/\?login=1$/)
    const cookies = await context.cookies()
    expect(cookies.map((c) => c.name)).not.toContain('eys_access')
  })

  test('con el acceso vencido y un refresco válido la sesión se renueva sola', async ({ page, context, baseURL }) => {
    await iniciarSesion(page, 'docente')

    await context.addCookies([{ name: 'eys_access', value: jwtVencido(), url: baseURL!, httpOnly: true }])
    await page.goto('/notas')

    await expect(page).toHaveURL(/\/notas$/)
    const acceso = (await context.cookies()).find((c) => c.name === 'eys_access')
    expect(acceso?.value).not.toBe(jwtVencido())
  })

  test('el token de acceso no se puede leer desde JavaScript', async ({ page }) => {
    await iniciarSesion(page, 'docente')

    expect(await page.evaluate(() => document.cookie)).not.toContain('eys_access')
  })

  // CP-SIS-065 (D-WEB-07): la regla real es de 30 min y se prueba en las
  // unitarias (`updateSession` recibe `ahora`). El proxy mide el tiempo con el reloj
  // del servidor, así que un reloj simulado del navegador no sirve: este escenario
  // corre contra una web de QA desplegada con SESSION_IDLE_MINUTES=1 y repite la
  // misma regla a escala (4 min con actividad ≈ 40 min; 70 s sin actividad ≈ 31 min).
  test.describe('a escala (QA con SESSION_IDLE_MINUTES=1)', () => {
    test.beforeEach(() => requiere('E2E_SESSION_IDLE_MINUTES'))

    test('una sesión usada durante 4 minutos con actividad cada 15 s sigue funcionando (CP-SIS-065)', async ({ page }) => {
      test.setTimeout(6 * MIN)
      await iniciarSesion(page, 'docente')

      const inicio = Date.now()
      const rutas = ['/notas', '/horarios', '/novedades', '/perfil']
      for (let i = 0; Date.now() - inicio < 4 * MIN; i++) {
        await page.goto(rutas[i % rutas.length])
        await expect(page, `vuelta ${i}`).not.toHaveURL(/\/\?login=1/)
        await page.waitForTimeout(15_000)
      }

      await page.goto('/general')
      await expect(page).toHaveURL(/\/general$/)
    })

    test('70 s sin actividad cierran la sesión (equivale a los 31 min de la regla real)', async ({ page, context }) => {
      test.setTimeout(3 * MIN)
      await iniciarSesion(page, 'docente')

      await page.waitForTimeout(70_000)
      await page.goto('/notas')

      await expect(page).toHaveURL(/\/\?login=1$/)
      expect((await context.cookies()).map((c) => c.name)).not.toContain('eys_access')
    })
  })
})

test('una ruta del panel sin sesión pide iniciar sesión', async ({ page }) => {
  requiere('E2E_BASE_URL')
  // Ocho navegaciones completas, cada una con su redirección a la portada: no
  // caben en el tiempo normal de una prueba.
  test.setTimeout(180_000)
  for (const ruta of ['/usuarios', '/reportes', '/notas', '/asistencia', '/novedades', '/horarios', '/perfil', '/qr']) {
    // `domcontentloaded` en vez del `load` por defecto: el destino es la portada,
    // que carga vídeos, un reproductor de YouTube y la fuente de iconos de
    // Google, así que `load` puede tardar más que el tiempo de la prueba. La
    // comprobación no cambia: `toHaveURL` espera a que el guardia redirija.
    await page.goto(ruta, { waitUntil: 'domcontentloaded' })
    // En Netlify el guardia no responde con un 307: la ruta se renderiza y la
    // redirección llega por el cliente, y eso tarda varios segundos. Los 5 s
    // que `expect` espera por defecto no alcanzan; la comprobación es la misma.
    await expect(page, ruta).toHaveURL(/\/\?login=1$/, { timeout: 20_000 })
  }
})
