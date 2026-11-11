import { afterEach, describe, expect, it, vi } from 'vitest'

import { json } from '../helpers'
import * as r from '@/services/reportes/reportesService'
import { applyTheme, getStoredTheme } from '@/services/theme/themeService'

function stub(respuesta: () => Response) {
  const m = vi.fn(async (_url: string, _init?: RequestInit) => respuesta())
  vi.stubGlobal('fetch', m)
  return m
}
const init = (m: ReturnType<typeof stub>, i = 0) => (m.mock.calls[i][1] ?? {}) as RequestInit

afterEach(() => {
  vi.unstubAllGlobals()
  window.localStorage.clear()
  document.documentElement.classList.remove('dark')
})

describe('Servicios · reportesService', () => {
  it('fileUrl: vacío, absoluta y relativa', () => {
    expect(r.fileUrl(null)).toBe('')
    expect(r.fileUrl('https://x.test/a.pdf')).toBe('https://x.test/a.pdf')
    expect(r.fileUrl('/static/reportes/a.pdf')).toBe('http://localhost:8000/static/reportes/a.pdf')
    expect(r.fileUrl('static/a.pdf')).toBe('http://localhost:8000/static/a.pdf')
  })

  it('validarArchivoReporte rechaza el formato y el tamaño', () => {
    expect(r.validarArchivoReporte(new File(['x'], 'a.pdf'))).toEqual({ ok: true })
    expect(r.validarArchivoReporte(new File(['x'], 'a.exe'))).toEqual({ ok: false, motivo: 'Formato de archivo no válido' })
    const grande = new File(['x'], 'a.pdf')
    Object.defineProperty(grande, 'size', { value: r.MAX_TAMANO_REPORTE + 1 })
    expect(r.validarArchivoReporte(grande)).toEqual({ ok: false, motivo: 'El archivo excede el tamaño máximo permitido' })
  })

  it('getReportes mapea a camelCase; con lista vacía devuelve []', async () => {
    stub(() => json(200, [{ id_reporte: 1, nombre_reporte: 'Mensual', tipo_reporte: 'Academico', estado: 'Completado', fecha_inicio: '2026-01-01', fecha_fin: '2026-01-31', fecha_generacion: '2026-02-01', parametros: '{}', archivo_generado: null, id_administrador: 3 }]))
    expect((await r.getReportes())[0]).toMatchObject({ idReporte: 1, nombreReporte: 'Mensual', idAdministrador: 3 })

    stub(() => json(200, []))
    expect(await r.getReportes()).toEqual([])
  })

  it('crear, actualizar y borrar un reporte', async () => {
    const m = stub(() => json(200, {}))

    await r.createReporte({ nombreReporte: 'R', tipoReporte: 'Academico', fechaInicio: 'a', fechaFin: 'b', parametros: '{}', idAdministrador: 3 })
    await r.updateReporte(5, { estado: 'Completado' })
    await r.deleteReporte(5)

    expect(JSON.parse(String(init(m, 0).body))).toMatchObject({ nombre_reporte: 'R', id_administrador: 3, archivo_generado: null })
    expect(init(m, 1).method).toBe('PATCH')
    expect(JSON.parse(String(init(m, 1).body))).toEqual({ estado: 'Completado' })
    expect(init(m, 2).method).toBe('DELETE')
  })

  it('downloadReporteArchivo lanza con el detail si la API responde error', async () => {
    stub(() => json(404, { detail: 'No hay archivo' }))

    await expect(r.downloadReporteArchivo(1, 'R')).rejects.toThrow('No hay archivo')
  })

  it('downloadReporteArchivo descarga con el nombre del Content-Disposition', async () => {
    stub(() => new Response('pdf', { status: 200, headers: { 'content-disposition': 'attachment; filename="mensual.pdf"' } }))
    URL.createObjectURL = vi.fn(() => 'blob:x')
    URL.revokeObjectURL = vi.fn()
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

    await r.downloadReporteArchivo(1, 'R')

    expect(click).toHaveBeenCalled()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:x')
    click.mockRestore()
  })
})

describe('Servicios · themeService', () => {
  it('lee el tema guardado y, sin nada guardado, el preferido del sistema', () => {
    window.localStorage.setItem('eys_theme', 'dark')
    expect(getStoredTheme()).toBe('dark')

    window.localStorage.clear()
    window.matchMedia = vi.fn(() => ({ matches: true })) as unknown as typeof window.matchMedia
    expect(getStoredTheme()).toBe('dark')
    window.matchMedia = vi.fn(() => ({ matches: false })) as unknown as typeof window.matchMedia
    expect(getStoredTheme()).toBe('light')
  })

  it('applyTheme pone la clase dark y persiste', () => {
    applyTheme('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(window.localStorage.getItem('eys_theme')).toBe('dark')

    applyTheme('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})
