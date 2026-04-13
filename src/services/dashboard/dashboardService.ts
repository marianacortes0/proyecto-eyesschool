import { createClient } from "../supabase/client";

// PROMEDIO
export const getPromedioGeneral = async () => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("notas")
    .select("nota");

  console.log("[notas]", { data, error });

  if (error) throw error;
  if (!data || data.length === 0) return 0;

  const promedio =
    data.reduce((acc: number, curr: any) => acc + curr.nota, 0) / data.length;

  return Number(promedio.toFixed(2));
};

// APROBACIÓN
export const getAprobacion = async () => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("notas")
    .select("nota");

  if (error) throw error;
  if (!data || data.length === 0) return 0;

  const aprobados = data.filter((n: any) => n.nota >= 3);

  return Math.round((aprobados.length / data.length) * 100);
};

// ESTUDIANTES
export const getEstudiantesActivos = async () => {
  const supabase = createClient();

  // El RLS o la falta de un campo count a veces causa problemas si no está soportado así,
  // pero mantendremos este query porque parece válido para supabase.
  const { count, error } = await supabase
    .from("estudiantes")
    .select("*", { count: "exact", head: true });

  console.log("[estudiantes]", { count, error })

  if (error) throw error;

  return count ?? 0; //
};

// ASISTENCIA
export const getAsistenciaPromedio = async () => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("Asistencia") //
    .select("estado"); //

  if (error) throw error;
  if (!data || data.length === 0) return 0;

  // 🔴 CAMBIO: lógica según tus valores reales
  const asistencias = data.filter(
    (a: any) => a.estado === "Presente" || a.estado === "Tarde"
  );

  return Math.round((asistencias.length / data.length) * 100);
};

// GRÁFICA
export const getNotasPorPeriodo = async () => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("notas")
    .select("idPeriodo, nota");

  if (error) throw error;
  if (!data || data.length === 0) return [];

  const grouped: Record<number, number[]> = {};

  data.forEach((item: any) => {
    if (!grouped[item.idPeriodo]) {
      grouped[item.idPeriodo] = [];
    }
    grouped[item.idPeriodo].push(item.nota);
  });

  return Object.keys(grouped).map((periodo) => {
    const notas = grouped[Number(periodo)];
    const promedio =
      notas.reduce((a: number, b: number) => a + Number(b), 0) / notas.length;
    return {
      periodo,
      promedio: Number(promedio.toFixed(2)),
    };
  });
};

// ─── Helpers internos ─────────────────────────────────────────────────────────

async function resolveIdUsuario(): Promise<number | null> {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const authId = session?.user?.id
  if (!authId) return null
  const { data } = await supabase
    .from('usuario')
    .select('idUsuario')
    .eq('auth_id', authId)
    .maybeSingle()
  return data?.idUsuario ?? null
}

