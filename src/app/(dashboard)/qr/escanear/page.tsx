export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { getServerUser, userToRole } from '@/lib/auth/server'
import { can } from '@/lib/utils/permissions'
import EscanearClient from './EscanearClient'

export default async function EscanearPage() {
  const user = await getServerUser()
  if (!user) redirect('/?login=1')

  const role = userToRole(user)
  if (!role || !can(role, 'create', 'qr:escanear')) redirect('/general')

  return (
    <EscanearClient
      role={role}
      idUsuarioRegistrador={user.idUsuario}
    />
  )
}
