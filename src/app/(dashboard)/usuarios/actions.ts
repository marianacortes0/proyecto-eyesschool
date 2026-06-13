'use server'

import { cookies } from 'next/headers'
import { ROL_NOMBRES, type UsuarioConRol } from '@/services/usuarios/usuariosService'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

async function getToken(): Promise<string | null> {
  const store = await cookies()
  return store.get('eys_access')?.value ?? null
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken()
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers as Record<string, string> | undefined),
    },
    cache: 'no-store',
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error((body as Record<string, unknown>).detail as string ?? `HTTP ${res.status}`)
  }
  if (res.status === 204) return null as T
  return res.json() as Promise<T>
}

function rawToUsuarioConRol(u: Record<string, unknown>): UsuarioConRol {
  const idRol = (u.idRol ?? u.id_rol) as number
  return {
    idUsuario:       (u.idUsuario ?? u.id_usuario) as number,
    tipoDocumento:   (u.tipoDocumento ?? u.tipo_documento) as string,
    numeroDocumento: (u.numeroDocumento ?? u.numero_documento) as string,
    primerNombre:    (u.primerNombre ?? u.primer_nombre) as string,
    segundoNombre:   (u.segundoNombre ?? u.segundo_nombre) as string | null,
    primerApellido:  (u.primerApellido ?? u.primer_apellido) as string,
    segundoApellido: (u.segundoApellido ?? u.segundo_apellido) as string | null,
    genero:          u.genero as string | null,
    direccion:       u.direccion as string | null,
    correo:          u.correo as string | null,
    telefono:        u.telefono as string | null,
    estado:          u.estado as boolean,
    fechaRegistro:   (u.fechaRegistro ?? u.fecha_registro) as string,
    ultimoAcceso:    (u.ultimoAcceso ?? u.ultimo_acceso) as string | null,
    idRol,
    rolNombre: ROL_NOMBRES[idRol] ?? 'Desconocido',
  }
}

