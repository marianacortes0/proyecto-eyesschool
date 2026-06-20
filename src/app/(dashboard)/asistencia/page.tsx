export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { getServerUser, getServerToken, userToRole } from '@/lib/auth/server'
import AsistenciaClient from './AsistenciaClient'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

export default async function AsistenciaPage() {
  const user = await getServerUser()
  if (!user) redirect('/?login=1')

  const role = userToRole(user)
  if (!role || role === 'padre') redirect('/general')

  const token = await getServerToken()
  let idEstudiantePropio: number | undefined

  if (role === 'estudiante' && token) {
    try {
      const res = await fetch(`${API}/estudiantes/me`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      })
      if (res.ok) {
        const est = await res.json() as Record<string, unknown>
        idEstudiantePropio = (est.id_estudiante ?? est.idEstudiante) as number | undefined
      }
    } catch {
      // leave idEstudiantePropio undefined
    }
  }

  return (
    <AsistenciaClient
      role={role}
      idUsuarioRegistrador={user.idUsuario}
      idEstudiantePropio={idEstudiantePropio}
    />
  )
}
