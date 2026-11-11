// Mensajes del estudiante asociado. Van en un módulo aparte porque
// `asociadoActions.ts` es `'use server'` y ahí solo pueden exportarse funciones
// asíncronas: una constante exportada rompe el módulo entero en el build.

/** Lo que ve el usuario si una consulta del horario falla; nunca una pantalla vacía. */
export const MSG_HORARIO_ERROR = 'No pudimos cargar el horario. Intenta de nuevo.'
