import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

// Reglas de código testeable (sección 5 de la planeación de correcciones) que se
// pueden vigilar leyendo el código fuente.

function archivos(dir: string, filtro: (ruta: string) => boolean, salida: string[] = []): string[] {
  for (const nombre of readdirSync(dir)) {
    const ruta = join(dir, nombre)
    if (statSync(ruta).isDirectory()) archivos(ruta, filtro, salida)
    else if (filtro(ruta)) salida.push(ruta)
  }
  return salida
}

const norm = (r: string) => r.split(String.fromCharCode(92)).join('/')
const fuentes = archivos('src', (r) => /\.(ts|tsx)$/.test(r))
const leer = (r: string) => readFileSync(r, 'utf-8')

describe('arquitectura (reglas 1 a 4)', () => {
  it('regla 1: ninguna vista (*Client.tsx ni componente) llama a la API directamente', () => {
    const vistas = fuentes.filter((r) => /Client\.tsx$/.test(r) || norm(r).startsWith('src/components/'))
    const infractoras = vistas.filter((r) => /NEXT_PUBLIC_API_URL|\bapiFetch\b|\bserverFetch\b/.test(leer(r)))
    expect(infractoras.map(norm)).toEqual([])
  })

  it('regla 3: ningún código lee el token de acceso desde el navegador', () => {
    const infractoras = fuentes.filter((r) => /getClientToken|document\.cookie[^\n]*eys_access/.test(leer(r)))
    expect(infractoras.map(norm)).toEqual([])
  })

  it('regla 4: las páginas toman el rol del token, no de la cookie eys_user', () => {
    // Fuera de server.ts (que decodifica el token) nadie debe parsear eys_user en el servidor.
    const infractoras = fuentes
      .filter((r) => norm(r) !== 'src/lib/auth/server.ts' && norm(r) !== 'src/hooks/useAuth.ts' && norm(r) !== 'src/auth/actions.ts')
      .filter((r) => /get\(['"]eys_user['"]\)/.test(leer(r)))
    expect(infractoras.map(norm)).toEqual([])
  })

  it('WEB-01/08: ya no existe src/services/supabase ni algo que lo importe', () => {
    expect(existsSync('src/services/supabase')).toBe(false)
    expect(fuentes.filter((r) => /services\/supabase|@supabase\//.test(leer(r))).map(norm)).toEqual([])
  })

  it('WEB-01: el guardia de rutas es proxy.ts y usa sessionMiddleware', () => {
    expect(existsSync('middleware.ts')).toBe(false)
    expect(leer('proxy.ts')).toContain("@/lib/auth/sessionMiddleware")
  })

  it('WEB-INF-4: hay un solo despliegue (se eliminó el flujo de Azure)', () => {
    expect(existsSync('.github/workflows/main_eyesschool.yml')).toBe(false)
  })
})
