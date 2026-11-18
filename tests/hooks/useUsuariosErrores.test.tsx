import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useUsuarios } from '@/hooks/useUsuarios'
import type { UsuariosBootstrap } from '@/app/(dashboard)/usuarios/actions'

// DEF-WEB-10 y CP-SIS-020, 026 y 028: en la gestión de usuarios, un rechazo de
// la API llega con su motivo y un fallo de red, con un mensaje claro; nunca un
// texto técnico. Y tras un error de carga se puede reintentar.

const a = vi.hoisted(() => ({
  bootstrap: vi.fn(),
  crear: vi.fn(),
  editar: vi.fn(),
  eliminar: vi.fn(),
  estado: vi.fn(),
  validar: vi.fn(),
  rechazar: vi.fn(),
  ok: vi.fn(),
  error: vi.fn(),
}))
vi.mock('@/app/(dashboard)/usuarios/actions', () => ({
  getUsuariosBootstrapAction: a.bootstrap,
  createUsuarioConAuth: a.crear,
  updateUsuarioAction: a.editar,
  deleteUsuarioAction: a.eliminar,
  toggleUsuarioEstadoAction: a.estado,
  validarUsuarioAction: a.validar,
  rechazarUsuarioAction: a.rechazar,
  updateEstudianteCursoAction: vi.fn(),
  updatePadreRelacionAction: vi.fn(),
  setProfesorEspecializacionByNameAction: vi.fn(),
  updateProfesorFechaAction: vi.fn(),
  updateAdministradorAction: vi.fn(),
}))
vi.mock('@/lib/toast', () => ({ notifySuccess: a.ok, notifyError: a.error }))
vi.mock('@/components/ui/ConfirmDialog', () => ({ useConfirm: () => async () => true }))

const USUARIO = { idUsuario: 7, primerNombre: 'Ana', primerApellido: 'Ruiz', idRol: 1 }
const DATOS = { usuarios: [USUARIO], pendientes: [], cursos: [], estudiantes: [], especializaciones: [] } as unknown as UsuariosBootstrap
const RED = new Error('fetch failed')

beforeEach(() => {
  vi.clearAllMocks()
  a.bootstrap.mockResolvedValue(DATOS)
})

const montar = () => renderHook(() => useUsuarios(DATOS)).result

describe('useUsuarios · errores (DEF-WEB-10)', () => {
  it('crear: el motivo de la API llega a la persona y el modal sigue abierto', async () => {
    a.crear.mockResolvedValue({ error: 'El correo ya está registrado' })
    const r = montar()

    await act(() => r.current.handleCreate({} as never))

    expect(a.error).toHaveBeenCalledWith('El correo ya está registrado')
    expect(a.ok).not.toHaveBeenCalled()
    expect(r.current.saving).toBe(false)
  })

  it('crear: un fallo de red da un mensaje claro', async () => {
    a.crear.mockRejectedValue(RED)
    const r = montar()

    await act(() => r.current.handleCreate({} as never))

    expect(a.error).toHaveBeenCalledWith('No fue posible crear el usuario. Intenta de nuevo.')
  })

  it('editar: el motivo de la API y el fallo de red', async () => {
    const r = montar()
    act(() => r.current.openEditModal(USUARIO as never))

    a.editar.mockResolvedValueOnce({ error: 'Datos inválidos' })
    await act(() => r.current.handleUpdate({} as never))
    expect(a.error).toHaveBeenLastCalledWith('Datos inválidos')

    a.editar.mockRejectedValueOnce(RED)
    await act(() => r.current.handleUpdate({} as never))
    expect(a.error).toHaveBeenLastCalledWith('No fue posible guardar los cambios. Intenta de nuevo.')
  })

  it('eliminar con la API caída avisa que no se pudo (CP-SIS-026)', async () => {
    a.eliminar.mockRejectedValue(RED)
    const r = montar()

    await act(() => r.current.handleDelete(7))

    expect(a.error).toHaveBeenCalledWith('No fue posible eliminar el usuario. Intenta de nuevo.')
  })

  it('cambiar estado, aprobar y rechazar avisan si fallan', async () => {
    a.estado.mockRejectedValue(RED)
    a.validar.mockRejectedValue(RED)
    a.rechazar.mockRejectedValue(RED)
    const r = montar()

    await act(() => r.current.handleToggleEstado(7, false))
    await act(() => r.current.handleValidar(7, 1))
    await act(() => r.current.handleRechazar(7))

    expect(a.error.mock.calls.map((c) => c[0])).toEqual([
      'Error al cambiar el estado del usuario',
      'Error al aprobar el usuario',
      'Error al rechazar el usuario',
    ])
  })

  it('tras un error de carga, reintentar vuelve a pedir la lista (CP-SIS-028)', async () => {
    a.bootstrap.mockRejectedValueOnce(RED)
    const { result } = renderHook(() => useUsuarios())
    await waitFor(() => expect(result.current.error).toBe('No se pudo cargar la lista de usuarios. Revisa tu conexión e intenta de nuevo.'))

    act(() => result.current.reintentar())

    await waitFor(() => expect(result.current.error).toBeNull())
    expect(a.bootstrap).toHaveBeenCalledTimes(2)
  })
})
