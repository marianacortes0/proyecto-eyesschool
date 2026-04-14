import { createClient } from '@/services/supabase/server'
import { redirect } from 'next/navigation'
import { mapRolToKey } from '@/lib/utils/permissions'
import AdminDashboardClient from './AdminDashboardClient'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (!user || error) redirect('/login')

  const nombreRol =
    (user.app_metadata?.rol as string | undefined) ??
    (user.user_metadata?.rol as string | undefined)
  const role = mapRolToKey(nombreRol, user.user_metadata?.idRol as number | undefined)

  if (role !== 'admin') redirect('/login')

  return <AdminDashboardClient />
}
