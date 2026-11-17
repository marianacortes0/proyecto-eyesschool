import { expect, test, type Page } from '@playwright/test'
import { iniciarSesion } from './utils'
import { apiQA, borrarQA } from './qa'

// WC-05 · novedades: CP-SIS-047 (registrar; la gravedad corresponde al tipo),
// 048 (sin descripción no se guarda) y 049 (historial por estudiante, por fecha).
// Lo que se crea lleva «E2E <marca>» en la descripción y se borra al final.

type Novedad = { id_novedad: number; id_estudiante: number; id_tipo_novedad?: number; descripcion: string; fecha: string }
type Tipo = { id_tipo_novedad: number; nombre_tipo: string; nivel_gravedad: string }
type Curso = { id_curso: number; nombre_curso: string; jornada: string; grado: string; activo: boolean }
type Est = { id_estudiante: number; primer_nombre: string; primer_apellido: string }

const MARCA = `E2E ${Date.now()}`
const CURSO = process.env.E2E_CURSO_MASIVO ?? 'Séptimo A'

test.afterAll(async () => {
  const todas = await apiQA<Novedad[]>('/novedades?limit=500')
  for (const n of todas.filter((n) => n.descripcion?.includes(MARCA))) await borrarQA(`/novedades/${n.id_novedad}`)
})

async function preparar() {
  const cursos = await apiQA<Curso[]>('/cursos?limit=500')
  const curso = cursos.find((c) => c.nombre_curso === CURSO && c.activo)!
  const [est] = await apiQA<Est[]>(`/cursos/${curso.id_curso}/estudiantes`)
  return { curso, est }
}

async function abrirFormulario(page: Page, curso: Curso, est: Est) {
  await page.getByRole('button', { name: '+ Nueva novedad' }).click()
  const form = page.locator('form').filter({ has: page.locator('textarea') }).last()
  const s = form.locator('select')
  // La jornada puede venir en minúscula o capitalizada: se elige sin importar mayúsculas.
  const valores = await s.nth(0).locator('option').evaluateAll((os) => os.map((o) => (o as HTMLOptionElement).value))
  await s.nth(0).selectOption(valores.find((v) => v.toLowerCase() === curso.jornada.toLowerCase())!)
  await s.nth(1).selectOption(curso.grado)
  await s.nth(2).selectOption(String(curso.id_curso))
  await s.nth(3).selectOption(String(est.id_estudiante))
  return form
}

test('CP-SIS-047 · el docente registra una novedad y su gravedad corresponde al tipo', async ({ page }) => {
  const { curso, est } = await preparar()
  const tipos = await apiQA<Tipo[]>('/tipos-novedad?limit=100')
  const tipo = tipos.find((t) => /dispositivos/i.test(t.nombre_tipo)) ?? tipos[0]

  await iniciarSesion(page, 'docente')
  await page.goto('/novedades')
  const form = await abrirFormulario(page, curso, est)
  await form.locator('select').nth(4).selectOption({ label: tipo.nombre_tipo })
  await form.locator('textarea').first().fill(`${MARCA} · registrar`)
  await form.getByRole('button', { name: 'Crear' }).click()
  await expect(page.getByText('Novedad creada exitosamente').first()).toBeVisible({ timeout: 30_000 })

  // La tabla pagina: se busca por la marca.
  await page.getByPlaceholder('Buscar estudiante o descripción...').fill(MARCA)
  const fila = page.locator('main table tbody tr').filter({ hasText: `${MARCA} · registrar` })
  await expect(fila).toBeVisible()
  await expect(fila).toContainText(tipo.nombre_tipo)
  await expect(fila).toContainText(tipo.nivel_gravedad)
})

test('CP-SIS-048 · sin descripción no se guarda', async ({ page }) => {
  const { curso, est } = await preparar()
  await iniciarSesion(page, 'docente')
  await page.goto('/novedades')
  const form = await abrirFormulario(page, curso, est)
  await form.locator('select').nth(4).selectOption({ index: 1 })
  await form.getByRole('button', { name: 'Crear' }).click()

  const descripcion = form.locator('textarea').first()
  expect(await descripcion.evaluate((e) => (e as HTMLTextAreaElement).validity.valueMissing)).toBe(true)
  await expect(page.getByText('Novedad creada exitosamente')).toHaveCount(0)
})

test('CP-SIS-049 · el historial de un estudiante sale solo con sus novedades y ordenado por fecha', async ({ page }) => {
  await iniciarSesion(page, 'docente')
  await page.goto('/novedades')
  const filas = page.locator('main table tbody tr')
  await expect(filas.first()).toBeVisible()

  // El estudiante con más novedades en la tabla.
  const nombres = (await filas.locator('td:nth-child(2)').allTextContents()).map((t) => t.replace(/\s*[A-Z]+\d+$/, '').trim())
  const conteo = new Map<string, number>()
  for (const n of nombres) conteo.set(n, (conteo.get(n) ?? 0) + 1)
  const [nombre] = [...conteo.entries()].sort((a, b) => b[1] - a[1])[0]

  await page.getByPlaceholder('Buscar estudiante o descripción...').fill(nombre)
  await expect(filas.first()).toBeVisible()
  for (const t of await filas.locator('td:nth-child(2)').allTextContents()) expect(t).toContain(nombre)

  // Fecha en formato d/m/aaaa: el historial va de la más reciente a la más antigua.
  const fechas = (await filas.locator('td:nth-child(1)').allTextContents()).map((t) => {
    const [d, m, a] = t.trim().split('/').map(Number)
    return new Date(a, m - 1, d).getTime()
  })
  expect(fechas.length).toBeGreaterThan(1)
  expect(fechas, 'ordenado por fecha, de la más reciente a la más antigua').toEqual([...fechas].sort((a, b) => b - a))
})
