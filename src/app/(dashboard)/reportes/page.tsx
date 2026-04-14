import { createClient } from '@/services/supabase/server'
import { createAdminClient } from '@/services/supabase/admin'
import { redirect } from 'next/navigation'
import { mapRolToKey } from '@/lib/utils/permissions'
import ReportesClient from './ReportesClient'

export default async function ReportesPage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (!user || error) redirect('/login')

  const nombreRol =
    (user.app_metadata?.rol as string | undefined) ??
    (user.user_metadata?.rol as string | undefined)
  const role = mapRolToKey(nombreRol, user.user_metadata?.idRol as number | undefined)

  if (!role) redirect('/login')

  const admin_db = createAdminClient()

  const { data: usuarioRow } = await admin_db
    .from('usuario')
    .select('idUsuario')
    .eq('auth_id', user.id)
    .maybeSingle()

  const { data: adminRow } = usuarioRow
    ? await admin_db
        .from('administrador')
        .select('idAdministrador')
        .eq('idUsuario', usuarioRow.idUsuario)
        .maybeSingle()
    : { data: null }

  return <ReportesClient role={role} idAdministrador={adminRow?.idAdministrador ?? 0} />
}
