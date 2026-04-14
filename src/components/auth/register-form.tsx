'use client'

import { useActionState, useState, useEffect, useMemo } from 'react'
import { register, getCursos, getEspecializaciones } from '../../auth/actions'
import Link from 'next/link'

type Curso = { idCurso: number; nombreCurso: string; grado: string; jornada: string }
type Especializacion = { idEspecializacion: number; nombreEspecializacion: string }

const INPUT_CLASS =
  'block w-full px-3 py-2 bg-slate-50/50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-xl text-[11px] outline-none transition-all'

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
    <div className="w-full max-w-[340px] p-5 bg-white/80 dark:bg-black/80 backdrop-blur-2xl border border-white/40 dark:border-white/10 rounded-2xl shadow-xl relative overflow-hidden group">
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-30"></div>

      <div className="flex flex-col gap-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-1.5 bg-blue-500/10 rounded-lg mb-2 shadow-inner group-hover:scale-105 transition-transform">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tighter uppercase">Crear Cuenta</h1>
        </div>

        <form action={formAction} className="flex flex-col gap-2.5">
          <div className="grid grid-cols-2 gap-2">
            <input name="firstName" required placeholder="Nombre" className={INPUT_CLASS} />
            <input name="lastName" required placeholder="Apellido" className={INPUT_CLASS} />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <select
              name="docType"
              required
              className={`${INPUT_CLASS} cursor-pointer`}
            >
              <option value="CC">CC</option>
              <option value="TI">TI</option>
              <option value="CE">CE</option>
              <option value="PP">PP</option>
            </select>
            <input
              name="docNumber"
              required
              placeholder="Número..."
              className={`${INPUT_CLASS} col-span-2`}
            />
          </div>

          {/* Rol — controlado para mostrar dropdown condicional */}
          <select
            name="roleId"
            required
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
            className={`${INPUT_CLASS} cursor-pointer text-slate-500 dark:text-zinc-400`}
          >
            <option value="" disabled>¿Quién eres?</option>
            <option value="2">Estudiante</option>
            <option value="4">Padre / Acudiente</option>
            <option value="1">Profesor / Administrativo</option>
          </select>

          {/* Curso — solo para Estudiante */}
          {roleId === '2' && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <select
                  required
                  disabled={loadingOptions}
                  value={jornada}
                  onChange={e => handleJornadaChange(e.target.value)}
                  className={`${INPUT_CLASS} cursor-pointer text-slate-500 dark:text-zinc-400`}
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
                  className={`${INPUT_CLASS} cursor-pointer text-slate-500 dark:text-zinc-400 disabled:opacity-40`}
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
                className={`${INPUT_CLASS} cursor-pointer text-slate-500 dark:text-zinc-400 disabled:opacity-40`}
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
              className={`${INPUT_CLASS} cursor-pointer text-slate-500 dark:text-zinc-400`}
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

          <input
            name="email"
            type="email"
            required
            placeholder="Email"
            className={INPUT_CLASS}
          />

          <input
            name="password"
            type="password"
            required
            placeholder="Contraseña"
            className={INPUT_CLASS}
          />

          {state?.error && (
            <div className="p-2 bg-red-500/10 text-red-600 text-[9px] font-bold rounded-lg border border-red-500/20 text-center">
              {state.error}
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full mt-1 py-2.5 px-4 text-[11px] font-black rounded-xl text-white bg-blue-600 hover:bg-blue-500 transition-all uppercase tracking-widest"
          >
            {pending ? '...' : 'Registrarse'}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100 dark:border-zinc-800">
          <p className="text-[10px] text-slate-500">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="font-bold text-blue-600 dark:text-blue-400">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
