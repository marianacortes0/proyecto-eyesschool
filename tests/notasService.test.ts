import { afterEach, describe, expect, it, vi } from 'vitest'

import { json } from './helpers'
import { downloadBoletinPdf, MSG_SIN_BOLETIN, MSG_SIN_NOTAS_PERIODO } from '@/services/notas/notasService'

afterEach(() => vi.unstubAllGlobals())

describe('notasService · boletín y mensajes (WEB-09)', () => {
  it('el texto del periodo sin notas es el del criterio de aceptación', () => {
    expect(MSG_SIN_NOTAS_PERIODO).toBe('No hay notas registradas para este periodo.')
  })

  it('un 404 sin datos lanza «No hay datos disponibles para generar el boletín.»', async () => {
    vi.stubGlobal('window', {})
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json(404, { detail: 'Sin notas' })))

    await expect(downloadBoletinPdf(3, 'Ana')).rejects.toThrow('No hay datos disponibles para generar el boletín.')
    expect(MSG_SIN_BOLETIN).toBe('No hay datos disponibles para generar el boletín.')
  })

  it('otro error lanza el detail de la API', async () => {
    vi.stubGlobal('window', {})
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json(403, { detail: 'Sin permiso' })))

    await expect(downloadBoletinPdf(3)).rejects.toThrow('Sin permiso')
  })

  it('pide el PDF al proxy del servidor, sin token en el navegador', async () => {
    const fetchMock = vi.fn().mockResolvedValue(json(404, { detail: 'x' }))
    vi.stubGlobal('window', {})
    vi.stubGlobal('fetch', fetchMock)

    await downloadBoletinPdf(3).catch(() => null)

    expect(fetchMock.mock.calls[0][0]).toBe('/api/proxy/notas/estudiantes/3/boletin/pdf')
    expect(fetchMock.mock.calls[0][1]?.headers?.Authorization).toBeUndefined()
  })
})
