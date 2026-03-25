import { LoginForm } from "@/components/auth/login-form"

// Generate metadata
export const metadata = {
  title: 'Iniciar Sesión | EyesSchool',
  description: 'Accede a la plataforma educativa EyesSchool.',
}

export default function LoginPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-black selection:bg-blue-500/30">
      
      {/* Background Decorative Blobs */}
      <div className="absolute top-0 -left-6 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 dark:opacity-20 animate-pulse transition-all duration-1000"></div>
      <div className="absolute top-0 -right-6 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 dark:opacity-20 animate-pulse transition-all duration-1000" style={{ animationDelay: '2s' }}></div>
      <div className="absolute -bottom-10 left-32 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 dark:opacity-20 animate-pulse transition-all duration-1000" style={{ animationDelay: '4s' }}></div>

      {/* Modern Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>

      {/* Central Content */}
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 mt-[-5vh]">
        <LoginForm />
        
        {/* Footer text */}
        <p className="text-center mt-10 text-sm text-slate-500 dark:text-slate-400">
          &copy; {new Date().getFullYear()} EyesSchool. Todos los derechos reservados.
        </p>
      </div>
    </div>
  )
}
