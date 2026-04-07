import { createClient } from '@/services/supabase/server'
import { redirect } from 'next/navigation'
import { mapRolToKey } from '@/lib/utils/permissions'
import AdminDashboardClient from './AdminDashboardClient'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/login')

  const role = mapRolToKey(
    session.user.app_metadata?.rol as string | undefined,
    session.user.user_metadata?.idRol as number | undefined
  )

  if (role !== 'admin') redirect('/login')

  return <AdminDashboardClient />
}
