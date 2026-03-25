'use client'

import { useActionState } from 'react'
import { resetPassword } from '@/auth/actions'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const [state, formAction, pending] = useActionState(resetPassword, null)

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-black">
      {/* Background blobs */}
      <div className="absolute top-0 -left-6 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 dark:opacity-10 animate-pulse"></div>
      <div className="absolute -bottom-10 right-10 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 dark:opacity-10 animate-pulse" style={{ animationDelay: '3s' }}></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>

      <div className="relative z-10 w-full max-w-[320px] px-4">
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl blur opacity-25 animate-pulse"></div>
          <div className="relative flex flex-col gap-4 p-6 bg-white/80 dark:bg-black/70 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-2xl shadow-2xl">

            <div className="text-center">
              <div className="inline-flex items-center justify-center p-2 bg-blue-500/10 dark:bg-blue-500/20 rounded-xl mb-2 shadow-inner">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h1 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">Nueva Clave</h1>
              <p className="text-slate-500 dark:text-slate-400 text-[10px] mt-1">Ingresa tu nueva contraseña</p>
            </div>

            {state?.success ? (
              <div className="flex flex-col gap-3">
                <div className="p-3 bg-green-50/80 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-[11px] font-medium rounded-xl border border-green-200 dark:border-green-800/50 flex items-center gap-2">
                  <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>{state.success}</span>
                </div>
                <Link href="/login" className="text-center text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                  Ir al login →
                </Link>
              </div>
            ) : (
              <form action={formAction} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1 group">
                  <label htmlFor="password" className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 ml-1">
                    Nueva Contraseña
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      minLength={8}
                      placeholder="Mínimo 8 caracteres"
                      className="block w-full px-3 py-2 bg-slate-50/50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white text-xs outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1 group">
                  <label htmlFor="confirmPassword" className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 ml-1">
                    Confirmar
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      placeholder="Repite la contraseña"
                      className="block w-full px-3 py-2 bg-slate-50/50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white text-xs outline-none transition-all"
                    />
                  </div>
                </div>

                {state?.error && (
                  <div className="p-2 bg-red-50/80 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-[10px] font-medium rounded-xl border border-red-200 dark:border-red-800/50 flex items-center gap-2">
                    <svg className="h-3.5 w-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>{state.error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={pending}
                  className="flex justify-center py-2.5 px-4 text-xs font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 transition-all shadow-[0_0_15px_rgba(37,99,235,0.2)] active:scale-[0.98]"
                >
                  {pending ? '...' : 'Actualizar'}
                </button>

                <Link href="/login" className="text-center text-[10px] text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  ← Volver al login
                </Link>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
