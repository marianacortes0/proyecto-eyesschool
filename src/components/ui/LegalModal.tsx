"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

// 👇 IMPORTAMOS LOS CONTENIDOS
import PrivacyContent from "@/components/legal/PrivacyContent";
import TermsContent from "@/components/legal/TermsContent";

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "privacy" | "terms"; // 🔥 NUEVO
}

export default function LegalModal({
  isOpen,
  onClose,
  initialTab = "privacy",
}: LegalModalProps) {
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<"privacy" | "terms">(initialTab);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 🔥 Cada vez que abres el modal, respeta el tab inicial
  useEffect(() => {
    if (isOpen) {
      setTab(initialTab);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen, initialTab]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      
      {/* Fondo */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 bg-white dark:bg-[#141414] rounded-2xl shadow-2xl w-full max-w-3xl mx-4 p-6">
        
        {/* Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black dark:hover:text-white text-xl"
        >
          ✖
        </button>

        {/* Tabs */}
        <div className="flex gap-6 mb-6 border-b pb-2">
          <button
            onClick={() => setTab("privacy")}
            className={`pb-2 transition ${
              tab === "privacy"
                ? "border-b-2 border-blue-600 font-semibold text-blue-600"
                : "opacity-60 hover:opacity-100"
            }`}
          >
            Política de Privacidad
          </button>

          <button
            onClick={() => setTab("terms")}
            className={`pb-2 transition ${
              tab === "terms"
                ? "border-b-2 border-blue-600 font-semibold text-blue-600"
                : "opacity-60 hover:opacity-100"
            }`}
          >
            Términos y Condiciones
          </button>
        </div>

        {/* CONTENIDO LIMPIO 🔥 */}
        <div className="max-h-[70vh] overflow-y-auto text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          {tab === "privacy" && <PrivacyContent />}
          {tab === "terms" && <TermsContent />}
        </div>

      </div>
    </div>,
    document.body
  );
}