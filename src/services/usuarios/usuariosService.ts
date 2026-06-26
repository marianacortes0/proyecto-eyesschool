import { apiFetch } from '@/services/api/client'

// Roles reales: 1=Profesor | 2=Estudiante | 3=Administrador | 4=Padre
export const ROL_NOMBRES: Record<number, string> = {
  1: 'Profesor',
  2: 'Estudiante',
  3: 'Administrador',
  4: 'Padre',
}

export type UsuarioConRol = {
  idUsuario: number
  tipoDocumento: string
  numeroDocumento: string
  primerNombre: string
  segundoNombre: string | null
  primerApellido: string
  segundoApellido: string | null
  genero: string | null
  direccion: string | null
  correo: string | null
  telefono: string | null
  estado: boolean
  fechaRegistro: string
  ultimoAcceso: string | null
  idRol: number
  rolNombre: string
  // Solo aplica a estudiantes (idRol === 2)
  idEstudiante?: number | null
  idCursoActual?: number | null
  cursoNombre?: string | null
  // Solo aplica a padres / acudientes (idRol === 4)
  idPadre?: number | null
  idEstudianteRelacionado?: number | null
  parentesco?: string | null
  estudianteNombre?: string | null
  estudianteCurso?: string | null
  // Solo aplica a profesores (idRol === 1)
  idProfesor?: number | null
  especializaciones?: { id: number; nombre: string; institucion: string | null }[]
  // Solo aplica a administradores (idRol === 3)
  idAdministrador?: number | null
  cargo?: string | null
  nivelAcceso?: string | null
  // Vigencia del rol (todos los usuarios; persistida según el rol)
  fechaAsignacion?: string | null
  fechaFin?: string | null
}

// Opción de curso para selects (estudiantes)
export type CursoOpt = {
  idCurso: number
  label: string
}

// Opción de estudiante para selects (vincular a un padre)
export type EstudianteOpt = {
  idEstudiante: number
  nombre: string
  idCurso: number | null
  cursoLabel: string | null
  label: string
}

// Opción de especialización para selects (profesores)
export type EspecializacionOpt = {
  idEspecializacion: number
  label: string
}

// Valores válidos de parentesco en el backend
export const PARENTESCOS = ['Padre', 'Madre', 'Tutor', 'Abuelo', 'Otro'] as const

// Niveles de acceso del administrador en el backend
export const NIVELES_ACCESO = ['Bajo', 'Medio', 'Alto'] as const

export type CreateUsuarioData = {
  primerNombre: string
  primerApellido: string
  segundoNombre?: string
  segundoApellido?: string
  tipoDocumento: 'CC' | 'CE' | 'TI' | 'PAS'
  numeroDocumento: string
  correo: string
  password: string
  telefono?: string
  genero?: 'M' | 'F' | 'O'
  direccion?: string
  idRol: number
  // Curso al que se matricula el estudiante (solo idRol === 2)
  idCursoActual?: number | null
  // Vínculo con un estudiante (solo idRol === 4 — padre / acudiente)
  idEstudianteRelacionado?: number | null
  parentesco?: string | null
  // Especialización (solo idRol === 1 — profesor). Es el NOMBRE de la
  // especialización: si no existe en el catálogo, el backend la crea.
  especializacion?: string | null
  institucion?: string | null
  // Cargo / nivel de acceso (solo idRol === 3 — administrador)
  cargo?: string | null
  nivelAcceso?: string | null
  // Vigencia del rol (todos los usuarios)
  fechaAsignacion?: string | null
  fechaFin?: string | null
}

export type UpdateUsuarioData = Partial<Omit<CreateUsuarioData, 'correo'>>

