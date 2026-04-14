import { createClient } from '@/services/supabase/server'
import { createAdminClient } from '@/services/supabase/admin'
import { redirect } from 'next/navigation'
import { mapRolToKey } from '@/lib/utils/permissions'
import PerfilClient from './PerfilClient'
import type { AdminPerfil, CursoPerfil, ProfesorPerfil } from '@/services/usuario/usuarioService'

export default async function PerfilPage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (!user || error) redirect('/login')

  const nombreRol =
    (user.app_metadata?.rol as string | undefined) ??
    (user.user_metadata?.rol as string | undefined)
  const role = mapRolToKey(nombreRol, user.user_metadata?.idRol as number | undefined)

  if (!role) redirect('/login')

  const db = createAdminClient()

  let adminData: AdminPerfil | null = null
  let cursosServer: CursoPerfil[] = []
  let idEstudianteServer: number | null = null
  let idCursoActualServer: number | null = null
  let profesorServer: ProfesorPerfil | null = null
  let especializacionesEnum: { idEspecializacion: number; nombreEspecializacion: string }[] = []
  let padreServer: { idPadre: number; idEstudiante: number; parentesco: string; ocupacion: string | null } | null = null
  let estudianteAsociadoServer: { idEstudiante: number; nombre: string; documento: string } | null = null

  const { data: usuarioRow } = await db
    .from('usuario')
    .select('idUsuario')
    .eq('auth_id', user.id)
    .maybeSingle()

  if (role === 'docente' && usuarioRow) {
    const { data: esps } = await db
      .from('especializaciones')
      .select('idEspecializacion, nombreEspecializacion')
      .eq('activo', true)
    especializacionesEnum = (esps ?? []) as typeof especializacionesEnum

    const { data: prof } = await db
      .from('profesores')
      .select('idProfesor, titulo, nivelEstudios, codigoProfesor, fechaVinculacion')
      .eq('idUsuario', usuarioRow.idUsuario)
      .maybeSingle()

    if (prof) {
      const { data: espRel } = await db
        .from('profesorespecializacion')
        .select('institucion, idEspecializacion, especializaciones ( nombreEspecializacion )')
        .eq('idProfesor', prof.idProfesor)
      profesorServer = {
        ...prof,
        especializaciones: ((espRel ?? []) as any[]).map(e => ({
          idEspecializacion: e.idEspecializacion,
          nombreEspecializacion: e.especializaciones?.nombreEspecializacion ?? '',
          institucion: e.institucion,
        })),
      } as ProfesorPerfil
    }
  }

  if (role === 'admin' && usuarioRow) {
    const { data } = await db
      .from('administrador')
      .select('idAdministrador, cargo, nivelAcceso, estado, fechaAsignacion')
      .eq('idUsuario', usuarioRow.idUsuario)
      .maybeSingle()
    adminData = data as AdminPerfil | null
  }

  if (role === 'estudiante' && usuarioRow) {
    const { data: cursos } = await db
      .from('cursos')
      .select('idCurso, nombreCurso, grado, jornada')
      .order('jornada').order('grado')
    cursosServer = (cursos ?? []) as CursoPerfil[]

    let { data: est } = await db
      .from('estudiantes')
      .select('idEstudiante, idCursoActual')
      .eq('idUsuario', usuarioRow.idUsuario)
      .maybeSingle()

    // Si no existe fila en estudiantes, la creamos automáticamente
    if (!est) {
      const count = await db.from('estudiantes').select('idEstudiante', { count: 'exact', head: true })
      const num   = String((count.count ?? 0) + 1).padStart(2, '0')
      const { data: nuevo } = await db
        .from('estudiantes')
        .insert({
          idUsuario:        usuarioRow.idUsuario,
          codigoEstudiante: `EST${num}`,
          fechaIngreso:     new Date().toISOString().slice(0, 10),
          estado:           'Activo',
        })
        .select('idEstudiante, idCursoActual')
        .single()
      est = nuevo
    }

    if (est) {
      idEstudianteServer  = est.idEstudiante
      idCursoActualServer = est.idCursoActual ?? null
    }
  }

  if (role === 'padre' && usuarioRow) {
    const { data: padre } = await db
      .from('padres')
      .select('idPadre, idEstudiante, parentesco, ocupacion')
      .eq('idUsuario', usuarioRow.idUsuario)
      .maybeSingle()
    if (padre) {
      padreServer = padre
      const { data: est } = await db
        .from('estudiantes')
        .select('idEstudiante, usuario ( primerNombre, primerApellido, numeroDocumento )')
        .eq('idEstudiante', padre.idEstudiante)
        .maybeSingle()
      if (est) {
        const u = (est as any).usuario
        estudianteAsociadoServer = {
          idEstudiante: est.idEstudiante,
          nombre: u ? `${u.primerNombre} ${u.primerApellido}` : `Estudiante #${est.idEstudiante}`,
          documento: u?.numeroDocumento ?? '',
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
