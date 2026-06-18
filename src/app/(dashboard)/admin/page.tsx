export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { getServerUser, userToRole } from '@/lib/auth/server'
import AdminDashboardClient from './AdminDashboardClient'

export default async function AdminPage() {
  const user = await getServerUser()
  if (!user) redirect('/login')

  const role = userToRole(user)
  if (role !== 'admin') redirect('/login')

  return <AdminDashboardClient />
}
