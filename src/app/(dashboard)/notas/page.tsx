import { createClient } from '@/services/supabase/server'
import { redirect } from 'next/navigation'
import { mapRolToKey } from '@/lib/utils/permissions'
import NotasClient from './NotasClient'

export default async function NotasPage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (!user || error) redirect('/login')

  const nombreRol =
    (user.app_metadata?.rol as string | undefined) ??
    (user.user_metadata?.rol as string | undefined)
  const role = mapRolToKey(nombreRol, user.user_metadata?.idRol as number | undefined)

  if (!role) redirect('/login')

  // Obtener idUsuario interno para registradoPor
  const { data: usuarioRow } = await supabase
    .from('usuario')
    .select('idUsuario')
    .eq('auth_id', user.id)
    .single()

  return <NotasClient role={role} idUsuarioRegistrador={usuarioRow?.idUsuario ?? 0} />
}
