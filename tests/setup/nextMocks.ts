import { vi } from 'vitest'

// ── next/headers ─────────────────────────────────────────────────────────────
// Cookies falsas: `cookieJar` guarda lo que la aplicación escribe y permite que
// cada prueba prepare lo que "llegó" en la petición.

export type CookieOptions = {
  path?: string
  maxAge?: number
  sameSite?: 'lax' | 'strict' | 'none'
  httpOnly?: boolean
  secure?: boolean
}

export type CookieEntry = { value: string; options: CookieOptions }

export const cookieJar = {
  store: new Map<string, CookieEntry>(),
  reset() {
    this.store.clear()
  },
  seed(values: Record<string, string>) {
    this.store.clear()
    for (const [name, value] of Object.entries(values)) this.store.set(name, { value, options: {} })
  },
  options(name: string): CookieOptions | undefined {
    return this.store.get(name)?.options
  },
}

const fakeCookies = {
  get: (name: string) => {
    const entry = cookieJar.store.get(name)
    return entry ? { name, value: entry.value } : undefined
  },
  set: (name: string, value: string, options: CookieOptions = {}) => {
    cookieJar.store.set(name, { value, options })
  },
  delete: (name: string) => {
    cookieJar.store.delete(name)
  },
  has: (name: string) => cookieJar.store.has(name),
}

vi.mock('next/headers', () => ({
  cookies: async () => fakeCookies,
  headers: async () => new Headers(),
}))

// ── next/navigation ──────────────────────────────────────────────────────────
// `redirect` lanza igual que el real, para que la acción se detenga.

export const navigationMock = {
  push: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
  params: new URLSearchParams(),
  pathname: '/',
}

export class RedirectError extends Error {
  constructor(public readonly destino: string) {
    super(`NEXT_REDIRECT:${destino}`)
  }
}

vi.mock('next/navigation', () => ({
  redirect: (destino: string) => {
    throw new RedirectError(destino)
  },
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND')
  },
  useRouter: () => navigationMock,
  usePathname: () => navigationMock.pathname,
  useSearchParams: () => navigationMock.params,
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}))
