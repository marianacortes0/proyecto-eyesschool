export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { getServerUser, userToRole } from '@/lib/auth/server'
import NovedadesClient from './NovedadesClient'

export default async function NovedadesPage() {
  const user = await getServerUser()
  if (!user) redirect('/?login=1')

  const role = userToRole(user)
  if (!role) redirect('/?login=1')

  return <NovedadesClient role={role} registradoPor={user.idUsuario} />
}
