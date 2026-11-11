import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// DEF-WEB-06 · la portada (y el modal de inicio de sesión, que vive en ella)
// precargaba los dos vídeos enteros y cargaba el reproductor de YouTube de un
// panel cerrado en cada visita. Los vídeos ya se reproducen solo cuando su sección
// se ve (EyeSchoolLanding), así que no hace falta precargarlos.

const markup = readFileSync('src/components/home/eyeschoolMarkup.ts', 'utf8')
const landing = readFileSync('src/components/home/EyeSchoolLanding.tsx', 'utf8')

describe('Portada · carga (DEF-WEB-06)', () => {
  it('ningún vídeo se precarga entero: solo los metadatos', () => {
    const videos = markup.match(/<video\b[^>]*>/g) ?? []
    expect(videos.length).toBeGreaterThan(0)
    expect(videos.filter((v) => !/preload="(metadata|none)"/.test(v))).toEqual([])
  })

  // loading="lazy" no basta: el panel entra deslizándose desde el borde y
  // Chromium carga los iframes cercanos a la pantalla. El iframe no lleva `src`
  // hasta que se abre su panel.
  it('el reproductor de YouTube no tiene src hasta que se abre su panel', () => {
    const iframes = markup.match(/<iframe\b[^>]*>/g) ?? []
    expect(iframes.length).toBeGreaterThan(0)
    expect(iframes.filter((f) => /\ssrc=/.test(f))).toEqual([])
    expect(iframes.filter((f) => !/data-src="https:\/\/www\.youtube\.com\//.test(f))).toEqual([])
    expect(landing).toMatch(/data-ben2-open[\s\S]{0,400}dataset\.src/)
  })
})
