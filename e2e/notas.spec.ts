import { expect, test, type Locator, type Page } from '@playwright/test'
import { iniciarSesion } from './utils'
import { apiQA, borrarQA, conApiCaida, requiereApiFallas, restaurarApiAlTerminar, sinTextoTecnico } from './qa'

// WC-05 · notas: CP-SIS-042 a 046 (docente) y 050 (estudiante).
// Escriben en QA sobre combinaciones estudiante + materia + periodo que no
// tenían notas al empezar; al final se borran con la cuenta del docente (el
// admin no puede borrar notas: 403). La API admite una sola nota por
// estudiante, materia y periodo (409).

restaurarApiAlTerminar()

type Nota = { id_nota: number; id_estudiante: number; id_materia: number; id_periodo: number; nota: number | string }
type Est = { id_estudiante: number; id_curso_actual: number | null; primer_nombre: string; primer_apellido: string }
type Curso = { id_curso: number; nombre_curso: string; jornada: string; grado: string; activo: boolean }
type Materia = { id_materia: number; nombre_materia: string }

const PERIODO = 4
const usadas: Array<{ idEstudiante: number; idMateria: number }> = []
let base: { curso: Curso; materia: Materia; libres: Est[] } | null = null

async function notasDe(idEstudiante: number, idMateria: number, periodos = [PERIODO]): Promise<Nota[]> {
  const todas = await apiQA<Nota[]>(`/estudiantes/${idEstudiante}/notas?limit=500`)
  return todas.filter((n) => n.id_materia === idMateria && periodos.includes(Number(n.id_periodo)))
}

/**
 * Una materia que el docente de pruebas dicta en un curso (la API solo le deja
 * calificar esas) y los estudiantes de ese curso sin notas de esa materia en el
 * periodo 4. Cada prueba toma un estudiante distinto: no se pisan entre sí.
 */
async function preparar() {
  if (base) return base
  const usuarios = await apiQA<{ id_usuario: number; correo: string }[]>('/usuarios?limit=500')
  const idUsuario = usuarios.find((u) => u.correo === process.env.E2E_DOCENTE_EMAIL)!.id_usuario
  const prof = (await apiQA<{ id_profesor: number; id_usuario: number }[]>('/profesores?limit=500')).find((p) => p.id_usuario === idUsuario)!
  const asig = (await apiQA<{ id_profesor: number; id_curso: number; id_materia: number; activo: boolean }[]>('/asignaciones?limit=500'))
    .filter((a) => a.id_profesor === prof.id_profesor && a.activo)
  const cursos = await apiQA<Curso[]>('/cursos?limit=500')
  const materias = await apiQA<Materia[]>('/materias?limit=100')
  for (const a of asig) {
    const curso = cursos.find((c) => c.id_curso === a.id_curso && c.activo)
    if (!curso) continue
    const estudiantes = await apiQA<Est[]>(`/cursos/${curso.id_curso}/estudiantes`)
    const libres: Est[] = []
    for (const e of estudiantes) if ((await notasDe(e.id_estudiante, a.id_materia, [3, 4])).length === 0) libres.push(e)
    if (libres.length >= 5) {
      base = { curso, materia: materias.find((m) => m.id_materia === a.id_materia)!, libres }
      return base
    }
  }
  test.skip(true, 'Dato de QA: el docente no tiene un curso con 5 estudiantes sin notas en el periodo 4 de su materia')
  throw new Error('inalcanzable')
}

async function materiaLibre(): Promise<{ est: Est; curso: Curso; materia: Materia }> {
  const { curso, materia, libres } = await preparar()
  const est = libres.shift()!
  usadas.push({ idEstudiante: est.id_estudiante, idMateria: materia.id_materia })
  expect(await notasDe(est.id_estudiante, materia.id_materia, [3, 4]), 'la combinación empieza vacía').toEqual([])
  return { est, curso, materia }
}

test.afterAll(async () => {
  for (const u of usadas) for (const n of await notasDe(u.idEstudiante, u.idMateria, [3, 4])) await borrarQA(`/notas/${n.id_nota}`, 'docente')
})

