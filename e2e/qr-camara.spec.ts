import { expect, test, type Page } from '@playwright/test'
import { iniciarSesion, requiere } from './utils'
import { apiQA, borrarQA, hoy } from './qa'
import { camara, videoDeQR } from './camara'

// WC-05 · escaneo QR con la cámara: CP-SIS-032 (entrada), 033 (QR inválido),
// 034 (doble entrada), 035 (salida) y 036 (doble salida). El QR inválido (033)
// está en qr-camara-invalido.spec.ts: la cámara se fija por archivo.
//
// Se usa la cámara falsa de Chromium con un video MJPEG del QR, en lugar del
// teléfono (planeación: «o con la cámara falsa de Chromium»). Firefox no tiene
// esa opción: estos casos corren solo en Chromium. El estudiante es uno sin
// registros hoy, elegido por la API antes de lanzar el navegador
// (E2E_QR_CODIGO_VALIDO lo fija `scripts/qr-camara.mjs`). Los registros que se
// crean se borran al final.

const CODIGO = process.env.E2E_QR_CODIGO_VALIDO ?? ''

type Registro = { id_asistencia: number; id_estudiante: number; tipo: string | null; observacion: string | null; activo?: boolean }
let idEstudiante = 0

test.beforeAll(async ({ browserName }) => {
  test.skip(browserName !== 'chromium', 'La cámara falsa con archivo solo existe en Chromium')
  requiere('E2E_QR_CODIGO_VALIDO')
  await videoDeQR(CODIGO, 'valido.mjpeg')
  const [est] = await apiQA<{ id_estudiante: number }[]>(`/estudiantes?codigo_estudiante=${encodeURIComponent(CODIGO)}&limit=1`)
  idEstudiante = est.id_estudiante
})

test.afterAll(async () => {
  if (!idEstudiante) return
  const registros = await apiQA<Registro[]>(`/estudiantes/${idEstudiante}/asistencia?fecha=${hoy()}&limit=50`)
  for (const r of registros.filter((r) => (r.observacion ?? '').startsWith('Registro por QR'))) await borrarQA(`/asistencia/${r.id_asistencia}`)
})

async function escanear(page: Page) {
  await page.getByRole('button', { name: /Escanear$/ }).click()
}

async function abrirEscaner(page: Page) {
  await iniciarSesion(page, 'docente')
  await page.goto('/qr/escanear')
  await page.getByRole('button', { name: /Activar cámara/ }).click()
  await expect(page.locator('main video')).toBeVisible()
}

test.use(camara('valido.mjpeg'))
test.describe.configure({ mode: 'serial' })

test.describe('con un QR de estudiante', () => {

  test('CP-SIS-032 y 034 · registra la entrada y bloquea una segunda entrada', async ({ page }) => {
    await abrirEscaner(page)
    await escanear(page)
    await expect(page.locator('main').getByText(CODIGO, { exact: true })).toBeVisible({ timeout: 45_000 })
    await page.getByRole('button', { name: 'Registrar Entrada' }).click()
    await expect(page.getByText(/Entrada registrada: \d{1,2}:\d{2}/).first()).toBeVisible({ timeout: 30_000 })

    const tras = (await apiQA<Registro[]>(`/estudiantes/${idEstudiante}/asistencia?fecha=${hoy()}&limit=50`)).filter((r) => r.activo !== false)
    expect(tras.filter((r) => r.tipo === 'entrada')).toHaveLength(1)

    // Segunda lectura (pasado el antirrebote de 5 s): entrada otra vez → bloqueada.
    await page.waitForTimeout(6_000)
    await escanear(page)
    await page.getByRole('button', { name: 'Registrar Entrada' }).click()
    await expect(page.getByText('El estudiante ya tiene registro de entrada hoy').first()).toBeVisible({ timeout: 30_000 })
    const despues = (await apiQA<Registro[]>(`/estudiantes/${idEstudiante}/asistencia?fecha=${hoy()}&limit=50`)).filter((r) => r.activo !== false)
    expect(despues.filter((r) => r.tipo === 'entrada')).toHaveLength(1)
  })

  test('CP-SIS-035 y 036 · registra la salida y bloquea una segunda salida', async ({ page }) => {
    await abrirEscaner(page)
    await escanear(page)
    await expect(page.locator('main').getByText(CODIGO, { exact: true })).toBeVisible({ timeout: 45_000 })
    await page.getByRole('button', { name: /Salida$/ }).first().click()
    await page.getByRole('button', { name: 'Registrar Salida' }).click()
    await expect(page.getByText(/Salida registrada: \d{1,2}:\d{2}/).first()).toBeVisible({ timeout: 30_000 })

    await page.waitForTimeout(6_000)
    await escanear(page)
    await page.getByRole('button', { name: /Salida$/ }).first().click()
    await page.getByRole('button', { name: 'Registrar Salida' }).click()
    await expect(page.getByText('El estudiante ya tiene registro de salida hoy').first()).toBeVisible({ timeout: 30_000 })
    const regs = (await apiQA<Registro[]>(`/estudiantes/${idEstudiante}/asistencia?fecha=${hoy()}&limit=50`)).filter((r) => r.activo !== false)
    expect(regs.filter((r) => r.tipo === 'salida')).toHaveLength(1)
  })
})
