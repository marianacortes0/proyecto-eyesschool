export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { getServerUser, userToRole } from '@/lib/auth/server'
import UsuariosClient from './UsuariosClient'

export default async function UsuariosPage() {
  const user = await getServerUser()
  if (!user) redirect('/?login=1')

  const role = userToRole(user)
  if (role !== 'admin') redirect('/general')

  return <UsuariosClient />
}
