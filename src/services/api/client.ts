const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

/** Ruta del route handler que agrega el token en el servidor (src/app/api/proxy). */
export const PROXY_URL = '/api/proxy'

// Recursive snake_case → camelCase converter
export function toCamel(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(toCamel)
  if (v !== null && typeof v === 'object') {
    return Object.fromEntries(
      Object.entries(v as Record<string, unknown>).map(([k, val]) => [
        k.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase()),
        toCamel(val),
      ])
    )
  }
  return v
}

// Error de la API con el código HTTP y el `detail` original de FastAPI, para que
// quien llama distinga, por ejemplo, un 409 (ya registrado) de un 500.
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly detail?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Generic fetch wrapper — en el servidor acepta un token explícito
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  // En el navegador no hay token (cookie httpOnly, WEB-02): la llamada pasa por el
  // proxy del servidor, que lo agrega. En el servidor se llama a la API directo
  // con el token explícito.
  const enNavegador = typeof window !== 'undefined'
  const t = enNavegador ? null : token
  const isFormData = options.body instanceof FormData
  const headers: Record<string, string> = {
    ...(t ? { Authorization: `Bearer ${t}` } : {}),
    ...(options.headers as Record<string, string> | undefined),
  }
  if (!isFormData) headers['Content-Type'] = 'application/json'

  const res = await fetch(`${enNavegador ? PROXY_URL : BASE_URL}${path}`, { ...options, headers })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const detail = (body as Record<string, unknown>).detail
    throw new ApiError(res.status, errorMessage(detail, res.status), detail)
  }
  if (res.status === 204) return null as T
  return toCamel(await res.json()) as T
}

// FastAPI responde `detail` como texto, o como lista de errores en un 422.
export function errorMessage(detail: unknown, status: number): string {
  if (typeof detail === 'string' && detail) return detail
  if (Array.isArray(detail) && detail.length > 0) {
    const first = detail[0] as { msg?: unknown } | null
    if (first && typeof first.msg === 'string') return first.msg
  }
  return `HTTP ${status}`
}
