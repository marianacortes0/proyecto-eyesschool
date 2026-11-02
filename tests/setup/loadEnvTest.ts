import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { config } from 'dotenv'

// Carga `.env.test.local` (no versionado) para las pruebas de integración.
const file = resolve(process.cwd(), '.env.test.local')
if (existsSync(file)) config({ path: file, quiet: true })
