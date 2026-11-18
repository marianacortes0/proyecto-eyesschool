import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useEscanear } from '@/hooks/useEscanear'

// CP-SIS-032 a 036 · el escáner de la web: leer el QR, resolver al estudiante,
// confirmar y registrar. La lectura (DEF-WEB-16) y la búsqueda (DEF-WEB-18) se
// prueban aparte; aquí, cómo el hook reacciona a cada resultado.

const m = vi.hoisted(() => ({
  leer: vi.fn(),
  buscar: vi.fn(),
  crear: vi.fn(),
  registros: vi.fn(),
  hoy: '2026-11-17',
}))
vi.mock('@/services/qr/qrService', () => ({ readQRFromImage: m.leer }))
vi.mock('@/services/qr/qrActions', () => ({
  getCodigoQRByValueAction: m.buscar,
  createAsistenciaAction: m.crear,
  getRegistrosAsistenciaAction: m.registros,
}))
vi.mock('@/lib/toast', () => ({ notifySuccess: vi.fn(), notifyError: vi.fn(), notifyWarning: vi.fn() }))
vi.mock('@/lib/utils/fecha', () => ({ hoyColegio: () => m.hoy }))

const ANA = { idEstudiante: 4, codigo: 'SYN0101', codigoEstudiante: 'SYN0101', nombreCompleto: 'Ana Ruiz' }
const foto = new Blob(['jpeg'])

beforeEach(() => {
  vi.clearAllMocks()
  m.registros.mockResolvedValue([])
  m.crear.mockResolvedValue(undefined)
})

async function escanear() {
  const h = renderHook(() => useEscanear(2))
  await act(() => h.result.current.processCapture(foto))
  return h
}

describe('useEscanear', () => {
  it('una foto sin QR pide intentarlo de nuevo', async () => {
    m.leer.mockResolvedValue(null)
    const { result } = await escanear()

    expect(result.current).toMatchObject({ status: 'error', errorMsg: 'No se pudo leer el código QR, intente nuevamente' })
    expect(m.buscar).not.toHaveBeenCalled()
  })

  it('un QR que no es de un estudiante es «Código QR inválido» y no registra', async () => {
    m.leer.mockResolvedValue('NO-ES-UN-ESTUDIANTE')
    m.buscar.mockResolvedValue(null)
    const { result } = await escanear()

    expect(result.current).toMatchObject({ status: 'error', errorMsg: 'Código QR inválido', pending: null })
    expect(m.crear).not.toHaveBeenCalled()
  })

  it('si la foto no se puede procesar, lo dice sin texto técnico', async () => {
    m.leer.mockRejectedValue(new Error('No se pudo procesar la imagen de la cámara. Intente nuevamente.'))
    const { result } = await escanear()

    expect(result.current.errorMsg).toBe('No se pudo procesar la imagen de la cámara. Intente nuevamente.')
  })

  it('un QR válido queda pendiente y al confirmar registra la entrada de hoy', async () => {
    m.leer.mockResolvedValue('SYN0101')
    m.buscar.mockResolvedValue(ANA)
    const { result } = await escanear()
    expect(result.current.status).toBe('pending')

    await act(() => result.current.confirmRegistration('entrada'))

    expect(m.registros).toHaveBeenCalledWith('2026-11-17')
    expect(m.crear).toHaveBeenCalledWith(expect.objectContaining({ idEstudiante: 4, fecha: '2026-11-17', tipo: 'entrada', registradoPor: 2, codigo_qr: 'SYN0101' }))
    expect(result.current).toMatchObject({ status: 'success', pending: null })
    expect(result.current.recentScans).toHaveLength(1)
  })

  it('si registrar falla, avisa y deja cancelar para volver a escanear', async () => {
    m.leer.mockResolvedValue('SYN0101')
    m.buscar.mockResolvedValue(ANA)
    m.crear.mockRejectedValue(new Error('fetch failed'))
    const { result } = await escanear()

    await act(() => result.current.confirmRegistration('salida'))
    expect(result.current).toMatchObject({ status: 'error', errorMsg: 'Error al registrar la asistencia, intente nuevamente' })

    act(() => result.current.cancelPending())
    expect(result.current).toMatchObject({ status: 'idle', pending: null, errorMsg: null })
  })

  it('una segunda entrada el mismo día se bloquea (CP-SIS-034)', async () => {
    m.leer.mockResolvedValue('SYN0101')
    m.buscar.mockResolvedValue(ANA)
    m.registros.mockResolvedValue([{ idEstudiante: 4, tipo: 'entrada' }])
    const { result } = await escanear()

    await act(() => result.current.confirmRegistration('entrada'))

    expect(result.current.errorMsg).toBe('El estudiante ya tiene registro de entrada hoy')
    expect(m.crear).not.toHaveBeenCalled()
  })
})
