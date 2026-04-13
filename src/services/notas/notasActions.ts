'use server'

import { createAdminClient } from '../supabase/admin'
import { revalidatePath } from 'next/cache'
import { type Nota } from './notasService'

/**
 * Registra una nota usando el Admin Client para bypass de RLS.
 */
export async function createNotaAction(
  payload: Pick<Nota, 'idEstudiante' | 'idMateria' | 'idPeriodo' | 'nota' | 'observacion' | 'registradoPor'>
) {
  const supabase = createAdminClient()

  const { error } = await supabase.from('notas').insert(payload)

  if (error) {
    console.error('Error en createNotaAction:', error)
    throw new Error(error.message)
  }

  revalidatePath('/notas')
}
