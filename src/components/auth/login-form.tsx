'use client'

import { useActionState } from 'react'
import { login } from '../../auth/actions'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useToggle } from '@/hooks/useToggle'

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, null)
  const searchParams = useSearchParams()
  const registeredParam = searchParams.get('registered')
  const justRegistered = registeredParam === 'true'
  const justRegisteredPending = registeredParam === 'pending'
  const [showPassword, togglePassword] = useToggle(false)

  return (
    <div className="relative w-full max-w-[300px] mx-auto">
      {/* Glow effect behind the form */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl blur opacity-20 transition-opacity group-hover:opacity-30"></div>
      
      {/* Form Container (Glassmorphism) */}
      <div className="relative flex flex-col gap-3 w-full p-5 bg-white/80 dark:bg-black/80 backdrop-blur-2xl border border-white/40 dark:border-white/10 rounded-2xl shadow-xl transition-all duration-300">
        
        <div className="text-center mb-0.5">
          <div className="inline-flex items-center justify-center p-1.5 bg-blue-500/10 rounded-lg mb-2 shadow-inner">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tighter uppercase">
            EyesSchool
          </h2>
        </div>

        {justRegistered && (
          <div className="p-2 bg-green-500/10 text-green-600 dark:text-green-400 text-[9px] font-bold rounded-lg border border-green-500/20 text-center animate-in fade-in zoom-in">
            ¡Registro completado! Ya puedes iniciar sesión.
          </div>
        )}
        {justRegisteredPending && (
          <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[9px] font-bold rounded-lg border border-amber-500/20 text-center animate-in fade-in zoom-in">
            Registro enviado. Tu cuenta está pendiente de validación por el administrador.
          </div>
        )}
        
        <form action={formAction} className="flex flex-col gap-2.5">
          <div className="flex flex-col gap-1">
            <input 
              id="email" 
              name="email" 
              type="email" 
              required 
              className="block w-full px-3 py-2 bg-slate-50/50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white text-[11px] outline-none transition-all placeholder:text-slate-400"
              placeholder="Email"
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="relative">
              <input 
                id="password" 
                name="password" 
                type={showPassword ? "text" : "password"} 
                required 
                className="block w-full pl-3 pr-9 py-2 bg-slate-50/50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white text-[11px] outline-none transition-all placeholder:text-slate-400"
                placeholder="Contraseña"
              />
              <button
                type="button"
                onClick={togglePassword}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-blue-500 transition-colors"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {showPassword ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          <div className="flex justify-end -mt-0.5">
            <Link
              href="/forgot-password"
              className="text-[9px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              ¿Olvidaste la clave?
            </Link>
          </div>

          {state?.error && (
            <div className="p-2 bg-red-500/10 text-red-600 text-[9px] font-bold rounded-lg border border-red-500/20 text-center">
              {state.error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={pending}
            className="mt-0.5 w-full py-2 px-4 text-[11px] font-black rounded-xl text-white bg-blue-600 hover:bg-blue-500 transition-all uppercase tracking-widest shadow-lg shadow-blue-500/20"
          >
            {pending ? '...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-1 pt-2 border-t border-slate-100 dark:border-zinc-800 text-center">
          <p className="text-[10px] text-slate-500">
            ¿No tienes cuenta?{' '}
            <Link href="/register" className="font-bold text-blue-600 dark:text-blue-400">
              Crea una
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
