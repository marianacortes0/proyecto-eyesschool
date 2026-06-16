import { cookies } from 'next/headers'
import { mapRolToKey, type Role } from '@/lib/utils/permissions'

export type AuthUser = {
  idUsuario: number
  idRol: number
  nombreRol: string
  primerNombre: string
  primerApellido: string
}

export async function getServerUser(): Promise<AuthUser | null> {
  const store = await cookies()
  const raw = store.get('eys_user')?.value
  if (!raw) return null
  try {
    return JSON.parse(decodeURIComponent(raw)) as AuthUser
  } catch {
    return null
  }
}

export async function getServerToken(): Promise<string | null> {
  const store = await cookies()
  return store.get('eys_access')?.value ?? null
}

export function userToRole(user: AuthUser): Role | null {
  return mapRolToKey(user.nombreRol, user.idRol)
}
