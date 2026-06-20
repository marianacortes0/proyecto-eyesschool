export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { getServerUser, userToRole } from '@/lib/auth/server'
import NotasClient from './NotasClient'

export default async function NotasPage() {
  const user = await getServerUser()
  if (!user) redirect('/?login=1')

  const role = userToRole(user)
  if (!role) redirect('/?login=1')

  return <NotasClient role={role} idUsuarioRegistrador={user.idUsuario} />
}