export type CreateUsuarioConAuthData = {
  primerNombre: string
  segundoNombre?: string
  primerApellido: string
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

const ID_ROL_ESTUDIANTE = 2
const ID_ROL_PROFESOR   = 1

export async function createUsuarioConAuth(data: CreateUsuarioConAuthData): Promise<void> {
  const usuario = await apiFetch<Record<string, unknown>>('/usuarios', {
    method: 'POST',
    body: JSON.stringify({
      correo:           data.correo,
      password:         data.password,
      primer_nombre:    data.primerNombre,
      primer_apellido:  data.primerApellido,
      segundo_nombre:   data.segundoNombre   ?? null,
      segundo_apellido: data.segundoApellido ?? null,
      tipo_documento:   data.tipoDocumento,
      numero_documento: data.numeroDocumento,
      telefono:         data.telefono  ?? null,
      genero:           data.genero    ?? null,
      direccion:        data.direccion ?? null,
      id_rol:           data.idRol,
    }),
  })

  const idUsuario = (usuario.id_usuario ?? usuario.idUsuario) as number
  const hoy = new Date().toISOString().slice(0, 10)

  if (data.idRol === ID_ROL_ESTUDIANTE) {
    const codigo = `EST${String(idUsuario).padStart(3, '0')}`
    await apiFetch('/estudiantes', {
      method: 'POST',
      body: JSON.stringify({
        id_usuario:        idUsuario,
        codigo_estudiante: codigo,
        fecha_ingreso:     hoy,
        estado:            'Activo',
      }),
    }).catch(() => null)
  }

  if (data.idRol === ID_ROL_PROFESOR) {
    const codigo = `PROF${String(idUsuario).padStart(3, '0')}`
    await apiFetch('/profesores', {
      method: 'POST',
      body: JSON.stringify({
        id_usuario:        idUsuario,
        codigo_profesor:   codigo,
        titulo:            'Pendiente',
        nivel_estudios:    'Pendiente',
        fecha_vinculacion: hoy,
        estado:            'Activo',
      }),
    }).catch(() => null)
  }
}

export async function getUsuariosAction(): Promise<UsuarioConRol[]> {
  const data = await apiFetch<Record<string, unknown>[]>('/usuarios?estado=true&limit=500')
  return data.map(rawToUsuarioConRol)
}

export async function updateUsuarioAction(
  id: number,
  data: Partial<{
    primerNombre: string; primerApellido: string
    segundoNombre: string | null; segundoApellido: string | null
    tipoDocumento: string; numeroDocumento: string
    telefono: string | null; genero: string | null; direccion: string | null
    idRol: number
  }>
): Promise<void> {
  const body: Record<string, unknown> = {}
  if (data.primerNombre    !== undefined) body.primer_nombre    = data.primerNombre
  if (data.primerApellido  !== undefined) body.primer_apellido  = data.primerApellido
  if (data.segundoNombre   !== undefined) body.segundo_nombre   = data.segundoNombre
  if (data.segundoApellido !== undefined) body.segundo_apellido = data.segundoApellido
  if (data.tipoDocumento   !== undefined) body.tipo_documento   = data.tipoDocumento
  if (data.numeroDocumento !== undefined) body.numero_documento = data.numeroDocumento
  if (data.telefono        !== undefined) body.telefono         = data.telefono
  if (data.genero          !== undefined) body.genero           = data.genero
  if (data.direccion       !== undefined) body.direccion        = data.direccion
  if (data.idRol           !== undefined) body.id_rol           = data.idRol
  await apiFetch(`/usuarios/${id}`, { method: 'PUT', body: JSON.stringify(body) })
}

export async function toggleUsuarioEstadoAction(id: number, nuevoEstado: boolean): Promise<void> {
  await apiFetch(`/usuarios/${id}/estado`, {
    method: 'PATCH',
    body: JSON.stringify({ estado: nuevoEstado }),
  })
}

export async function getPendingUsuariosAction(): Promise<UsuarioConRol[]> {
  const data = await apiFetch<Record<string, unknown>[]>('/usuarios?estado=false&limit=500')
  return data.map(rawToUsuarioConRol)
}

export async function validarUsuarioAction(id: number, idRol: number): Promise<void> {
  await apiFetch(`/usuarios/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ id_rol: idRol }),
  })
  await apiFetch(`/usuarios/${id}/estado`, {
    method: 'PATCH',
    body: JSON.stringify({ estado: true }),
  })

  const hoy = new Date().toISOString().slice(0, 10)

  if (idRol === ID_ROL_ESTUDIANTE) {
    const existing = await apiFetch<Array<Record<string, unknown>>>(`/estudiantes?id_usuario=${id}&limit=1`).catch(() => [])
    if (!existing.length) {
      const codigo = `EST${String(id).padStart(3, '0')}`
      await apiFetch('/estudiantes', {
        method: 'POST',
        body: JSON.stringify({ id_usuario: id, codigo_estudiante: codigo, fecha_ingreso: hoy, estado: 'Activo' }),
      }).catch(() => null)
    }
  }

  if (idRol === ID_ROL_PROFESOR) {
    const existing = await apiFetch<Array<Record<string, unknown>>>(`/profesores?id_usuario=${id}&limit=1`).catch(() => [])
    if (!existing.length) {
      const codigo = `PROF${String(id).padStart(3, '0')}`
      await apiFetch('/profesores', {
        method: 'POST',
        body: JSON.stringify({
          id_usuario: id, codigo_profesor: codigo,
          titulo: 'Pendiente', nivel_estudios: 'Pendiente',
          fecha_vinculacion: hoy, estado: 'Activo',
        }),
      }).catch(() => null)
    }
  }
}

export async function rechazarUsuarioAction(id: number): Promise<void> {
  return deleteUsuarioAction(id)
}

export async function deleteUsuarioAction(id: number): Promise<void> {
  await apiFetch(`/usuarios/${id}`, { method: 'DELETE' })
}

export async function repararFilasRolAction(): Promise<void> {
  // Handled automatically by validarUsuarioAction — no separate repair needed
}
