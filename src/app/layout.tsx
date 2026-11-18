import type { Metadata } from "next";
import Script from "next/script";
import { Poppins, Hanken_Grotesk, Inter } from "next/font/google";
import { ToastContainer } from "react-toastify";
import PageTransition from "@/components/ui/PageTransition";
import CookieBanner from "@/components/ui/CookieBanner";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";
import { URL_ICONOS } from "@/lib/iconos";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Anti-flash: aplica el tema guardado antes del primer paint, fuera del árbol JSX
const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('eys_theme');if(t!=='light'&&t!=='dark'){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.classList.toggle('dark',t==='dark');}catch(e){}})();`;

export const metadata: Metadata = {
  title: "Eyes School",
  description: "Plataforma de gestión escolar",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${poppins.variable} ${hankenGrotesk.variable} ${inter.variable} h-full antialiased`}
    >
      <head>
        {/* Material Symbols (icon font): no está en next/font/google, se carga por link y solo con los iconos usados (DEF-WEB-17) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href={URL_ICONOS}
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col font-sans bg-[#a5b9c9] dark:bg-[#253444] transition-colors duration-500">
        {/* Anti-flash del tema: beforeInteractive se inyecta en el <head> y corre antes del primer paint (evita FOUC) */}
        <Script id="eys-theme-init" strategy="beforeInteractive">
          {THEME_INIT_SCRIPT}
        </Script>
        <PageTransition>
          {/* Contenedor, no <main>: cada página trae el suyo (el panel en su layout,
              la portada, (auth) y home en su página). Dos <main> anidados rompían
              la región principal para los lectores de pantalla (DEF-WEB-02). */}
          <div className="flex-1">
            {children}
          </div>
        </PageTransition>

        {/* 🔥 SOLO COOKIE GLOBAL */}
        <CookieBanner />

        {/* Notificaciones uniformes (verde/rojo/amarillo, autocierre 4s) */}
        <ToastContainer theme="colored" newestOnTop />

      </body>
    </html>
  );
}