export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { getServerUser, userToRole } from '@/lib/auth/server'
import { can } from '@/lib/utils/permissions'
import { getNotasBootstrapAction, type NotasBootstrap } from '@/services/notas/notasActions'
import { getNotasAsociadoAction } from '@/services/asociado/asociadoActions'
import NotasClient from './NotasClient'
import NotasViewerClient from './NotasViewerClient'

export default async function NotasPage() {
  const user = await getServerUser()
  if (!user) redirect('/?login=1')

  const role = userToRole(user)
  if (!role) redirect('/?login=1')

  // El recurso de notas es exclusivo del docente (gestión) y de quienes ven sus
  // propias notas (estudiante/padre). El admin no accede al recurso.
  if (!can(role, 'read', 'notas') && !can(role, 'read', 'notas:propias')) {
    redirect(can(role, 'read', 'usuarios') ? '/admin' : '/general')
  }

  // Padre y estudiante: vista acotada de SOLO LECTURA del estudiante asociado.
  if (role === 'padre' || role === 'estudiante') {
    const data = await getNotasAsociadoAction()
    return <NotasViewerClient {...data} />
  }

  // Docente: gestión completa. Datos en el render del servidor.
  let initialData: NotasBootstrap | undefined
  try {
    initialData = await getNotasBootstrapAction()
  } catch {
    initialData = undefined
  }

  return <NotasClient role={role} idUsuarioRegistrador={user.idUsuario} initialData={initialData} />
}
