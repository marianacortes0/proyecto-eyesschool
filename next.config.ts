import type { NextConfig } from "next";
import { cabecerasDeSeguridad } from "./src/lib/seguridad/cabeceras";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // WC-06 · ZAP: no anunciar «X-Powered-By: Next.js».
  poweredByHeader: false,
  // Fija la raíz del workspace a esta carpeta. Sin esto, Next detecta un
  // package-lock.json suelto en C:\Users\maria y toma TODO el directorio de
  // usuario como raíz, vigilando miles de archivos → dev/HMR lentísimos.
  turbopack: {
    root: __dirname,
  },
  // WC-06 · cabeceras de seguridad en todas las respuestas (src/lib/seguridad/cabeceras.ts).
  async headers() {
    return [{ source: "/:path*", headers: cabecerasDeSeguridad() }];
  },
};

export default nextConfig;
