import { createClient } from '@/services/supabase/server'
import { createAdminClient } from '@/services/supabase/admin'
import { redirect } from 'next/navigation'
import { mapRolToKey, can } from '@/lib/utils/permissions'
import QRClient from './QRClient'
import { type CodigoQRConEstudiante } from '@/services/qr/qrService'

function buildNombre(u: {
  primerNombre: string
  primerApellido: string
  segundoNombre: string | null
  segundoApellido: string | null
} | null): string {
  if (!u) return '—'
  return [u.primerNombre, u.segundoNombre, u.primerApellido, u.segundoApellido]
    .filter(Boolean)
    .join(' ')
}

export default async function QRPage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (!user || error) redirect('/login')

  const nombreRol =
    (user.app_metadata?.rol as string | undefined) ??
    (user.user_metadata?.rol as string | undefined)
  const role = mapRolToKey(nombreRol, user.user_metadata?.idRol as number | undefined)

  if (!role || !can(role, 'read', 'qr')) redirect('/general')

  // Para estudiantes: obtener su código server-side con admin client (bypass RLS)
  let miCodigoServer: CodigoQRConEstudiante | null = null

  if (role === 'estudiante') {
    const admin = createAdminClient()

    const { data: usuarioRow } = await admin
      .from('usuario')
      .select('idUsuario')
      .eq('auth_id', user.id)
      .maybeSingle()

    if (usuarioRow) {
      const { data: est } = await admin
        .from('estudiantes')
        .select(`
          idEstudiante,
          codigoEstudiante,
          usuario!fk_estudiantes_usuario (
            primerNombre, primerApellido, segundoNombre, segundoApellido
          ),
          cursos!fk_estudiantes_curso ( nombreCurso )
        `)
        .eq('idUsuario', usuarioRow.idUsuario)
        .maybeSingle()

      if (est) {
        const estData = est as {
          idEstudiante: number
          codigoEstudiante: string
          usuario: { primerNombre: string; primerApellido: string; segundoNombre: string | null; segundoApellido: string | null } | null
          cursos: { nombreCurso: string } | null
        }

        miCodigoServer = {
          idCodigo:         estData.idEstudiante,
          idEstudiante:     estData.idEstudiante,
          tipo:             'ambos',
          codigo:           estData.codigoEstudiante,
          activo:           true,
          fechaCreacion:    new Date().toISOString(),
          fechaVencimiento: null,
          creadoPor:        null,
          nombreCompleto:   buildNombre(estData.usuario),
          codigoEstudiante: estData.codigoEstudiante,
          curso:            estData.cursos?.nombreCurso ?? null,
        }
      }
    }
  }

  return <QRClient miCodigoServer={miCodigoServer} />
}
