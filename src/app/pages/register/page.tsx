import { RegisterForm } from '@/components/auth/register-form'

export default function RegisterPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-black">
      {/* Elementos decorativos animados en segundo plano */}
      <div className="absolute top-0 -left-10 w-96 h-96 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-[128px] animate-pulse"></div>
      <div className="absolute -bottom-10 -right-10 w-96 h-96 bg-cyan-500/20 rounded-full mix-blend-multiply filter blur-[128px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

      <div className="relative z-10 w-full flex justify-center px-4 py-10">
        <RegisterForm />
      </div>

      <footer className="absolute bottom-6 w-full text-center text-xs text-slate-400 dark:text-slate-600">
        &copy; {new Date().getFullYear()} EyesSchool. Todo los derechos reservados.
      </footer>
    </div>
  )
}