/** Formulario «Registrar nota» con jornada, grado, estudiante, periodo y materia elegidos. */
async function abrirFormulario(page: Page, curso: Curso, est: Est, materia?: Materia, periodo = PERIODO): Promise<Locator> {
  await page.getByRole('button', { name: '+ Registrar nota' }).click()
  const form = page.locator('form').filter({ has: page.getByPlaceholder('Ej: 4.5') })
  const selects = form.locator('select')
  await selects.nth(0).selectOption(curso.jornada.toLowerCase())
  await selects.nth(1).selectOption(curso.grado)
  await selects.nth(2).selectOption(String(est.id_estudiante))
  await selects.nth(3).selectOption(String(periodo))
  if (materia) await selects.nth(4).selectOption(String(materia.id_materia))
  return form
}

/** Filtra la lista por estudiante, materia y periodo (muestra el promedio). */
async function filtrarLista(page: Page, curso: Curso, est: Est, materia: Materia, periodo: number | null = PERIODO) {
  const s = page.locator('main select')
  await s.filter({ has: page.getByRole('option', { name: 'Todas las jornadas' }) }).selectOption({ label: curso.jornada })
  await s.filter({ has: page.getByRole('option', { name: 'Todos los cursos' }) }).selectOption(String(curso.id_curso))
  await s.filter({ has: page.getByRole('option', { name: 'Todos los estudiantes' }) }).selectOption(String(est.id_estudiante))
  await s.filter({ has: page.getByRole('option', { name: 'Todas las materias' }) }).selectOption(String(materia.id_materia))
  if (periodo !== null) await s.filter({ has: page.getByRole('option', { name: 'Todos los periodos' }) }).selectOption(String(periodo))
}

const promedio = (page: Page) => page.locator('main').getByText('Promedio', { exact: true }).locator('xpath=following-sibling::p[1]')

async function registrar(page: Page, form: Locator, valor: string) {
  await form.getByPlaceholder('Ej: 4.5').fill(valor)
  await form.getByRole('button', { name: 'Registrar' }).click()
  // Éxito: el formulario se cierra (el aviso puede ser el de una nota anterior).
  await expect(form).toBeHidden({ timeout: 30_000 })
  await expect(page.getByText('Nota creada exitosamente').first()).toBeVisible()
}

test('CP-SIS-042 · el docente registra 4.5 y se guarda por estudiante, materia y periodo', async ({ page }) => {
  const { est, curso, materia } = await materiaLibre()
  await iniciarSesion(page, 'docente')
  await page.goto('/notas')
  const form = await abrirFormulario(page, curso, est, materia)
  await registrar(page, form, '4.5')

  const guardadas = await notasDe(est.id_estudiante, materia.id_materia)
  expect(guardadas.map((n) => Number(n.nota))).toEqual([4.5])
})

test('CP-SIS-043 · una nota fuera de rango no se guarda', async ({ page }) => {
  const { est, curso, materia } = await materiaLibre()
  await iniciarSesion(page, 'docente')
  await page.goto('/notas')
  const form = await abrirFormulario(page, curso, est, materia)
  const campo = form.getByPlaceholder('Ej: 4.5')

  for (const valor of ['5.1', '-0.1']) {
    await campo.fill(valor)
    await form.getByRole('button', { name: 'Registrar' }).click()
    const fuera = await campo.evaluate((e) => (e as HTMLInputElement).validity.rangeOverflow || (e as HTMLInputElement).validity.rangeUnderflow)
    // Lo frena el navegador (min/max) o la app con su mensaje.
    if (!fuera) await expect(form.getByText('La nota debe estar entre 0.0 y 5.0')).toBeVisible()
  }
  // «abc» no se puede escribir en un campo numérico.
  await campo.fill('')
  await campo.pressSequentially('abc')
  expect(await campo.inputValue()).toBe('')

  expect(await notasDe(est.id_estudiante, materia.id_materia)).toEqual([])
})

