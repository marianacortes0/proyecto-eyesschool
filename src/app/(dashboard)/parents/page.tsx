import { createClient } from '@/services/supabase/server'
import { redirect } from 'next/navigation'
import { mapRolToKey } from '@/lib/utils/permissions'

export default async function ParentsPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/login')

  const role = mapRolToKey(
    session.user.app_metadata?.rol as string | undefined,
    session.user.user_metadata?.idRol as number | undefined
  )

  if (role !== 'padre') redirect('/login')

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800">Portal para Padres</h1>
      <p className="text-gray-600 mt-2">Bienvenido, mantente al tanto del rendimiento de tu hijo.</p>
    </div>
  )
}
