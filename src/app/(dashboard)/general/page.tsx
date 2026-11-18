export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { getServerUser, getServerToken, userToRole } from '@/lib/auth/server'
import {
  getDashboardDocenteServer,
  getDashboardEstudianteServer,
  getDashboardPadreServer,
} from '@/services/dashboard/dashboardService'
import GeneralDashboardClient from '@/components/panel/GeneralDashboardClient'
import SelectorHijo from '@/components/asociado/SelectorHijo'
import { getHijosAction } from '@/services/asociado/asociadoActions'
import { elegirHijoActivo, type Hijo } from '@/lib/utils/hijoActivo'

export default async function GeneralDashboardPage({ searchParams }: { searchParams: Promise<{ hijo?: string }> }) {
  const user = await getServerUser()
  if (!user) redirect('/?login=1')

  const role = userToRole(user)
  if (role === 'admin') redirect('/admin')
  if (!role) redirect('/?login=1')

  // Perf: traemos los datos del dashboard en el servidor (sin waterfall ni spinner
  // en cliente). El hook recibe initialData y omite el fetch en el navegador.
  const token = await getServerToken()

  // Padre: el inicio muestra al hijo activo (`?hijo=`). Si no se puede leer la lista
  // de hijos, el inicio sigue cargando con el vínculo que la API devuelve por defecto.
  let hijos: Hijo[] = []
  let activoId: number | undefined
  if (role === 'padre') {
    try {
      const { hijo } = await searchParams
      hijos = await getHijosAction()
      activoId = elegirHijoActivo(hijos, hijo)?.idEstudiante
    } catch {
      hijos = []
    }
  }

  // Si la API falla, el dato llega como null y el cliente vuelve a pedirlo; si
  // también falla, muestra el error con «Reintentar» (DEF-WEB-08).
  const initial =
    token && role === 'docente'
      ? { initialDocente: (await getDashboardDocenteServer(token)) ?? undefined }
      : token && role === 'estudiante'
        ? { initialEstudiante: (await getDashboardEstudianteServer(token)) ?? undefined }
        : token && role === 'padre'
          ? { initialPadre: (await getDashboardPadreServer(token, activoId)) ?? undefined }
          : {}

  return (
    <>
      <SelectorHijo hijos={hijos} activoId={activoId ?? null} />
      <GeneralDashboardClient key={activoId ?? 'inicio'} {...initial} />
    </>
  )
}
