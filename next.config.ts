import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Fija la raíz del workspace a esta carpeta. Sin esto, Next detecta un
  // package-lock.json suelto en C:\Users\maria y toma TODO el directorio de
  // usuario como raíz, vigilando miles de archivos → dev/HMR lentísimos.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
