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
    // WEB-INF-2: la cobertura mide solo la lógica; las vistas se cubren con E2E.
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'lcov', 'html'],
      include: ['src/lib/**', 'src/services/**', 'src/hooks/**'],
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
