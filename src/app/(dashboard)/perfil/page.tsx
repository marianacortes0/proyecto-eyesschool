export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { getServerUser, getServerToken, userToRole } from '@/lib/auth/server'
import PerfilClient from './PerfilClient'
import type { AdminPerfil, CursoPerfil, ProfesorPerfil, PerfilUsuario } from '@/services/usuario/usuarioService'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'
const API_ORIGIN = API.replace(/\/api\/v1\/?$/, '')

/** Resuelve la ruta de la foto (relativa /static/...) contra el origen del backend. */
function resolveFoto(v: unknown): string | null {
  const url = typeof v === 'string' ? v : ''
  if (!url) return null
  if (/^https?:\/\//.test(url) || url.startsWith('data:')) return url
  return `${API_ORIGIN}${url.startsWith('/') ? '' : '/'}${url}`
}

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
  if (!user) redirect('/?login=1')

  const role = userToRole(user)
  if (!role) redirect('/?login=1')

  const token = await getServerToken()

  // Perfil base en el render del servidor (evita el spinner del fetch en cliente).
  let perfilServer: PerfilUsuario | null = null
  if (token) {
    const u = await serverFetch<Record<string, unknown>>(`/usuarios/${user.idUsuario}`, token)
    if (u) {
      perfilServer = {
        idUsuario:       u.idUsuario as number,
        primerNombre:    u.primerNombre as string,
        segundoNombre:   u.segundoNombre as string | null,
        primerApellido:  u.primerApellido as string,
        segundoApellido: u.segundoApellido as string | null,
        correo:          u.correo as string | null,
        tipoDocumento:   u.tipoDocumento as string,
        numeroDocumento: u.numeroDocumento as string,
        telefono:        u.telefono as string | null,
        direccion:       u.direccion as string | null,
        genero:          u.genero as string | null,
        rolNombre:       (u.nombreRol ?? u.rolNombre) as string | null ?? null,
        fechaRegistro:   (u.fechaRegistro as string | null) ?? null,
        ultimoAcceso:    (u.ultimoAcceso as string | null) ?? null,
        fotoPerfil:      resolveFoto(u.fotoPerfil),
      }
    }
  }

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
        perfilServer={perfilServer}
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
      // GET /profesores IGNORA ?id_usuario (solo skip/limit) → se trae la lista y
      // se busca la fila del usuario. Con limit=1 se cargaría OTRO profesor.
      serverFetch<Array<Record<string, unknown>>>(`/profesores?limit=500`, token),
    ])
    especializacionesEnum = (esps ?? []).map(e => ({
      idEspecializacion:     e.idEspecializacion,
      nombreEspecializacion: e.nombreEspecializacion,
    }))
    const p = (profList ?? []).find(x => (x.idUsuario as number) === user.idUsuario)
    if (p) {
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
          // El nombre viene ANIDADO en `especializacion` (join del backend), no
          // en el nivel superior; leerlo plano dejaba el nombre vacío.
          nombreEspecializacion: ((e.especializacion as Record<string, unknown> | null)?.nombreEspecializacion as string) ?? '',
          institucion:           (e.institucion as string) ?? '',
        })),
      }
    }
  }

  if (role === 'admin') {
    // GET /administradores ignora ?id_usuario → se trae la lista y se busca al
    // administrador del usuario logueado (si no, se cargaría OTRO administrador).
    const adminList = await serverFetch<Array<Record<string, unknown>>>(
      `/administradores?limit=500`,
      token
    )
    const a = (adminList ?? []).find(x => (x.idUsuario as number) === user.idUsuario)
    if (a) {
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
      // /padres/me ya trae el nombre y documento del estudiante asociado.
      if (padreData.idEstudiante != null) {
        estudianteAsociadoServer = {
          idEstudiante: padreData.idEstudiante as number,
          nombre:       (padreData.nombreEstudiante as string | null) ?? `Estudiante #${padreData.idEstudiante}`,
          documento:    (padreData.documentoEstudiante as string | null) ?? '',
        }
      }
    }
  }

  return (
    <PerfilClient
      role={role}
      perfilServer={perfilServer}
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
