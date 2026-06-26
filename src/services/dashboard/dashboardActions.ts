'use server'

import { cookies } from 'next/headers'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

async function getToken(): Promise<string | null> {
  const store = await cookies()
  return store.get('eys_access')?.value ?? null
}

export type ChartPoint = { name: string; value: number }

type AdminDashboard = {
  totalEstudiantes: number
  totalProfesores: number
  totalCursos: number
  promedioGeneral: number | null
  tasaAprobacion: number | null
  porcentajeAsistencia: number | null
  totalNovedadesActivas: number
  // Datos para gráficas
  estudiantesPorCurso: { curso: string; estudiantes: number }[]
  usuariosPorRol: ChartPoint[]
  promedioPorMateria: { materia: string; promedio: number }[]
}

/** Devuelve el primer valor no nulo entre varias claves (snake_case o camelCase). */
function pick(o: Record<string, unknown>, ...keys: string[]): unknown {
  for (const k of keys) if (o[k] != null) return o[k]
  return undefined
}

export async function getAdminDashboardAction(): Promise<AdminDashboard | null> {
  return getAdminDashboard()
}

async function fetchList(path: string, token: string | null): Promise<Record<string, unknown>[]> {
  try {
    const res = await fetch(`${API}${path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: 'no-store',
    })
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? (data as Record<string, unknown>[]) : []
  } catch {
    return []
  }
}

// El endpoint /dashboard/admin del backend devuelve ceros, así que los KPIs se
// calculan a partir de los endpoints de lista (mismo enfoque que el módulo de notas).
async function getAdminDashboard(): Promise<AdminDashboard | null> {
  const token = await getToken()

  // Matrícula = TODOS los estudiantes (no solo activos), para que el conteo
  // coincida con cuántos usuarios tienen rol estudiante.
  const [estudiantes, profesores, cursos, notas, asistencia, novedades, usuarios, materias] = await Promise.all([
    fetchList('/estudiantes?limit=500', token),
    fetchList('/profesores?limit=500', token),
    fetchList('/cursos?activo=true&limit=200', token),
    fetchList('/notas?limit=500', token),
    fetchList('/asistencia?limit=500', token),
    fetchList('/novedades?limit=500', token),
    fetchList('/usuarios?limit=500', token),
    fetchList('/materias?limit=200', token),
  ])

  // Promedio general y tasa de aprobación (nota mínima de aprobación: 3.0)
  const valoresNota = notas.map(n => Number(n.nota)).filter(v => !Number.isNaN(v))
  const promedioGeneral = valoresNota.length
    ? Number((valoresNota.reduce((a, b) => a + b, 0) / valoresNota.length).toFixed(2))
    : null
  const tasaAprobacion = valoresNota.length
    ? Number(((valoresNota.filter(v => v >= 3).length / valoresNota.length) * 100).toFixed(1))
    : null

  // Asistencia: cuenta como asistido "Presente" y "Tarde"
  const asistidos = asistencia.filter(a => {
    const estado = String(a.estado ?? '').toLowerCase()
    return estado === 'presente' || estado === 'tarde'
  }).length
  const porcentajeAsistencia = asistencia.length
    ? Number(((asistidos / asistencia.length) * 100).toFixed(1))
    : null

  // Novedades activas: las que siguen "Pendiente"
  const totalNovedadesActivas = novedades.filter(
    n => String(n.estado ?? '').toLowerCase() === 'pendiente'
  ).length

  // ── Datos para gráficas (los endpoints responden snake_case; pick() tolera ambos) ──

  // Estudiantes por curso (matrícula por grupo)
  const cursoNombre = new Map<number, string>()
  for (const c of cursos) {
    const id = Number(pick(c, 'id_curso', 'idCurso'))
    if (!Number.isNaN(id)) cursoNombre.set(id, String(pick(c, 'nombre_curso', 'nombreCurso') ?? `Curso ${id}`))
  }
  const conteoCurso = new Map<number, number>()
  for (const e of estudiantes) {
    const idc = Number(pick(e, 'id_curso_actual', 'idCursoActual'))
    if (!idc || Number.isNaN(idc)) continue
    conteoCurso.set(idc, (conteoCurso.get(idc) ?? 0) + 1)
  }
  const estudiantesPorCurso = [...conteoCurso.entries()]
    .map(([idc, n]) => ({ curso: cursoNombre.get(idc) ?? `Curso ${idc}`, estudiantes: n }))
    .sort((a, b) => a.curso.localeCompare(b.curso, 'es', { numeric: true }))

  // Distribución de usuarios por rol
  const ROL_LABEL: Record<number, string> = { 1: 'Docentes', 2: 'Estudiantes', 3: 'Admins', 4: 'Padres' }
  const conteoRol = new Map<number, number>()
  for (const u of usuarios) {
    const r = Number(pick(u, 'id_rol', 'idRol'))
    if (!r || Number.isNaN(r)) continue
    conteoRol.set(r, (conteoRol.get(r) ?? 0) + 1)
  }
  const usuariosPorRol: ChartPoint[] = [...conteoRol.entries()]
    .map(([r, n]) => ({ name: ROL_LABEL[r] ?? `Rol ${r}`, value: n }))
    .sort((a, b) => b.value - a.value)

  // Promedio por materia
  const materiaNombre = new Map<number, string>()
  for (const m of materias) {
    const id = Number(pick(m, 'id_materia', 'idMateria'))
    if (!Number.isNaN(id)) materiaNombre.set(id, String(pick(m, 'nombre_materia', 'nombreMateria') ?? `Materia ${id}`))
  }
  const acumPorMateria = new Map<number, { suma: number; n: number }>()
  for (const nt of notas) {
    const idm = Number(pick(nt, 'id_materia', 'idMateria'))
    const val = Number(pick(nt, 'nota'))
    if (!idm || Number.isNaN(idm) || Number.isNaN(val)) continue
    const acc = acumPorMateria.get(idm) ?? { suma: 0, n: 0 }
    acc.suma += val
    acc.n += 1
    acumPorMateria.set(idm, acc)
  }
  const promedioPorMateria = [...acumPorMateria.entries()]
    .map(([idm, { suma, n }]) => ({
      materia: materiaNombre.get(idm) ?? `Materia ${idm}`,
      promedio: Number((suma / n).toFixed(2)),
    }))
    .sort((a, b) => a.materia.localeCompare(b.materia, 'es'))

  return {
    totalEstudiantes:      estudiantes.length,
    totalProfesores:       profesores.length,
    totalCursos:           cursos.length,
    promedioGeneral,
    tasaAprobacion,
    porcentajeAsistencia,
    totalNovedadesActivas,
    estudiantesPorCurso,
    usuariosPorRol,
    promedioPorMateria,
  }
}

export async function getPromedioGeneralAction(): Promise<number> {
  const d = await getAdminDashboard()
  return d?.promedioGeneral ?? 0
}

export async function getAprobacionAction(): Promise<number> {
  const d = await getAdminDashboard()
  return d?.tasaAprobacion ?? 0
}

export async function getEstudiantesActivosAction(): Promise<number> {
  const d = await getAdminDashboard()
  return d?.totalEstudiantes ?? 0
}

export async function getAsistenciaPromedioAction(): Promise<number> {
  const d = await getAdminDashboard()
  return d?.porcentajeAsistencia ?? 0
}

export async function getNotasPorPeriodoAction(): Promise<{ periodo: string; promedio: number }[]> {
  // Returns empty until a dedicated endpoint is added to the backend
  return []
}

export async function getDistribucionUsuariosAction(): Promise<{ name: string; value: number }[]> {
  // Returns empty until a dedicated endpoint is added to the backend
  return []
}
