import { ApiError } from './client'

/**
 * DEF-WEB-10 · En producción, el mensaje de un error lanzado en una Server Action
 * no llega al navegador («Minified React error #441»). Un rechazo de la API por
 * los datos o los permisos (4xx) se devuelve como valor para que el usuario lea
 * el motivo («El correo ya está registrado», «No tiene asignada esta materia…»);
 * un 5xx o un fallo de red se sigue lanzando.
 */
export async function conMotivo(fn: () => Promise<void>): Promise<{ error?: string }> {
  try {
    await fn()
    return {}
  } catch (e) {
    if (e instanceof ApiError && e.status >= 400 && e.status < 500) return { error: e.message }
    throw e
  }
}
