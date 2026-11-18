import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

// PR-05: pruebas de contrato web ↔ API real de QA. Aparte de `npm test` para que
// la suite normal nunca llame a la red. Las variables (QA_API_URL, correos y
// QA_PASSWORD) vienen de `.env.test.local`, fuera del repositorio.
export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'node',
    include: ['tests/integration/**/*.int.test.ts'],
    testTimeout: 20_000,
    setupFiles: ['tests/setup/nextMocks.ts', 'tests/setup/loadEnvTest.ts'],
  },
})
