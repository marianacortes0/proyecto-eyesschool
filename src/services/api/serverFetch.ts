import { ApiError, errorMessage } from './client'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

export type ServerFetchInit = Omit<RequestInit, 'headers'> & {
  token?: string | null
  headers?: HeadersInit
}

/**
 * Única forma de llamar a la API desde el servidor (Server Actions y páginas).
 * Recibe el token por parámetro —no lee cookies— para poder probarse simulando
 * solo `fetch`. Devuelve el JSON tal cual (snake_case); `null` en un 204.
 * Ante un error lanza `ApiError` con `status` y `detail`.
 */
export async function serverFetch<T>(path: string, init: ServerFetchInit = {}): Promise<T> {
  const { token, headers, ...rest } = init
  const isFormData = rest.body instanceof FormData
  const res = await fetch(`${API}${path}`, {
    cache: 'no-store',
    ...rest,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers ? Object.fromEntries(new Headers(headers)) : {}),
    },
  })

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as Record<string, unknown>
    throw new ApiError(res.status, errorMessage(body.detail, res.status), body.detail)
  }
  if (res.status === 204) return null as T
  return (await res.json()) as T
}
