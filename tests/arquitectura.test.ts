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

  // DEF-WEB-04: Next 16 solo carga el proxy si está al mismo nivel que `app`
  // (node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md). Con la
  // app en src/app, uno en la raíz se ignora sin aviso y el guardia no corre.
  it('WEB-01 / DEF-WEB-04: el proxy está junto a src/app y usa sessionMiddleware', () => {
    expect(existsSync('src/app'), 'la app vive en src/app').toBe(true)
    expect(leer('src/proxy.ts')).toContain('@/lib/auth/sessionMiddleware')
    expect(leer('src/proxy.ts')).toMatch(/export (async )?function proxy\(/)
  })

  it('DEF-WEB-04: no hay proxy ni middleware fuera de src (Next los ignoraría)', () => {
    const ignorados = ['proxy.ts', 'proxy.js', 'middleware.ts', 'middleware.js', 'src/middleware.ts', 'src/middleware.js']
    expect(ignorados.filter((r) => existsSync(r))).toEqual([])
  })

  // DEF-WEB-02: un solo <main> por página (HTML y axe: landmark-no-duplicate-main,
  // landmark-main-is-top-level). Se cuentan los de la página y los de todos los
  // layouts que la envuelven, desde src/app hasta su carpeta.
  it('DEF-WEB-02: cada página queda envuelta por exactamente un <main>', () => {
    const paginas = archivos('src/app', (r) => /[\\/]page\.tsx$/.test(r)).map(norm)
    expect(paginas.length).toBeGreaterThan(0)
    // Sin comentarios: que un comentario mencione la etiqueta no la vuelve un elemento.
    const sinComentarios = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
    const mains = (r: string) => (sinComentarios(leer(r)).match(/<main\b/g) ?? []).length
    const cuenta: Record<string, number> = {}
    for (const pagina of paginas) {
      const partes = pagina.split('/').slice(0, -1)
      let total = mains(pagina)
      for (let i = 2; i <= partes.length; i++) {
        const layout = [...partes.slice(0, i), 'layout.tsx'].join('/')
        if (existsSync(layout)) total += mains(layout)
      }
      cuenta[pagina] = total
    }
    expect(Object.entries(cuenta).filter(([, n]) => n !== 1)).toEqual([])
  })

  it('WEB-INF-4: hay un solo despliegue (se eliminó el flujo de Azure)', () => {
    expect(existsSync('.github/workflows/main_eyesschool.yml')).toBe(false)
  })

  it("los módulos 'use server' solo exportan funciones async (si no, el build los deja sin exports)", () => {
    const servidor = fuentes.filter((r) => /^['"]use server['"]/.test(leer(r).trimStart()))
    expect(servidor.length).toBeGreaterThan(0)

    const infractoras: string[] = []
    for (const ruta of servidor) {
      for (const linea of leer(ruta).split('\n')) {
        // `export type`/`export interface` desaparecen al compilar: están permitidos.
        const m = /^export\s+(?!type\b|interface\b|default\s+async\b)(.*)$/.exec(linea.trim())
        // Vale `export async function f` y `export const f = async (…)`.
        const asincrona = /^async\s+function\b/.test(m?.[1] ?? '') || /^const\s+\w+\s*=\s*async\b/.test(m?.[1] ?? '')
        if (m && !asincrona) infractoras.push(`${norm(ruta)}: ${linea.trim()}`)
      }
    }
    expect(infractoras).toEqual([])
  })
})
