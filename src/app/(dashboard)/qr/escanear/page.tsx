import { createClient } from '@/services/supabase/server'
import { redirect } from 'next/navigation'
import { mapRolToKey, can } from '@/lib/utils/permissions'
import EscanearClient from './EscanearClient'

export default async function EscanearPage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (!user || error) redirect('/login')

  const nombreRol =
    (user.app_metadata?.rol as string | undefined) ??
    (user.user_metadata?.rol as string | undefined)
  const role = mapRolToKey(nombreRol, user.user_metadata?.idRol as number | undefined)

  // Solo admin y docente pueden escanear
  if (!role || !can(role, 'create', 'qr:escanear')) redirect('/general')

  // idUsuario interno → para Asistencia.registradoPor
  const { data: usuarioRow } = await supabase
    .from('usuario')
    .select('idUsuario')
    .eq('auth_id', user.id)
    .single()

  return (
    <EscanearClient
      role={role}
      idUsuarioRegistrador={usuarioRow?.idUsuario ?? 0}
    />
  )
}
