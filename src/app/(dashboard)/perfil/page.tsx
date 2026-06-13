export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { getServerUser, getServerToken, userToRole } from '@/lib/auth/server'
import PerfilClient from './PerfilClient'
import type { AdminPerfil, CursoPerfil, ProfesorPerfil } from '@/services/usuario/usuarioService'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

function toCamel(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(toCamel)
  if (v !== null && typeof v === 'object') {
    return Object.fromEntries(
      Object.entries(v as Record<string, unknown>).map(([k, val]) => [
        k.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase()),
        toCamel(val),
      ])
    )
  }
  return v
}

async function serverFetch<T>(path: string, token: string): Promise<T | null> {
  try {
    const res = await fetch(`${API}${path}`, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      cache: 'no-store',
    })
    if (!res.ok) return null
    return toCamel(await res.json()) as T
  } catch {
    return null
  }
}

export default async function PerfilPage() {
  const user = await getServerUser()
  if (!user) redirect('/login')

  const role = userToRole(user)
  if (!role) redirect('/login')

  const token = await getServerToken()

  let adminData: AdminPerfil | null = null
  let cursosServer: CursoPerfil[] = []
  let idEstudianteServer: number | null = null
  let idCursoActualServer: number | null = null
  let profesorServer: ProfesorPerfil | null = null
  let especializacionesEnum: { idEspecializacion: number; nombreEspecializacion: string }[] = []
  let padreServer: { idPadre: number; idEstudiante: number; parentesco: string; ocupacion: string | null } | null = null
  let estudianteAsociadoServer: { idEstudiante: number; nombre: string; documento: string } | null = null

  if (!token) {
    return (
      <PerfilClient
        role={role}
        adminDataServer={adminData}
        cursosServer={cursosServer}
        idEstudianteServer={idEstudianteServer}
        idCursoActualServer={idCursoActualServer}
        profesorServer={profesorServer}
        especializacionesEnum={especializacionesEnum}
        padreServer={padreServer}
        estudianteAsociadoServer={estudianteAsociadoServer}
      />
    )
  }

  if (role === 'docente') {
    const [esps, profList] = await Promise.all([
      serverFetch<Array<{ idEspecializacion: number; nombreEspecializacion: string }>>('/especializaciones?limit=200', token),
      serverFetch<Array<Record<string, unknown>>>(`/profesores?id_usuario=${user.idUsuario}&limit=1`, token),
    ])
    especializacionesEnum = (esps ?? []).map(e => ({
      idEspecializacion:     e.idEspecializacion,
      nombreEspecializacion: e.nombreEspecializacion,
    }))
    if (profList && profList.length > 0) {
      const p = profList[0] as Record<string, unknown>
      const espsRel = await serverFetch<Array<Record<string, unknown>>>(
        `/profesores/${p.idProfesor}/especializaciones`,
        token
      )
      profesorServer = {
        idProfesor:       p.idProfesor as number,
        titulo:           p.titulo as string,
        nivelEstudios:    p.nivelEstudios as string,
        codigoProfesor:   p.codigoProfesor as string,
        fechaVinculacion: p.fechaVinculacion as string,
        especializaciones: (espsRel ?? []).map(e => ({
          idEspecializacion:     e.idEspecializacion as number,
          nombreEspecializacion: e.nombreEspecializacion as string,
          institucion:           (e.institucion as string) ?? '',
        })),
      }
    }
  }

  if (role === 'admin') {
    const adminList = await serverFetch<Array<Record<string, unknown>>>(
      `/administradores?id_usuario=${user.idUsuario}&limit=1`,
      token
    )
    if (adminList && adminList.length > 0) {
      const a = adminList[0]
      adminData = {
        idAdministrador: a.idAdministrador as number,
        cargo:           a.cargo as string,
        nivelAcceso:     a.nivelAcceso as string,
        estado:          a.estado as string,
        fechaAsignacion: a.fechaAsignacion as string,
      }
    }
  }

  if (role === 'estudiante') {
    const [cursosData, estData] = await Promise.all([
      serverFetch<Array<CursoPerfil>>('/cursos?limit=200', token),
      serverFetch<Record<string, unknown>>('/estudiantes/me', token),
    ])
    cursosServer = (cursosData ?? []).map(c => ({
      idCurso:     (c as Record<string, unknown>).idCurso as number,
      nombreCurso: (c as Record<string, unknown>).nombreCurso as string,
      grado:       (c as Record<string, unknown>).grado as string,
      jornada:     (c as Record<string, unknown>).jornada as string,
    }))
    if (estData) {
      idEstudianteServer  = estData.idEstudiante as number
      idCursoActualServer = (estData.idCursoActual as number | null) ?? null
    }
  }

  if (role === 'padre') {
    const padreData = await serverFetch<Record<string, unknown>>('/padres/me', token)
    if (padreData) {
      padreServer = {
        idPadre:    padreData.idPadre as number,
        idEstudiante: padreData.idEstudiante as number,
        parentesco:   padreData.parentesco as string,
        ocupacion:    padreData.ocupacion as string | null,
      }
      const estData = await serverFetch<Record<string, unknown>>(
        `/estudiantes/${padreData.idEstudiante}`,
        token
      )
      if (estData) {
        estudianteAsociadoServer = {
          idEstudiante: estData.idEstudiante as number,
          nombre:       `Estudiante #${estData.idEstudiante}`,
          documento:    '',
        }
      }
    }
  }

  return (
    <PerfilClient
      role={role}
      adminDataServer={adminData}
      cursosServer={cursosServer}
      idEstudianteServer={idEstudianteServer}
      idCursoActualServer={idCursoActualServer}
      profesorServer={profesorServer}
      especializacionesEnum={especializacionesEnum}
      padreServer={padreServer}
      estudianteAsociadoServer={estudianteAsociadoServer}
    />
  )
}
