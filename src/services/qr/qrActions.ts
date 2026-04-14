'use server'

import { createAdminClient } from '../supabase/admin'
import type {
  RegistroAsistencia,
  EstudianteQR,
  CodigoQRConEstudiante,
  CreateAsistenciaData,
  TipoQR,
} from './qrService'

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

// ── Registros de asistencia (bypass RLS) ─────────────────────────────────────

export async function getRegistrosAsistenciaAction(
  fecha?: string
): Promise<RegistroAsistencia[]> {
  const supabase = createAdminClient()

  let query = supabase
    .from('Asistencia')
    .select(`
      idAsistencia, idEstudiante, estado, fecha,
      fechaRegistro, observacion, registradoPor,
      codigo_qr, tipo,
      estudiantes!fk_asistencia_estudiante (
        codigoEstudiante,
        usuario!fk_estudiantes_usuario (
          primerNombre, primerApellido, segundoNombre, segundoApellido
        )
      )
    `)
    .order('fecha',         { ascending: false })
    .order('fechaRegistro', { ascending: false })

  if (fecha) query = query.eq('fecha', fecha)

  const { data, error } = await query
  if (error) throw new Error(error.message)
  if (!data)  return []

  return data.map((r) => {
    const est = r.estudiantes as {
      codigoEstudiante: string
      usuario: Parameters<typeof buildNombre>[0]
    } | null

    return {
      idAsistencia:     r.idAsistencia,
      idEstudiante:     r.idEstudiante,
      estado:           r.estado as RegistroAsistencia['estado'],
      fecha:            r.fecha,
      fechaRegistro:    r.fechaRegistro,
      observacion:      r.observacion,
      registradoPor:    r.registradoPor,
      nombreEstudiante: buildNombre(est?.usuario ?? null),
      codigoEstudiante: est?.codigoEstudiante ?? '—',
      codigo_qr:        (r as { codigo_qr?: string | null }).codigo_qr ?? null,
      tipo:             (r as { tipo?: string | null }).tipo ?? null,
    }
  })
}

// ── Estudiantes con QR (bypass RLS) ──────────────────────────────────────────

export async function getEstudiantesConQRAction(): Promise<EstudianteQR[]> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('estudiantes')
    .select(`
      idEstudiante,
      codigoEstudiante,
      usuario!fk_estudiantes_usuario (
        primerNombre, primerApellido, segundoNombre, segundoApellido
      ),
      cursos!fk_estudiantes_curso ( nombreCurso )
    `)
    .eq('estado', 'Activo')
    .order('idEstudiante', { ascending: true })

  if (error) throw new Error(error.message)
  if (!data) return []

  return data.map((e) => ({
    idEstudiante: e.idEstudiante,
    codigoEstudiante: e.codigoEstudiante,
    nombreCompleto: buildNombre(e.usuario as Parameters<typeof buildNombre>[0]),
    curso: (e.cursos as { nombreCurso: string } | null)?.nombreCurso ?? null,
  }))
}

// ── Buscar QR por código de estudiante (bypass RLS) ──────────────────────────

export async function getCodigoQRByValueAction(
  codigoTexto: string
): Promise<CodigoQRConEstudiante | null> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('estudiantes')
    .select(`
      idEstudiante,
      codigoEstudiante,
      estado,
      usuario!fk_estudiantes_usuario (
        primerNombre, primerApellido, segundoNombre, segundoApellido
      ),
      cursos!fk_estudiantes_curso ( nombreCurso )
    `)
    .eq('codigoEstudiante', codigoTexto)
    .eq('estado', 'Activo')
    .maybeSingle()

  if (error || !data) return null

  return {
    idCodigo:         data.idEstudiante,
    idEstudiante:     data.idEstudiante,
    tipo:             'ambos' as TipoQR,
    codigo:           data.codigoEstudiante,
    activo:           true,
    fechaCreacion:    new Date().toISOString(),
    fechaVencimiento: null,
    creadoPor:        null,
    nombreCompleto:   buildNombre(data.usuario as Parameters<typeof buildNombre>[0]),
    codigoEstudiante: data.codigoEstudiante,
    curso:            (data.cursos as { nombreCurso: string } | null)?.nombreCurso ?? null,
  }
}

// ── Crear asistencia (bypass RLS) ────────────────────────────────────────────

export async function createAsistenciaAction(data: CreateAsistenciaData): Promise<void> {
  const supabase = createAdminClient()

  const { error } = await supabase.from('Asistencia').insert({
    idEstudiante:  data.idEstudiante,
    estado:        data.estado,
    fecha:         data.fecha,
    observacion:   data.observacion ?? null,
    registradoPor: data.registradoPor,
    codigo_qr:     data.codigo_qr ?? null,
    tipo:          data.tipo      ?? null,
    activo:        true,
  })

  if (error) throw new Error(error.message)
}

// ── Usuarios sin estudiante (bypass RLS) ─────────────────────────────────────

export async function getUsuariosSinEstudianteAction() {
  const supabase = createAdminClient()

  const [{ data: usuarios }, { data: conRegistro }] = await Promise.all([
    supabase
      .from('usuario')
      .select('idUsuario, primerNombre, primerApellido, correo, numeroDocumento')
      .eq('idRol', 2)
      .eq('estado', true),
    supabase.from('estudiantes').select('idUsuario'),
  ])

  const asignados = new Set((conRegistro ?? []).map((e) => e.idUsuario))

  return (usuarios ?? [])
    .filter((u) => !asignados.has(u.idUsuario))
    .map((u) => ({
      idUsuario: u.idUsuario,
      primerNombre: u.primerNombre,
      primerApellido: u.primerApellido,
      correo: u.correo,
      numeroDocumento: u.numeroDocumento,
    }))
}

// ── Cursos activos (bypass RLS) ──────────────────────────────────────────────

export async function getCursosActivosAction() {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('cursos')
    .select('idCurso, nombreCurso')
    .eq('activo', true)
    .order('nombreCurso')
  return (data ?? []) as { idCurso: number; nombreCurso: string }[]
}
