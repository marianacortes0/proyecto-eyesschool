"use client";

import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";

export default function BeneficiosPage() {
  return (
    <main className="relative min-h-screen flex flex-col overflow-hidden">

      {/* Fondo modo claro */}
      <div className="absolute inset-0 -z-10 bg-[url('/images/pattern.png')] bg-repeat dark:hidden" />

      {/* Fondo modo oscuro */}
      <div className="absolute inset-0 -z-10 bg-[url('/images/pattern-dark.png')] bg-repeat hidden dark:block" />

      <Header />

      {/* HERO */}
      <section className="relative flex items-center justify-center text-center py-40 px-6">
        <div className="relative bg-[#d7e0e9] dark:bg-[#141414] backdrop-blur-xl p-16 rounded-3xl shadow-xl border border-white/20 dark:border-white/10 max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-800 dark:text-white mb-8">
            Todo lo que tu colegio necesita 📚
          </h1>

          <p className="text-gray-600 dark:text-gray-300 text-xl">
            EyeSchool simplifica la gestión académica, administrativa y
            comunicativa en una sola plataforma.
          </p>
        </div>
      </section>

      {/* BENEFICIOS */}
      <section className="py-28 px-6 max-w-6xl mx-auto grid md:grid-cols-3 gap-10">
        {[
          {
            icon: "⚡",
            title: "Ahorro de tiempo",
            text: "Automatiza procesos como notas, asistencia y reportes.",
          },
          {
            icon: "📊",
            title: "Control total",
            text: "Accede a toda la información en tiempo real.",
          },
          {
            icon: "🔗",
            title: "Todo en uno",
            text: "Unifica todas las herramientas en una sola plataforma.",
          },
        ].map((item, i) => (
          <div
            key={i}
            className="p-10 rounded-3xl bg-[#d7e0e9] dark:bg-[#141414] backdrop-blur-xl shadow border border-white/20 dark:border-white/10 hover:scale-105 hover:shadow-2xl transition"
          >
            <div className="text-4xl mb-5">{item.icon}</div>
            <h3 className="text-2xl font-semibold mb-3 text-gray-800 dark:text-white">
              {item.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              {item.text}
            </p>
          </div>
        ))}
      </section>

      {/* SECCIÓN DESTACADA */}
      <section className="py-28 px-6 max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="text-4xl font-bold mb-6 text-gray-800 dark:text-white">
            Gestión inteligente 📈
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg mb-6">
            Administra estudiantes, docentes y cursos desde un solo lugar,
            con una interfaz moderna y fácil de usar.
          </p>

          <ul className="space-y-3 text-gray-600 dark:text-gray-300 text-lg">
            <li>✔ Panel administrativo centralizado</li>
            <li>✔ Seguimiento académico en tiempo real</li>
            <li>✔ Reportes automáticos</li>
          </ul>
        </div>

        <div className="bg-[#d7e0e9] dark:bg-[#141414] backdrop-blur-xl p-12 rounded-3xl shadow border border-white/20 dark:border-white/10 text-center">
          <div className="text-6xl">💻</div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            Plataforma moderna y responsive
          </p>
        </div>
      </section>

      {/* PARA QUIÉN */}
      <section className="py-28 px-6 max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-16 text-gray-800 dark:text-white">
          Diseñado para todos
        </h2>

        <div className="grid md:grid-cols-3 gap-10">
          {[
            {
              title: "Administradores",
              text: "Controla toda la institución desde un solo panel.",
            },
            {
              title: "Docentes",
              text: "Gestiona clases, asistencia y notas fácilmente.",
            },
            {
              title: "Estudiantes",
              text: "Consulta tu progreso académico en tiempo real.",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-[#d7e0e9] dark:bg-[#141414] backdrop-blur-xl p-10 rounded-3xl shadow border border-white/20 dark:border-white/10"
            >
              <h3 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
                {item.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* DIFERENCIAL */}
      <section className="py-28 px-6 max-w-5xl mx-auto text-center">
        <div className="bg-[#d7e0e9] dark:bg-[#141414] backdrop-blur-xl p-16 rounded-3xl shadow border border-white/20 dark:border-white/10">
          <h2 className="text-4xl font-bold mb-6 text-gray-800 dark:text-white">
            ¿Por qué elegir EyeSchool?
          </h2>

          <p className="text-gray-600 dark:text-gray-300 text-lg mb-10">
            Porque no solo es un sistema, es una solución completa para tu institución.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {["Fácil de usar", "Seguro", "Escalable", "Moderno"].map((item, i) => (
              <span
                key={i}
                className="bg-gray-100 dark:bg-[#1f1f1f] text-gray-800 dark:text-white p-4 rounded-xl"
              >
                ✔ {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 px-6 max-w-4xl mx-auto text-center">
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-14 rounded-3xl shadow-xl">
          <h2 className="text-4xl font-bold mb-6">
            Empieza hoy mismo 🚀
          </h2>

          <p className="mb-8 text-lg opacity-90">
            Únete a las instituciones que ya están modernizando su gestión.
          </p>

          <a href="/login">
            <button className="px-10 py-4 rounded-xl bg-white text-black font-semibold hover:scale-105 transition">
              Iniciar sesión
            </button>
          </a>
        </div>
      </section>

      <Footer />
    </main>
  );
}