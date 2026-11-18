import { describe, expect, it } from 'vitest'

import { API_ROLES } from './fixtures/apiRoles'
import {
  can,
  canDelete,
  canRead,
  canWrite,
  mapRolToKey,
  PERMISSIONS,
  type Action,
  type Resource,
  type Role,
} from '@/lib/utils/permissions'

// Toda la UI decide qué mostrar con estas funciones. Un cambio accidental aquí
// le abre (o le quita) una pantalla entera a un rol.
describe('permisos por rol', () => {
  it('solo el administrador gestiona usuarios', () => {
    expect(canWrite('admin', 'usuarios')).toBe(true)
    expect(canDelete('admin', 'usuarios')).toBe(true)
    for (const role of ['docente', 'estudiante', 'padre'] as const) {
      expect(canRead(role, 'usuarios')).toBe(false)
    }
  })

  it('las notas las escribe el docente; el admin solo las lee', () => {
    expect(canWrite('docente', 'notas')).toBe(true)
    expect(canWrite('admin', 'notas')).toBe(false)
    expect(can('admin', 'download', 'notas')).toBe(true)
  })

  it('estudiante y padre solo leen lo propio', () => {
    expect(canRead('estudiante', 'notas:propias')).toBe(true)
    expect(canRead('estudiante', 'asistencia')).toBe(false)
    expect(canRead('padre', 'asistencia:hijos')).toBe(true)
    expect(canWrite('padre', 'novedades')).toBe(false)
    expect(canWrite('estudiante', 'novedades')).toBe(false)
  })

  it('escanear QR es de docentes y administradores', () => {
    expect(can('docente', 'create', 'qr:escanear')).toBe(true)
    expect(can('admin', 'create', 'qr:escanear')).toBe(true)
    expect(can('estudiante', 'create', 'qr:escanear')).toBe(false)
  })
})

describe('mapRolToKey', () => {
  it('traduce los nombres de rol del backend', () => {
    expect(mapRolToKey('admin')).toBe('admin')
    expect(mapRolToKey('Administrador')).toBe('admin')
    expect(mapRolToKey('docente')).toBe('docente')
    expect(mapRolToKey('Profesor')).toBe('docente')
    expect(mapRolToKey('padre')).toBe('padre')
  })

  it('traduce el id_rol de la base (1 docente, 2 estudiante, 3 admin, 4 padre)', () => {
    expect([1, 2, 3, 4].map((id) => mapRolToKey(undefined, id))).toEqual([
      'docente',
      'estudiante',
      'admin',
      'padre',
    ])
  })

  it('un rol desconocido no se convierte en ninguno', () => {
    expect(mapRolToKey('superusuario')).toBeNull()
    expect(mapRolToKey(undefined, 9)).toBeNull()
    expect(mapRolToKey()).toBeNull()
  })
})

describe('WEB-04 · permiso de borrar asistencia', () => {
  it("can('docente','delete','asistencia') es false: la API se lo niega con 403", () => {
    expect(can('docente', 'delete', 'asistencia')).toBe(false)
  })

  it("can('admin','delete','asistencia') es true", () => {
    expect(can('admin', 'delete', 'asistencia')).toBe(true)
  })
})

// IT-WEB-01 · CP-INT-076: ninguna acción visible en la web que la API rechace.
describe('contrato PERMISSIONS ↔ roles de la API', () => {
  it('PERMISSIONS no concede nada que la API rechace (0 diferencias)', () => {
    const diferencias: string[] = []
    for (const [rol, recursos] of Object.entries(PERMISSIONS) as [Role, Partial<Record<Resource, Action[]>>][]) {
      for (const [recurso, acciones] of Object.entries(recursos) as [Resource, Action[]][]) {
        const enApi = API_ROLES[recurso]
        if (!enApi) continue // recurso solo de interfaz (qr, kpis)
        for (const accion of acciones) {
          if (!enApi[accion]?.includes(rol)) diferencias.push(`${rol} puede ${accion} ${recurso} en la web pero la API lo rechaza`)
        }
      }
    }
    expect(diferencias).toEqual([])
  })
})
