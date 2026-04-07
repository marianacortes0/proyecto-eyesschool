"use client";

import { useState } from "react";
import LegalModal from "../ui/LegalModal";

export default function Footer() {
  const [openPolicy, setOpenPolicy] = useState(false);
  const [selectedTab, setSelectedTab] = useState<"privacy" | "terms">("privacy");

  return (
    <>
      <footer className="mt-20 border-t bg-white/80 dark:bg-[#141414] backdrop-blur-md transition-colors duration-500">
        
        <div className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-10 text-gray-700 dark:text-gray-300">
          
          {/* Marca */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-blue-600 text-white shadow">
                👁️
              </div>
              <span className="font-bold text-lg text-gray-800 dark:text-white">
                EyeSchool
              </span>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400">
              Plataforma de gestión escolar diseñada para simplificar procesos académicos
              y mejorar la experiencia educativa.
            </p>
          </div>

          {/* Navegación */}
          <div>
            <h4 className="font-semibold mb-4 text-gray-800 dark:text-white">
              Navegación
            </h4>

            <ul className="space-y-2 text-sm">
              <li>
                <a href="/" className="hover:text-black dark:hover:text-white transition">
                  Inicio
                </a>
              </li>
              <li>
                <a href="/home/nosotros" className="hover:text-black dark:hover:text-white transition">
                  Nosotros
                </a>
              </li>
              <li>
                <a href="/home/beneficios" className="hover:text-black dark:hover:text-white transition">
                  Beneficios
                </a>
              </li>
              <li>
                <a href="/login" className="hover:text-black dark:hover:text-white transition">
                  Iniciar sesión
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4 text-gray-800 dark:text-white">
              Legal
            </h4>

            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => {
                    setSelectedTab("privacy");
                    setOpenPolicy(true);
                  }}
                  className="hover:text-black dark:hover:text-white transition"
                >
                  Política de privacidad
                </button>
              </li>

              <li>
                <button
                  onClick={() => {
                    setSelectedTab("terms");
                    setOpenPolicy(true);
                  }}
                  className="hover:text-black dark:hover:text-white transition"
                >
                  Términos y condiciones
                </button>
              </li>

              <li>
                <a href="/home/support" className="hover:text-black dark:hover:text-white transition">
                  Soporte
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Línea inferior */}
        <div className="border-t border-gray-200 dark:border-gray-700 text-center py-4 text-sm text-gray-500 dark:text-gray-400 transition-colors">
          © {new Date().getFullYear()} EyeSchool. Todos los derechos reservados.
        </div>

      </footer>

      {/* 🔥 MODAL NUEVO */}
      <LegalModal
        isOpen={openPolicy}
        onClose={() => setOpenPolicy(false)}
        initialTab={selectedTab}
      />
    </>
  );
}