'use server'

import { createAdminClient } from '../supabase/admin'
import { revalidatePath } from 'next/cache'
import { type CreateRegistroData } from './asistenciaService'

/**
 * Registra asistencia usando el Admin Client para bypass de RLS.
 * Útil para roles (como profesores) que tienen restricciones de inserción directa.
 */
export async function crearRegistroAction(data: CreateRegistroData) {
  const supabase = createAdminClient()

  const { error } = await supabase.from('Asistencia').insert({
    idEstudiante:  data.idEstudiante,
    estado:        data.estado,
    fecha:         data.fecha,
    observacion:   data.observacion ?? null,
    registradoPor: data.registradoPor,
    activo:        true,
  })

  if (error) {
    console.error('Error en crearRegistroAction:', error)
    throw new Error(error.message)
  }

  revalidatePath('/qr/escanear')
  revalidatePath('/asistencia')
}
