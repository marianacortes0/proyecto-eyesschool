import { createClient } from '@/services/supabase/server'
import { createAdminClient } from '@/services/supabase/admin'
import { redirect } from 'next/navigation'
import { mapRolToKey } from '@/lib/utils/permissions'
import NovedadesClient from './NovedadesClient'

export default async function NovedadesPage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (!user || error) redirect('/login')

  const nombreRol =
    (user.app_metadata?.rol as string | undefined) ??
    (user.user_metadata?.rol as string | undefined)
  const role = mapRolToKey(nombreRol, user.user_metadata?.idRol as number | undefined)

  if (!role) redirect('/login')

  const db = createAdminClient()
  const { data: usuarioRow } = await db
    .from('usuario')
    .select('idUsuario')
    .eq('auth_id', user.id)
    .maybeSingle()

  const registradoPor = usuarioRow?.idUsuario ?? 0

  return <NovedadesClient role={role} registradoPor={registradoPor} />
}
