'use client'

import { useActionState } from 'react'
import { login } from '../app/(auth)/actions'

export function LoginForm() {
  // En React 19 / Next.js 15, useActionState es la forma recomendada para Server Actions en formularios
  const [state, formAction, pending] = useActionState(login, null)

  return (
    <form action={formAction} className="flex flex-col gap-4 w-full max-w-md mx-auto p-8 border rounded-2xl shadow-sm bg-white">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">EyesSchool</h2>
        <p className="text-gray-500 text-sm mt-1">Ingresa a tu cuenta</p>
      </div>
      
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-semibold text-gray-700">Correo Electrónico</label>
        <input 
          id="email" 
          name="email" 
          type="email" 
          required 
          className="p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          placeholder="usuario@eyesschool.com"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-semibold text-gray-700">Contraseña</label>
        <input 
          id="password" 
          name="password" 
          type="password" 
          required 
          className="p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
        />
      </div>

      {state?.error && (
        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
          {state.error}
        </div>
      )}

      <button 
        type="submit" 
        disabled={pending}
        className="mt-2 bg-blue-600 text-white p-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
      >
        {pending ? 'Autenticando...' : 'Iniciar Sesión'}
      </button>
    </form>
  )
}
