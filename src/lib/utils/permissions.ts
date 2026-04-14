export type Role     = 'admin' | 'docente' | 'estudiante' | 'padre'
export type Action   = 'create' | 'read' | 'update' | 'delete' | 'download'
export type Resource =
  | 'usuarios'
  | 'qr' | 'qr:escanear'
  | 'asistencia' | 'asistencia:propia' | 'asistencia:hijos'
  | 'notas' | 'notas:propias'
  | 'novedades'
  | 'reportes'
  | 'horarios'
  | 'kpis'

type PermissionMap = Record<Role, Partial<Record<Resource, Action[]>>>

export const PERMISSIONS: PermissionMap = {
  admin: {
    usuarios:            ['create', 'read', 'update', 'delete'],
    qr:                  ['create', 'read', 'download'],
    'qr:escanear':       ['create'],
    asistencia:          ['read'],
    notas:               ['read'],
    novedades:           ['create', 'read', 'update', 'delete'],
    reportes:            ['create', 'read', 'update', 'delete', 'download'],
    horarios:            ['create', 'read', 'update', 'delete'],
    kpis:                ['read'],
  },
  docente: {
    'qr:escanear':       ['create'],
    asistencia:          ['read'],
    notas:               ['create', 'read', 'update', 'delete'],
    novedades:           ['create', 'read', 'update', 'delete'],
    horarios:            ['read'],
    kpis:                ['read'],
  },
  estudiante: {
    qr:                  ['read', 'download'],
    'asistencia:propia': ['read'],
    'notas:propias':     ['read', 'download'],
    novedades:           ['read'],
    horarios:            ['read'],
  },
  padre: {
    'asistencia:hijos':  ['read'],
    'notas:propias':     ['read', 'download'],
    novedades:           ['read'],
    horarios:            ['read'],
  },
}

export function can(role: Role, action: Action, resource: Resource): boolean {
  return PERMISSIONS[role]?.[resource]?.includes(action) ?? false
}

// ── Helpers de alto nivel ────────────────────────────────────────────────────

/** El rol puede leer el recurso */
export function canRead(role: Role, resource: Resource): boolean {
  return can(role, 'read', resource)
}

/** El rol puede crear o editar el recurso */
export function canWrite(role: Role, resource: Resource): boolean {
  return can(role, 'create', resource) || can(role, 'update', resource)
}

/** El rol puede eliminar registros del recurso */
export function canDelete(role: Role, resource: Resource): boolean {
  return can(role, 'delete', resource)
}

/**
 * Maps the Supabase role string or numeric idRol to the internal Role key.
 * Supports:
 *   - app_metadata.rol  → 'Administrador' | 'Profesor' | 'Estudiante' | 'Padre'
 *   - user_metadata.idRol → 1 | 2 | 3 | 4
 */
export function mapRolToKey(nombreRol?: string, idRol?: number): Role | null {
  if (nombreRol) {
    const byName: Record<string, Role> = {
      Administrador: 'admin',
      Profesor:      'docente',
      Estudiante:    'estudiante',
      Padre:         'padre',
    }
    return byName[nombreRol] ?? null
  }
  if (idRol !== undefined) {
    // Roles reales en la BD: 1=Profesor | 2=Estudiante | 3=Administrador | 4=Padre
    const byId: Record<number, Role> = {
      1: 'docente',
      2: 'estudiante',
      3: 'admin',
      4: 'padre',
    }
    return byId[idRol] ?? null
  }
  return null
}
