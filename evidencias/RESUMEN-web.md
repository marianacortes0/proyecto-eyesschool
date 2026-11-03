# Resumen de pruebas · Frontend web Eyes School

| | |
|---|---|
| Rama | `feat/web-calidad-pruebas` (PR #34) |
| Commit | ver `evidencias/commit.txt` |
| Fecha | 03/11/2026 |
| Web de QA | `https://deploy-preview-34--qaeyesschool.netlify.app` (deploy preview del PR #34) |
| API de QA | `apieyeschool-q-g4hfgrgvepbecacc.chilecentral-01.azurewebsites.net/api/v1` |

Todas las cifras salen de las salidas guardadas en `evidencias/`. Ninguna evidencia contiene contraseñas, tokens ni cookies (revisado antes de cada commit).

## Por nivel

| # | Nivel | Total | Pasan | Fallan | Bloqueadas | Omitidas | Evidencia |
|---|---|---|---|---|---|---|---|
| 1 | Tipos (`tsc --noEmit`) | — | **0 errores** | 0 | — | — | `PR-04/web/U3_tsc.txt` |
| 2 | Lint (`eslint --max-warnings=0`) | 193 archivos | **0 errores, 0 advertencias** | 0 | — | — | `PR-04/web/U3_eslint.json` |
| 3 | Unitarias y de componentes | **274** en 32 archivos | 274 | 0 | 0 | 0 | `PR-04/web/U3_unitarias.xml` |
| 4 | Cobertura | ver abajo | cumple | — | — | — | `PR-04/web/U3_cobertura.txt`, `U3_cobertura-summary.json` |
| 5 | Trazabilidad | 283 mapeadas | 126 UT · 136 extra · 21 IT | — | — | — | `docs/trazabilidad-ut-web.md` |
| 6 | Integración / contrato contra QA | **9 ejecutadas** (ninguna omitida) | 1 | 0 | **8** | 0 | `PR-05/web/I2_integracion.xml` |
| 7 | E2E (humo, Chromium) | 8 ejecutadas de 48 | 0 | 0 | **8** | 40 sin correr | `PR-06/web/E1_humo-login.xml` |
| 8 | Build de producción | — | **compila** | — | — | — | `PR-04/web/U3_build.txt` |
| 9 | Dependencias (`npm audit --omit=dev`) | — | **0 vulnerabilidades** | — | — | — | `PR-03/web/npm-audit.txt` |
| 10 | Secretos (gitleaks, 75 commits) | 4 hallazgos | — | — | — | — | `PR-03/web/gitleaks.json` |
| 11 | Pruebas manuales (Brave, accesibilidad, responsive) | 24 casos | — | — | — | **pendientes** | `docs/pruebas-manuales-pr06-web.md` |

## Cobertura (umbrales de `vitest.config.mts`, sin tocar)

| Área | Líneas | Umbral | Antes del 03/11 |
|---|---|---|---|
| `src/lib` | **87,8 %** (122/139) | 80 % ✔ | 85,5 % |
| `src/services` | **68,8 %** (609/885) | 60 % ✔ | 68,8 % |
| `src/hooks` | **32,6 %** (298/915) | sin umbral (D-WEB-05) | 0,4 % |
| Total de líneas | **53,1 %** (1029/1939) | — | 37,5 % |

Lo que subió viene de las pruebas nuevas de los arreglos de SonarQube: `tests/hooks/cargaInicial.test.tsx` (15), `tests/apiBase.test.ts` (12) y `tests/components/FallidosMasivo.test.tsx` (5). Ver D-WEB-13 y D-WEB-14 en `docs/decisiones-qa.md`.

## Por qué hay 16 casos bloqueados

**DEF-WEB-01 (backend, severidad alta): la API de QA no puede consultar su base de datos.** `POST /auth/login` responde 500 con cualquier cuenta, y también con un correo inexistente (debería ser 401); un cuerpo inválido sí responde 422, así que la aplicación está sana y lo que falla es la base. Detalle y pasos en `docs/defectos/DEF-WEB-01.md`, códigos HTTP en `PR-05/web/I1_preflight-qa.txt`.

- **Nivel 6:** los 9 casos se **ejecutaron** (ya no se omiten: `.env.test.local` está completo). Las 8 fallas son todas «Login de *rol* falló: HTTP 500». El caso que pasa es «401: sin token», que no necesita base.
- **Nivel 7:** el humo (`login-roles`, Chromium, 8 casos) confirma que el deploy preview, el modal de inicio de sesión y los selectores funcionan: el navegador llena el formulario y la web se queda en `/?login=1` porque la API devuelve 500. No se corrieron los 48 casos en Chromium y Firefox porque fallarían todos por la misma causa y `registro-masivo` y `registro-padre` necesitan escribir en la base.
- **Bloqueados por el backend, no por el frontend.** No se cambió ninguna prueba ni ningún comportamiento para ocultarlo.

## Lo que ya está verificado del entorno

| Comprobación | Resultado |
|---|---|
| Web del deploy preview | 200 (inicio y páginas públicas) |
| `/login` del preview | 404, y es correcto: el inicio de sesión es un modal sobre `/` |
| Autenticación de la API | 401 sin token en `/auth/me`, `/usuarios`, `/materias` (antes todo daba 500) |
| Validación de la API | 422 con cuerpo inválido |
| Contrato de rutas web ↔ API | **43 de 44** (`PR-05/web/I1_contrato_rutas.json`); falta `/padres/me/hijos` (BE-07) |
| Navegadores de Playwright | Chromium y Firefox instalados |
| `.env.test.local` | Completo e ignorado por git; solo falta `E2E_ESTUDIANTE_VINCULADO_ID`, que lo imprime `npm run qa:datos` (necesita la base) |

## Para cerrar

1. Backend: arreglar DEF-WEB-01 (Azure → `DATABASE_URL` de `apieyeschool-q`).
2. Con el login en 200: `npm run qa:datos`, repetir el nivel 6 y correr el nivel 7 completo en Chromium y Firefox, y rehacer este resumen.
3. SonarQube: el Quality Gate se evalúa en el CI del PR #34 con los arreglos de D-WEB-14 y las exclusiones de cobertura de D-WEB-13. La captura va a `PR-03/web/sonar-quality-gate.png` y el resumen a `PR-03/web/sonar-resumen.md`.
4. Nivel 11: pruebas manuales sobre la URL de QA.
