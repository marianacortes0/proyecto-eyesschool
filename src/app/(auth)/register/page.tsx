import Link from 'next/link'
import { RegisterForm } from '@/components/auth/register-form'

export default function RegisterPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-surface-bg font-body py-10 px-4">
      {/* Halos suaves de fondo */}
      <div className="absolute top-0 -left-20 w-80 h-80 bg-primary/10 rounded-full filter blur-[120px]" />
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-neon-purple/10 rounded-full filter blur-[120px]" />

      {/* Volver al inicio */}
      <Link
        href="/"
        className="absolute top-6 left-6 z-20 inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary transition-colors"
      >
        <span className="material-symbols-outlined !text-lg">arrow_back</span>
        Inicio
      </Link>

      <div className="relative z-10 w-full flex justify-center">
        <RegisterForm />
      </div>

      <footer className="absolute bottom-4 w-full text-center text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-[0.3em]">
        © {new Date().getFullYear()} EyeSchool
      </footer>
    </div>
  )
}
