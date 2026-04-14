export const dynamic = 'force-dynamic'

import { createClient } from '@/services/supabase/server'
import { redirect } from 'next/navigation'
import { mapRolToKey } from '@/lib/utils/permissions'
import AsistenciaClient from './AsistenciaClient'

export default async function AsistenciaPage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (!user || error) redirect('/login')

  const nombreRol =
    (user.app_metadata?.rol as string | undefined) ??
    (user.user_metadata?.rol as string | undefined)
  const role = mapRolToKey(nombreRol, user.user_metadata?.idRol as number | undefined)

  // Admin y docente pueden ver asistencia; padre y sin rol → redirect
  if (!role || role === 'padre') redirect('/general')

  // Obtener idUsuario interno para registradoPor
  const { data: usuarioRow } = await supabase
    .from('usuario')
    .select('idUsuario')
    .eq('auth_id', user.id)
    .single()

  // Si es estudiante, obtener su idEstudiante para filtrar solo sus registros
  let idEstudiantePropio: number | undefined
  if (role === 'estudiante' && usuarioRow?.idUsuario) {
    const { data: estRow } = await supabase
      .from('estudiantes')
      .select('idEstudiante')
      .eq('idUsuario', usuarioRow.idUsuario)
      .maybeSingle()
    idEstudiantePropio = estRow?.idEstudiante ?? undefined
  }

  return (
    <AsistenciaClient
      role={role}
      idUsuarioRegistrador={usuarioRow?.idUsuario ?? 0}
      idEstudiantePropio={idEstudiantePropio}
    />
  )
}
