import { createClient } from '@/services/supabase/server'
import { createAdminClient } from '@/services/supabase/admin'
import { redirect } from 'next/navigation'
import { mapRolToKey } from '@/lib/utils/permissions'
import dynamic from 'next/dynamic'
import { 
  getDashboardPadreServer, 
  getDashboardDocenteServer, 
  getDashboardEstudianteServer 
} from '@/services/dashboard/dashboardService'

const DocenteDashboardClient   = dynamic(() => import('@/components/dashboard/DocenteDashboardClient'))
const EstudianteDashboardClient = dynamic(() => import('@/components/dashboard/EstudianteDashboardClient'))
const PadreDashboardClient      = dynamic(() => import('@/components/dashboard/PadreDashboardClient'))

export default async function GeneralDashboardPage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (!user || error) redirect('/login')

  const nombreRol =
    (user.app_metadata?.rol as string | undefined) ??
    (user.user_metadata?.rol as string | undefined)
  const role = mapRolToKey(nombreRol, user.user_metadata?.idRol as number | undefined)

  if (role === 'admin') redirect('/admin')

  // Fetch data on the server based on role
  if (role === 'docente') {
    const adminDb = createAdminClient()
    const initialData = await getDashboardDocenteServer(adminDb, user.id)
    return <DocenteDashboardClient initialData={initialData} />
  }

  if (role === 'estudiante') {
    const adminDb = createAdminClient()
    const initialData = await getDashboardEstudianteServer(adminDb, user.id)
    return <EstudianteDashboardClient initialData={initialData} />
  }
  
  if (role === 'padre') {
    const adminDb = createAdminClient()
    const initialData = await getDashboardPadreServer(adminDb, user.id)
    return <PadreDashboardClient initialData={initialData} />
  }

  // Rol desconocido — vista de espera
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
      <p className="text-gray-500 mt-2">
        Tu cuenta no tiene un rol asignado. Contacta al administrador.
      </p>
    </div>
  )
}