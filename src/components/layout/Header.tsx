"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const saved = localStorage.getItem("theme");

    if (saved === "dark") {
      document.documentElement.classList.add("dark");
      setDark(true);
    } else {
      document.documentElement.classList.remove("dark");
      setDark(false);
    }
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;

    if (html.classList.contains("dark")) {
      html.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setDark(false);
    } else {
      html.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setDark(true);
    }
  };

  // 🔥 evitar hydration mismatch
  if (!mounted) return null;

  return (
    <header className="w-full border-b bg-white/80 dark:bg-[#141414] backdrop-blur sticky top-0 z-50 transition-colors duration-500">
      
      {/* Barra superior */}
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-600 text-white shadow flex items-center justify-center">
            👁️
          </div>
          <span className="font-bold text-xl tracking-tight text-gray-800 dark:text-white">
            Eyes School
          </span>
        </Link>

        {/* Botón menú */}
        <button
          onClick={() => setOpen(!open)}
          className="text-2xl text-gray-700 dark:text-gray-300 hover:scale-110 transition"
        >
          {open ? "✖" : "☰"}
        </button>
      </div>

      {/* Menú */}
      <div
        className={`absolute top-full left-0 w-full transition-all duration-300 ease-in-out ${
          open ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
      >
        <div className="mx-auto max-w-4xl mt-2 bg-white/90 dark:bg-[#141414] backdrop-blur-md shadow-xl rounded-2xl border border-white/20 dark:border-white/10 p-6">
          
          <nav className="flex flex-col items-center gap-4 text-gray-700 dark:text-gray-300 text-lg">

            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="hover:text-black dark:hover:text-white transition"
            >
              Inicio
            </Link>

            <a
              href="/home/nosotros"
              onClick={() => setOpen(false)}
              className="hover:text-black dark:hover:text-white transition"
            >
              Nosotros
            </a>

            <a
              href="/home/beneficios"
              onClick={() => setOpen(false)}
              className="hover:text-black dark:hover:text-white transition"
            >
              Beneficios
            </a>

            {/* Divider */}
            <div className="w-full border-t border-gray-200 dark:border-gray-700 my-2"></div>

            {/* 🌙 Toggle Dark Mode */}
            <button
              onClick={toggleTheme}
              className="flex items-center justify-between w-full px-4 py-2 rounded-xl 
              bg-gray-100 dark:bg-[#1f1f1f] 
              hover:scale-[1.02] transition"
            >
              <span>
                {dark ? "☀️ Modo claro" : "🌙 Modo oscuro"}
              </span>

              <div
                className={`w-10 h-5 flex items-center rounded-full p-1 transition ${
                  dark ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
                    dark ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </div>
            </button>

            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="px-5 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition"
            >
              Iniciar sesión
            </Link>

          </nav>
        </div>
      </div>

    </header>
  );
}