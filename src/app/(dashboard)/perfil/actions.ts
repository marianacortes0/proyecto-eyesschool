'use server'

import { createAdminClient } from '@/services/supabase/admin'

export async function serverEnsureEstudiante(idUsuario: number): Promise<number> {
  const db = createAdminClient()
  const { data: existing } = await db
    .from('estudiantes')
    .select('idEstudiante')
    .eq('idUsuario', idUsuario)
    .maybeSingle()
  if (existing) return existing.idEstudiante

  const count = await db.from('estudiantes').select('idEstudiante', { count: 'exact', head: true })
  const num   = String((count.count ?? 0) + 1).padStart(2, '0')
  const { data, error } = await db
    .from('estudiantes')
    .insert({
      idUsuario,
      codigoEstudiante: `EST${num}`,
      fechaIngreso:     new Date().toISOString().slice(0, 10),
      estado:           'Activo',
    })
    .select('idEstudiante')
    .single()
  if (error) throw new Error(error.message)
  return data.idEstudiante
}

export async function serverUpdateEstudianteCurso(idEstudiante: number, idCurso: number): Promise<void> {
  const db = createAdminClient()
  const { error } = await db
    .from('estudiantes')
    .update({ idCursoActual: idCurso })
    .eq('idEstudiante', idEstudiante)
  if (error) throw new Error(error.message)
}

export async function serverUpsertEPS(
  idEstudiante: number,
  payload: { idIPS: number; nombreIPS: string; tipoAfiliacion: string }
): Promise<void> {
  const db = createAdminClient()

  const { data: existing } = await db
    .from('estudianteips')
    .select('idIPS')
    .eq('idEstudiante', idEstudiante)
    .eq('activo', true)
    .maybeSingle()

  if (existing) {
    const { error } = await db
      .from('estudianteips')
      .update({ nombreIPS: payload.nombreIPS, tipoAfiliacion: payload.tipoAfiliacion })
      .eq('idEstudiante', idEstudiante)
      .eq('idIPS', existing.idIPS)
    if (error) throw new Error(error.message)
  } else {
    const { error } = await db
      .from('estudianteips')
      .insert({
        idEstudiante,
        idIPS: payload.idIPS,
        nombreIPS: payload.nombreIPS,
        tipoAfiliacion: payload.tipoAfiliacion,
        fechaAfiliacion: new Date().toISOString().slice(0, 10),
        activo: true,
      })
    if (error) throw new Error(error.message)
  }
}

export async function serverUpdateUsuario(
  idUsuario: number,
  payload: Record<string, string | null>
): Promise<void> {
  const db = createAdminClient()
  const { error } = await db.from('usuario').update(payload).eq('idUsuario', idUsuario)
  if (error) throw new Error(error.message)
}

export async function serverUpdateAdministrador(
  idAdministrador: number,
  payload: { cargo?: string; nivelAcceso?: string }
): Promise<void> {
  const db = createAdminClient()
  const { error } = await db.from('administrador').update(payload).eq('idAdministrador', idAdministrador)
  if (error) throw new Error(error.message)
}

export async function serverInsertAdministrador(
  idUsuario: number,
  payload: { cargo: string; nivelAcceso: string }
): Promise<{ idAdministrador: number; cargo: string; nivelAcceso: string; estado: string; fechaAsignacion: string }> {
  const db = createAdminClient()
  const { data, error } = await db
    .from('administrador')
    .insert({ idUsuario, cargo: payload.cargo, nivelAcceso: payload.nivelAcceso, estado: 'Activo', fechaAsignacion: new Date().toISOString().slice(0, 10) })
    .select('idAdministrador, cargo, nivelAcceso, estado, fechaAsignacion')
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function serverUpdateProfesor(
  idProfesor: number,
  payload: { titulo?: string; nivelEstudios?: string }
): Promise<void> {
  const db = createAdminClient()
  const { error } = await db
    .from('profesores')
    .update(payload)
    .eq('idProfesor', idProfesor)
  if (error) throw new Error(error.message)
}

export async function serverEnsureProfesor(idUsuario: number): Promise<number> {
  const db = createAdminClient()
  const { data: existing } = await db
    .from('profesores')
    .select('idProfesor')
    .eq('idUsuario', idUsuario)
    .maybeSingle()
  if (existing) return existing.idProfesor

  const count = await db.from('profesores').select('idProfesor', { count: 'exact', head: true })
  const num   = String((count.count ?? 0) + 1).padStart(2, '0')
  const { data, error } = await db
    .from('profesores')
    .insert({
      idUsuario,
      codigoProfesor:   `PROF${num}`,
      titulo:           '',
      nivelEstudios:    '',
      fechaVinculacion: new Date().toISOString().slice(0, 10),
      estado:           'Activo',
    })
    .select('idProfesor')
    .single()
  if (error) throw new Error(error.message)
  return data.idProfesor
}

export async function serverAddEspecializacion(
  idProfesor: number,
  idEspecializacion: number,
  institucion: string
): Promise<void> {
  const db = createAdminClient()
  const { error } = await db
    .from('profesorespecializacion')
    .upsert({ idProfesor, idEspecializacion, institucion }, { onConflict: 'idProfesor,idEspecializacion' })
  if (error) throw new Error(error.message)
}

export async function serverRemoveEspecializacion(
  idProfesor: number,
  idEspecializacion: number
): Promise<void> {
  const db = createAdminClient()
  const { error } = await db
    .from('profesorespecializacion')
    .delete()
    .eq('idProfesor', idProfesor)
    .eq('idEspecializacion', idEspecializacion)
  if (error) throw new Error(error.message)
}

export async function serverBuscarEstudiantePorDocumento(
  numeroDocumento: string
): Promise<{ idEstudiante: number; nombre: string; documento: string } | null> {
  const db = createAdminClient()
  const { data } = await db
    .from('estudiantes')
    .select('idEstudiante, usuario ( primerNombre, primerApellido, numeroDocumento )')
    .eq('usuario.numeroDocumento', numeroDocumento)
    .not('usuario', 'is', null)
    .maybeSingle()
  if (!data) return null
  const u = (data as any).usuario
  return {
    idEstudiante: data.idEstudiante,
    nombre: u ? `${u.primerNombre} ${u.primerApellido}` : `Estudiante #${data.idEstudiante}`,
    documento: u?.numeroDocumento ?? numeroDocumento,
  }
}

export async function serverUpsertPadre(
  idUsuario: number,
  idEstudiante: number,
  parentesco: string,
  ocupacion: string | null
): Promise<void> {
  const db = createAdminClient()
  const { data: existing } = await db
    .from('padres')
    .select('idPadre')
    .eq('idUsuario', idUsuario)
    .maybeSingle()
  if (existing) {
    const { error } = await db
      .from('padres')
      .update({ idEstudiante, parentesco, ocupacion })
      .eq('idPadre', existing.idPadre)
    if (error) throw new Error(error.message)
  } else {
    const { error } = await db
      .from('padres')
      .insert({ idUsuario, idEstudiante, parentesco, ocupacion })
    if (error) throw new Error(error.message)
  }
}
