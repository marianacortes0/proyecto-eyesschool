"use client";

import { MessageCircle, Mail, Phone } from "lucide-react";

import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";

export default function SupportPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#a5b9c9] dark:bg-[#253444] text-gray-800 dark:text-gray-200 transition-colors duration-500">
      
      {/* HEADER */}
      <Header />


      {/* CONTENIDO */}
      <main className="flex-1 flex flex-col justify-center px-6 py-20">
        
        {/* Header sección */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">
            Centro de Soporte
          </h1>
          <p className="text-gray-700 dark:text-gray-300">
            Estamos aquí para ayudarte. Elige la opción que prefieras para contactarnos.
          </p>
        </div>

        {/* Opciones */}
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
          
          {/* Chat */}
          <div className="group bg-white dark:bg-[#141414] p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-transparent hover:border-blue-500">
            
            <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900 mb-6 group-hover:scale-110 transition">
              <MessageCircle className="text-blue-600 dark:text-blue-400" size={28} />
            </div>

            <h3 className="text-xl font-semibold mb-2">
              Chat en vivo
            </h3>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Habla directamente con uno de nuestros agentes en tiempo real.
            </p>

            <button className="w-full py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition">
              Iniciar chat
            </button>
          </div>

          {/* Email */}
          <div className="group bg-white dark:bg-[#141414] p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-transparent hover:border-green-500">
            
            <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-green-100 dark:bg-green-900 mb-6 group-hover:scale-110 transition">
              <Mail className="text-green-600 dark:text-green-400" size={28} />
            </div>

            <h3 className="text-xl font-semibold mb-2">
              Enviar correo
            </h3>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Escríbenos y te responderemos lo más pronto posible.
            </p>

            <button className="w-full py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition">
              Enviar email
            </button>
          </div>

          {/* Teléfono */}
          <div className="group bg-white dark:bg-[#141414] p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-transparent hover:border-purple-500">
            
            <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900 mb-6 group-hover:scale-110 transition">
              <Phone className="text-purple-600 dark:text-purple-400" size={28} />
            </div>

            <h3 className="text-xl font-semibold mb-2">
              Llamar
            </h3>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Contáctanos por teléfono para atención inmediata.
            </p>

            <button className="w-full py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition">
              Ver número
            </button>
          </div>

        </div>

        {/* Info extra */}
        <div className="text-center mt-16 text-sm text-gray-700 dark:text-gray-300">
          Horario de atención: Lunes a Viernes · 8:00 AM – 6:00 PM
        </div>

      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}