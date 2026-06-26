export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { getServerUser, getServerToken, userToRole } from '@/lib/auth/server'
import { getReportesAction } from '@/services/reportes/reportesActions'
import { type Reporte } from '@/services/reportes/reportesService'
import ReportesClient from './ReportesClient'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

export default async function ReportesPage() {
  const user = await getServerUser()
  if (!user) redirect('/?login=1')

  const role = userToRole(user)
  if (!role) redirect('/?login=1')

  const token = await getServerToken()
  let idAdministrador = 0

  if (role === 'admin' && token) {
    try {
      const res = await fetch(
        `${API}/administradores?id_usuario=${user.idUsuario}&limit=1`,
        { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }
      )
      if (res.ok) {
        const data = await res.json() as Array<Record<string, unknown>>
        if (data.length > 0) {
          idAdministrador = (data[0].id_administrador ?? data[0].idAdministrador) as number ?? 0
        }
      }
    } catch {
      // leave idAdministrador as 0
    }
  }

  // Lista de reportes en el render del servidor: el cliente arranca sin fetch tras hidratar.
  let initialReportes: Reporte[] | undefined
  try {
    initialReportes = await getReportesAction()
  } catch {
    initialReportes = undefined
  }

  return <ReportesClient role={role} idAdministrador={idAdministrador} initialReportes={initialReportes} />
}
