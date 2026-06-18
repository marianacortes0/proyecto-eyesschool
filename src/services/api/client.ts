const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

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

// Read access token from cookie — client-side only
export function getClientToken(): string | null {
  if (typeof document === 'undefined') return null
  const m = document.cookie.match(/(?:^|; )eys_access=([^;]*)/)
  return m ? decodeURIComponent(m[1]) : null
}

// Generic fetch wrapper — accepts an explicit token for server-side use
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const t = token ?? getClientToken()
  const isFormData = options.body instanceof FormData
  const headers: Record<string, string> = {
    ...(t ? { Authorization: `Bearer ${t}` } : {}),
    ...(options.headers as Record<string, string> | undefined),
  }
  if (!isFormData) headers['Content-Type'] = 'application/json'

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error((body as Record<string, unknown>).detail as string ?? `HTTP ${res.status}`)
  }
  if (res.status === 204) return null as T
  return toCamel(await res.json()) as T
}
