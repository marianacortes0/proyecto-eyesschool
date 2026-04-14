"use client";

import { useState, useEffect } from "react";
import { MessageCircle, Mail, Phone } from "lucide-react";
import { useRouter } from "next/navigation";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function SupportPage() {
  const router = useRouter();

  const [showPhone, setShowPhone] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    lastName: "",
    id: "",
    email: "",
    type: "",
    message: "",
  });

  useEffect(() => {
    if (showPhone || showEmail) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showPhone, showEmail]);

  const handleSendEmail = async () => {
    if (
      !form.name ||
      !form.lastName ||
      !form.id ||
      !form.email ||
      !form.type ||
      !form.message
    ) {
      alert("Todos los campos son obligatorios");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.success) {
        alert("Correo enviado correctamente ✅");
        setShowEmail(false);
        setForm({
          name: "",
          lastName: "",
          id: "",
          email: "",
          type: "",
          message: "",
        });
      } else {
        alert("Error al enviar correo ❌");
      }
    } catch (error) {
      alert("Error de conexión ❌");
    } finally {
      setLoading(false);
    }
  };

  const handleChat = () => {
    alert("Tienes que iniciar sesión para esta acción");
    router.push("/login");
  };

  return (
    <div className="relative flex flex-col min-h-screen text-gray-800 dark:text-gray-200 transition-colors duration-500">
      
      {/* 🌄 IMAGEN FONDO CLARO */}
<div className="absolute inset-0 -z-10 bg-[url('/images/pattern.png')] bg-repeat dark:hidden" />      
      {/* 🌙 IMAGEN FONDO OSCURO */}
        <div className="absolute inset-0 -z-10 bg-[url('/images/pattern-dark.png')] bg-repeat hidden dark:block" />


      <Header />

      <main className="flex-1 flex flex-col justify-center px-6 py-20">
        
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">
            Centro de Soporte
          </h1>
          <p className="text-gray-700 dark:text-gray-300">
            Estamos aquí para ayudarte. Elige la opción que prefieras para contactarnos.
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
          
          {/* CHAT */}
          <div className="group bg-white dark:bg-[#141414] p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border hover:border-blue-500">
            <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900 mb-6">
              <MessageCircle className="text-blue-600 dark:text-blue-400" size={28} />
            </div>

            <h3 className="text-xl font-semibold mb-2">Chat en vivo</h3>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Habla directamente con uno de nuestros agentes en tiempo real.
            </p>

            <button
              onClick={handleChat}
              className="w-full py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              Iniciar chat
            </button>
          </div>

          {/* EMAIL */}
          <div className="group bg-white dark:bg-[#141414] p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border hover:border-green-500">
            <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-green-100 dark:bg-green-900 mb-6">
              <Mail className="text-green-600 dark:text-green-400" size={28} />
            </div>

            <h3 className="text-xl font-semibold mb-2">Enviar correo</h3>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Escríbenos y te responderemos lo más pronto posible.
            </p>

            <button
              onClick={() => setShowEmail(true)}
              className="w-full py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
            >
              Enviar email
            </button>
          </div>

          {/* TELÉFONO */}
          <div className="group bg-white dark:bg-[#141414] p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border hover:border-purple-500">
            <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900 mb-6">
              <Phone className="text-purple-600 dark:text-purple-400" size={28} />
            </div>

            <h3 className="text-xl font-semibold mb-2">Llamar</h3>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Contáctanos por teléfono para atención inmediata.
            </p>

            <button
              onClick={() => setShowPhone(true)}
              className="w-full py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition"
            >
              Ver número
            </button>
          </div>
        </div>

        <div className="text-center mt-16 text-sm text-gray-700 dark:text-gray-300">
          Horario de atención: Lunes a Viernes · 8:00 AM – 6:00 PM
        </div>
      </main>

      <Footer />
     {/* MODAL TELÉFONO */}
      {showPhone && (
        <div className="fixed inset-0 z-50 flex justify-center items-start py-20 px-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative bg-white dark:bg-[#141414] text-gray-800 dark:text-white p-8 rounded-2xl shadow-xl text-center max-w-sm w-full">
            <h2 className="text-2xl font-bold mb-4">Llámanos</h2>
            <p className="text-lg font-semibold mb-2">321 4142140</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Atención a nivel nacional
            </p>
            <button
              onClick={() => setShowPhone(false)}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* MODAL EMAIL */}
      {showEmail && (
        <div className="fixed inset-0 z-50 flex justify-center items-start py-20 px-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative bg-white dark:bg-[#141414] text-gray-800 dark:text-white p-8 rounded-2xl shadow-xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6">Enviar solicitud</h2>

            <input type="text" placeholder="Nombre" className="w-full mb-3 p-2 rounded border bg-white dark:bg-[#1f1f1f] dark:border-gray-700"
              onChange={(e) => setForm({ ...form, name: e.target.value })} />

            <input type="text" placeholder="Apellidos" className="w-full mb-3 p-2 rounded border bg-white dark:bg-[#1f1f1f] dark:border-gray-700"
              onChange={(e) => setForm({ ...form, lastName: e.target.value })} />

            <input type="text" placeholder="Cédula" className="w-full mb-3 p-2 rounded border bg-white dark:bg-[#1f1f1f] dark:border-gray-700"
              onChange={(e) => setForm({ ...form, id: e.target.value })} />

            <input type="email" placeholder="Correo" className="w-full mb-3 p-2 rounded border bg-white dark:bg-[#1f1f1f] dark:border-gray-700"
              onChange={(e) => setForm({ ...form, email: e.target.value })} />

            <select className="w-full mb-3 p-2 rounded border bg-white dark:bg-[#1f1f1f] dark:text-white dark:border-gray-700"
              onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="">Tipo de ayuda</option>
              <option>Problemas técnicos de la página</option>
              <option>Asesoría para convenio</option>
              <option>Problemas al ingresar a su cuenta</option>
              <option>Otro</option>
            </select>

            <textarea placeholder="Mensaje" className="w-full mb-4 p-2 rounded border bg-white dark:bg-[#1f1f1f] dark:border-gray-700"
              rows={4}
              onChange={(e) => setForm({ ...form, message: e.target.value })} />

            <div className="flex gap-3">
              <button onClick={handleSendEmail} disabled={loading}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg disabled:opacity-50">
                {loading ? "Enviando..." : "Enviar"}
              </button>

              <button onClick={() => setShowEmail(false)}
                className="flex-1 bg-gray-400 text-white py-2 rounded-lg">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}