function toUsuarioConRol(u: Record<string, unknown>): UsuarioConRol {
  const idRol = u.idRol as number ?? u.id_rol as number
  return {
    idUsuario:      u.idUsuario as number,
    tipoDocumento:  u.tipoDocumento as string,
    numeroDocumento:u.numeroDocumento as string,
    primerNombre:   u.primerNombre as string,
    segundoNombre:  u.segundoNombre as string | null,
    primerApellido: u.primerApellido as string,
    segundoApellido:u.segundoApellido as string | null,
    genero:         u.genero as string | null,
    direccion:      u.direccion as string | null,
    correo:         u.correo as string | null,
    telefono:       u.telefono as string | null,
    estado:         u.estado as boolean,
    fechaRegistro:  u.fechaRegistro as string,
    ultimoAcceso:   u.ultimoAcceso as string | null,
    idRol,
    rolNombre: ROL_NOMBRES[idRol] ?? 'Desconocido',
  }
}

export const getUsuarios = async (): Promise<UsuarioConRol[]> => {
  const data = await apiFetch<Record<string, unknown>[]>('/usuarios?estado=true&limit=500')
  return data.map(toUsuarioConRol)
}

export const getPendingUsuarios = async (): Promise<UsuarioConRol[]> => {
  const data = await apiFetch<Record<string, unknown>[]>('/usuarios?estado=false&limit=500')
  return data.map(toUsuarioConRol)
}

export const validarUsuario = async (id: number, idRol: number): Promise<void> => {
  await apiFetch(`/usuarios/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ id_rol: idRol }),
  })
  // `estado` va como query param (el backend NO lo lee del body).
  await apiFetch(`/usuarios/${id}/estado?estado=true`, { method: 'PATCH' })
}

export const rechazarUsuario = async (id: number): Promise<void> => {
  await deleteUsuario(id)
}

export const getUsuarioById = async (id: number): Promise<UsuarioConRol | null> => {
  try {
    const u = await apiFetch<Record<string, unknown>>(`/usuarios/${id}`)
    return toUsuarioConRol(u)
  } catch {
    return null
  }
}

export const createUsuario = async (usuario: CreateUsuarioData): Promise<void> => {
  await apiFetch('/usuarios', {
    method: 'POST',
    body: JSON.stringify({
      correo:           usuario.correo,
      password:         usuario.password,
      primer_nombre:    usuario.primerNombre,
      primer_apellido:  usuario.primerApellido,
      segundo_nombre:   usuario.segundoNombre ?? null,
      segundo_apellido: usuario.segundoApellido ?? null,
      tipo_documento:   usuario.tipoDocumento,
      numero_documento: usuario.numeroDocumento,
      telefono:         usuario.telefono ?? null,
      genero:           usuario.genero ?? null,
      direccion:        usuario.direccion ?? null,
      id_rol:           usuario.idRol,
    }),
  })
}

export const updateUsuario = async (id: number, data: UpdateUsuarioData): Promise<void> => {
  const payload: Record<string, unknown> = {}
  if (data.primerNombre)    payload.primer_nombre    = data.primerNombre
  if (data.primerApellido)  payload.primer_apellido  = data.primerApellido
  if (data.segundoNombre  !== undefined) payload.segundo_nombre   = data.segundoNombre ?? null
  if (data.segundoApellido !== undefined) payload.segundo_apellido = data.segundoApellido ?? null
  if (data.tipoDocumento)   payload.tipo_documento   = data.tipoDocumento
  if (data.numeroDocumento) payload.numero_documento = data.numeroDocumento
  if (data.telefono  !== undefined) payload.telefono = data.telefono ?? null
  if (data.genero    !== undefined) payload.genero   = data.genero ?? null
  if (data.direccion !== undefined) payload.direccion = data.direccion ?? null
  if (data.idRol     !== undefined) payload.id_rol   = data.idRol

  await apiFetch(`/usuarios/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export const toggleUsuarioEstado = async (id: number, nuevoEstado: boolean): Promise<void> => {
  // `estado` va como query param (el backend NO lo lee del body).
  await apiFetch(`/usuarios/${id}/estado?estado=${nuevoEstado}`, { method: 'PATCH' })
}

// Borrado físico: DELETE /usuarios/{id} (204). El backend cascadea las filas de rol.
export const deleteUsuario = async (id: number): Promise<void> => {
  await apiFetch(`/usuarios/${id}`, { method: 'DELETE' })
}