function getDiaActual(): string {
  const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  return dias[new Date().getDay()]
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

function calcPromedio(notas: { nota: number }[]) {
  if (!notas.length) return 0
  return Number((notas.reduce((s, n) => s + n.nota, 0) / notas.length).toFixed(2))
}

function calcAprobacion(notas: { nota: number }[]) {
  if (!notas.length) return 0
  return Math.round(notas.filter(n => n.nota >= 3).length / notas.length * 100)
}

// ─── Tipos públicos ───────────────────────────────────────────────────────────

export type HorarioHoy = {
  idHorario: number
  horaInicio: string
  horaFin: string
  salon: string
  nombreMateria: string
  nombreCurso: string
}

export type TopEstudiante = {
  idEstudiante: number
  nombre: string
  codigoEstudiante: string
  promedio: number
}

export type DocenteStats = {
  promedioNotas: number
  aprobacion: number
  estudiantesCount: number
  novedadesPendientes: number
  notasPorPeriodo: { periodo: string; promedio: number }[]
  horariosHoy: HorarioHoy[]
  topEstudiantes: TopEstudiante[]
}

export type NotaMateria = {
  idMateria: number
  nombreMateria: string
  promedio: number
}

export type NovedadResumen = {
  idNovedad: number
  descripcion: string
  estado: string
  fecha: string
  nombreTipo: string
}

export type EstudianteStats = {
  promedioGeneral: number
  aprobacion: number
  porcentajeAsistencia: number
  totalAsistencias: number
  novedadesActivas: number
  notasPorMateria: NotaMateria[]
  notasPorPeriodo: { periodo: string; promedio: number }[]
  asistenciaEstados: { estado: string; cantidad: number }[]
  novedadesRecientes: NovedadResumen[]
}

export type HijoStats = {
  idEstudiante: number
  nombreCompleto: string
  codigoEstudiante: string
  curso: string
  promedioGeneral: number
  aprobacion: number
  porcentajeAsistencia: number
  novedadesActivas: number
  notasPorMateria: NotaMateria[]
  notasPorPeriodo: { periodo: string; promedio: number }[]
  novedadesRecientes: NovedadResumen[]
}

export type PadreStats = {
  hijos: HijoStats[]
}

// ─── DASHBOARD DOCENTE ────────────────────────────────────────────────────────

export const getDashboardDocente = async (db?: AnySupabaseClient): Promise<DocenteStats> => {
  const supabase = db ?? createClient()

  const idUsuario = await resolveIdUsuario()
  if (!idUsuario) return emptyDocenteStats()

  const { data: profRow } = await supabase
    .from('profesores')
    .select('idProfesor')
    .eq('idUsuario', idUsuario)
    .maybeSingle()
  if (!profRow) return emptyDocenteStats()
  const idProfesor = profRow.idProfesor

  const [asigRes, phRes] = await Promise.all([
    supabase.from('asignaciones').select('idCurso, idMateria').eq('idProfesor', idProfesor).eq('activo', true),
    supabase.from('profesores_horario').select('idHorario').eq('idProfesor', idProfesor).eq('activo', true),
  ])

  const idMaterias = [...new Set((asigRes.data ?? []).map((a: any) => a.idMateria))]
  const idCursos   = [...new Set((asigRes.data ?? []).map((a: any) => a.idCurso))]
  const idHorarios = (phRes.data ?? []).map((r: any) => r.idHorario)

  const [notasRes, estudiantesRes, novedadesRes, horariosRes] = await Promise.all([
    idMaterias.length > 0
      ? supabase.from('notas').select('nota, idPeriodo, idEstudiante').in('idMateria', idMaterias)
      : Promise.resolve({ data: [] as { nota: number; idPeriodo: number; idEstudiante: number }[] }),
    idCursos.length > 0
      ? supabase.from('estudiantes').select('idEstudiante', { count: 'exact', head: true }).in('idCursoActual', idCursos).eq('estado', 'Activo')
      : Promise.resolve({ count: 0, data: null }),
    supabase.from('novedades').select('idNovedad', { count: 'exact', head: true }).eq('estado', 'Pendiente'),
    idHorarios.length > 0
      ? supabase.from('Horario')
          .select('idHorario, horaInicio, horaFin, salon, materias(nombreMateria), cursos(nombreCurso)')
          .in('idHorario', idHorarios)
          .eq('dia', getDiaActual())
      : Promise.resolve({ data: [] }),
  ])

  const notas = (notasRes.data ?? []) as { nota: number; idPeriodo: number; idEstudiante: number }[]

  // Top estudiantes — group by student
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
    const topIds = rawTop.map(s => s.idEstudiante)
    const { data: estInfo } = await supabase
      .from('estudiantes')
      .select('idEstudiante, codigoEstudiante, usuario!fk_estudiantes_usuario(primerNombre, primerApellido)')
      .in('idEstudiante', topIds)
    const infoMap: Record<number, any> = {}
    ;(estInfo ?? []).forEach((e: any) => { infoMap[e.idEstudiante] = e })
    topEstudiantes = rawTop.map(s => {
      const info = infoMap[s.idEstudiante]
      return {
        idEstudiante: s.idEstudiante,
        nombre: info?.usuario
          ? `${info.usuario.primerNombre} ${info.usuario.primerApellido}`
          : `Estudiante #${s.idEstudiante}`,
        codigoEstudiante: info?.codigoEstudiante ?? '—',
        promedio: s.promedio,
      }
    })
  }

  const horariosHoy = ((horariosRes.data ?? []) as any[])
    .map(h => ({
      idHorario: h.idHorario,
      horaInicio: h.horaInicio,
      horaFin: h.horaFin,
      salon: h.salon,
      nombreMateria: h.materias?.nombreMateria ?? '—',
      nombreCurso: h.cursos?.nombreCurso ?? '—',
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

/**
 * Versión server-side de getDashboardDocente.
 * Usar ÚNICAMENTE desde Server Components o Server Actions.
 */
export async function getDashboardDocenteServer(
  db: AnySupabaseClient,
  authId: string,
): Promise<DocenteStats> {
  // 1. Resolver idUsuario usando el client provisto
  const { data: usuarioRow } = await db
    .from('usuario')
    .select('idUsuario')
    .eq('auth_id', authId)
    .maybeSingle()

  if (!usuarioRow) return emptyDocenteStats()
  
  // Ahora podemos llamar a la lógica original pasando el client
  // Nota: getDashboardDocente por defecto usa resolveIdUsuario() que busca session.
  // Aquí necesitamos pasar el idUsuario ya resuelto o inyectar la lógica.
  // Para simplificar, duplicaremos la lógica o la refactorizaremos ligeramente.
  
  const idUsuario = usuarioRow.idUsuario
  const { data: profRow } = await db
    .from('profesores')
    .select('idProfesor')
    .eq('idUsuario', idUsuario)
    .maybeSingle()

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
    const topIds = rawTop.map(s => s.idEstudiante)
    const { data: estInfo } = await db
      .from('estudiantes')
      .select('idEstudiante, codigoEstudiante, usuario!fk_estudiantes_usuario(primerNombre, primerApellido)')
      .in('idEstudiante', topIds)
    const infoMap: Record<number, any> = {}
    ;(estInfo ?? []).forEach((e: any) => { infoMap[e.idEstudiante] = e })
    topEstudiantes = rawTop.map(s => {
      const info = infoMap[s.idEstudiante]
      return {
        idEstudiante: s.idEstudiante,
        nombre: info?.usuario
          ? `${info.usuario.primerNombre} ${info.usuario.primerApellido}`
          : `Estudiante #${s.idEstudiante}`,
        codigoEstudiante: info?.codigoEstudiante ?? '—',
        promedio: s.promedio,
      }
    })
  }

  const horariosHoy = ((horariosRes.data ?? []) as any[])
    .map(h => ({
      idHorario: h.idHorario,
      horaInicio: h.horaInicio,
      horaFin: h.horaFin,
      salon: h.salon,
      nombreMateria: h.materias?.nombreMateria ?? '—',
      nombreCurso: h.cursos?.nombreCurso ?? '—',
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

// ─── DASHBOARD ESTUDIANTE ─────────────────────────────────────────────────────

export const getDashboardEstudiante = async (db?: AnySupabaseClient): Promise<EstudianteStats> => {
  const supabase = db ?? createClient()

  const idUsuario = await resolveIdUsuario()
  if (!idUsuario) return emptyEstudianteStats()

  const { data: estRow } = await supabase
    .from('estudiantes')
    .select('idEstudiante')
    .eq('idUsuario', idUsuario)
    .maybeSingle()
  if (!estRow) return emptyEstudianteStats()
  const idEstudiante = estRow.idEstudiante

  const [notasRes, asistenciaRes, novedadesRes] = await Promise.all([
    supabase.from('notas')
      .select('nota, idPeriodo, idMateria, materias(nombreMateria)')
      .eq('idEstudiante', idEstudiante),
    supabase.from('Asistencia')
      .select('estado')
      .eq('idEstudiante', idEstudiante),
    supabase.from('novedades')
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
  const asistenciaEstados = Object.entries(estadoMap).map(([estado, cantidad]) => ({ estado, cantidad }))

  const materiaMap: Record<number, { nombre: string; ns: number[] }> = {}
  notas.forEach((n: any) => {
    if (!materiaMap[n.idMateria]) materiaMap[n.idMateria] = { nombre: n.materias?.nombreMateria ?? `Materia ${n.idMateria}`, ns: [] }
    materiaMap[n.idMateria].ns.push(n.nota)
  })
  const notasPorMateria: NotaMateria[] = Object.entries(materiaMap)
    .map(([id, { nombre, ns }]) => ({
      idMateria: Number(id),
      nombreMateria: nombre,
      promedio: Number((ns.reduce((a, b) => a + b, 0) / ns.length).toFixed(2)),
    }))
    .sort((a, b) => b.promedio - a.promedio)

  return {
    promedioGeneral:     calcPromedio(notas),
    aprobacion:          calcAprobacion(notas),
    porcentajeAsistencia: pctAsistencia,
    totalAsistencias:    asistencias.length,
    novedadesActivas:    novedades.filter(n => n.estado !== 'Cerrada' && n.estado !== 'Resuelta').length,
    notasPorMateria,
    notasPorPeriodo:     groupNotasByPeriodo(notas),
    asistenciaEstados,
    novedadesRecientes:  novedades.map((n: any) => ({
      idNovedad:   n.idNovedad,
      descripcion: n.descripcion,
      estado:      n.estado,
      fecha:       n.fecha,
      nombreTipo:  n.tiposnovedad?.nombreTipo ?? '—',
    })),
  }
}

/**
 * Versión server-side de getDashboardEstudiante.
 * Usar ÚNICAMENTE desde Server Components o Server Actions.
 */
export async function getDashboardEstudianteServer(
  db: AnySupabaseClient,
  authId: string,
): Promise<EstudianteStats> {
  const { data: usuarioRow } = await db
    .from('usuario')
    .select('idUsuario')
    .eq('auth_id', authId)
    .maybeSingle()

  if (!usuarioRow) return emptyEstudianteStats()
  const idUsuario = usuarioRow.idUsuario

  const { data: estRow } = await db
    .from('estudiantes')
    .select('idEstudiante')
    .eq('idUsuario', idUsuario)
    .maybeSingle()
  
  if (!estRow) return emptyEstudianteStats()
  const idEstudiante = estRow.idEstudiante

  const [notasRes, asistenciaRes, novedadesRes] = await Promise.all([
    db.from('notas')
      .select('nota, idPeriodo, idMateria, materias(nombreMateria)')
      .eq('idEstudiante', idEstudiante),
    db.from('Asistencia')
      .select('estado')
      .eq('idEstudiante', idEstudiante),
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
  const asistenciaEstados = Object.entries(estadoMap).map(([estado, cantidad]) => ({ estado, cantidad }))

  const materiaMap: Record<number, { nombre: string; ns: number[] }> = {}
  notas.forEach((n: any) => {
    if (!materiaMap[n.idMateria]) materiaMap[n.idMateria] = { nombre: n.materias?.nombreMateria ?? `Materia ${n.idMateria}`, ns: [] }
    materiaMap[n.idMateria].ns.push(n.nota)
  })
  const notasPorMateria: NotaMateria[] = Object.entries(materiaMap)
    .map(([id, { nombre, ns }]) => ({
      idMateria: Number(id),
      nombreMateria: nombre,
      promedio: Number((ns.reduce((a, b) => a + b, 0) / ns.length).toFixed(2)),
    }))
    .sort((a, b) => b.promedio - a.promedio)

  return {
    promedioGeneral:     calcPromedio(notas),
    aprobacion:          calcAprobacion(notas),
    porcentajeAsistencia: pctAsistencia,
    totalAsistencias:    asistencias.length,
    novedadesActivas:    novedades.filter(n => n.estado !== 'Cerrada' && n.estado !== 'Resuelta').length,
    notasPorMateria,
    notasPorPeriodo:     groupNotasByPeriodo(notas),
    asistenciaEstados,
    novedadesRecientes:  novedades.map((n: any) => ({
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

// ─── DASHBOARD PADRE ──────────────────────────────────────────────────────────

type AnySupabaseClient = ReturnType<typeof createClient> | any

async function buildHijoStats(
  idEstudiante: number,
  nombre: string,
  codigoEstudiante: string,
  curso: string,
  db?: AnySupabaseClient,
): Promise<HijoStats> {
  const supabase = db ?? createClient()

  const [notasRes, asistenciaRes, novedadesRes] = await Promise.all([
    supabase.from('notas').select('nota, idPeriodo, idMateria, materias(nombreMateria)').eq('idEstudiante', idEstudiante),
    supabase.from('Asistencia').select('estado').eq('idEstudiante', idEstudiante),
    supabase.from('novedades')
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
    nombreCompleto:      nombre,
    codigoEstudiante,
    curso,
    promedioGeneral:     calcPromedio(notas),
    aprobacion:          calcAprobacion(notas),
    porcentajeAsistencia: pctAsistencia,
    novedadesActivas:    novedades.filter(n => n.estado !== 'Cerrada' && n.estado !== 'Resuelta').length,
    notasPorMateria:     Object.entries(materiaMap).map(([id, { nombre, ns }]) => ({
      idMateria:     Number(id),
      nombreMateria: nombre,
      promedio:      Number((ns.reduce((a, b) => a + b, 0) / ns.length).toFixed(2)),
    })).sort((a, b) => b.promedio - a.promedio),
    notasPorPeriodo:     groupNotasByPeriodo(notas),
    novedadesRecientes:  novedades.map((n: any) => ({
      idNovedad:   n.idNovedad,
      descripcion: n.descripcion,
      estado:      n.estado,
      fecha:       n.fecha,
      nombreTipo:  n.tiposnovedad?.nombreTipo ?? '—',
    })),
  }
}

export const getDashboardPadre = async (): Promise<PadreStats> => {
  const supabase = createClient()

  const idUsuario = await resolveIdUsuario()
  if (!idUsuario) return { hijos: [] }

  const { data: padreRows } = await supabase
    .from('padres')
    .select('idEstudiante')
    .eq('idUsuario', idUsuario)
  if (!padreRows || padreRows.length === 0) return { hijos: [] }

  const idEstudiantes = padreRows.map((p: any) => p.idEstudiante)
  const { data: estudiantesRows } = await supabase
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
      return buildHijoStats(e.idEstudiante, nombre, e.codigoEstudiante ?? '—', e.cursos?.nombreCurso ?? '—')
    })
  )

  return { hijos }
}

/**
 * Versión server-side de getDashboardPadre.
 * Recibe un admin client (sin RLS) y el auth_id del usuario logueado.
 * Usar ÚNICAMENTE desde Server Components o Server Actions.
 */
export async function getDashboardPadreServer(
  db: AnySupabaseClient,
  authId: string,
): Promise<PadreStats> {
  // 1. Resolver idUsuario usando el admin client
  const { data: usuarioRow } = await db
    .from('usuario')
    .select('idUsuario')
    .eq('auth_id', authId)
    .maybeSingle()

  if (!usuarioRow) return { hijos: [] }
  const idUsuario = usuarioRow.idUsuario

  // 2. Buscar filas en padres (tabla con RLS que bloqueaba al browser client)
  const { data: padreRows } = await db
    .from('padres')
    .select('idEstudiante')
    .eq('idUsuario', idUsuario)

  if (!padreRows || padreRows.length === 0) return { hijos: [] }

  // 3. Datos de los estudiantes hijos
  const idEstudiantes = padreRows.map((p: any) => p.idEstudiante)
  const { data: estudiantesRows } = await db
    .from('estudiantes')
    .select(`
      idEstudiante, codigoEstudiante,
      usuario!fk_estudiantes_usuario ( primerNombre, primerApellido, segundoNombre, segundoApellido ),
      cursos!fk_estudiantes_curso ( nombreCurso )
    `)
    .in('idEstudiante', idEstudiantes)

  // 4. Construir stats de cada hijo usando el mismo admin client
  const hijos = await Promise.all(
    (estudiantesRows ?? []).map(async (e: any) => {
      const u = e.usuario
      const nombre = u
        ? [u.primerNombre, u.segundoNombre, u.primerApellido, u.segundoApellido].filter(Boolean).join(' ')
        : `Estudiante #${e.idEstudiante}`
      return buildHijoStats(e.idEstudiante, nombre, e.codigoEstudiante ?? '—', e.cursos?.nombreCurso ?? '—', db)
    })
  )

  return { hijos }
}