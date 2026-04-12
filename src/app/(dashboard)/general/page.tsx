import { createClient } from '@/services/supabase/server'
import { redirect } from 'next/navigation'
import { mapRolToKey } from '@/lib/utils/permissions'
import { getDashboardData } from '@/services/dashboard/dashboardGeneralService'
import KPICard from '@/components/dashboard/KPICard'
import type {
  EstudianteDashboardData,
  ProfesorDashboardData
} from '@/types/dashboard'

export default async function GeneralDashboardPage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (!user || error) redirect('/login')

  const nombreRol =
    (user.app_metadata?.rol as string | undefined) ??
    (user.user_metadata?.rol as string | undefined)
  const role = mapRolToKey(nombreRol, user.user_metadata?.idRol as number | undefined)

  if (role === 'admin') redirect('/admin')

  const data = await getDashboardData(role as string)

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Dashboard General
        </h1>
        <p className="text-gray-500 mt-2">
          Rol activo:{' '}
          <span className="font-semibold text-blue-600">
            {role ?? 'desconocido'}
          </span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* ===== ESTUDIANTE ===== */}
        {role === 'estudiante' && data && (
          (() => {
            const d = data as EstudianteDashboardData

            return (
              <>
                <KPICard title="Promedio" value={d.promedio} />
                <KPICard title="Asistencia" value={`${d.asistencia}%`} />
                <KPICard title="Novedades" value={d.novedades} />
              </>
            )
          })()
        )}

        {/* ===== PADRE ===== */}
        {role === 'padre' && data && (
          (() => {
            const d = data as EstudianteDashboardData

            return (
              <>
                <KPICard title="Promedio del hijo" value={d.promedio} />
                <KPICard title="Asistencia" value={`${d.asistencia}%`} />
                <KPICard title="Novedades" value={d.novedades} />
              </>
            )
          })()
        )}

        {/* ===== PROFESOR ===== */}
        {role === 'docente' && data && (
          (() => {
            const d = data as ProfesorDashboardData

            return (
              <KPICard
                title="Total Estudiantes"
                value={d.totalEstudiantes}
              />
            )
          })()
        )}

      </div>
    </div>
  )
}