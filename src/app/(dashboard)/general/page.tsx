export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { getServerUser, getServerToken, userToRole } from '@/lib/auth/server'
import nextDynamic from 'next/dynamic'
import {
  getDashboardDocenteServer,
  getDashboardEstudianteServer,
  getDashboardPadreServer,
} from '@/services/dashboard/dashboardService'

const DocenteDashboardClient    = nextDynamic(() => import('@/components/dashboard/DocenteDashboardClient'))
const EstudianteDashboardClient = nextDynamic(() => import('@/components/dashboard/EstudianteDashboardClient'))
const PadreDashboardClient      = nextDynamic(() => import('@/components/dashboard/PadreDashboardClient'))

export default async function GeneralDashboardPage() {
  const user = await getServerUser()
  if (!user) redirect('/login')

  const role = userToRole(user)
  if (role === 'admin') redirect('/admin')
  if (!role) redirect('/login')

  const token = await getServerToken()

  if (role === 'docente') {
    const initialData = token ? await getDashboardDocenteServer(token) : undefined
    return <DocenteDashboardClient initialData={initialData} />
  }

  if (role === 'estudiante') {
    const initialData = token ? await getDashboardEstudianteServer(token) : undefined
    return <EstudianteDashboardClient initialData={initialData} />
  }

  if (role === 'padre') {
    const initialData = token ? await getDashboardPadreServer(token) : undefined
    return <PadreDashboardClient initialData={initialData} />
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
      <p className="text-gray-500 mt-2">
        Tu cuenta no tiene un rol asignado. Contacta al administrador.
      </p>
    </div>
  )
}
