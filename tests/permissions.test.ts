import { describe, expect, it } from 'vitest'

import { can, canDelete, canRead, canWrite, mapRolToKey } from '@/lib/utils/permissions'

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
