// Estudiante activo de un padre con uno o varios hijos vinculados (WEB-03).

/** Hijo vinculado a un padre (respuesta de GET /padres/me/hijos, en camelCase). */
export type Hijo = {
  idEstudiante: number
  nombre: string
  documento: string
  parentesco: string
  idCursoActual: number | null
  /** Código del estudiante (EST001…), si la API lo entrega. */
  codigoEstudiante?: string
  /**
   * `true` cuando el curso NO se pudo leer porque la consulta del estudiante
   * falló, no porque el estudiante no tenga curso. Las pantallas que dependen
   * del curso muestran un error con reintento en vez de «sin curso asignado».
   */
  cursoNoDisponible?: boolean
}

export const MSG_SIN_HIJOS = 'No hay estudiantes vinculados'

/**
 * Hijo que se debe mostrar: el pedido en la URL (`?hijo=`), o el primero si no se
 * pidió ninguno o el id no es de un hijo de este padre; `null` si no tiene hijos.
 */
export function elegirHijoActivo(hijos: Hijo[], idSolicitado?: number | string | null): Hijo | null {
  if (hijos.length === 0) return null
  const id = idSolicitado === undefined || idSolicitado === null || idSolicitado === '' ? Number.NaN : Number(idSolicitado)
  return hijos.find((h) => h.idEstudiante === id) ?? hijos[0]
}
