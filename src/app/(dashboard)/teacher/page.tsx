import { createClient } from '@/services/supabase/server'
import { redirect } from 'next/navigation'
import { mapRolToKey } from '@/lib/utils/permissions'

export default async function TeacherPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/login')

  const role = mapRolToKey(
    session.user.app_metadata?.rol as string | undefined,
    session.user.user_metadata?.idRol as number | undefined
  )

  if (role !== 'docente') redirect('/login')

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800">Panel del Profesor</h1>
      <p className="text-gray-600 mt-2">Bienvenido, aquí gestionarás asistencia y notas.</p>
    </div>
  )
}
