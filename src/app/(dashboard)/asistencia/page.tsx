export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { getServerUser, getServerToken, userToRole } from '@/lib/auth/server'
import { getAsistenciaBootstrapAction, type AsistenciaBootstrap } from '@/services/asistencia/asistenciaActions'
import { getAsociadoAction } from '@/services/asociado/asociadoActions'
import SelectorHijo from '@/components/asociado/SelectorHijo'
import type { Hijo } from '@/lib/utils/hijoActivo'
import AsistenciaClient from './AsistenciaClient'
import { hoyColegio } from '@/lib/utils/fecha'
import { MSG_SIN_HIJOS } from '@/lib/utils/hijoActivo'

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
  let sinHijos = false
  if (role === 'padre') {
    try {
      const { hijo } = await searchParams
      const asociado = await getAsociadoAction(hijo)
      hijos = asociado.hijos
      sinHijos = asociado.hijos.length === 0 && !asociado.info
      idEstudiantePropio = asociado.info?.idEstudiante
      nombreEstudiantePropio = asociado.info?.nombre
    } catch {
      // leave idEstudiantePropio undefined
    }
    // CP-SIS-061 (DEF-WEB-15): sin hijos vinculados no hay asistencia que pedir;
    // antes la pantalla mostraba «No se pudo cargar la asistencia».
    if (sinHijos) {
      return (
        <div className="p-6">
          <div className="px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-300 text-sm">
            <strong>{MSG_SIN_HIJOS}.</strong> No encontramos un estudiante asociado a tu cuenta.
          </div>
        </div>
      )
    }
  }

  // Datos del día en el render del servidor (la fecha de hoy coincide con la del
  // cliente porque ambas usan hoyColegio(): DEF-WEB-11).
  const hoy = hoyColegio()
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
