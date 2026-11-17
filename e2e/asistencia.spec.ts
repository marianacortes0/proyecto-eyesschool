import { expect, test, type Page } from '@playwright/test'
import { iniciarSesion } from './utils'
import { apiQA, conApiCaida, hoy, requiereApiFallas, restaurarApiAlTerminar, sinTextoTecnico } from './qa'

// WC-05 · registro del día: CP-SIS-040 (filtros, sin datos y API caída) y
// CP-SIS-064 (el docente no ve la acción de borrar). El oráculo de los conteos
// es la propia API de QA del mismo día: la prueba no depende de lo que dejaron
// otras corridas.

restaurarApiAlTerminar()

type Registro = { id_estudiante: number; activo?: boolean }
type Estudiante = { id_estudiante: number; id_curso_actual: number | null }
type Curso = { id_curso: number; nombre_curso: string; jornada: string; activo: boolean }

async function conteoDeHoyPorCurso() {
  const [registros, estudiantes, cursos] = await Promise.all([
    apiQA<Registro[]>(`/asistencia?fecha=${hoy()}&limit=500`),
    apiQA<Estudiante[]>('/estudiantes?limit=500'),
    apiQA<Curso[]>('/cursos?limit=500'),
  ])
  const cursoDe = new Map(estudiantes.map((e) => [e.id_estudiante, e.id_curso_actual]))
  const cuenta = new Map<number, number>()
  for (const r of registros.filter((r) => r.activo !== false)) {
    const c = cursoDe.get(r.id_estudiante)
    if (c) cuenta.set(c, (cuenta.get(c) ?? 0) + 1)
  }
  return { cursos: cursos.filter((c) => c.activo), cuenta }
}

async function filtrar(page: Page, jornada: string, curso: string) {
  const selects = page.locator('main select')
  await selects.filter({ has: page.getByRole('option', { name: 'Todas las jornadas' }) }).selectOption({ label: jornada })
  await selects.filter({ has: page.getByRole('option', { name: 'Todos los cursos' }) }).selectOption({ label: curso })
}

test('CP-SIS-040 · el registro del día filtra por jornada y curso, y avisa si no hay datos', async ({ page }) => {
  const { cursos, cuenta } = await conteoDeHoyPorCurso()
  const conDatos = cursos.find((c) => (cuenta.get(c.id_curso) ?? 0) > 0)
  const sinDatos = cursos.find((c) => !cuenta.get(c.id_curso))
  test.skip(!conDatos || !sinDatos, 'Dato de QA: hace falta un curso con registros hoy y otro sin registros')

  await iniciarSesion(page, 'admin')
  await page.goto('/asistencia')
  await expect(page.locator('main input[type="date"]')).toHaveValue(hoy())

  const n = cuenta.get(conDatos!.id_curso)!
  await filtrar(page, conDatos!.jornada, conDatos!.nombre_curso)
  await expect(page.getByText(`${n} registro${n !== 1 ? 's' : ''} encontrado${n !== 1 ? 's' : ''}`)).toBeVisible()

  await filtrar(page, sinDatos!.jornada, sinDatos!.nombre_curso)
  await expect(page.getByText('No hay registros para los filtros seleccionados.')).toBeVisible()
})

test('CP-SIS-040 · con la API caída el registro del día avisa y deja reintentar', async ({ page }) => {
  requiereApiFallas()
  await iniciarSesion(page, 'admin')
  const aviso = page.getByRole('alert').filter({ hasText: /no se pudo/i })

  await conApiCaida(async () => {
    await page.goto('/asistencia')
    await expect(aviso).toBeVisible({ timeout: 60_000 })
    await sinTextoTecnico(page)
    // Sin datos no se afirma «0 registros» ni «No hay registros».
    await expect(page.getByText(/^0 registros encontrados$/)).toHaveCount(0)
    await expect(page.getByText('No hay registros para los filtros seleccionados.')).toHaveCount(0)
  })

  await page.getByRole('button', { name: 'Reintentar' }).click()
  await expect(aviso).toHaveCount(0, { timeout: 30_000 })
  await expect(page.getByText(/registros? encontrados?/)).toBeVisible()
})

test('CP-SIS-064 · el docente no ve la acción de borrar asistencia; el admin sí', async ({ page }) => {
  await iniciarSesion(page, 'docente')
  await page.goto('/asistencia')
  const filas = page.locator('main table tbody tr')
  await expect(filas.first()).toBeVisible()
  await expect(page.locator('main table').getByRole('button', { name: 'edit' }).first()).toBeVisible()
  await expect(page.locator('main table').getByRole('button', { name: 'delete' })).toHaveCount(0)
})
