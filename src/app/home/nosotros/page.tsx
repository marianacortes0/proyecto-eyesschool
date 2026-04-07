"use client";

import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";


export default function NosotrosPage() {
  return (
    <main className="min-h-screen flex flex-col bg-[#a5b9c9] dark:bg-[#253444] transition-colors duration-500">

      <Header />

      {/* HERO */}
      <section className="flex items-center justify-center text-center py-40 px-6">
        <div className="bg-white/80 dark:bg-[#141414] backdrop-blur-xl p-16 rounded-3xl shadow-xl border border-white/20 dark:border-white/10 max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-800 dark:text-white mb-8">
            Transformando la educación
          </h1>

          <p className="text-gray-600 dark:text-gray-300 text-xl">
            En EyeSchool creemos que la tecnología debe simplificar la vida
            de colegios, docentes y estudiantes.
          </p>
        </div>
      </section>

      {/* STATS */}
      <section className="py-20 px-6 max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {[
          { value: "50+", label: "Colegios" },
          { value: "10k+", label: "Usuarios" },
          { value: "99%", label: "Satisfacción" },
          { value: "24/7", label: "Disponibilidad" },
        ].map((item, i) => (
          <div key={i} className="bg-white/80 dark:bg-[#141414] backdrop-blur-xl p-8 rounded-2xl shadow border border-white/20 dark:border-white/10">
            <h3 className="text-3xl font-bold text-gray-800 dark:text-white">{item.value}</h3>
            <p className="text-gray-600 dark:text-gray-300 mt-2">{item.label}</p>
          </div>
        ))}
      </section>

      {/* MISIÓN / VISIÓN */}
      <section className="py-24 px-6 max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
        
        <div className="bg-white/80 dark:bg-[#141414] backdrop-blur-xl p-10 rounded-3xl shadow border border-white/20 dark:border-white/10">
          <h2 className="text-3xl font-semibold mb-6 text-gray-800 dark:text-white">
            Nuestra Misión
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Facilitar la gestión escolar mediante herramientas digitales que
            optimicen procesos administrativos y académicos, permitiendo a las
            instituciones enfocarse en lo más importante: la educación.
          </p>
        </div>

        <div className="bg-white/80 dark:bg-[#141414] backdrop-blur-xl p-10 rounded-3xl shadow border border-white/20 dark:border-white/10">
          <h2 className="text-3xl font-semibold mb-6 text-gray-800 dark:text-white">
            Nuestra Visión
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Ser la plataforma líder en gestión educativa en Latinoamérica,
            impulsando la innovación y la transformación digital en colegios.
          </p>
        </div>

      </section>

      {/* DIFERENCIAL */}
      <section className="py-24 px-6 max-w-6xl mx-auto grid md:grid-cols-3 gap-10">
        
        {[
          {
            icon: "⚡",
            title: "Rápido",
            text: "Todo funciona en segundos, sin complicaciones.",
          },
          {
            icon: "🎯",
            title: "Intuitivo",
            text: "Diseñado para que cualquiera lo use fácilmente.",
          },
          {
            icon: "🔒",
            title: "Seguro",
            text: "Tus datos siempre protegidos.",
          },
        ].map((item, i) => (
          <div
            key={i}
            className="p-10 rounded-3xl bg-white/80 dark:bg-[#141414] backdrop-blur-xl shadow border border-white/20 dark:border-white/10 hover:scale-105 hover:shadow-2xl transition"
          >
            <div className="text-4xl mb-5">{item.icon}</div>
            <h3 className="text-2xl font-semibold mb-3 text-gray-800 dark:text-white">{item.title}</h3>
            <p className="text-gray-600 dark:text-gray-300 text-lg">{item.text}</p>
          </div>
        ))}

      </section>

      {/* EQUIPO */}
      <section className="py-28 px-6 max-w-6xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-16">
          Fundadores
        </h2>

        <div className="grid md:grid-cols-4 gap-10">
          
          {[
            "Samuel Sierra",
            "Mariana Cortez",
            "Andres Acero",
            "Sergio Gomes",
          ].map((name, i) => (
            <div
              key={i}
              className="bg-white/80 dark:bg-[#141414] backdrop-blur-xl p-10 rounded-3xl shadow border border-white/20 dark:border-white/10 hover:-translate-y-3 transition"
            >
              
              <div className="w-28 h-28 mx-auto rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center text-3xl mb-5">
                👤
              </div>

              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{name}</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Fundador</p>

            </div>
          ))}

        </div>
      </section>

      {/* CTA */}
      <section className="py-28 px-6 max-w-4xl mx-auto text-center">
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-14 rounded-3xl shadow-xl">
          
          <h2 className="text-4xl font-bold mb-6">
            Únete a la revolución educativa
          </h2>

          <p className="mb-8 text-lg opacity-90">
            Lleva tu institución al siguiente nivel con EyeSchool.
          </p>

          <a href="/login">
            <button className="px-10 py-4 rounded-xl bg-white text-black font-semibold hover:scale-105 transition">
              Contáctanos
            </button>
          </a>

        </div>
      </section>

      <Footer />
      

    </main>
  );
}