import { useCallback, useEffect, useState } from 'react'
import { getErrorMessage } from '@/lib/errors'

/**
 * Carga de los datos del inicio con error y reintento (DEF-WEB-08). Si el
 * servidor ya trajo los datos no vuelve a pedirlos; si no (la API falló al
 * renderizar), los pide desde el navegador y, ante un error, deja `reintentar`.
 * `cargar` debe ser estable (una función del servicio, no una flecha nueva).
 */
export function useCargaInicio<T>(cargar: () => Promise<T>, initialData?: T) {
  const [data, setData] = useState<T | null>(initialData ?? null)
  const [loading, setLoading] = useState(!initialData)
  const [error, setError] = useState<string | null>(null)

  const traer = useCallback(
    () =>
      cargar()
        .then(setData, (e: unknown) => setError(getErrorMessage(e, 'No se pudo cargar la información. Intenta de nuevo.')))
        .finally(() => setLoading(false)),
    [cargar]
  )

  useEffect(() => {
    if (!initialData) void traer()
  }, [initialData, traer])

  const reintentar = useCallback(() => {
    setLoading(true)
    setError(null)
    void traer()
  }, [traer])

  return { data, loading, error, reintentar }
}
