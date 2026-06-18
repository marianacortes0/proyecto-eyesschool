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
}

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
  await apiFetch(`/usuarios/${id}/estado`, {
    method: 'PATCH',
    body: JSON.stringify({ estado: true }),
  })
}

export const rechazarUsuario = async (id: number): Promise<void> => {
  await apiFetch(`/usuarios/${id}`, { method: 'DELETE' })
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
  await apiFetch(`/usuarios/${id}/estado`, {
    method: 'PATCH',
    body: JSON.stringify({ estado: nuevoEstado }),
  })
}

export const deleteUsuario = async (id: number): Promise<void> => {
  await apiFetch(`/usuarios/${id}`, { method: 'DELETE' })
}
