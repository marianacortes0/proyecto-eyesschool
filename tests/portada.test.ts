import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// DEF-WEB-06 · la portada (y el modal de inicio de sesión, que vive en ella)
// descargaba 34–41 MB de vídeo y abría el reproductor de YouTube oculto en cada
// visita. Los vídeos ya se reproducen solo cuando su sección se ve
// (EyeSchoolLanding), así que no hace falta precargarlos enteros.

const markup = readFileSync('src/components/home/eyeschoolMarkup.ts', 'utf8')

describe('Portada · carga (DEF-WEB-06)', () => {
  it('ningún vídeo se precarga entero: solo los metadatos', () => {
    const videos = markup.match(/<video\b[^>]*>/g) ?? []
    expect(videos.length).toBeGreaterThan(0)
    expect(videos.filter((v) => !/preload="(metadata|none)"/.test(v))).toEqual([])
  })

  it('los iframes (el reproductor de YouTube) se cargan cuando se ven', () => {
    const iframes = markup.match(/<iframe\b[^>]*>/g) ?? []
    expect(iframes.length).toBeGreaterThan(0)
    expect(iframes.filter((f) => !/loading="lazy"/.test(f))).toEqual([])
  })
})
