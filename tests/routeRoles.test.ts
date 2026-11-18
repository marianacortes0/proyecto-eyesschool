import { describe, expect, it } from 'vitest'

import { getNavItems } from '@/lib/auth/navItems'
import { puedeEntrar, rolesDeRuta } from '@/lib/auth/routeRoles'
import type { Role } from '@/lib/utils/permissions'

const ROLES: Role[] = ['admin', 'docente', 'estudiante', 'padre']

describe('mapa único de rutas por rol (WEB-01)', () => {
  it('/admin, /usuarios y /reportes son solo del administrador', () => {
    for (const ruta of ['/admin', '/usuarios', '/reportes']) {
      expect(rolesDeRuta(ruta), ruta).toEqual(['admin'])
    }
  })

  it('notas, asistencia, novedades, horarios, perfil y general admiten a todos los roles', () => {
    for (const ruta of ['/notas', '/asistencia', '/novedades', '/horarios', '/perfil', '/general']) {
      for (const rol of ROLES) expect(puedeEntrar(rol, ruta), `${rol} ${ruta}`).toBe(true)
    }
  })

  it('/qr/escanear es de administrador y docente', () => {
    expect(rolesDeRuta('/qr/escanear')).toEqual(['admin', 'docente'])
  })

  it('docente puede entrar a /qr/escanear', () => {
    expect(puedeEntrar('docente', '/qr/escanear')).toBe(true)
  })

  it('docente no puede entrar a /qr (Mi QR)', () => {
    expect(puedeEntrar('docente', '/qr')).toBe(false)
  })

  it('estudiante no puede entrar a /qr/escanear', () => {
    expect(puedeEntrar('estudiante', '/qr/escanear')).toBe(false)
    expect(puedeEntrar('padre', '/qr/escanear')).toBe(false)
  })

  it('el enlace de escanear aparece en el riel del docente y no en el del estudiante', () => {
    expect(getNavItems('docente').map((i) => i.href)).toContain('/qr/escanear')
    expect(getNavItems('estudiante').map((i) => i.href)).not.toContain('/qr/escanear')
  })

  it('una subruta hereda la regla de su prefijo más largo', () => {
    expect(puedeEntrar('docente', '/usuarios/12')).toBe(false)
    expect(puedeEntrar('docente', '/qr/escanear/lote')).toBe(true)
  })

  it('una ruta fuera del mapa no está protegida', () => {
    expect(rolesDeRuta('/home/nosotros')).toBeNull()
  })

  it('ningún enlace del PanelSidebar es visible para un rol que la ruta no permite', () => {
    for (const rol of ROLES) {
      for (const item of getNavItems(rol)) {
        expect(puedeEntrar(rol, item.href), `${rol} ve ${item.href}`).toBe(true)
      }
    }
  })
})
