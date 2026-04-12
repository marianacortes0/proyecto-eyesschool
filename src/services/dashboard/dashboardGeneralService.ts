import { createClient } from "@/services/supabase/client"
import type {
  EstudianteDashboardData,
  ProfesorDashboardData,
  DashboardData
} from "@/types/dashboard"

const supabase = createClient()

export async function getDashboardData(
  rol: string
): Promise<DashboardData | null> {
  switch (rol) {
    case "profesor":
    case "docente":
      return await getProfesorData()

    case "estudiante":
      return await getEstudianteData()

    case "padre":
      return await getPadreData()

    default:
      return null
  }
}

// ================= ESTUDIANTE =================

async function getEstudianteData(): Promise<EstudianteDashboardData> {
  const { data: userId } = await supabase.rpc("get_my_idusuario")

  if (!userId) {
    return { promedio: 0, asistencia: 0, novedades: 0 }
  }

  const { data: estudiante } = await supabase
    .from("estudiantes")
    .select("idEstudiante")
    .eq("idUsuario", userId)
    .single()

  if (!estudiante?.idEstudiante) {
    return { promedio: 0, asistencia: 0, novedades: 0 }
  }

  const idEstudiante = estudiante.idEstudiante

  const { data: promedio } = await supabase
    .from("promedio_por_estudiante")
    .select("promedio")
    .eq("idEstudiante", idEstudiante)
    .single()

  const { data: asistencia } = await supabase
    .from("asistencia_por_estudiante")
    .select("porcentaje_asistencia")
    .eq("idEstudiante", idEstudiante)
    .single()

  const { data: novedades } = await supabase
    .from("novedades_por_estudiante")
    .select("total_novedades")
    .eq("idEstudiante", idEstudiante)
    .single()

  return {
    promedio: promedio?.promedio ?? 0,
    asistencia: asistencia?.porcentaje_asistencia ?? 0,
    novedades: novedades?.total_novedades ?? 0,
  }
}

// ================= PROFESOR =================

async function getProfesorData(): Promise<ProfesorDashboardData> {
  const { data: userId } = await supabase.rpc("get_my_idusuario")

  if (!userId) {
    return { totalEstudiantes: 0 }
  }

  const { data: profesor } = await supabase
    .from("profesores")
    .select("idProfesor")
    .eq("idUsuario", userId)
    .single()

  if (!profesor?.idProfesor) {
    return { totalEstudiantes: 0 }
  }

  const idProfesor = profesor.idProfesor

  const { data: asignaciones } = await supabase
    .from("asignaciones")
    .select("idCurso")
    .eq("idProfesor", idProfesor)

  const cursos = asignaciones?.map(a => a.idCurso) || []

  if (cursos.length === 0) {
    return { totalEstudiantes: 0 }
  }

  const { data: estudiantes } = await supabase
    .from("estudiantes")
    .select("idEstudiante")
    .in("idCursoActual", cursos)

  return {
    totalEstudiantes: estudiantes?.length ?? 0,
  }
}

// ================= PADRE =================

async function getPadreData(): Promise<EstudianteDashboardData> {
  const { data: userId } = await supabase.rpc("get_my_idusuario")

  if (!userId) {
    return { promedio: 0, asistencia: 0, novedades: 0 }
  }

  const { data: padre } = await supabase
    .from("padres")
    .select("idEstudiante")
    .eq("idUsuario", userId)
    .single()

  if (!padre?.idEstudiante) {
    return { promedio: 0, asistencia: 0, novedades: 0 }
  }

  const idEstudiante = padre.idEstudiante

  const { data: promedio } = await supabase
    .from("promedio_por_estudiante")
    .select("promedio")
    .eq("idEstudiante", idEstudiante)
    .single()

  const { data: asistencia } = await supabase
    .from("asistencia_por_estudiante")
    .select("porcentaje_asistencia")
    .eq("idEstudiante", idEstudiante)
    .single()

  const { data: novedades } = await supabase
    .from("novedades_por_estudiante")
    .select("total_novedades")
    .eq("idEstudiante", idEstudiante)
    .single()

  return {
    promedio: promedio?.promedio ?? 0,
    asistencia: asistencia?.porcentaje_asistencia ?? 0,
    novedades: novedades?.total_novedades ?? 0,
  }
}