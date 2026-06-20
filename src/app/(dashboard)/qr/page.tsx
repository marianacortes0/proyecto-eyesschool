export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { getServerUser, getServerToken, userToRole } from '@/lib/auth/server'
import { can } from '@/lib/utils/permissions'
import QRClient from './QRClient'
import { type CodigoQRConEstudiante } from '@/services/qr/qrService'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

export default async function QRPage() {
  const user = await getServerUser()
  if (!user) redirect('/?login=1')

  const role = userToRole(user)
  if (!role || !can(role, 'read', 'qr')) redirect('/general')

  let miCodigoServer: CodigoQRConEstudiante | null = null

  if (role === 'estudiante') {
    const token = await getServerToken()
    if (token) {
      try {
        const res = await fetch(`${API}/estudiantes/me`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        })
        if (res.ok) {
          const est = await res.json() as Record<string, unknown>
          const idEstudiante = (est.id_estudiante ?? est.idEstudiante) as number
          const codigo = (est.codigo_estudiante ?? est.codigoEstudiante) as string
          miCodigoServer = {
            idCodigo:         idEstudiante,
            idEstudiante,
            tipo:             'ambos',
            codigo,
            activo:           true,
            fechaCreacion:    new Date().toISOString(),
            fechaVencimiento: null,
            creadoPor:        null,
            nombreCompleto:   `${user.primerNombre} ${user.primerApellido}`,
            codigoEstudiante: codigo,
            curso:            null,
          }
        }
      } catch {
        // leave miCodigoServer as null
      }
    }
  }

  return <QRClient miCodigoServer={miCodigoServer} />
}
