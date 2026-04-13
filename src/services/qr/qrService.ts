import { createClient } from '../supabase/client'

// ── Tipos ────────────────────────────────────────────────────────────────────

export type TipoQR = 'ingreso' | 'salida' | 'ambos'

export type EstudianteQR = {
  idEstudiante: number
  codigoEstudiante: string
  nombreCompleto: string
  curso: string | null
}

/** Shape unificada que usan los componentes y el hook del escáner */
export type CodigoQRConEstudiante = EstudianteQR & {
  idCodigo: number
  tipo: TipoQR
  codigo: string
  activo: boolean
  fechaCreacion: string
  fechaVencimiento: string | null
  creadoPor: number | null
}

export type CreateCodigoQRData  = { idEstudiante: number; tipo: TipoQR; fechaVencimiento: string | null }
export type UpdateCodigoQRData  = { tipo?: TipoQR; fechaVencimiento?: string | null; activo?: boolean }

export type RegistroAsistencia = {
  idAsistencia: number
  idEstudiante: number
  estado: 'Presente' | 'Ausente' | 'Tarde' | 'Excusa' | 'Suspensión'
  fecha: string
  fechaRegistro: string
  observacion: string | null
  registradoPor: number
  nombreEstudiante: string
  codigoEstudiante: string
  codigo_qr: string | null
  tipo: string | null
}

export type CreateAsistenciaData = {
  idEstudiante: number
  estado: 'Presente' | 'Ausente' | 'Tarde' | 'Excusa' | 'Suspensión'
  fecha: string
  observacion?: string
  registradoPor: number
  codigo_qr?: string | null
  tipo?: string | null
}

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
 * URL de imagen QR via goqr.me — se usa como src de <img>
 * El QR codifica el codigoEstudiante del alumno.
 */
export const getQRImageUrl = (codigoEstudiante: string, size = 200): string =>
  `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(codigoEstudiante)}&size=${size}x${size}&ecc=M&margin=2`

// ── Tipos extras ─────────────────────────────────────────────────────────────

export type UsuarioSinEstudiante = {
  idUsuario: number
  primerNombre: string
  primerApellido: string
  correo: string | null
  numeroDocumento: string
}

export type CursoSimple = { idCurso: number; nombreCurso: string }

// ── Estudiantes (base del módulo QR) ─────────────────────────────────────────

/** Todos los estudiantes activos — la lista de QR codes es 1:1 con estudiantes */
export const getEstudiantesConQR = async (): Promise<EstudianteQR[]> => {
  const supabase = createClient()

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

/** Alias para el selector del modal */
export const getEstudiantesParaSelector = getEstudiantesConQR

/** Cursos activos para el selector del modal de asignación */
export const getCursosActivos = async (): Promise<CursoSimple[]> => {
  const supabase = createClient()
  const { data } = await supabase
    .from('cursos')
    .select('idCurso, nombreCurso')
    .eq('activo', true)
    .order('nombreCurso')
  return (data ?? []) as CursoSimple[]
}

/** Usuarios con rol Estudiante que aún no tienen registro en la tabla estudiantes */
export const getUsuariosSinEstudiante = async (): Promise<UsuarioSinEstudiante[]> => {
  const supabase = createClient()

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

/**
 * Busca el estudiante por su codigoEstudiante (valor que viene del escáner).
 * Retorna la shape CodigoQRConEstudiante para compatibilidad con useEscanear.
 */
export const getCodigoQRByValue = async (
  codigoTexto: string
): Promise<CodigoQRConEstudiante | null> => {
  const supabase = createClient()

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

/** Código QR del propio estudiante autenticado */
export const getMiCodigoQR = async (): Promise<CodigoQRConEstudiante | null> => {
  const supabase = createClient()

  const { data: sessionData } = await supabase.auth.getSession()
  const user = sessionData.session?.user
  if (!user) return null

  const { data: usuarioRow } = await supabase
    .from('usuario')
    .select('idUsuario')
    .eq('auth_id', user.id)
    .maybeSingle()

  if (!usuarioRow) return null

  const { data: est } = await supabase
    .from('estudiantes')
    .select(`
      idEstudiante,
      codigoEstudiante,
      usuario!fk_estudiantes_usuario (
        primerNombre, primerApellido, segundoNombre, segundoApellido
      ),
      cursos!fk_estudiantes_curso ( nombreCurso )
    `)
    .eq('idUsuario', usuarioRow.idUsuario)
    .maybeSingle()

  if (!est) return null

  const estData = est as {
    idEstudiante: number
    codigoEstudiante: string
    usuario: Parameters<typeof buildNombre>[0]
    cursos: { nombreCurso: string } | null
  }

  return {
    idCodigo:         estData.idEstudiante,
    idEstudiante:     estData.idEstudiante,
    tipo:             'ambos' as TipoQR,
    codigo:           estData.codigoEstudiante,
    activo:           true,
    fechaCreacion:    new Date().toISOString(),
    fechaVencimiento: null,
    creadoPor:        null,
    nombreCompleto:   buildNombre(estData.usuario),
    codigoEstudiante: estData.codigoEstudiante,
    curso:            estData.cursos?.nombreCurso ?? null,
  }
}

// ── goqr.me — leer QR desde imagen ───────────────────────────────────────────

/**
 * POST a goqr.me con la imagen capturada por la cámara.
 * Retorna el texto decodificado (= codigoEstudiante) o null.
 */
export const readQRFromImage = async (imageBlob: Blob): Promise<string | null> => {
  const formData = new FormData()
  formData.append('file', imageBlob, 'qr.jpg')

  const res = await fetch('https://api.qrserver.com/v1/read-qr-code/', {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) throw new Error('Error al contactar la API de lectura QR')

  const json = await res.json()
  const symbol = json?.[0]?.symbol?.[0]

  if (!symbol || symbol.error) return null
  return (symbol.data as string) ?? null
}

// ── CRUD Asistencia ───────────────────────────────────────────────────────────

export const getRegistrosAsistencia = async (fecha?: string): Promise<RegistroAsistencia[]> => {
  const supabase = createClient()

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

export const createAsistencia = async (data: CreateAsistenciaData): Promise<void> => {
  const supabase = createClient()

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

export const updateAsistencia = async (
  id: number,
  data: {
    estado?: RegistroAsistencia['estado']
    observacion?: string | null
    fecha?: string
  }
): Promise<void> => {
  const supabase = createClient()
  const { error } = await supabase.from('Asistencia').update(data).eq('idAsistencia', id)
  if (error) throw new Error(error.message)
}

export const deleteAsistencia = async (id: number): Promise<void> => {
  const supabase = createClient()
  const { error } = await supabase.from('Asistencia').delete().eq('idAsistencia', id)
  if (error) throw new Error(error.message)
}
