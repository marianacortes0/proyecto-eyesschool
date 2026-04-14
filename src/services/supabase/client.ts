import { createBrowserClient } from '@supabase/ssr'
import { type Database } from '../../types/supabase'

// Singleton: una sola instancia por proceso de navegador.
// Múltiples instancias compiten por el mismo Web Lock de auth → AbortError.
// Se deshabilita el lock porque con singleton no hay concurrencia entre instancias.
let _client: ReturnType<typeof createBrowserClient<Database>> | null = null

export function createClient() {
  if (!_client) {
    _client = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          lock: async <R>(_name: string, _acquireTimeout: number, fn: () => Promise<R>): Promise<R> => fn(),
        },
      }
    )
  }
  return _client
}
