'use client'

import { useState, useEffect } from 'react'
import Modal from '@/components/ui/Modal'
import { type UsuarioConRol, type CreateUsuarioData, type UpdateUsuarioData } from '@/services/usuarios/usuariosService'
import { type ModalMode } from '@/hooks/useUsuarios'

interface UsuarioModalProps {
  mode: ModalMode
  usuario: UsuarioConRol | null
  saving: boolean
  onClose: () => void
  onCreate: (data: CreateUsuarioData) => Promise<void>
  onUpdate: (data: UpdateUsuarioData) => Promise<void>
}

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
}

export default function UsuarioModal({
  mode,
  usuario,
  saving,
  onClose,
  onCreate,
  onUpdate,
}: UsuarioModalProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (mode === 'edit' && usuario) {
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
      })
    } else {
      setForm(EMPTY_FORM)
    }
    setFormError(null)
  }, [mode, usuario])

  const set = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!form.primerNombre.trim() || !form.primerApellido.trim()) {
      setFormError('El nombre y apellido son obligatorios.')
      return
    }
    if (!form.numeroDocumento.trim()) {
      setFormError('El número de documento es obligatorio.')
      return
    }
    if (mode === 'create' && !form.correo.trim()) {
      setFormError('El correo es obligatorio.')
      return
    }
    if (mode === 'create' && form.password.length < 6) {
      setFormError('La contraseña debe tener al menos 6 caracteres.')
      return
    }

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
        })
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Error al guardar')
    }
  }

  const isOpen = mode === 'create' || mode === 'edit'
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

        {/* Documento */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Tipo Doc. <span className="text-red-500">*</span>
            </label>
            <select value={form.tipoDocumento} onChange={set('tipoDocumento')} className={selectClass}>
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
              className={inputClass}
              placeholder="1234567890"
              required
            />
          </div>
        </div>

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
            className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors disabled:opacity-60 shadow-lg shadow-blue-500/30"
          >
            {saving ? 'Guardando...' : mode === 'create' ? 'Crear Usuario' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

const inputClass =
  'w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a] text-slate-800 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50'

const selectClass =
  'w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a] text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50'
