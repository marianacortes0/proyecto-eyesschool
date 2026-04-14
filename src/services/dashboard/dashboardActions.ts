'use server'

import { createAdminClient } from '../supabase/admin'

export async function getPromedioGeneralAction(): Promise<number> {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from('notas').select('nota')
  if (error) throw new Error(error.message)
  if (!data || data.length === 0) return 0
  const promedio = data.reduce((acc: number, curr: any) => acc + curr.nota, 0) / data.length
  return Number(promedio.toFixed(2))
}

export async function getAprobacionAction(): Promise<number> {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from('notas').select('nota')
  if (error) throw new Error(error.message)
  if (!data || data.length === 0) return 0
  const aprobados = data.filter((n: any) => n.nota >= 3)
  return Math.round((aprobados.length / data.length) * 100)
}

export async function getEstudiantesActivosAction(): Promise<number> {
  const supabase = createAdminClient()
  const { count, error } = await supabase
    .from('estudiantes')
    .select('*', { count: 'exact', head: true })
  if (error) throw new Error(error.message)
  return count ?? 0
}

export async function getAsistenciaPromedioAction(): Promise<number> {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from('Asistencia').select('estado')
  if (error) throw new Error(error.message)
  if (!data || data.length === 0) return 0
  const asistencias = data.filter((a: any) => a.estado === 'Presente' || a.estado === 'Tarde')
  return Math.round((asistencias.length / data.length) * 100)
}

export async function getNotasPorPeriodoAction(): Promise<{ periodo: string; promedio: number }[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from('notas').select('idPeriodo, nota')
  if (error) throw new Error(error.message)
  if (!data || data.length === 0) return []
  const grouped: Record<number, number[]> = {}
  data.forEach((item: any) => {
    if (!grouped[item.idPeriodo]) grouped[item.idPeriodo] = []
    grouped[item.idPeriodo].push(item.nota)
  })
  return Object.keys(grouped).map((periodo) => {
    const notas = grouped[Number(periodo)]
    const promedio = notas.reduce((a: number, b: number) => a + Number(b), 0) / notas.length
    return { periodo, promedio: Number(promedio.toFixed(2)) }
  })
}

export async function getDistribucionUsuariosAction(): Promise<{ name: string; value: number }[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from('usuario').select('idRol')
  if (error) throw new Error(error.message)
  if (!data) return []
  const ROL_NOMBRES: Record<number, string> = {
    1: 'Profesor',
    2: 'Estudiante',
    3: 'Administrador',
    4: 'Padre',
  }
  const counts: Record<string, number> = {}
  data.forEach((item: any) => {
    const name = ROL_NOMBRES[item.idRol] ?? 'Desconocido'
    counts[name] = (counts[name] ?? 0) + 1
  })
  return Object.entries(counts).map(([name, value]) => ({ name, value }))
}
