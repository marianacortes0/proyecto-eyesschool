import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useAsistencia } from '@/hooks/useAsistencia'
import { useNotas } from '@/hooks/useNotas'
import type { AsistenciaBootstrap } from '@/services/asistencia/asistenciaActions'
import type { NotasBootstrap } from '@/services/notas/notasActions'

// DEF-WEB-10 y DEF-WEB-12 · notas (CP-SIS-042 a 046) y asistencia (CP-SIS-040):
// cada fallo llega como un mensaje claro, el motivo de la API se respeta y tras
// un error de carga se puede reintentar.

const m = vi.hoisted(() => ({
  ok: vi.fn(), error: vi.fn(), aviso: vi.fn(),
  notasBootstrap: vi.fn(), crearNota: vi.fn(), editarNota: vi.fn(), borrarNota: vi.fn(),
  asisBootstrap: vi.fn(), registros: vi.fn(), crearReg: vi.fn(), crearLote: vi.fn(), editarReg: vi.fn(), borrarReg: vi.fn(),
}))
vi.mock('@/lib/toast', () => ({ notifySuccess: m.ok, notifyError: m.error, notifyWarning: m.aviso }))
vi.mock('@/components/ui/ConfirmDialog', () => ({ useConfirm: () => async () => true }))
vi.mock('@/services/notas/notasActions', () => ({ getNotasBootstrapAction: m.notasBootstrap, createNotaAction: m.crearNota }))
vi.mock('@/services/notas/notasService', async (orig) => ({
  ...(await orig<typeof import('@/services/notas/notasService')>()),
  updateNota: m.editarNota,
  deleteNota: m.borrarNota,
}))
vi.mock('@/services/asistencia/asistenciaActions', () => ({
  getAsistenciaBootstrapAction: m.asisBootstrap,
  getRegistrosAction: m.registros,
  crearRegistroAction: m.crearReg,
  crearRegistrosMasivoAction: m.crearLote,
}))
vi.mock('@/services/asistencia/asistenciaService', async (orig) => ({
  ...(await orig<typeof import('@/services/asistencia/asistenciaService')>()),
  actualizarRegistro: m.editarReg,
  eliminarRegistro: m.borrarReg,
}))

const RED = new Error('fetch failed')
const NOTAS = { notas: [{ idNota: 1 }], estudiantes: [], materias: [], cursos: [] } as unknown as NotasBootstrap
const ASIS = { registros: [{ idAsistencia: 5 }], estudiantes: [], cursos: [] } as unknown as AsistenciaBootstrap
const NOTA = { idEstudiante: 1, idMateria: 2, idPeriodo: 3, nota: 4.5, observacion: null }

beforeEach(() => {
  vi.clearAllMocks()
  m.notasBootstrap.mockResolvedValue(NOTAS)
  m.asisBootstrap.mockResolvedValue(ASIS)
  m.registros.mockResolvedValue([])
})

