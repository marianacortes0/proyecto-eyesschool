import { cookies } from 'next/headers'
import { decodeRol } from '@/lib/auth/decodeRol'
import { decodeJwtPayload } from '@/lib/auth/jwt'
import { mapRolToKey, type Role } from '@/lib/utils/permissions'

export type AuthUser = {
  idUsuario: number
  idRol: number
  nombreRol: string
  primerNombre: string
  primerApellido: string
}

const NOMBRE_ROL: Record<Role, string> = {
  admin: 'Administrador',
  docente: 'Profesor',
  estudiante: 'Estudiante',
  padre: 'Padre',
}
const ID_ROL: Record<Role, number> = { docente: 1, estudiante: 2, admin: 3, padre: 4 }

/**
 * Usuario de la sesión. El ROL sale del token de acceso (el que valida la API);
 * `eys_user` es un JSON sin firma y solo aporta el nombre y el id para mostrar.
 * Sin token de acceso vigente no hay usuario.
 */
export async function getServerUser(): Promise<AuthUser | null> {
  const store = await cookies()
  const rol = decodeRol(store.get('eys_access')?.value)
  if (!rol) return null

  let perfil: Partial<AuthUser> = {}
  const raw = store.get('eys_user')?.value
  if (raw) {
    try {
      perfil = JSON.parse(decodeURIComponent(raw)) as Partial<AuthUser>
    } catch {
      perfil = {}
    }
  }

  const payload = decodeJwtPayload(store.get('eys_access')?.value)
  return {
    idUsuario: perfil.idUsuario ?? Number(payload?.sub ?? 0),
    idRol: ID_ROL[rol],
    nombreRol: NOMBRE_ROL[rol],
    primerNombre: perfil.primerNombre ?? '',
    primerApellido: perfil.primerApellido ?? '',
  }
}

export async function getServerToken(): Promise<string | null> {
  const store = await cookies()
  return store.get('eys_access')?.value ?? null
}

export function userToRole(user: AuthUser): Role | null {
  return mapRolToKey(user.nombreRol, user.idRol)
}
