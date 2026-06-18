'use client'

import { useEffect, useState } from 'react'
import { getRoles, type Rol } from '@/services/usuarios/usuariosService'

// Fallback con los roles reales de la BD por si el backend no responde.
const FALLBACK: Rol[] = [
  { idRol: 1, nombreRol: 'Profesor' },
  { idRol: 2, nombreRol: 'Estudiante' },
  { idRol: 3, nombreRol: 'Administrador' },
  { idRol: 4, nombreRol: 'Padre' },
]

/** Carga los roles desde /roles (con fallback a los conocidos). */
export function useRoles() {
  const [roles, setRoles] = useState<Rol[]>(FALLBACK)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    getRoles()
      .then((r) => {
        if (active && r.length) setRoles(r)
      })
      .catch(() => {})
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  return { roles, loading }
}
