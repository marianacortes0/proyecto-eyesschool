export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { getServerUser, getServerToken, userToRole } from '@/lib/auth/server'
import {
  getDashboardDocenteServer,
  getDashboardEstudianteServer,
  getDashboardPadreServer,
} from '@/services/dashboard/dashboardService'
import GeneralDashboardClient from '@/components/panel/GeneralDashboardClient'

export default async function GeneralDashboardPage() {
  const user = await getServerUser()
  if (!user) redirect('/?login=1')

  const role = userToRole(user)
  if (role === 'admin') redirect('/admin')
  if (!role) redirect('/?login=1')

  // Perf: traemos los datos del dashboard en el servidor (sin waterfall ni spinner
  // en cliente). El hook recibe initialData y omite el fetch en el navegador.
  const token = await getServerToken()
  const initial =
    token && role === 'docente'
      ? { initialDocente: await getDashboardDocenteServer(token) }
      : token && role === 'estudiante'
        ? { initialEstudiante: await getDashboardEstudianteServer(token) }
        : token && role === 'padre'
          ? { initialPadre: await getDashboardPadreServer(token) }
          : {}

  return <GeneralDashboardClient {...initial} />
}
