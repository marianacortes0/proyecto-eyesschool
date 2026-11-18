import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { ICONOS, URL_ICONOS } from '@/lib/iconos'

// DEF-WEB-17 · la fuente de iconos se pide solo con los iconos de ICONOS. Un
// icono que falte en la lista se vería como su nombre en texto: esta prueba lee
// los iconos escritos en el código; e2e/iconos.spec.ts mira los que se pintan.

function archivos(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n)
    return statSync(p).isDirectory() ? archivos(p) : /\.(tsx?|css)$/.test(n) ? [p] : []
  })
}

const fuente = archivos('src').map((p) => [p, readFileSync(p, 'utf8')] as const)

/** Iconos escritos en el código: texto de los <span> de iconos, literales dentro de sus llaves y props `icon`. */
function iconosEnElCodigo(): Map<string, string> {
  const usados = new Map<string, string>()
  const anota = (nombre: string, archivo: string) => usados.set(nombre, archivo)
  for (const [p, t] of fuente) {
    for (const m of t.matchAll(/material-symbols-outlined[^>]*>\s*([a-z0-9_]+)\s*</g)) anota(m[1], p)
    for (const m of t.matchAll(/material-symbols-outlined[^>]*>\s*\{([^}]*)\}/g))
      // Solo lo que se muestra (tras «?», «:» o «??»), no lo que se compara.
      for (const l of m[1].matchAll(/(?:\?\?|\?|:)\s*['"]([a-z0-9_]+)['"]/g)) anota(l[1], p)
    // Props `icon`, no atributos `data-*-icon`.
    for (const m of t.matchAll(/(?<![-\w])icon[A-Za-z]*\s*[:=]\s*['"]([a-z0-9_]+)['"]/g)) anota(m[1], p)
    for (const m of t.matchAll(/TIPO_ICON[^{]*\{([^}]*)\}/g))
      for (const l of m[1].matchAll(/:\s*['"]([a-z0-9_]+)['"]/g)) anota(l[1], p)
  }
  return usados
}

describe('iconos de Material Symbols (DEF-WEB-17)', () => {
  it('todo icono escrito en el código está en la lista que se pide a Google', () => {
    const usados = iconosEnElCodigo()
    expect(usados.size).toBeGreaterThan(40)
    const faltan = [...usados].filter(([n]) => !(ICONOS as readonly string[]).includes(n)).map(([n, p]) => `${n} (${p})`)
    expect(faltan).toEqual([])
  })

  it('la lista va en orden alfabético y sin repetidos, como exige icon_names', () => {
    expect([...ICONOS]).toEqual([...new Set(ICONOS)].sort())
  })

  it('la fuente se pide con icon_names y los mismos ejes de antes', () => {
    const u = new URL(URL_ICONOS)
    expect(u.searchParams.get('icon_names')).toBe(ICONOS.join(','))
    expect(u.searchParams.get('family')).toBe('Material Symbols Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200')
    expect(u.searchParams.get('display')).toBe('swap')
  })

  it('ninguna página pide la fuente completa', () => {
    const completas = fuente.filter(([, t]) => /Material\+Symbols\+Outlined/.test(t) && !/icon_names/.test(t)).map(([p]) => p)
    expect(completas).toEqual([])
  })
})
