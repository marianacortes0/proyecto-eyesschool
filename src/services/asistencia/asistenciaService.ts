import { createClient } from '../supabase/client'

// ── Tipos ─────────────────────────────────────────────────────────────────────

export type EstadoAsistencia = 'Presente' | 'Ausente' | 'Tarde' | 'Excusa' | 'Suspensión'

export type RegistroAsistencia = {
  idAsistencia: number
  idEstudiante: number
  estado: EstadoAsistencia
  fecha: string
  fechaRegistro: string
  observacion: string | null
  registradoPor: number
  nombreEstudiante: string
  codigoEstudiante: string
  curso: string | null
  codigo_qr: string | null
  tipo: string | null
}

export type EstudianteSelector = {
  idEstudiante: number
  codigoEstudiante: string
  nombreCompleto: string
  curso: string | null
  jornada: string | null
}

export type TipoAsistencia = 'entrada' | 'salida'

export type CreateRegistroData = {
  idEstudiante: number
  estado: EstadoAsistencia
  fecha: string
  observacion?: string | null
  registradoPor: number
  tipo: TipoAsistencia
}

export type UpdateRegistroData = {
  estado?: EstadoAsistencia
  fecha?: string
  observacion?: string | null
  tipo?: TipoAsistencia
}

export type FiltrosAsistencia = {
  fecha?: string
  estado?: EstadoAsistencia | 'todos'
  search?: string
  idEstudiante?: number
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildNombre(u: {
  primerNombre: string
  primerApellido: string
  segundoNombre: string | null
  segundoApellido: string | null
} | null): string {
  if (!u) return '—'
  return [u.primerNombre, u.segundoNombre, u.primerApellido, u.segundoApellido]
    .filter(Boolean)
    .join(' ')
}

// ── Queries ───────────────────────────────────────────────────────────────────

export const getRegistros = async (
  filtros: FiltrosAsistencia = {}
): Promise<RegistroAsistencia[]> => {
  const supabase = createClient()

  let query = supabase
    .from('Asistencia')
    .select(`
      idAsistencia, idEstudiante, estado,
      fecha, fechaRegistro, observacion, registradoPor,
      codigo_qr, tipo,
      estudiantes!fk_asistencia_estudiante (
        codigoEstudiante,
        usuario!fk_estudiantes_usuario (
          primerNombre, primerApellido, segundoNombre, segundoApellido
        ),
        cursos!fk_estudiantes_curso ( nombreCurso )
      )
    `)
    .order('fecha',         { ascending: false })
    .order('fechaRegistro', { ascending: false })
    .limit(200)

  if (filtros.idEstudiante) query = query.eq('idEstudiante', filtros.idEstudiante)
  if (filtros.fecha)  query = query.eq('fecha',  filtros.fecha)
  if (filtros.estado && filtros.estado !== 'todos')
    query = query.eq('estado', filtros.estado)

  const { data, error } = await query
  if (error) throw new Error(error.message)
  if (!data)  return []

  const resultado: RegistroAsistencia[] = data.map((r) => {
    const est = r.estudiantes as {
      codigoEstudiante: string
      usuario: Parameters<typeof buildNombre>[0]
      cursos: { nombreCurso: string } | null
    } | null

    return {
      idAsistencia:     r.idAsistencia,
      idEstudiante:     r.idEstudiante,
      estado:           r.estado as EstadoAsistencia,
      fecha:            r.fecha,
      fechaRegistro:    r.fechaRegistro,
      observacion:      r.observacion,
      registradoPor:    r.registradoPor,
      nombreEstudiante: buildNombre(est?.usuario ?? null),
      codigoEstudiante: est?.codigoEstudiante ?? '—',
      curso:            est?.cursos?.nombreCurso ?? null,
      codigo_qr:        (r as { codigo_qr?: string | null }).codigo_qr ?? null,
      tipo:             (r as { tipo?: string | null }).tipo ?? null,
    }
  })

  // Filtro de búsqueda por nombre (client-side sobre los primeros 200)
  if (filtros.search) {
    const q = filtros.search.toLowerCase()
    return resultado.filter(
      (r) =>
        r.nombreEstudiante.toLowerCase().includes(q) ||
        r.codigoEstudiante.toLowerCase().includes(q)
    )
  }

  return resultado
}

export const getEstudiantesSelector = async (): Promise<EstudianteSelector[]> => {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('estudiantes')
    .select(`
      idEstudiante,
      codigoEstudiante,
      usuario!fk_estudiantes_usuario (
        primerNombre, primerApellido, segundoNombre, segundoApellido
      ),
      cursos!fk_estudiantes_curso ( nombreCurso, jornada )
    `)
    .order('idEstudiante', { ascending: true })

  if (error) throw new Error(error.message)
  if (!data)  return []

  return data.map((e) => ({
    idEstudiante:     e.idEstudiante,
    codigoEstudiante: e.codigoEstudiante,
    nombreCompleto:   buildNombre(e.usuario as Parameters<typeof buildNombre>[0]),
    curso:            (e.cursos as { nombreCurso: string; jornada: string } | null)?.nombreCurso ?? null,
    jornada:          (e.cursos as { nombreCurso: string; jornada: string } | null)?.jornada ?? null,
  }))
}

export const crearRegistro = async (data: CreateRegistroData): Promise<void> => {
  const supabase = createClient()

  const { error } = await supabase.from('Asistencia').insert({
    idEstudiante:  data.idEstudiante,
    estado:        data.estado,
    fecha:         data.fecha,
    observacion:   data.observacion ?? null,
    registradoPor: data.registradoPor,
    activo:        true,
  })

  if (error) throw new Error(error.message)
}

export const actualizarRegistro = async (
  id: number,
  data: UpdateRegistroData
): Promise<void> => {
  const supabase = createClient()
  const { error } = await supabase.from('Asistencia').update(data).eq('idAsistencia', id)
  if (error) throw new Error(error.message)
}

export const eliminarRegistro = async (id: number): Promise<void> => {
  const supabase = createClient()
  const { error } = await supabase.from('Asistencia').delete().eq('idAsistencia', id)
  if (error) throw new Error(error.message)
}
