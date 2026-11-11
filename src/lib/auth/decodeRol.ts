import { mapRolToKey, type Role } from '@/lib/utils/permissions'
import { decodeJwtPayload } from './jwt'

/**
 * Rol del usuario según el token de acceso (el mismo que valida la API). Es la
 * única fuente del rol para las páginas: `eys_user` es un JSON sin firma que el
 * usuario puede editar y solo sirve para mostrar el nombre.
 */
export function decodeRol(token: string | undefined | null): Role | null {
  const payload = decodeJwtPayload(token)
  if (!payload) return null
  return mapRolToKey(
    (payload.rol ?? payload.nombre_rol) as string | undefined,
    (payload.idRol ?? payload.id_rol) as number | undefined
  )
}
