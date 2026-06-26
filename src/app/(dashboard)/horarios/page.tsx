export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { getServerUser, userToRole } from '@/lib/auth/server'
import { getHorariosBootstrapAction, type HorariosBootstrap } from '@/services/horarios/horariosActions'
import { getHorarioAsociadoAction } from '@/services/asociado/asociadoActions'
import HorariosClient from './HorariosClient'
import HorariosViewerClient from './HorariosViewerClient'

export default async function HorariosPage() {
  const user = await getServerUser()
  if (!user) redirect('/?login=1')

  const role = userToRole(user)
  if (!role) redirect('/?login=1')

  // Padre y estudiante: solo el horario del curso del estudiante asociado (lectura).
  if (role === 'padre' || role === 'estudiante') {
    const data = await getHorarioAsociadoAction()
    return <HorariosViewerClient {...data} />
  }

  // Admin/docente: vista de gestión. Datos en el render del servidor.
  let initialData: HorariosBootstrap | undefined
  try {
    initialData = await getHorariosBootstrapAction()
  } catch {
    initialData = undefined
  }

  return <HorariosClient role={role} initialData={initialData} />
}
