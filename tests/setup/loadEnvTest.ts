import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { config } from 'dotenv'

// Carga `.env.test.local` (no versionado) para las pruebas de integración.
const file = resolve(process.cwd(), '.env.test.local')
if (existsSync(file)) config({ path: file, quiet: true })

// Mismos alias que `playwright.config.ts`: la plantilla distingue al padre con un
// hijo del que tiene dos, y las pruebas de contrato piden un solo `E2E_PADRE_EMAIL`.
// Sin esto el correo llegaba vacío y el login respondía 422 en vez de 200.
process.env.E2E_PADRE_EMAIL ??= process.env.E2E_PADRE_DOS_HIJOS_EMAIL
process.env.E2E_PASSWORD ??= process.env.QA_PASSWORD
