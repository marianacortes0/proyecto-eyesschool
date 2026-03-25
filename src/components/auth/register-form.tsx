'use client'

import { useActionState } from 'react'
import { register } from '../../auth/actions'
import Link from 'next/link'

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(register, null)

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
            <input 
              name="firstName" 
              required 
              placeholder="Nombre"
              className="block w-full px-3 py-2 bg-slate-50/50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-xl text-[11px] outline-none transition-all"
            />
            <input 
              name="lastName" 
              required 
              placeholder="Apellido"
              className="block w-full px-3 py-2 bg-slate-50/50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-xl text-[11px] outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <select 
              name="docType" 
              required
              className="block w-full px-2 py-2 bg-slate-50/50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-xl text-[10px] outline-none transition-all cursor-pointer"
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
              className="block w-full col-span-2 px-3 py-2 bg-slate-50/50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-xl text-[11px] outline-none transition-all"
            />
          </div>

          <select 
            name="roleId" 
            required
            className="block w-full px-3 py-2 bg-slate-50/50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-xl text-[11px] outline-none transition-all cursor-pointer"
          >
            <option value="1">Admin</option>
            <option value="2">Profesor</option>
            <option value="3">Estudiante</option>
            <option value="4">Padre</option>
          </select>

          <input 
            name="email" 
            type="email" 
            required 
            placeholder="Email"
            className="block w-full px-3 py-2 bg-slate-50/50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-xl text-[11px] outline-none transition-all"
          />

          <input 
            name="password" 
            type="password" 
            required 
            placeholder="Contraseña"
            className="block w-full px-3 py-2 bg-slate-50/50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-xl text-[11px] outline-none transition-all"
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
            {pending ? "..." : "Registrarse"}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100 dark:border-zinc-800">
          <p className="text-[10px] text-slate-500">
            ¿Ya tienes cuenta? {' '}
            <Link href="/login" className="font-bold text-blue-600 dark:text-blue-400">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
