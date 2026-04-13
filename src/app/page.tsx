"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import ColegiosCarousel from "@/components/home/ColegiosCarousel";
import CookieBanner from "@/components/ui/CookieBanner";

export default function Home() {
  return (
    <>
      <main className="relative min-h-screen flex flex-col">

        <div className="absolute inset-0 -z-10 bg-[url('/images/pattern.png')] bg-repeat dark:hidden" />
        <div className="absolute inset-0 -z-10 bg-[url('/images/pattern-dark.png')] bg-repeat hidden dark:block" />

        <Header />

        {/* HERO */}
        <section className="relative z-10 w-full flex items-center justify-center text-center py-24 overflow-hidden">
          <div className="w-full py-40 px-6 md:px-20">
            
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight text-black dark:text-white">
              Eye
              <span className="bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
                School
              </span>
            </h1>

            <p className="text-base md:text-xl leading-relaxed text-gray-800 dark:text-gray-300 mb-10 max-w-2xl mx-auto font-light">
              Simplifica la gestión escolar con una plataforma moderna e intuitiva para 
              <span className="font-medium text-black dark:text-white"> estudiantes y docentes</span>.
            </p>

            <Link href="/login">
              <button className="px-6 py-3 text-base rounded-xl bg-[lab(35_0_0)] text-white hover:bg-[lab(30_0_0)] dark:bg-white dark:text-black dark:hover:bg-gray-200 transition-all duration-300 shadow-lg hover:scale-105">
                Iniciar Sesión
              </button>
            </Link>

          </div>
        </section>

        {/* SECCIÓN PRINCIPAL */}
        <section className="relative z-10 py-24 px-6 max-w-6xl mx-auto mt-24">
          
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-black dark:text-white mb-4">
              Una plataforma{" "}
              <span className="bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
                completa
              </span>{" "}
              para tu institución
            </h2>

            <p className="text-gray-700 dark:text-gray-300 max-w-2xl mx-auto text-lg">
              Diseñada para cada rol y optimizada para simplificar todos los procesos académicos.
            </p>
          </div>

          {/* BLOQUE 1 */}
          <div className="mb-16">
            <h3 className="text-xl font-semibold text-black dark:text-white mb-6 text-center">
              Para cada rol
            </h3>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: "🏫", title: "Administradores", text: "Controla toda la institución desde un solo panel." },
                { icon: "👨‍🏫", title: "Docentes", text: "Gestiona notas, asistencia y cursos fácilmente." },
                { icon: "🎓", title: "Estudiantes", text: "Consulta tu progreso académico en tiempo real." }
              ].map((item, i) => (
                <div
                  key={i}
                  className="group relative p-8 rounded-2xl bg-[#d7e0e9] dark:bg-[#141414] backdrop-blur-xl border border-black/10 dark:border-white/20 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                >
                  <div className="text-4xl mb-5">{item.icon}</div>

                  <h3 className="text-xl md:text-2xl font-semibold mb-3 text-black dark:text-white">
                    {item.title}
                  </h3>

                  <p className="text-gray-700 dark:text-gray-300">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* BLOQUE 2 */}
          <div>
            <h3 className="text-xl font-semibold text-black dark:text-white mb-6 text-center">
              Beneficios clave
            </h3>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: "⚡", title: "Automatización", text: "Reduce tareas manuales repetitivas." },
                { icon: "🧠", title: "Centralización", text: "Toda la información en un solo lugar." },
                { icon: "📊", title: "Reportes", text: "Genera informes en segundos." }
              ].map((item, i) => (
                <div
                  key={i}
                  className="group relative p-8 rounded-2xl bg-[#d7e0e9] dark:bg-[#141414] backdrop-blur-xl border border-black/10 dark:border-white/20 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                >
                  <div className="text-4xl mb-5">{item.icon}</div>

                  <h3 className="text-xl md:text-2xl font-semibold mb-3 text-black dark:text-white">
                    {item.title}
                  </h3>

                  <p className="text-gray-700 dark:text-gray-300">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </section>

        <div className="relative z-10">
          <ColegiosCarousel />
        </div>

        {/* TESTIMONIOS */}
        <section className="relative z-10 py-20 px-6 max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-black dark:text-white mb-12">
            Lo que dicen los profesores
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                text: "Desde que usamos EyeSchool, gestionar notas y asistencia es muchísimo más rápido.",
                name: "María Gómez",
                role: "Docente de Matemáticas",
                icon: "👩‍🏫"
              },
              {
                text: "La plataforma es muy intuitiva. Mis estudiantes ahora tienen todo claro.",
                name: "Carlos Rodríguez",
                role: "Docente de Ciencias",
                icon: "👨‍🏫"
              },
              {
                text: "Generar reportes ahora es cuestión de segundos. Es increíble.",
                name: "Laura Fernández",
                role: "Coordinadora Académica",
                icon: "👩‍💼"
              }
            ].map((item, i) => (
              <div
                key={i}
                className="bg-[#d7e0e9] dark:bg-[#141414] p-6 rounded-2xl shadow border border-black/10 dark:border-white/20 flex flex-col"
              >
                <p className="text-gray-700 dark:text-gray-300 flex-1 mb-6">“{item.text}”</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-black dark:text-white">{item.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{item.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* VIDEO */}
        <section className="relative z-10 py-24 px-6 max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white mb-6">
            Conoce cómo funciona EyeSchool
          </h2>

          <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 mb-10 max-w-2xl mx-auto">
            Descubre cómo nuestra plataforma transforma la gestión escolar.
          </p>

          <div className="w-full aspect-video bg-[#d7e0e9] dark:bg-[#141414] backdrop-blur-xl rounded-2xl shadow-xl border border-black/10 dark:border-white/20 overflow-hidden">
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/Ow75gjvJDvE"
              title="EyeSchool demo"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </section>

        <Footer />
      </main>

      <CookieBanner />
    </>
  );
}
