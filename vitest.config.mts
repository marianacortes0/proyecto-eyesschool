import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

// WEB-INF-1: `*.test.ts` corre en Node; `*.test.tsx` (hooks y componentes) en jsdom.
// Las pruebas contra la API real (`*.int.test.ts`) tienen su propia configuración
// (vitest.integration.config.mts) y no se ejecutan con `npm test`.
export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    setupFiles: ['tests/setup/nextMocks.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'lcov', 'html'],
      // Se mide TODO `src`. Antes se medían solo lib, services y hooks, y el
      // informe lcov no incluía archivos que sí tienen pruebas (el proxy,
      // PasswordChecklist, SelectorHijo, RegistroMasivo…): SonarQube los veía
      // con 0 % y hundía la cobertura del código nuevo. Qué vistas quedan fuera
      // del cálculo de Sonar se decide en `sonar-project.properties` (D-WEB-13).
      include: ['src/**'],
      // D-WEB-05: la meta se mide sobre la lógica (lib y services). Los hooks y las
      // pantallas se cubren con Playwright (PR-06), por eso no llevan umbral.
      thresholds: {
        'src/lib/**': { lines: 80 },
        'src/services/**': { lines: 60 },
      },
    },
    projects: [
      {
        extends: true,
        test: {
          name: 'unitarias',
          environment: 'node',
          include: ['tests/**/*.test.ts'],
          exclude: ['tests/integration/**'],
        },
      },
      {
        extends: true,
        test: {
          name: 'componentes',
          environment: 'jsdom',
          setupFiles: ['tests/setup/nextMocks.ts', 'tests/setup/rtl.ts'],
          include: ['tests/**/*.test.tsx'],
        },
      },
    ],
  },
})
