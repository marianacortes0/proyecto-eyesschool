'use client'

import { useState, useEffect, useMemo } from 'react'
import Modal from '@/components/ui/Modal'
import { type UsuarioConRol, type CreateUsuarioData, type UpdateUsuarioData, type CursoOpt, type EstudianteOpt, type EspecializacionOpt, PARENTESCOS, NIVELES_ACCESO } from '@/services/usuarios/usuariosService'
import { type ModalMode } from '@/hooks/useUsuarios'
import { notifyWarning } from '@/lib/toast'

const HOY = new Date().toISOString().slice(0, 10)

interface UsuarioModalProps {
  mode: ModalMode
  usuario: UsuarioConRol | null
  saving: boolean
  cursos: CursoOpt[]
  estudiantes: EstudianteOpt[]
  especializaciones: EspecializacionOpt[]
  onClose: () => void
  onCreate: (data: CreateUsuarioData) => Promise<void>
  onUpdate: (data: UpdateUsuarioData) => Promise<void>
}

const ID_ROL_PROFESOR = 1
const ID_ROL_ESTUDIANTE = 2
const ID_ROL_ADMIN = 3
const ID_ROL_PADRE = 4

const TIPOS_DOCUMENTO = ['CC', 'CE', 'TI', 'PAS'] as const
const GENEROS = [
  { value: 'M', label: 'Masculino' },
  { value: 'F', label: 'Femenino' },
  { value: 'O', label: 'Otro' },
] as const
// Roles reales en la BD: 1=Profesor | 2=Estudiante | 3=Administrador | 4=Padre
const ROLES = [
  { value: 2, label: 'Estudiante' },
  { value: 4, label: 'Padre / Acudiente' },
  { value: 1, label: 'Profesor' },
  { value: 3, label: 'Administrador' },
] as const

type FormState = {
  primerNombre: string
  segundoNombre: string
  primerApellido: string
  segundoApellido: string
  tipoDocumento: string
  numeroDocumento: string
  correo: string
  password: string
  telefono: string
  genero: string
  direccion: string
  idRol: number
  idCursoActual: string
  cursoEstudiante: string
  idEstudianteRelacionado: string
  parentesco: string
  especializacion: string
  institucion: string
  cargo: string
  nivelAcceso: string
  fechaAsignacion: string
  fechaFin: string
}

const EMPTY_FORM: FormState = {
  primerNombre: '',
  segundoNombre: '',
  primerApellido: '',
  segundoApellido: '',
  tipoDocumento: 'CC',
  numeroDocumento: '',
  correo: '',
  password: '',
  telefono: '',
  genero: '',
  direccion: '',
  idRol: 4,
  idCursoActual: '',
  cursoEstudiante: '',
  idEstudianteRelacionado: '',
  parentesco: '',
  especializacion: '',
  institucion: '',
  cargo: '',
  nivelAcceso: 'Bajo',
  fechaAsignacion: HOY,
  fechaFin: HOY,
}

// Clave de curso para el filtro de estudiantes ('' = sin elegir; 'none' = estudiante sin curso)
const cursoKey = (idCurso: number | null): string => (idCurso != null ? String(idCurso) : 'none')

