import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import PageTransition from "@/components/ui/PageTransition";
import CookieBanner from "@/components/ui/CookieBanner";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

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
      className={`${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-screen flex flex-col font-sans bg-[#a5b9c9] dark:bg-[#253444] transition-colors duration-500">
        
        <PageTransition>
          <main className="flex-1">
            {children}
          </main>
        </PageTransition>

        {/* 🔥 SOLO COOKIE GLOBAL */}
        <CookieBanner />

      </body>
    </html>
  );
}