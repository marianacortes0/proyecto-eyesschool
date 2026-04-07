import { createClient } from '@/services/supabase/server'
import { redirect } from 'next/navigation'
import { mapRolToKey } from '@/lib/utils/permissions'

export default async function GeneralDashboardPage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (!user || error) redirect('/login')

  const role = mapRolToKey(
    user.app_metadata?.rol as string | undefined,
    user.user_metadata?.idRol as number | undefined
  )

  // Admin tiene su propio dashboard
  if (role === 'admin') redirect('/admin')

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard General</h1>
      <p className="text-gray-500 mt-2">Rol activo: <span className="font-semibold text-blue-600">{role ?? 'desconocido'}</span></p>
      <p className="text-gray-400 mt-4 text-sm">Página de prueba — aquí irá el contenido según el rol.</p>
    </div>
  )
}
