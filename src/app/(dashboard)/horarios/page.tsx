export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { getServerUser, userToRole } from '@/lib/auth/server'
import HorariosClient from './HorariosClient'

export default async function HorariosPage() {
  const user = await getServerUser()
  if (!user) redirect('/login')

  const role = userToRole(user)
  if (!role) redirect('/login')

  return <HorariosClient role={role} />
}
