'use client'

import { useActionState, useState, useEffect, useMemo } from 'react'
import { register, getCursos, getEspecializaciones } from '../../auth/actions'
import Link from 'next/link'

type Curso = { idCurso: number; nombreCurso: string; grado: string; jornada: string }
type Especializacion = { idEspecializacion: number; nombreEspecializacion: string }

const INPUT_CLASS =
  'block w-full px-4 py-2.5 bg-surface-bg border border-glass-stroke rounded-xl text-sm text-on-surface outline-none transition-all focus:ring-2 focus:ring-primary/30 focus:border-primary placeholder:text-on-surface-variant'

const SELECT_CLASS = `${INPUT_CLASS} cursor-pointer`

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(register, null)
  const [roleId, setRoleId] = useState('')
  const [cursos, setCursos] = useState<Curso[]>([])
  const [especializaciones, setEspecializaciones] = useState<Especializacion[]>([])
  const [loadingOptions, setLoadingOptions] = useState(false)
  const [jornada, setJornada] = useState('')
  const [grado, setGrado] = useState('')

  useEffect(() => {
    if (!roleId) return
    setLoadingOptions(true)
    if (roleId === '2') {
      getCursos()
        .then(setCursos)
        .finally(() => setLoadingOptions(false))
    } else if (roleId === '1') {
      getEspecializaciones()
        .then(setEspecializaciones)
        .finally(() => setLoadingOptions(false))
    } else {
      setLoadingOptions(false)
    }
  }, [roleId])

  const jornadas = useMemo(() => [...new Set(cursos.map(c => c.jornada))].sort(), [cursos])
  const grados = useMemo(
    () => jornada ? [...new Set(cursos.filter(c => c.jornada === jornada).map(c => c.grado))].sort() : [],
    [jornada, cursos]
  )
  const cursosFiltrados = useMemo(
    () => jornada && grado ? cursos.filter(c => c.jornada === jornada && c.grado === grado) : [],
    [jornada, grado, cursos]
  )

  const handleJornadaChange = (val: string) => { setJornada(val); setGrado('') }

  return (
    <div className="w-full max-w-md p-8 lg:p-10 minimal-card rounded-super">
      <div className="flex flex-col gap-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-container text-primary mb-4">
            <span className="material-symbols-outlined fill !text-2xl">person_add</span>
          </div>
          <h1 className="font-headline text-3xl font-black text-on-surface tracking-tight">
            Crear <span className="text-primary">cuenta</span>
          </h1>
          <p className="text-sm text-on-surface-variant font-light mt-2">
            Únete a la plataforma EyeSchool.
          </p>
        </div>

        <form action={formAction} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <input name="firstName" required placeholder="Nombre" className={INPUT_CLASS} />
            <input name="lastName" required placeholder="Apellido" className={INPUT_CLASS} />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <select name="docType" required className={SELECT_CLASS}>
              <option value="CC">CC</option>
              <option value="TI">TI</option>
              <option value="CE">CE</option>
              <option value="PP">PP</option>
            </select>
            <input
              name="docNumber"
              required
              placeholder="Número de documento"
              className={`${INPUT_CLASS} col-span-2`}
            />
          </div>

          {/* Rol — controlado para mostrar dropdown condicional */}
          <select
            name="roleId"
            required
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
            className={SELECT_CLASS}
          >
            <option value="" disabled>¿Quién eres?</option>
            <option value="2">Estudiante</option>
            <option value="4">Padre / Acudiente</option>
            <option value="1">Profesor / Administrativo</option>
          </select>

          {/* Curso — solo para Estudiante */}
          {roleId === '2' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <select
                  required
                  disabled={loadingOptions}
                  value={jornada}
                  onChange={e => handleJornadaChange(e.target.value)}
                  className={SELECT_CLASS}
                >
                  <option value="" disabled>{loadingOptions ? 'Cargando...' : 'Jornada'}</option>
                  {jornadas.map(j => (
                    <option key={j} value={j}>{j}</option>
                  ))}
                </select>
                <select
                  required
                  disabled={!jornada}
                  value={grado}
                  onChange={e => setGrado(e.target.value)}
                  className={`${SELECT_CLASS} disabled:opacity-40`}
                >
                  <option value="" disabled>Grado</option>
                  {grados.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
              <select
                name="courseId"
                required
                disabled={!grado}
                defaultValue=""
                className={`${SELECT_CLASS} disabled:opacity-40`}
              >
                <option value="" disabled>
                  {!jornada ? 'Selecciona jornada y grado' : !grado ? 'Selecciona un grado' : 'Selecciona tu curso'}
                </option>
                {cursosFiltrados.map(c => (
                  <option key={c.idCurso} value={c.idCurso}>
                    {c.nombreCurso}
                  </option>
                ))}
              </select>
            </>
          )}

          {/* Especialización — solo para Profesor */}
          {roleId === '1' && (
            <select
              name="especializacionId"
              required
              disabled={loadingOptions}
              defaultValue=""
              className={SELECT_CLASS}
            >
              <option value="" disabled>
                {loadingOptions ? 'Cargando...' : 'Selecciona tu especialización'}
              </option>
              {especializaciones.map((e) => (
                <option key={e.idEspecializacion} value={e.idEspecializacion}>
                  {e.nombreEspecializacion}
                </option>
              ))}
            </select>
          )}

          <input name="email" type="email" required placeholder="Correo electrónico" className={INPUT_CLASS} />
          <input name="password" type="password" required placeholder="Contraseña" className={INPUT_CLASS} />

          {state?.error && (
            <div className="px-4 py-2.5 bg-red-50 text-red-600 text-xs font-medium rounded-xl border border-red-200 text-center">
              {state.error}
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full mt-2 py-3 px-4 text-sm font-bold rounded-xl text-white bg-primary hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-60"
          >
            {pending ? 'Creando cuenta…' : 'Registrarse'}
          </button>
        </form>

        <div className="text-center pt-4 border-t border-glass-stroke">
          <p className="text-sm text-on-surface-variant">
            ¿Ya tienes cuenta?{' '}
            <Link href="/" className="font-bold text-primary hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