test('CP-SIS-044 · sin materia no se guarda (el periodo siempre trae uno elegido)', async ({ page }) => {
  const { est, curso, materia } = await materiaLibre()
  await iniciarSesion(page, 'docente')
  await page.goto('/notas')
  const form = await abrirFormulario(page, curso, est)
  await form.getByPlaceholder('Ej: 4.5').fill('4.0')
  await form.getByRole('button', { name: 'Registrar' }).click()

  const materiaSel = form.locator('select').nth(4)
  const vacia = await materiaSel.evaluate((e) => (e as HTMLSelectElement).validity.valueMissing)
  if (!vacia) await expect(form.getByText('Selecciona estudiante y materia.')).toBeVisible()
  expect(await notasDe(est.id_estudiante, materia.id_materia)).toEqual([])
})

test('CP-SIS-045 · el promedio se recalcula al registrar y al editar, sin recargar', async ({ page }) => {
  const { est, curso, materia } = await materiaLibre()
  await iniciarSesion(page, 'docente')
  await page.goto('/notas')

  // Una nota por estudiante, materia y periodo (409): las dos notas van en los
  // periodos 3 y 4, y la lista se filtra por estudiante y materia (D-WEB-17).
  await registrar(page, await abrirFormulario(page, curso, est, materia, 3), '4.0')
  await registrar(page, await abrirFormulario(page, curso, est, materia, 4), '3.0')
  await filtrarLista(page, curso, est, materia, null)
  // La planeación dice «3.50» y «4.50»: la pantalla muestra un decimal.
  await expect(promedio(page)).toHaveText('3.5')

  const fila = page.locator('main table tbody tr').filter({ hasText: '3.0' }).first()
  await fila.getByRole('button', { name: 'Editar' }).click()
  const form = page.locator('form').filter({ has: page.getByPlaceholder('Ej: 4.5') })
  await form.getByPlaceholder('Ej: 4.5').fill('5.0')
  await form.getByRole('button', { name: 'Guardar' }).click()
  await expect(page.getByText('Nota editada exitosamente').first()).toBeVisible({ timeout: 30_000 })
  await expect(promedio(page)).toHaveText('4.5')
})

test('CP-SIS-046 · con la API caída, guardar avisa y deja reintentar', async ({ page }) => {
  requiereApiFallas()
  const { est, curso, materia } = await materiaLibre()
  await iniciarSesion(page, 'docente')
  await page.goto('/notas')
  const form = await abrirFormulario(page, curso, est, materia)
  await form.getByPlaceholder('Ej: 4.5').fill('4.2')

  await conApiCaida(async () => {
    await form.getByRole('button', { name: 'Registrar' }).click()
    // CP-SIS-046 pide «pasos para solucionarlo»: revisar la conexión e intentar de nuevo.
    await expect(page.getByText(/No se pudo guardar la nota\. Revisa tu conexión e intenta de nuevo/).first()).toBeVisible({ timeout: 60_000 })
    await sinTextoTecnico(page)
  })
  expect(await notasDe(est.id_estudiante, materia.id_materia)).toEqual([])

  // Reintentar: el formulario sigue con los datos y ahora guarda.
  await expect(form.getByPlaceholder('Ej: 4.5')).toHaveValue('4.2')
  await form.getByRole('button', { name: 'Registrar' }).click()
  await expect(page.getByText('Nota creada exitosamente').first()).toBeVisible({ timeout: 30_000 })
  expect((await notasDe(est.id_estudiante, materia.id_materia)).map((n) => Number(n.nota))).toEqual([4.2])
})

test('CP-SIS-050 · el estudiante consulta sus notas por periodo y ve un aviso en un periodo sin notas', async ({ page }) => {
  await iniciarSesion(page, 'estudiante')
  await page.goto('/notas')
  const filas = page.locator('main table tbody tr')
  await expect(filas.first()).toBeVisible()

  const periodo = page.locator('main select').filter({ has: page.getByRole('option', { name: 'Todos los periodos' }) })
  await periodo.selectOption({ label: 'Periodo 1' })
  for (const p of await filas.locator('td:nth-child(3)').allTextContents()) expect(p).toMatch(/1/)

  await periodo.selectOption({ label: 'Periodo 4' })
  await expect(page.getByText('No hay notas registradas para este periodo.')).toBeVisible()
})
