export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { getServerUser, getServerToken, userToRole } from '@/lib/auth/server'
import { getAsistenciaBootstrapAction, type AsistenciaBootstrap } from '@/services/asistencia/asistenciaActions'
import { getAsociadoAction } from '@/services/asociado/asociadoActions'
import SelectorHijo from '@/components/asociado/SelectorHijo'
import type { Hijo } from '@/lib/utils/hijoActivo'
import AsistenciaClient from './AsistenciaClient'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

export default async function AsistenciaPage({ searchParams }: { searchParams: Promise<{ hijo?: string }> }) {
  const user = await getServerUser()
  if (!user) redirect('/?login=1')

  const role = userToRole(user)
  if (!role) redirect('/?login=1')

  const token = await getServerToken()
  let idEstudiantePropio: number | undefined
  let nombreEstudiantePropio: string | undefined
  let hijos: Hijo[] = []

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

  // Padre: ve la asistencia del hijo activo (`?hijo=`, o el primero) entre los que tiene vinculados.
  if (role === 'padre') {
    try {
      const { hijo } = await searchParams
      const asociado = await getAsociadoAction(hijo)
      hijos = asociado.hijos
      idEstudiantePropio = asociado.info?.idEstudiante
      nombreEstudiantePropio = asociado.info?.nombre
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
    <>
      <SelectorHijo hijos={hijos} activoId={idEstudiantePropio ?? null} />
      <AsistenciaClient
        key={idEstudiantePropio ?? 'sin-hijo'}
        role={role}
        idUsuarioRegistrador={user.idUsuario}
        idEstudiantePropio={idEstudiantePropio}
        nombreEstudiantePropio={nombreEstudiantePropio}
        initialData={initialData}
      />
    </>
  )
}
