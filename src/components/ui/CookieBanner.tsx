"use client";

import { useEffect, useState } from "react";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie_consent", "accepted");
    setVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem("cookie_consent", "rejected");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[9999] flex justify-center px-4 pb-6 pointer-events-none">
      
      {/* Contenedor */}
      <div className="pointer-events-auto w-full max-w-2xl bg-white dark:bg-[#141414] text-gray-800 dark:text-gray-200 backdrop-blur-md shadow-2xl rounded-2xl p-5 border border-gray-200 dark:border-gray-700 animate-slideUp">
        
        <p className="text-sm mb-4 text-center">
          Usamos cookies para mejorar tu experiencia. Puedes aceptar o rechazar su uso.
        </p>

        <div className="flex justify-center gap-3">
          <button
            onClick={handleReject}
            className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1f1f1f] transition"
          >
            Rechazar
          </button>

          <button
            onClick={handleAccept}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}