export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { getServerUser, userToRole } from '@/lib/auth/server'
import { getUsuariosBootstrapAction, type UsuariosBootstrap } from './actions'
import UsuariosClient from './UsuariosClient'

export default async function UsuariosPage() {
  const user = await getServerUser()
  if (!user) redirect('/?login=1')

  const role = userToRole(user)
  if (role !== 'admin') redirect('/general')

  // Datos en el render del servidor: el cliente recibe todo ya cargado, sin
  // disparar fetches tras la hidratación. Si el backend falla, el cliente
  // hace fallback a su carga propia (initialData = undefined).
  let initialData: UsuariosBootstrap | undefined
  try {
    initialData = await getUsuariosBootstrapAction()
  } catch {
    initialData = undefined
  }

  return <UsuariosClient initialData={initialData} />
}
