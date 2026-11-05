import { defineConfig, devices } from '@playwright/test'

// WEB-INF-3 · E2E contra QA. Las URL y los usuarios llegan por variables de
// entorno (nunca en el código): E2E_BASE_URL, E2E_PASSWORD y los correos por rol
// (E2E_ADMIN_EMAIL, E2E_DOCENTE_EMAIL, E2E_ESTUDIANTE_EMAIL, E2E_PADRE_UN_HIJO_EMAIL,
// E2E_PADRE_DOS_HIJOS_EMAIL). Ver .env.test.example.
// Brave se prueba a mano (PR-06); aquí corren Chromium y Firefox.
// Secretos y datos de QA: .env.test.local (fuera del repositorio; plantilla en .env.test.example).
try {
  process.loadEnvFile('.env.test.local')
} catch {
  // Sin archivo, las variables deben venir del entorno (CI).
}
process.env.E2E_PASSWORD ??= process.env.QA_PASSWORD
process.env.E2E_PADRE_EMAIL ??= process.env.E2E_PADRE_DOS_HIJOS_EMAIL

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  // Un solo trabajador: con Chromium y Firefox a la vez, la portada (vídeos,
  // reproductor de YouTube y la fuente de iconos de Google) agota el ancho de
  // banda y las navegaciones se pasan de tiempo. En serie son estables.
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  // Evidencias del PR-06 en el repositorio (sin tokens: las trazas se descartan si pasan).
  outputDir: 'test-results',
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'evidencias/PR-06/web/reporte-html' }],
    ['junit', { outputFile: 'evidencias/PR-06/web/e2e.xml' }],
  ],
  use: {
    baseURL: process.env.E2E_BASE_URL,
    viewport: { width: 1920, height: 1080 },
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1920, height: 1080 } } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'], viewport: { width: 1920, height: 1080 } } },
  ],
})
