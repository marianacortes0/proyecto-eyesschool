import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ConfirmProvider } from '@/components/ui/ConfirmDialog'
import { useAsistencia } from '@/hooks/useAsistencia'
import { useHorarios } from '@/hooks/useHorarios'
import { useNotas } from '@/hooks/useNotas'
import { useReportes } from '@/hooks/useReportes'
import { useUsuarios } from '@/hooks/useUsuarios'

/**
 * Carga inicial de los hooks de pantalla: si la página ya entregó los datos en
 * el render del servidor, el hook NO vuelve a pedirlos; si no, los pide una vez
 * al montar y un fallo queda en `error` (no se propaga ni deja `loading` colgado).
 *
 * Cubre las líneas que SonarQube marcó como promesas sin esperar (ahora `void`).
 */

const { acciones } = vi.hoisted(() => ({
  acciones: {
    reportes: vi.fn(),
    notas: vi.fn(),
    usuarios: vi.fn(),
    asistencia: vi.fn(),
    horarios: vi.fn(),
  },
}))

vi.mock('@/services/reportes/reportesActions', () => ({
  getReportesAction: acciones.reportes,
  createReporteAction: vi.fn(),
  updateReporteAction: vi.fn(),
  deleteReporteAction: vi.fn(),
}))
vi.mock('@/services/notas/notasActions', () => ({
  getNotasBootstrapAction: acciones.notas,
  createNotaAction: vi.fn(),
  updateNotaAction: vi.fn(),
  deleteNotaAction: vi.fn(),
}))
vi.mock('@/app/(dashboard)/usuarios/actions', () => ({
  getUsuariosBootstrapAction: acciones.usuarios,
  createUsuarioConAuth: vi.fn(),
  updateUsuarioAction: vi.fn(),
  toggleUsuarioEstadoAction: vi.fn(),
  validarUsuarioAction: vi.fn(),
  rechazarUsuarioAction: vi.fn(),
  deleteUsuarioAction: vi.fn(),
  updateEstudianteCursoAction: vi.fn(),
  updatePadreRelacionAction: vi.fn(),
  setProfesorEspecializacionByNameAction: vi.fn(),
  updateProfesorFechaAction: vi.fn(),
  updateAdministradorAction: vi.fn(),
}))
vi.mock('@/services/asistencia/asistenciaActions', () => ({
  getAsistenciaBootstrapAction: acciones.asistencia,
  getRegistrosAction: vi.fn(),
  crearRegistroAction: vi.fn(),
  crearRegistrosMasivoAction: vi.fn(),
}))
vi.mock('@/services/horarios/horariosActions', () => ({
  getHorariosBootstrapAction: acciones.horarios,
  createHorarioAction: vi.fn(),
  updateHorarioAction: vi.fn(),
  deleteHorarioAction: vi.fn(),
  createAsignacionAction: vi.fn(),
  updateAsignacionAction: vi.fn(),
  deleteAsignacionAction: vi.fn(),
}))

const envoltorio = ({ children }: { children: ReactNode }) => <ConfirmProvider>{children}</ConfirmProvider>

/** De cada hook solo nos interesan estos dos campos para la carga inicial. */
type HookDeCarga = () => { loading: boolean; error: string | null }
type Caso = {
  nombre: string
  useSinDatos: HookDeCarga
  useConDatos: HookDeCarga
  accion: (typeof acciones)[keyof typeof acciones]
  respuesta: unknown
}

const montar = (hook: HookDeCarga) => renderHook(hook, { wrapper: envoltorio })

const VACIO_NOTAS = { notas: [], estudiantes: [], materias: [], cursos: [] }
const VACIO_USUARIOS = { usuarios: [], pendientes: [], cursos: [], estudiantes: [], especializaciones: [] }
const VACIO_ASISTENCIA = { registros: [], estudiantes: [], cursos: [] }
const VACIO_HORARIOS = {
  horarios: [], cursos: [], allCursos: [], materias: [], allMaterias: [],
  especializaciones: [], profesores: [], asignaciones: [],
}

// Cada caso: nombre · hook sin datos del servidor · hook con datos · acción espiada
// · qué devuelve la acción cuando funciona.
const CASOS: Caso[] = [
  {
    nombre: 'useReportes',
    useSinDatos: () => useReportes(1),
    useConDatos: () => useReportes(1, []),
    accion: acciones.reportes,
    respuesta: [],
  },
  {
    nombre: 'useNotas',
    useSinDatos: () => useNotas(1),
    useConDatos: () => useNotas(1, VACIO_NOTAS),
    accion: acciones.notas,
    respuesta: VACIO_NOTAS,
  },
  {
    nombre: 'useUsuarios',
    useSinDatos: () => useUsuarios(),
    useConDatos: () => useUsuarios(VACIO_USUARIOS),
    accion: acciones.usuarios,
    respuesta: VACIO_USUARIOS,
  },
  {
    nombre: 'useAsistencia',
    useSinDatos: () => useAsistencia(1),
    useConDatos: () => useAsistencia(1, undefined, VACIO_ASISTENCIA),
    accion: acciones.asistencia,
    respuesta: VACIO_ASISTENCIA,
  },
  {
    nombre: 'useHorarios',
    useSinDatos: () => useHorarios(),
    useConDatos: () => useHorarios(VACIO_HORARIOS),
    accion: acciones.horarios,
    respuesta: VACIO_HORARIOS,
  },
]

beforeEach(() => {
  for (const espia of Object.values(acciones)) espia.mockReset()
})

describe('carga inicial de los hooks de pantalla', () => {
  for (const caso of CASOS) {
    describe(caso.nombre, () => {
      it('sin datos del servidor pide los datos una sola vez y apaga loading', async () => {
        caso.accion.mockResolvedValue(caso.respuesta)

        const { result } = montar(caso.useSinDatos)

        await waitFor(() => expect(result.current.loading).toBe(false))
        expect(caso.accion).toHaveBeenCalledTimes(1)
        expect(result.current.error).toBeNull()
      })

      it('con datos del servidor no vuelve a pedirlos', async () => {
        caso.accion.mockResolvedValue(caso.respuesta)

        const { result } = montar(caso.useConDatos)

        expect(result.current.loading).toBe(false)
        await waitFor(() => expect(caso.accion).not.toHaveBeenCalled())
      })

      it('si la carga falla, el mensaje queda en error y loading se apaga', async () => {
        caso.accion.mockRejectedValue(new Error('Error interno'))

        const { result } = montar(caso.useSinDatos)

        await waitFor(() => expect(result.current.error).toBe('Error interno'))
        expect(result.current.loading).toBe(false)
      })
    })
  }
})
