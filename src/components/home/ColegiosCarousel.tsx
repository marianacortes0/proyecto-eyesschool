"use client";

import { useRef, useEffect } from "react";

export default function ColegiosCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);

  // 🔥 Centrar al cargar
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const center = (el.scrollWidth - el.clientWidth) / 2;
    el.scrollLeft = center;
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;

    const amount = 300;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

 return (
  <section className="py-20 px-6">
    <div className="max-w-6xl mx-auto">

      {/* Título */}
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 text-gray-800 dark:text-white">
        Colegios que confían en nosotros
      </h2>

      {/* CONTENEDOR DEL CARRUSEL */}
      <div className="relative">

        {/* Flecha izquierda */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-white dark:bg-[#141414] shadow p-3 rounded-full z-10 hover:scale-110 transition"
        >
          ◀
        </button>

        {/* Flecha derecha */}
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-white dark:bg-[#141414] shadow p-3 rounded-full z-10 hover:scale-110 transition"
        >
          ▶
        </button>

        {/* Carrusel */}
        <div
  ref={scrollRef}
  className="flex gap-6 overflow-x-auto scroll-smooth px-10"
  style={{ scrollbarWidth: "none" }}
>
          {[
            "colegio1",
            "colegio2",
            "colegio3",
            "colegio4",
            "colegio5",
            "colegio6",
            "colegio7",
            "colegio8",
          ].map((logo, i) => (
            <div
              key={i}
              className="min-w-[180px] h-[120px] bg-white/80 dark:bg-[#141414]/80 backdrop-blur rounded-2xl shadow flex items-center justify-center p-4"
            >
              <img
                src={`/logos/${logo}.png`}
                alt={logo}
                className="max-h-full max-w-full object-contain grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition"
              />
            </div>
          ))}
        </div>

      </div>
    </div>
  </section>
);
}