export default function UsuarioModal({
  mode,
  usuario,
  saving,
  cursos,
  estudiantes,
  especializaciones,
  onClose,
  onCreate,
  onUpdate,
}: UsuarioModalProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (mode === 'edit' && usuario) {
      // Curso del estudiante vinculado (para preseleccionar el filtro de curso)
      const hijo = usuario.idEstudianteRelacionado != null
        ? estudiantes.find((e) => e.idEstudiante === usuario.idEstudianteRelacionado)
        : undefined
      // Especialización actual del profesor (tratada como única)
      const esp = usuario.especializaciones?.[0]
      setForm({
        primerNombre: usuario.primerNombre,
        segundoNombre: usuario.segundoNombre ?? '',
        primerApellido: usuario.primerApellido,
        segundoApellido: usuario.segundoApellido ?? '',
        tipoDocumento: usuario.tipoDocumento,
        numeroDocumento: usuario.numeroDocumento,
        correo: usuario.correo ?? '',
        telefono: usuario.telefono ?? '',
        genero: usuario.genero ?? '',
        direccion: usuario.direccion ?? '',
        idRol: usuario.idRol,
        idCursoActual: usuario.idCursoActual != null ? String(usuario.idCursoActual) : '',
        cursoEstudiante: hijo ? cursoKey(hijo.idCurso) : '',
        idEstudianteRelacionado: usuario.idEstudianteRelacionado != null ? String(usuario.idEstudianteRelacionado) : '',
        parentesco: usuario.parentesco ?? '',
        especializacion: esp?.nombre ?? '',
        institucion: esp?.institucion ?? '',
        cargo: usuario.cargo ?? '',
        nivelAcceso: usuario.nivelAcceso ?? 'Bajo',
        fechaAsignacion: usuario.fechaAsignacion ?? HOY,
        fechaFin: usuario.fechaFin ?? HOY,
        password: '',
      })
    } else {
      setForm(EMPTY_FORM)
    }
    setFormError(null)
  }, [mode, usuario, estudiantes])

  // Cursos disponibles a partir de los estudiantes (para el filtro previo del padre)
  const cursosDeEstudiantes = useMemo(() => {
    const map = new Map<string, string>()
    for (const e of estudiantes) {
      const key = cursoKey(e.idCurso)
      if (!map.has(key)) map.set(key, e.cursoLabel ?? 'Sin curso')
    }
    return Array.from(map, ([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [estudiantes])

  // Estudiantes filtrados por el curso elegido
  const estudiantesFiltrados = useMemo(() => {
    if (!form.cursoEstudiante) return []
    return estudiantes.filter((e) => cursoKey(e.idCurso) === form.cursoEstudiante)
  }, [estudiantes, form.cursoEstudiante])

  const set = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!form.primerNombre.trim() || !form.primerApellido.trim()) {
      setFormError('El nombre y apellido son obligatorios.')
      notifyWarning('Complete todos los campos obligatorios')
      return
    }
    if (!form.numeroDocumento.trim()) {
      setFormError('El número de documento es obligatorio.')
      notifyWarning('Complete todos los campos obligatorios')
      return
    }
    if (mode === 'create' && !form.correo.trim()) {
      setFormError('El correo es obligatorio.')
      notifyWarning('Complete todos los campos obligatorios')
      return
    }
    if (mode === 'create' && form.password.length < 6) {
      setFormError('La contraseña debe tener al menos 6 caracteres.')
      return
    }

    const esEstudiante = form.idRol === ID_ROL_ESTUDIANTE
    const idCursoActual = esEstudiante
      ? (form.idCursoActual ? Number(form.idCursoActual) : null)
      : undefined

    const esPadre = form.idRol === ID_ROL_PADRE
    if (esPadre && (!form.idEstudianteRelacionado || !form.parentesco)) {
      setFormError('Selecciona el estudiante vinculado y el parentesco.')
      return
    }
    const idEstudianteRelacionado = esPadre ? Number(form.idEstudianteRelacionado) : undefined
    const parentesco = esPadre ? form.parentesco : undefined

    const esProfesor = form.idRol === ID_ROL_PROFESOR
    const especializacion = esProfesor ? form.especializacion.trim() : undefined
    const institucion = esProfesor ? form.institucion.trim() : undefined

    const esAdmin = form.idRol === ID_ROL_ADMIN
    const cargo = esAdmin ? form.cargo.trim() : undefined
    const nivelAcceso = esAdmin ? form.nivelAcceso : undefined
    // Vigencia: todos los usuarios
    const fechaAsignacion = form.fechaAsignacion || HOY
    const fechaFin = form.fechaFin || HOY

    try {
      if (mode === 'create') {
        await onCreate({
          primerNombre: form.primerNombre.trim(),
          segundoNombre: form.segundoNombre.trim() || undefined,
          primerApellido: form.primerApellido.trim(),
          segundoApellido: form.segundoApellido.trim() || undefined,
          tipoDocumento: form.tipoDocumento as CreateUsuarioData['tipoDocumento'],
          numeroDocumento: form.numeroDocumento.trim(),
          correo: form.correo.trim(),
          password: form.password,
          telefono: form.telefono.trim() || undefined,
          genero: (form.genero as CreateUsuarioData['genero']) || undefined,
          direccion: form.direccion.trim() || undefined,
          idRol: form.idRol,
          idCursoActual,
          idEstudianteRelacionado,
          parentesco,
          especializacion,
          institucion,
          cargo,
          nivelAcceso,
          fechaAsignacion,
          fechaFin,
        })
      } else {
        await onUpdate({
          primerNombre: form.primerNombre.trim(),
          segundoNombre: form.segundoNombre.trim() || undefined,
          primerApellido: form.primerApellido.trim(),
          segundoApellido: form.segundoApellido.trim() || undefined,
          tipoDocumento: form.tipoDocumento as UpdateUsuarioData['tipoDocumento'],
          numeroDocumento: form.numeroDocumento.trim(),
          telefono: form.telefono.trim() || undefined,
          genero: (form.genero as UpdateUsuarioData['genero']) || undefined,
          direccion: form.direccion.trim() || undefined,
          idRol: form.idRol,
          idCursoActual,
          idEstudianteRelacionado,
          parentesco,
          especializacion,
          institucion,
          cargo,
          nivelAcceso,
          fechaAsignacion,
          fechaFin,
        })
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Error al guardar')
    }
  }

  const isOpen = mode === 'create' || mode === 'edit'
  const isEdit = mode === 'edit'
  const title = mode === 'create' ? 'Nuevo Usuario' : 'Editar Usuario'

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <h2 className="text-xl font-bold text-slate-800 dark:text-white pr-6">{title}</h2>

        {/* Error */}
        {formError && (
          <div className="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-sm">
            {formError}
          </div>
        )}

        {/* Nombres */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Primer Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.primerNombre}
              onChange={set('primerNombre')}
              className={inputClass}
              placeholder="Juan"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Segundo Nombre
            </label>
            <input
              type="text"
              value={form.segundoNombre}
              onChange={set('segundoNombre')}
              className={inputClass}
              placeholder="Carlos"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Primer Apellido <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.primerApellido}
              onChange={set('primerApellido')}
              className={inputClass}
              placeholder="García"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Segundo Apellido
            </label>
            <input
              type="text"
              value={form.segundoApellido}
              onChange={set('segundoApellido')}
              className={inputClass}
              placeholder="López"
            />
          </div>
        </div>

        {/* Documento — bloqueado en edición por seguridad (identidad inmutable) */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Tipo Doc. <span className="text-red-500">*</span>
            </label>
            <select
              value={form.tipoDocumento}
              onChange={set('tipoDocumento')}
              className={isEdit ? lockedSelectClass : selectClass}
              disabled={isEdit}
            >
              {TIPOS_DOCUMENTO.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              N° Documento <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.numeroDocumento}
              onChange={set('numeroDocumento')}
              className={isEdit ? lockedInputClass : inputClass}
              placeholder="1234567890"
              required
              disabled={isEdit}
            />
          </div>
        </div>

        {/* Correo — solo lectura en edición (no editable por seguridad) */}
        {isEdit && (
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Correo electrónico
            </label>
            <input
              type="email"
              value={usuario?.correo ?? ''}
              className={lockedInputClass}
              placeholder="Sin correo"
              disabled
            />
            <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <span className="material-symbols-outlined !text-sm">lock</span>
              El documento y el correo no se pueden modificar por seguridad.
            </p>
          </div>
        )}

        {/* Correo + Contraseña (solo en create) */}
        {mode === 'create' && (
          <>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Correo electrónico <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={form.correo}
                onChange={set('correo')}
                className={inputClass}
                placeholder="correo@ejemplo.com"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Contraseña <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={form.password}
                onChange={set('password')}
                className={inputClass}
                placeholder="Mínimo 6 caracteres"
                autoComplete="new-password"
                required
              />
            </div>
          </>
        )}

        {/* Teléfono + Género */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Teléfono
            </label>
            <input
              type="tel"
              value={form.telefono}
              onChange={set('telefono')}
              className={inputClass}
              placeholder="300 000 0000"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Género
            </label>
            <select value={form.genero} onChange={set('genero')} className={selectClass}>
              <option value="">— Selecciona —</option>
              {GENEROS.map((g) => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Dirección */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
            Dirección
          </label>
          <input
            type="text"
            value={form.direccion}
            onChange={set('direccion')}
            className={inputClass}
            placeholder="Calle 123 # 45-67"
          />
        </div>

        {/* Rol (create y edit) */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
            Rol <span className="text-red-500">*</span>
          </label>
          <select
            value={form.idRol}
            onChange={(e) => setForm((prev) => ({ ...prev, idRol: Number(e.target.value) }))}
            className={selectClass}
          >
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>

        {/* Curso actual (solo estudiantes) */}
        {form.idRol === ID_ROL_ESTUDIANTE && (
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Curso actual
            </label>
            <select
              value={form.idCursoActual}
              onChange={(e) => setForm((prev) => ({ ...prev, idCursoActual: e.target.value }))}
              className={selectClass}
            >
              <option value="">— Sin asignar —</option>
              {cursos.map((c) => (
                <option key={c.idCurso} value={c.idCurso}>{c.label}</option>
              ))}
            </select>
          </div>
        )}

        {/* Vínculo del padre: primero el curso, luego el estudiante, luego el parentesco */}
        {form.idRol === ID_ROL_PADRE && (
          <div className="grid grid-cols-2 gap-3">
            {/* 1) Curso */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Curso <span className="text-red-500">*</span>
              </label>
              <select
                value={form.cursoEstudiante}
                onChange={(e) =>
                  // Al cambiar de curso se limpia el estudiante seleccionado
                  setForm((prev) => ({ ...prev, cursoEstudiante: e.target.value, idEstudianteRelacionado: '' }))
                }
                className={selectClass}
              >
                <option value="">— Selecciona —</option>
                {cursosDeEstudiantes.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            {/* 2) Estudiante (filtrado por el curso elegido) */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Estudiante vinculado <span className="text-red-500">*</span>
              </label>
              <select
                value={form.idEstudianteRelacionado}
                onChange={(e) => setForm((prev) => ({ ...prev, idEstudianteRelacionado: e.target.value }))}
                className={selectClass}
                disabled={!form.cursoEstudiante}
              >
                <option value="">
                  {form.cursoEstudiante ? '— Selecciona —' : 'Elige un curso primero'}
                </option>
                {estudiantesFiltrados.map((e) => (
                  <option key={e.idEstudiante} value={e.idEstudiante}>{e.nombre}</option>
                ))}
              </select>
            </div>

            {/* 3) Parentesco */}
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Parentesco <span className="text-red-500">*</span>
              </label>
              <select
                value={form.parentesco}
                onChange={(e) => setForm((prev) => ({ ...prev, parentesco: e.target.value }))}
                className={selectClass}
              >
                <option value="">— Selecciona —</option>
                {PARENTESCOS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Especialización + institución (solo profesores) */}
        {form.idRol === ID_ROL_PROFESOR && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Especialización
              </label>
              <select
                value={form.especializacion}
                onChange={(e) => setForm((prev) => ({ ...prev, especializacion: e.target.value }))}
                className={selectClass}
              >
                <option value="">— Selecciona una especialización —</option>
                {especializaciones.map((e) => (
                  <option key={e.idEspecializacion} value={e.label}>{e.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Institución
              </label>
              <input
                type="text"
                value={form.institucion}
                onChange={(e) => setForm((prev) => ({ ...prev, institucion: e.target.value }))}
                className={inputClass}
                placeholder="Universidad / entidad"
                disabled={!form.especializacion.trim()}
              />
            </div>
          </div>
        )}

        {/* Cargo + nivel de acceso (solo administradores) */}
        {form.idRol === ID_ROL_ADMIN && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Cargo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.cargo}
                onChange={(e) => setForm((prev) => ({ ...prev, cargo: e.target.value }))}
                className={inputClass}
                placeholder="Coordinador, Rector…"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Nivel de acceso
              </label>
              <select
                value={form.nivelAcceso}
                onChange={(e) => setForm((prev) => ({ ...prev, nivelAcceso: e.target.value }))}
                className={selectClass}
              >
                {NIVELES_ACCESO.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Vigencia del rol (todos los usuarios) */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Fecha de asignación
            </label>
            <input
              type="date"
              value={form.fechaAsignacion}
              onChange={(e) => setForm((prev) => ({ ...prev, fechaAsignacion: e.target.value }))}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Fecha de fin
            </label>
            <input
              type="date"
              value={form.fechaFin}
              onChange={(e) => setForm((prev) => ({ ...prev, fechaFin: e.target.value }))}
              className={inputClass}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-sm transition-colors disabled:opacity-60 shadow-lg shadow-blue-500/30"
          >
            {saving ? 'Guardando...' : mode === 'create' ? 'Crear Usuario' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

const inputClass =
  'w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a] text-slate-800 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50'

const selectClass =
  'w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a] text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50'

// Variante de solo lectura: campos de identidad que no se pueden editar.
const lockedInputClass =
  'w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 text-sm cursor-not-allowed select-none'

const lockedSelectClass = lockedInputClass
