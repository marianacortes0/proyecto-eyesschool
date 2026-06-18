export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { getServerUser, userToRole } from '@/lib/auth/server'
import GeneralDashboardClient from '@/components/panel/GeneralDashboardClient'

export default async function GeneralDashboardPage() {
  const user = await getServerUser()
  if (!user) redirect('/login')

  const role = userToRole(user)
  if (role === 'admin') redirect('/admin')
  if (!role) redirect('/login')

  return <GeneralDashboardClient />
}
