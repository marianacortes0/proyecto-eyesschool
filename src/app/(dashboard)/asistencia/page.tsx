export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { getServerUser, getServerToken, userToRole } from '@/lib/auth/server'
import { getAsistenciaBootstrapAction, type AsistenciaBootstrap } from '@/services/asistencia/asistenciaActions'
import AsistenciaClient from './AsistenciaClient'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

export default async function AsistenciaPage() {
  const user = await getServerUser()
  if (!user) redirect('/?login=1')

  const role = userToRole(user)
  if (!role) redirect('/?login=1')

  const token = await getServerToken()
  let idEstudiantePropio: number | undefined
  let nombreEstudiantePropio: string | undefined

  // Estudiante: ve SU propia asistencia (id vía /estudiantes/me; nombre desde la cookie).
  if (role === 'estudiante' && token) {
    try {
      const res = await fetch(`${API}/estudiantes/me`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      })
      if (res.ok) {
        const est = await res.json() as Record<string, unknown>
        idEstudiantePropio = (est.id_estudiante ?? est.idEstudiante) as number | undefined
        nombreEstudiantePropio = [user.primerNombre, user.primerApellido].filter(Boolean).join(' ') || undefined
      }
    } catch {
      // leave idEstudiantePropio undefined
    }
  }

  // Padre: ve la asistencia del estudiante asociado (id + nombre vía /dashboard/padre).
  if (role === 'padre' && token) {
    try {
      const res = await fetch(`${API}/dashboard/padre`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      })
      if (res.ok) {
        const d = await res.json() as Record<string, unknown>
        idEstudiantePropio = (d.id_estudiante ?? d.idEstudiante) as number | undefined
        nombreEstudiantePropio = (d.nombre_estudiante ?? d.nombreEstudiante) as string | undefined
      }
    } catch {
      // leave idEstudiantePropio undefined
    }
  }

  // Datos del día en el render del servidor (la fecha de hoy coincide con la del
  // cliente porque ambas usan la fecha UTC vía toISOString).
  const hoy = new Date().toISOString().split('T')[0]
  let initialData: AsistenciaBootstrap | undefined
  try {
    initialData = await getAsistenciaBootstrapAction({ fecha: hoy, estado: 'todos', idEstudiante: idEstudiantePropio })
  } catch {
    initialData = undefined
  }

  return (
    <AsistenciaClient
      role={role}
      idUsuarioRegistrador={user.idUsuario}
      idEstudiantePropio={idEstudiantePropio}
      nombreEstudiantePropio={nombreEstudiantePropio}
      initialData={initialData}
    />
  )
}