describe('useNotas · errores', () => {
  it('registrar: el motivo de la API (403/409) llega tal cual y no se cierra el modal', async () => {
    m.crearNota.mockResolvedValue({ error: 'Ya existe una nota para este estudiante, materia y período' })
    const { result } = renderHook(() => useNotas(2, NOTAS))

    await act(() => result.current.handleCreate(NOTA))

    expect(m.error).toHaveBeenCalledWith('Ya existe una nota para este estudiante, materia y período')
    expect(m.ok).not.toHaveBeenCalled()
    expect(result.current.saving).toBe(false)
  })

  it('registrar y editar con la API caída dan un mensaje claro (CP-SIS-046)', async () => {
    m.crearNota.mockRejectedValue(RED)
    m.editarNota.mockRejectedValue(RED)
    const { result } = renderHook(() => useNotas(2, NOTAS))

    await act(() => result.current.handleCreate(NOTA))
    await act(() => result.current.handleUpdate(1, { nota: 3 }))

    expect(m.error.mock.calls.map((c) => c[0])).toEqual([
      'No se pudo guardar la nota. Revisa tu conexión e intenta de nuevo.',
      'No se pudo guardar la nota. Revisa tu conexión e intenta de nuevo.',
    ])
  })

  it('eliminar avisa si falla y deja la nota', async () => {
    m.borrarNota.mockRejectedValue(RED)
    const { result } = renderHook(() => useNotas(2, NOTAS))

    await act(() => result.current.handleDelete(1))

    expect(m.error).toHaveBeenCalledWith('Error al eliminar la nota')
    expect(result.current.totalNotas).toBe(1)
  })

  it('tras un error de carga, reintentar vuelve a pedir los datos', async () => {
    m.notasBootstrap.mockRejectedValueOnce(RED)
    const { result } = renderHook(() => useNotas(2))
    await waitFor(() => expect(result.current.error).not.toBeNull())

    act(() => result.current.reintentar())

    await waitFor(() => expect(result.current.error).toBeNull())
    expect(m.notasBootstrap).toHaveBeenCalledTimes(2)
  })
})

describe('useAsistencia · errores', () => {
  const montar = () => renderHook(() => useAsistencia(2, undefined, ASIS)).result

  it('guardar, editar y eliminar avisan si fallan', async () => {
    m.crearReg.mockRejectedValue(RED)
    m.editarReg.mockRejectedValue(RED)
    m.borrarReg.mockRejectedValue(RED)
    const r = montar()

    await act(() => r.current.handleCreate({} as never))
    act(() => r.current.openEdit({ idAsistencia: 5 } as never))
    await act(() => r.current.handleUpdate({} as never))
    await act(() => r.current.handleDelete(5))

    expect(m.error.mock.calls.map((c) => c[0])).toEqual([
      'Error al guardar el registro de asistencia',
      'Error al editar el registro de asistencia',
      'Error al eliminar el registro de asistencia',
    ])
  })

  it('el registro por lote resume guardados, duplicados y fallidos', async () => {
    m.crearLote.mockResolvedValue({ guardados: [1, 2], duplicados: [3], fallidos: [4] })
    const r = montar()

    await act(() => r.current.handleCreateMany([1, 2, 3, 4], { estado: 'Presente', fecha: '2026-11-17', tipo: 'entrada' } as never))

    expect(m.ok).toHaveBeenCalledWith('2 registros de asistencia guardados')
    expect(m.aviso).toHaveBeenCalledWith('1 ya tenían registro ese día')
    expect(m.error).toHaveBeenCalledWith('1 no se pudieron registrar. Inténtalo de nuevo.')
  })

  it('el lote con la API caída avisa', async () => {
    m.crearLote.mockRejectedValue(RED)
    const r = montar()

    await act(() => r.current.handleCreateMany([1], { estado: 'Presente', fecha: '2026-11-17', tipo: 'entrada' } as never))

    expect(m.error).toHaveBeenCalledWith('Error al registrar el lote')
  })

  it('si al refrescar falla la lista, se muestra el aviso de carga (DEF-WEB-12)', async () => {
    m.crearReg.mockResolvedValue(undefined)
    m.registros.mockRejectedValue(RED)
    const r = montar()

    await act(() => r.current.handleCreate({} as never))

    expect(r.current.error).toBe('No se pudo cargar la asistencia. Revisa tu conexión e intenta de nuevo.')
  })

  it('tras un error de carga, reintentar vuelve a pedir los datos', async () => {
    m.asisBootstrap.mockRejectedValueOnce(RED)
    const { result } = renderHook(() => useAsistencia(2))
    await waitFor(() => expect(result.current.error).not.toBeNull())

    act(() => result.current.reintentar())

    await waitFor(() => expect(result.current.error).toBeNull())
    expect(m.asisBootstrap).toHaveBeenCalledTimes(2)
  })
})
