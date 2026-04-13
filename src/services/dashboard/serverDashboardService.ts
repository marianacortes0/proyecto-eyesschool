/**
 * Server-only dashboard service — uses the admin client to bypass RLS.
 * Call ONLY from Server Components / Server Actions.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  DocenteStats,
  EstudianteStats,
  PadreStats,
  HijoStats,
  NotaMateria,
  NovedadResumen,
  HorarioHoy,
  TopEstudiante,
} from './dashboardService'

// ── Helpers internos ──────────────────────────────────────────────────────────

function getDiaActual(): string {
  const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  return dias[new Date().getDay()]
}

function calcPromedio(notas: { nota: number }[]) {
  if (!notas.length) return 0
  return Number((notas.reduce((s, n) => s + n.nota, 0) / notas.length).toFixed(2))
}

function calcAprobacion(notas: { nota: number }[]) {
  if (!notas.length) return 0
  return Math.round(notas.filter(n => n.nota >= 3).length / notas.length * 100)
}

function groupNotasByPeriodo(notas: { nota: number; idPeriodo: number }[]) {
  const map: Record<number, number[]> = {}
  notas.forEach(n => {
    if (!map[n.idPeriodo]) map[n.idPeriodo] = []
    map[n.idPeriodo].push(n.nota)
  })
  return Object.keys(map).sort().map(p => ({
    periodo: `Periodo ${p}`,
    promedio: Number((map[Number(p)].reduce((a, b) => a + b, 0) / map[Number(p)].length).toFixed(2)),
  }))
}

// ── DOCENTE ───────────────────────────────────────────────────────────────────

export async function fetchDocenteStats(db: SupabaseClient, idUsuario: number): Promise<DocenteStats> {
  const { data: profRow } = await db.from('profesores').select('idProfesor').eq('idUsuario', idUsuario).maybeSingle()
  if (!profRow) return emptyDocenteStats()
  const idProfesor = profRow.idProfesor

  const [asigRes, phRes] = await Promise.all([
    db.from('asignaciones').select('idCurso, idMateria').eq('idProfesor', idProfesor).eq('activo', true),
    db.from('profesores_horario').select('idHorario').eq('idProfesor', idProfesor).eq('activo', true),
  ])

  const idMaterias = [...new Set((asigRes.data ?? []).map((a: any) => a.idMateria))]
  const idCursos   = [...new Set((asigRes.data ?? []).map((a: any) => a.idCurso))]
  const idHorarios = (phRes.data ?? []).map((r: any) => r.idHorario)

  const [notasRes, estudiantesRes, novedadesRes, horariosRes] = await Promise.all([
    idMaterias.length > 0
      ? db.from('notas').select('nota, idPeriodo, idEstudiante').in('idMateria', idMaterias)
      : Promise.resolve({ data: [] as { nota: number; idPeriodo: number; idEstudiante: number }[] }),
    idCursos.length > 0
      ? db.from('estudiantes').select('idEstudiante', { count: 'exact', head: true }).in('idCursoActual', idCursos).eq('estado', 'Activo')
      : Promise.resolve({ count: 0, data: null }),
    db.from('novedades').select('idNovedad', { count: 'exact', head: true }).eq('estado', 'Pendiente'),
    idHorarios.length > 0
      ? db.from('Horario')
          .select('idHorario, horaInicio, horaFin, salon, materias(nombreMateria), cursos(nombreCurso)')
          .in('idHorario', idHorarios)
          .eq('dia', getDiaActual())
      : Promise.resolve({ data: [] }),
  ])

  const notas = (notasRes.data ?? []) as { nota: number; idPeriodo: number; idEstudiante: number }[]

  // Top estudiantes
  const studentMap: Record<number, number[]> = {}
  notas.forEach(n => {
    if (!studentMap[n.idEstudiante]) studentMap[n.idEstudiante] = []
    studentMap[n.idEstudiante].push(n.nota)
  })
  const rawTop = Object.entries(studentMap)
    .map(([id, ns]) => ({ idEstudiante: Number(id), promedio: calcPromedio(ns.map(v => ({ nota: v }))) }))
    .sort((a, b) => b.promedio - a.promedio)
    .slice(0, 5)

  let topEstudiantes: TopEstudiante[] = []
  if (rawTop.length > 0) {
    const { data: estInfo } = await db
      .from('estudiantes')
      .select('idEstudiante, codigoEstudiante, usuario!fk_estudiantes_usuario(primerNombre, primerApellido)')
      .in('idEstudiante', rawTop.map(s => s.idEstudiante))
    const infoMap: Record<number, any> = {}
    ;(estInfo ?? []).forEach((e: any) => { infoMap[e.idEstudiante] = e })
    topEstudiantes = rawTop.map(s => {
      const info = infoMap[s.idEstudiante]
      return {
        idEstudiante: s.idEstudiante,
        nombre: info?.usuario ? `${info.usuario.primerNombre} ${info.usuario.primerApellido}` : `Estudiante #${s.idEstudiante}`,
        codigoEstudiante: info?.codigoEstudiante ?? '—',
        promedio: s.promedio,
      }
    })
  }

  const horariosHoy: HorarioHoy[] = ((horariosRes.data ?? []) as any[])
    .map(h => ({
      idHorario:     h.idHorario,
      horaInicio:    h.horaInicio,
      horaFin:       h.horaFin,
      salon:         h.salon,
      nombreMateria: h.materias?.nombreMateria ?? '—',
      nombreCurso:   h.cursos?.nombreCurso ?? '—',
    }))
    .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))

  return {
    promedioNotas:       calcPromedio(notas),
    aprobacion:          calcAprobacion(notas),
    estudiantesCount:    (estudiantesRes as any).count ?? 0,
    novedadesPendientes: (novedadesRes as any).count ?? 0,
    notasPorPeriodo:     groupNotasByPeriodo(notas),
    horariosHoy,
    topEstudiantes,
  }
}

function emptyDocenteStats(): DocenteStats {
  return { promedioNotas: 0, aprobacion: 0, estudiantesCount: 0, novedadesPendientes: 0, notasPorPeriodo: [], horariosHoy: [], topEstudiantes: [] }
}

// ── ESTUDIANTE ────────────────────────────────────────────────────────────────

export async function fetchEstudianteStats(db: SupabaseClient, idUsuario: number): Promise<EstudianteStats> {
  const { data: estRow } = await db.from('estudiantes').select('idEstudiante').eq('idUsuario', idUsuario).maybeSingle()
  if (!estRow) return emptyEstudianteStats()
  const idEstudiante = estRow.idEstudiante

  const [notasRes, asistenciaRes, novedadesRes] = await Promise.all([
    db.from('notas').select('nota, idPeriodo, idMateria, materias(nombreMateria)').eq('idEstudiante', idEstudiante),
    db.from('Asistencia').select('estado').eq('idEstudiante', idEstudiante),
    db.from('novedades')
      .select('idNovedad, descripcion, estado, fecha, tiposnovedad(nombreTipo)')
      .eq('idEstudiante', idEstudiante)
      .order('fecha', { ascending: false })
      .limit(5),
  ])

  const notas       = (notasRes.data ?? []) as any[]
  const asistencias = (asistenciaRes.data ?? []) as { estado: string }[]
  const novedades   = (novedadesRes.data ?? []) as any[]

  const presentes = asistencias.filter(a => a.estado === 'Presente' || a.estado === 'Tarde').length
  const pctAsistencia = asistencias.length > 0 ? Math.round(presentes / asistencias.length * 100) : 0

  const estadoMap: Record<string, number> = {}
  asistencias.forEach(a => { estadoMap[a.estado] = (estadoMap[a.estado] ?? 0) + 1 })

  const materiaMap: Record<number, { nombre: string; ns: number[] }> = {}
  notas.forEach((n: any) => {
    if (!materiaMap[n.idMateria]) materiaMap[n.idMateria] = { nombre: n.materias?.nombreMateria ?? `Materia ${n.idMateria}`, ns: [] }
    materiaMap[n.idMateria].ns.push(n.nota)
  })

  return {
    promedioGeneral:      calcPromedio(notas),
    aprobacion:           calcAprobacion(notas),
    porcentajeAsistencia: pctAsistencia,
    totalAsistencias:     asistencias.length,
    novedadesActivas:     novedades.filter((n: any) => n.estado !== 'Cerrada' && n.estado !== 'Resuelta').length,
    notasPorMateria:      Object.entries(materiaMap).map(([id, { nombre, ns }]) => ({
      idMateria:     Number(id),
      nombreMateria: nombre,
      promedio:      Number((ns.reduce((a, b) => a + b, 0) / ns.length).toFixed(2)),
    })).sort((a, b) => b.promedio - a.promedio),
    notasPorPeriodo:      groupNotasByPeriodo(notas),
    asistenciaEstados:    Object.entries(estadoMap).map(([estado, cantidad]) => ({ estado, cantidad })),
    novedadesRecientes:   novedades.map((n: any) => ({
      idNovedad:   n.idNovedad,
      descripcion: n.descripcion,
      estado:      n.estado,
      fecha:       n.fecha,
      nombreTipo:  n.tiposnovedad?.nombreTipo ?? '—',
    })),
  }
}

function emptyEstudianteStats(): EstudianteStats {
  return { promedioGeneral: 0, aprobacion: 0, porcentajeAsistencia: 0, totalAsistencias: 0, novedadesActivas: 0, notasPorMateria: [], notasPorPeriodo: [], asistenciaEstados: [], novedadesRecientes: [] }
}

// ── PADRE ─────────────────────────────────────────────────────────────────────

async function buildHijo(db: SupabaseClient, idEstudiante: number, nombre: string, codigoEstudiante: string, curso: string): Promise<HijoStats> {
  const [notasRes, asistenciaRes, novedadesRes] = await Promise.all([
    db.from('notas').select('nota, idPeriodo, idMateria, materias(nombreMateria)').eq('idEstudiante', idEstudiante),
    db.from('Asistencia').select('estado').eq('idEstudiante', idEstudiante),
    db.from('novedades')
      .select('idNovedad, descripcion, estado, fecha, tiposnovedad(nombreTipo)')
      .eq('idEstudiante', idEstudiante)
      .order('fecha', { ascending: false })
      .limit(5),
  ])

  const notas       = (notasRes.data ?? []) as any[]
  const asistencias = (asistenciaRes.data ?? []) as { estado: string }[]
  const novedades   = (novedadesRes.data ?? []) as any[]

  const presentes = asistencias.filter(a => a.estado === 'Presente' || a.estado === 'Tarde').length
  const pctAsistencia = asistencias.length > 0 ? Math.round(presentes / asistencias.length * 100) : 0

  const materiaMap: Record<number, { nombre: string; ns: number[] }> = {}
  notas.forEach((n: any) => {
    if (!materiaMap[n.idMateria]) materiaMap[n.idMateria] = { nombre: n.materias?.nombreMateria ?? `Materia ${n.idMateria}`, ns: [] }
    materiaMap[n.idMateria].ns.push(n.nota)
  })

  return {
    idEstudiante,
    nombreCompleto:       nombre,
    codigoEstudiante,
    curso,
    promedioGeneral:      calcPromedio(notas),
    aprobacion:           calcAprobacion(notas),
    porcentajeAsistencia: pctAsistencia,
    novedadesActivas:     novedades.filter((n: any) => n.estado !== 'Cerrada' && n.estado !== 'Resuelta').length,
    notasPorMateria:      Object.entries(materiaMap).map(([id, { nombre, ns }]) => ({
      idMateria:     Number(id),
      nombreMateria: nombre,
      promedio:      Number((ns.reduce((a, b) => a + b, 0) / ns.length).toFixed(2)),
    })).sort((a, b) => b.promedio - a.promedio),
    notasPorPeriodo:      groupNotasByPeriodo(notas),
    novedadesRecientes:   novedades.map((n: any) => ({
      idNovedad:   n.idNovedad,
      descripcion: n.descripcion,
      estado:      n.estado,
      fecha:       n.fecha,
      nombreTipo:  n.tiposnovedad?.nombreTipo ?? '—',
    })),
  }
}

export async function fetchPadreStats(db: SupabaseClient, idUsuario: number): Promise<PadreStats> {
  // padres es N:M — un padre puede tener varios hijos
  const { data: padreRows } = await db
    .from('padres')
    .select('idEstudiante')
    .eq('idUsuario', idUsuario)

  if (!padreRows || padreRows.length === 0) return { hijos: [] }

  const idEstudiantes = padreRows.map((p: any) => p.idEstudiante)

  const { data: estudiantesRows } = await db
    .from('estudiantes')
    .select(`
      idEstudiante, codigoEstudiante,
      usuario!fk_estudiantes_usuario ( primerNombre, primerApellido, segundoNombre, segundoApellido ),
      cursos!fk_estudiantes_curso ( nombreCurso )
    `)
    .in('idEstudiante', idEstudiantes)

  const hijos = await Promise.all(
    (estudiantesRows ?? []).map(async (e: any) => {
      const u = e.usuario
      const nombre = u
        ? [u.primerNombre, u.segundoNombre, u.primerApellido, u.segundoApellido].filter(Boolean).join(' ')
        : `Estudiante #${e.idEstudiante}`
      return buildHijo(db, e.idEstudiante, nombre, e.codigoEstudiante ?? '—', e.cursos?.nombreCurso ?? '—')
    })
  )

  return { hijos }
}
