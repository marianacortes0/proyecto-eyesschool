'use client'

import { useActionState } from 'react'
import { forgotPassword } from '@/auth/actions'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(forgotPassword, null)

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-black">
      {/* Background blobs */}
      <div className="absolute top-0 -right-6 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 dark:opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 -left-6 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 dark:opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>

      <div className="relative z-10 w-full max-w-sm px-4">
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl blur opacity-25 animate-pulse"></div>
          <div className="relative flex flex-col gap-5 p-6 sm:p-8 bg-white/80 dark:bg-black/70 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-2xl shadow-2xl">

            <div className="text-center">
              <div className="inline-flex items-center justify-center p-2.5 bg-blue-500/10 dark:bg-blue-500/20 rounded-xl mb-3 shadow-inner">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Recuperar Contraseña</h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-1.5">Te enviaremos un enlace a tu correo</p>
            </div>

            {state?.success ? (
              <div className="flex flex-col gap-4">
                <div className="p-3.5 bg-green-50/80 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm font-medium rounded-xl border border-green-200 dark:border-green-800/50 flex items-center gap-2.5">
                  <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>{state.success}</span>
                </div>
                <Link href="/pages/login" className="text-center text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                  ← Volver al inicio de sesión
                </Link>
              </div>
            ) : (
              <form action={formAction} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1 group">
                  <label htmlFor="email" className="text-xs font-semibold text-slate-700 dark:text-slate-300 ml-1 group-focus-within:text-blue-600">
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="tu@correo.com"
                      className="block w-full pl-9 p-2.5 bg-slate-50/50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white text-sm outline-none transition-all"
                    />
                  </div>
                </div>

                {state?.error && (
                  <div className="p-3 bg-red-50/80 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium rounded-xl border border-red-200 dark:border-red-800/50 flex items-center gap-2.5">
                    <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>{state.error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={pending}
                  className="flex justify-center py-3 px-4 text-sm font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 focus:ring-4 focus:ring-blue-500/30 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] active:scale-[0.98]"
                >
                  {pending ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
                </button>

                <Link href="/pages/login" className="text-center text-xs text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  ← Volver al inicio de sesión
                </Link>
              </form>
            )}
          </div>
        </div>
        <p className="text-center mt-8 text-xs text-slate-500 dark:text-slate-400">
          &copy; {new Date().getFullYear()} EyesSchool.
        </p>
      </div>
    </div>
  )
}
