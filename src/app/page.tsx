"use client";

import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";
import Link from "next/link";
import ColegiosCarousel from "@/components/home/ColegiosCarousel";
import CookieBanner from "@/components/ui/CookieBanner";

export default function Home() {
  return (
    <>
      <main className="min-h-screen flex flex-col bg-[#a5b9c9] dark:bg-[#253444] transition-colors duration-500">

        <Header />

        <section className="w-full flex items-center justify-center text-center py-24 -mt-20 pt-20">
          <div className="w-full bg-white/80 dark:bg-[#141414] backdrop-blur-xl py-80 px-6 md:px-20 rounded-none md:rounded-2xl shadow-xl border border-white/20 dark:border-white/10">
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-800 dark:text-white">
              EyeSchool
            </h1>

            <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Plataforma de gestión escolar para administrar estudiantes, docentes y procesos académicos de forma eficiente.
            </p>

            <Link href="/login">
              <button className="px-6 py-3 rounded-xl bg-[lab(35_0_0)] text-white hover:bg-[lab(30_0_0)] dark:bg-white dark:text-black dark:hover:bg-gray-200 transition">
                Iniciar Sesión
              </button>
            </Link>

          </div>
        </section>

        {/* USUARIOS */}
        <section className="py-20 px-6 max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">

            {[
              { icon: "🏫", title: "Administradores", text: "Controla toda la institución desde un solo panel." },
              { icon: "👨‍🏫", title: "Docentes", text: "Gestiona notas, asistencia y cursos fácilmente." },
              { icon: "🎓", title: "Estudiantes", text: "Consulta tu progreso académico en tiempo real." }
            ].map((item, i) => (
              <div
                key={i}
                className="p-8 rounded-2xl shadow bg-white/80 dark:bg-[#141414] backdrop-blur-xl border border-white/20 dark:border-white/10 flex flex-col min-h-[220px] hover:scale-[1.04] hover:shadow-2xl transition"
              >
                <div className="text-3xl mb-4">{item.icon}</div>
                <h3 className="text-2xl font-semibold mb-3 text-gray-800 dark:text-white">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 flex-1">{item.text}</p>
              </div>
            ))}

          </div>
        </section>

        <section className="py-20 px-6 max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">

            {[
              { icon: "⚡", title: "Automatización", text: "Reduce tareas manuales repetitivas." },
              { icon: "🧠", title: "Centralización", text: "Toda la información en un solo lugar." },
              { icon: "📊", title: "Reportes", text: "Genera informes en segundos." }
            ].map((item, i) => (
              <div
                key={i}
                className="p-8 rounded-2xl shadow bg-white/80 dark:bg-[#141414] backdrop-blur-xl border border-white/20 dark:border-white/10 flex flex-col min-h-[220px] hover:scale-[1.04] hover:shadow-2xl transition"
              >
                <div className="text-3xl mb-4">{item.icon}</div>
                <h3 className="text-2xl font-semibold mb-3 text-gray-800 dark:text-white">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 flex-1">{item.text}</p>
              </div>
            ))}

          </div>
        </section>

        <ColegiosCarousel />

        <section className="py-20 px-6 max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 dark:text-white mb-12">
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
                className="bg-white/80 dark:bg-[#141414] backdrop-blur-xl p-6 rounded-2xl shadow border border-white/20 dark:border-white/10 flex flex-col"
              >
                <p className="text-gray-600 dark:text-gray-300 flex-1 mb-6">“{item.text}”</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-white">{item.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.role}</p>
                  </div>
                </div>
              </div>
            ))}

          </div>
        </section>

        <section className="py-20 px-6 max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-6">
            Conoce cómo funciona EyeSchool
          </h2>

          <p className="text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto">
            Descubre cómo nuestra plataforma transforma la gestión escolar.
          </p>

          <div className="w-full aspect-video bg-white/80 dark:bg-[#141414] backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-white/10 overflow-hidden">
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