export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { getServerUser, userToRole } from '@/lib/auth/server'
import { getNovedadesBootstrapAction, type NovedadesBootstrap } from '@/services/novedades/novedadesActions'
import { getNovedadesAsociadoAction } from '@/services/asociado/asociadoActions'
import NovedadesClient from './NovedadesClient'
import NovedadesViewerClient from './NovedadesViewerClient'

export default async function NovedadesPage() {
  const user = await getServerUser()
  if (!user) redirect('/?login=1')

  const role = userToRole(user)
  if (!role) redirect('/?login=1')

  // Padre y estudiante: vista acotada de SOLO LECTURA del estudiante asociado.
  if (role === 'padre' || role === 'estudiante') {
    const data = await getNovedadesAsociadoAction()
    return <NovedadesViewerClient {...data} />
  }

  // Admin (solo lectura) y docente (CRUD): vista de gestión.
  let initialData: NovedadesBootstrap | undefined
  try {
    initialData = await getNovedadesBootstrapAction()
  } catch {
    initialData = undefined
  }

  return <NovedadesClient role={role} registradoPor={user.idUsuario} initialData={initialData} />
}
