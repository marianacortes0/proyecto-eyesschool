// Región principal de las páginas de cuenta (recuperar y restablecer la
// contraseña): el layout raíz ya no pone <main> (DEF-WEB-02).
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <main>{children}</main>
}
