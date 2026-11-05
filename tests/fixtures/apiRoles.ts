import type { Action, Resource, Role } from '@/lib/utils/permissions'

/**
 * Roles que la API acepta por recurso y acción. Sale de `require_roles(...)` en
 * `app/api/v1/*.py` del backend (rama `developer`, revisada el 02/11/2026).
 * Si el backend cambia un permiso, se actualiza aquí y la prueba de contrato de
 * `tests/permissions.test.ts` avisa de lo que la web deba ajustar.
 *
 * Solo están los recursos que existen en la API. `qr`, `qr:escanear` y `kpis` son
 * de la interfaz (el escaneo usa POST /asistencia; los KPI, /dashboard/*).
 */
export type ApiRoles = Partial<Record<Resource, Partial<Record<Action, Role[]>>>>

export const API_ROLES: ApiRoles = {
  // usuarios.py
  usuarios: {
    create: ['admin'],
    read: ['admin'],
    update: ['admin'],
    delete: ['admin'],
  },
  // asistencia.py: POST/PUT admin y docente; DELETE solo admin.
  asistencia: {
    create: ['admin', 'docente'],
    read: ['admin', 'docente', 'padre', 'estudiante'],
    update: ['admin', 'docente'],
    delete: ['admin'],
  },
  // GET /estudiantes/{id}/asistencia: admin, docente, estudiante y padre.
  'asistencia:propia': { read: ['admin', 'docente', 'estudiante', 'padre'] },
  'asistencia:hijos': { read: ['admin', 'docente', 'estudiante', 'padre'] },
  // notas.py: el CRUD es solo del docente; el admin lee. El boletín PDF lo piden los cuatro.
  notas: {
    create: ['docente'],
    read: ['admin', 'docente'],
    update: ['docente'],
    delete: ['docente'],
    download: ['admin', 'docente', 'estudiante', 'padre'],
  },
  // GET /estudiantes/{id}/notas y /boletin/pdf.
  'notas:propias': {
    read: ['admin', 'docente', 'estudiante', 'padre'],
    download: ['admin', 'docente', 'estudiante', 'padre'],
  },
  // novedades.py: CRUD de admin y docente; GET /estudiantes/{id}/novedades abre la lectura.
  novedades: {
    create: ['admin', 'docente'],
    read: ['admin', 'docente', 'estudiante', 'padre'],
    update: ['admin', 'docente'],
    delete: ['admin', 'docente'],
  },
  // reportes.py: todo es solo del admin (incluida la descarga del archivo).
  reportes: {
    create: ['admin'],
    read: ['admin'],
    update: ['admin'],
    delete: ['admin'],
    download: ['admin'],
  },
  // horarios.py: lectura para los cuatro; escritura solo admin.
  horarios: {
    create: ['admin'],
    read: ['admin', 'docente', 'estudiante', 'padre'],
    update: ['admin'],
    delete: ['admin'],
  },
}
