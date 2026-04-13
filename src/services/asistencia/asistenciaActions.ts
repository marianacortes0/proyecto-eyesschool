'use server'

import { createAdminClient } from '../supabase/admin'
import { revalidatePath } from 'next/cache'
import {
  type CreateRegistroData,
  type RegistroAsistencia,
  type EstudianteSelector,
  type FiltrosAsistencia,
  type EstadoAsistencia,
  type TipoAsistencia,
} from './asistenciaService'

// ── Helpers ──────────────────────────────────────────────────────────────────

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

/**
 * Registra asistencia usando el Admin Client para bypass de RLS.
 * Útil para roles (como profesores) que tienen restricciones de inserción directa.
 */
export async function crearRegistroAction(data: CreateRegistroData) {
  const supabase = createAdminClient()

  // Verificar duplicado: mismo estudiante, misma fecha, mismo tipo
  const { data: existing, error: checkError } = await supabase
    .from('Asistencia')
    .select('idAsistencia')
    .eq('idEstudiante', data.idEstudiante)
    .eq('fecha', data.fecha)
    .eq('tipo', data.tipo)
    .maybeSingle()

  if (checkError) throw new Error(checkError.message)
  if (existing) {
    throw new Error(`Ya existe un registro de ${data.tipo} para este estudiante en esta fecha.`)
  }

  const { error } = await supabase.from('Asistencia').insert({
    idEstudiante:  data.idEstudiante,
    estado:        data.estado,
    fecha:         data.fecha,
    observacion:   data.observacion ?? null,
    registradoPor: data.registradoPor,
    activo:        true,
    tipo:          data.tipo,
  })

  if (error) {
    console.error('Error en crearRegistroAction:', error)
    throw new Error(error.message)
  }

  revalidatePath('/qr/escanear')
  revalidatePath('/asistencia')
}

/**
 * Obtiene registros de asistencia usando el Admin Client (bypass RLS).
 */
export async function getRegistrosAction(
  filtros: FiltrosAsistencia = {}
): Promise<RegistroAsistencia[]> {
  const supabase = createAdminClient()

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

/**
 * Obtiene estudiantes para el selector (bypass RLS).
 */
export async function getEstudiantesSelectorAction(): Promise<EstudianteSelector[]> {
  const supabase = createAdminClient()

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
