# Informe de estado de pruebas · Frontend web Eyes School

> **Para quien rellena los informes formales PR-03 a PR-07 (parte web).** Cada dato lleva entre corchetes el archivo o el comando del que sale. Donde no hay dato dice **NO DISPONIBLE** con el motivo. Ninguna cifra está estimada ni redondeada por gusto: si una medición no existe, no se inventa.
>
> **Vocabulario usado en todo el informe:** **APROBADO** (pasó) · **FALLA** (defecto del producto) · **BLOQUEADO** (depende de otra cosa: BE-07, BE-08, entorno, datos o configuración) · **NO EJECUTADO** (no se corrió).
>
> Las rutas de evidencia son relativas a la raíz del repositorio. Las de las secciones 3 a 5 se abrevian: `U3_*` = `evidencias/PR-04/web/`, `I1_*`/`I2_*` = `evidencias/PR-05/web/`, `E0_*`/`E1_*` = `evidencias/PR-06/web/`.

---

## 1. IDENTIFICACIÓN

| Dato | Valor | Fuente |
|---|---|---|
| Repositorio | `marianacortes0/proyecto-eyesschool` | [`git remote`] |
| Rama | `feat/web-calidad-pruebas` | [`git branch --show-current`] |
| Commit al cierre de este informe (HEAD) | `77d5629` | [`git rev-parse --short HEAD`] |
| Commit de las evidencias | **`77d5629`: el mismo que HEAD** (corrida del 05/11/2026) | [`evidencias/commit.txt`] |
| Pull request | **#34**, `feat/web-calidad-pruebas` → `develop`, abierto, no fusionado | [API de GitHub `/pulls/34`] |
| Commits de la rama por delante de `develop` | **31** | [`git rev-list --count origin/develop..HEAD`] |
| Árbol de trabajo limpio | **No.** Sigue habiendo 1 archivo modificado sin versionar: `.vscode/settings.json` (agrega `"python.terminal.useEnvFile": true`). No afecta a código ni a pruebas | [`git status --porcelain`, `git diff .vscode/settings.json`] |

### 1.1 ¿Todas las evidencias salen del mismo commit?

**Sí.** Todos los niveles automatizados se volvieron a correr el **05/11/2026 sobre `77d5629`**, que es HEAD. Las evidencias de esa corrida llevan el prefijo `U4_` (niveles locales), `I2_` (integración) y `E2_` (E2E del guardia de rutas) [`evidencias/commit.txt`].

Las evidencias `U3_*` de la corrida del 03/11 se conservan como histórico; las cifras no cambiaron entre las dos corridas.

### 1.2 Fecha y hora de cada corrida

Las evidencias vigentes son las del **05/11/2026**, todas sobre el commit `77d5629`. Las duraciones se midieron con reloj (incluyen el arranque de la herramienta) [`evidencias/PR-04/web/U4_duraciones.txt`].

| Corrida | Fecha y hora (UTC) | Duración | Fuente |
|---|---|---|---|
| Tipos (`tsc --noEmit`) | 05/11/2026 ~20:45 | **7,4 s** | [`U4_duraciones.txt`, `U4_tsc.txt`] |
| Lint (ESLint) | 05/11/2026 ~20:45 | **25,3 s** | [`U4_duraciones.txt`, `U4_eslint.json`] |
| Unitarias y de componentes | 05/11/2026 ~20:46 | **23,0 s** (11,6 s de pruebas) | [`U4_duraciones.txt`, `U4_unitarias.xml`] |
| Cobertura (`test:cov`) | 05/11/2026 ~20:46 | **23,8 s** | [`U4_duraciones.txt`, `U4_cobertura.txt`] |
| Trazabilidad (`npm run trazabilidad`) | 05/11/2026 ~20:48 | **126,2 s** | [`U4_duraciones.txt`] |
| Build de producción | 05/11/2026 ~20:50 | **45,9 s** | [`U4_duraciones.txt`, `U4_build.txt`] |
| Auditoría de dependencias | 05/11/2026 ~20:51 | **4,7 s** | [`U4_duraciones.txt`, `npm-audit.txt`] |
| Integración / contrato (I2) | 05/11/2026 **20:52** | **2,07 s** | [atributo `time` de `I2_integracion.xml`] |
| E2E del guardia de rutas (E2) | 05/11/2026 **20:50** | **102,7 s** (49,6 s Chromium + 53,1 s Firefox) | [`E2_guardia-rutas.xml`] |
| E2E de humo de inicio de sesión (E1) | 03/11/2026 15:27 | 257,1 s | [`E1_humo-login.xml`] · histórico, no se repitió |
| gitleaks | 05/11/2026 ~20:57 | NO DISPONIBLE (lo corre el binario, no se cronometró) | [`gitleaks.json`] |
| SonarQube Cloud (PR #34) | 03/11/2026 **15:55:54** | — | [check-run de `d251ae2`] · **no se ha vuelto a analizar** (ver 7.1) |
| Preflight del entorno | 05/11/2026 **20:57** | — | [`I1_preflight-qa.txt`] |

### 1.3 Versiones

| Herramienta | Versión | Fuente |
|---|---|---|
| Node.js (local) | **24.21.0** | [`node -v`] |
| Node.js (CI) | 24.x | [`.github/workflows/ci.yml`] |
| Node.js (Netlify) | 20 | [`netlify.toml`] |
| npm | 11.19.0 | [`npm -v`] |
| Next.js | **16.4.3** | [`package-lock.json`] |
| React / React DOM | 19.2.4 | [`package-lock.json`] |
| TypeScript | 5.9.3 | [`npx tsc --version`] |
| Vitest | **4.1.12** | [`package-lock.json`] |
| `@vitest/coverage-v8` | 4.1.12 | [`package-lock.json`] |
| ESLint | 9.39.4 | [`package-lock.json`] |
| jsdom | 30.1.3 | [`package-lock.json`] |
| Playwright | **1.64.1** | [`npx playwright --version`] |

### 1.4 Navegadores

| Navegador | Versión | Usado en |
|---|---|---|
| Chromium (Chrome for Testing) | **156.0.8078.4** (build Playwright v1248) | Humo de inicio de sesión (E1, 03/11) y guardia de rutas (E2, 05/11) |
| Firefox | **157.0** (build Playwright v1555) | Guardia de rutas (E2, 05/11) |

Fuente de las dos filas: [`npx playwright install --dry-run chromium firefox`].

### 1.5 URL del entorno (sin credenciales)

| Pieza | URL | Fuente |
|---|---|---|
| Web de QA | `https://deploy-preview-34--qaeyesschool.netlify.app` (deploy preview del PR #34) | [`.env.test.example`, `playwright.config.ts`] |
| Web de QA del contexto `develop` | `https://qaeyesschool.netlify.app` — todavía sin publicar | [`.env.test.example`] |
| API de QA | `https://apieyeschool-q-g4hfgrgvepbecacc.chilecentral-01.azurewebsites.net/api/v1` | [`.env.test.example`, `I1_preflight-qa.txt`] |
| Web de producción (no se tocó) | `https://proyecto-eyesschool.vercel.app` | [`docs/acciones-externas.md`] |

### 1.6 Quién ejecutó qué

| Parte | Quién |
|---|---|
| Niveles automatizados 1 a 10 (tipos, lint, unitarias, componentes, cobertura, trazabilidad, integración, humo E2E, build, auditoría, gitleaks), los arreglos de código, las pruebas nuevas y los documentos | La IA (Claude, en VS Code), en el equipo de Mariana |
| Despliegue del deploy preview en Netlify, `.env.test.local` con `QA_PASSWORD`, configuración de Azure y de la base de QA, importación del proyecto en SonarQube Cloud, pausa de la Web App de QA | Mariana Cortés / equipo, a mano, fuera del repositorio |
| Pruebas manuales del nivel 11 (Lighthouse, axe, ZAP, Brave, cámara, responsive) | **Nadie todavía** (ver sección 14) |
| Revisión y aprobación del PR #34 | **Nadie todavía** (ver sección 13) |

---

## 2. ENTORNO DE QA

### 2.1 Preflight

Tres mediciones, porque el entorno cambió varias veces. La vigente es la **C**.

| Comprobación | Esperado | A · 03/11 15:11 | B · 03/11 22:31 | **C · 05/11 20:57** |
|---|---|---|---|---|
| API `/docs` | 200 | 200 | **403** | **200** |
| API `/openapi.json` | 200 | 200 | 403 | **200** |
| API `/api/v1/cursos` sin token | 401 o 403 | **500** | 403 | **500** |
| API `/api/v1/cursos/` sin token | 401 o 403 | 500 (307 → 500) | 403 | **500** |
| API `/api/v1/auth/me` sin token | 401 | 401 | 403 | **401** |
| API `POST /auth/login` con cuerpo inválido | 422 | 422 | 403 | **422** |
| API `POST /auth/login` admin del seed con su clave | 200 | **500** | 403 | **500** (un intento dio **502**) |
| API `POST /auth/login` con un correo inexistente | 401 | **500** | 403 | no repetido |
| Web `/` del deploy preview | 200 | 200 | 200 | **200** |
| Web `/home/beneficios` | 200 | 200 | — | **200** |
| Web `/usuarios` **sin sesión** (por HTTP) | redirección | — | — | **200** (ver abajo) |
| Web `/login` | 200 | **404** | 404 | no repetido |
| Web `https://qaeyesschool.netlify.app` | 200 | **404** | 404 | **404** |

Fuentes: A y B en el histórico del propio archivo; C en [`evidencias/PR-05/web/I1_preflight-qa.txt`], generado el 05/11 sobre `77d5629`.

**Qué cambió entre B y C:** la Web App de QA, que el 03/11 por la noche estaba pausada a propósito, volvió a estar encendida. **DEF-WEB-01 sigue abierto**: las rutas con datos siguen en 500.

**`/usuarios` sin sesión devuelve 200, y no es un defecto.** En Netlify el guardia (`proxy.ts`) no responde con un 307: la ruta se renderiza y la redirección a `/?login=1` llega por el cliente. Se comprobó de dos formas: observando la navegación en un navegador (la URL acaba en `/?login=1`) y con la prueba E2E del guardia, que **pasa en Chromium y en Firefox** sobre las ocho rutas del panel [`evidencias/PR-06/web/E2_guardia-rutas.xml`]. Lo que sí deja es un aviso de rendimiento: cada redirección tarda varios segundos en vez de ser inmediata.

**`/login` 404 tampoco es defecto:** el inicio de sesión es un modal sobre `/`, no una página propia [`CLAUDE.md`].

### 2.2 ¿Hay base de datos operativa hoy?

**No.** Dos días después sigue sin haberla. El 03/11 la aplicación respondía pero **ninguna consulta a la base funcionaba** (500 incluso en un login con un correo inexistente, que debería ser 401); el 05/11, con la Web App otra vez encendida, el resultado es el mismo: 500 en `/cursos` y en el login, 422 con un cuerpo inválido y 401 sin token. Esto es **DEF-WEB-01** (sección 9) y es la causa de todos los BLOQUEADOS de este informe [`I1_preflight-qa.txt`, `docs/defectos/DEF-WEB-01.md`].

### 2.3 Datos de prueba

| Dato | Valor | Fuente |
|---|---|---|
| Seed cargado en la base de QA | **NO DISPONIBLE.** La planeación de cierre dice que Mariana aplicó `seed_data.sql`, `seed_estudiantes_sinteticos.sql` y `QA_PASSWORD`, pero no se pudo verificar: toda consulta a la base falla y hoy la API está detenida | [`I1_preflight-qa.txt`] |
| Cuántos usuarios hay en QA | **NO DISPONIBLE.** Requiere `GET /usuarios` con token; el login no funciona | — |
| Cuántos estudiantes hay en QA | **NO DISPONIBLE.** Requiere `GET /estudiantes` con token. `npm run qa:datos` existe para obtenerlo y no se pudo correr | [`scripts/qa-datos.mjs`] |
| Cursos esperados del seed | 10 (según la planeación de cierre, sin verificar) | [planeación de cierre, sección 3] |
| Estudiantes sintéticos esperados | `SYN0101` a `SYN0110` en «Sexto A», jornada «Mañana» | [`.env.test.example`] |

**Cuentas del seed usadas en las pruebas** (solo correos; las claves viven únicamente en `.env.test.local`, que no se versiona) [`.env.test.example`]:

| Rol | Correo |
|---|---|
| Administrador | `admin@eyesschool.edu.co` |
| Docente | `carlos.jimenez@eyes.edu.co` |
| Estudiante | `sofia.rodriguez@student.eyes.co` |
| Padre con un hijo | `roberto.diaz@gmail.com` |
| Padre con dos hijos | `rosa.perez@gmail.com` |

Hijos esperados del padre con dos hijos: `Sofía` y `Santiago` (coincidencia por primer nombre) [`.env.test.example`].

### 2.4 Variables del entorno de pruebas

`.env.test.local` existe, está ignorado por git [`git check-ignore -v .env.test.local` → regla `.gitignore:34`] y tiene valor en 12 de sus 17 variables. Quedan vacías: `E2E_ESTUDIANTE_VINCULADO_ID`, `E2E_ESTUDIANTE_VINCULADO_NOMBRE` (las imprime `npm run qa:datos`, que necesita la base), `E2E_SESSION_IDLE_MINUTES`, `E2E_BE07` y `E2E_BE08`. **No se transcribe ningún valor.**

Dos problemas de configuración se corrigieron hoy (sección 9, lista de no-defectos): a `QA_API_URL` le faltaba el `https://` y no existía `E2E_PADRE_EMAIL`.

---

## 3. RESULTADOS POR NIVEL

Una fila por nivel. Los totales de unitarias, componentes, integración y E2E salen de los XML JUnit, no de la memoria.

| Nivel | Herramienta | Total | Aprobadas | Fallan | Bloqueadas | Omitidas | Duración | Evidencia |
|---|---|---|---|---|---|---|---|---|
| Tipos | `tsc --noEmit` (TypeScript 5.9.3) | — | **0 errores** | 0 | 0 | 0 | **7,4 s** | `U4_tsc.txt`, `U4_duraciones.txt` |
| Lint | ESLint 9.39.4, `--max-warnings=0` | 195 archivos analizados | **0 errores y 0 advertencias** | 0 | 0 | 0 | **25,3 s** | `U4_eslint.json` |
| Unitarias | Vitest 4.1.12, proyecto `unitarias` (node, `tests/**/*.test.ts`) | **243** en 25 archivos | **243** | 0 | 0 | 0 | — (incluida abajo) | `U4_unitarias.xml` |
| Componentes | Vitest 4.1.12, proyecto `componentes` (jsdom, `tests/**/*.test.tsx`) | **59** en 9 archivos | **59** | 0 | 0 | 0 | — (incluida abajo) | `U4_unitarias.xml` |
| Unitarias + componentes (total) | Vitest 4.1.12 | **302** en 34 archivos | **302** | 0 | 0 | 0 | **23,0 s** (11,6 s de pruebas) | `U4_unitarias.xml` |
| Cobertura | Vitest + `@vitest/coverage-v8` 4.1.12 | 139 archivos medidos | **cumple los dos umbrales** | 0 | 0 | 0 | **23,8 s** | `U4_cobertura.txt`, `U4_cobertura-summary.json` |
| Trazabilidad | `npm run trazabilidad` | 311 pruebas mapeadas | — | 0 | 0 | 0 | **126,2 s** | `docs/trazabilidad-ut-web.md` |
| Integración / contrato contra QA | Vitest 4.1.12, `vitest.integration.config.mts` | **9** en 1 archivo | **1** | 0 | **8** | **0** | **2,07 s** | `I2_integracion.xml` |
| E2E Chromium | Playwright 1.64.1, Chrome for Testing 156.0.8078.4 | **9** ejecutados de 24 | **1** | 0 | **8** | 0 | 49,6 s (E2) + 257,1 s (E1) | `E2_guardia-rutas.xml`, `E1_humo-login.xml` |
| E2E Firefox | Playwright 1.64.1, Firefox 157.0 | **1** ejecutado de 24 | **1** | 0 | 0 | 23 NO EJECUTADOS | **53,1 s** | `E2_guardia-rutas.xml` |
| Build | `next build` (Next.js 16.4.3) | — | **compila** | 0 | 0 | 0 | **45,9 s** | `U4_build.txt` |
| Auditoría de dependencias | `npm audit --omit=dev --audit-level=high` | — | **0 vulnerabilidades** | 0 | 0 | 0 | **4,7 s** | `evidencias/PR-03/web/npm-audit.txt` |
| Secretos | gitleaks 8.21.2, `--redact` | **81 commits** analizados | — | **4 hallazgos históricos** (0 nuevos) | 0 | 0 | NO DISPONIBLE (no se cronometró) | `evidencias/PR-03/web/gitleaks.json` |
| SonarQube Cloud | `sonarqube-scan-action@v5` en el CI | — | **Quality Gate: Passed** | 0 issues nuevos | 0 | 0 | NO DISPONIBLE | `evidencias/PR-03/web/sonar-resumen.md` |
| Pruebas manuales | Lighthouse, axe DevTools, ZAP, Brave, Chrome móvil | **24 casos** | 0 | 0 | 0 | **24 NO EJECUTADOS** | — | `docs/pruebas-manuales-pr06-web.md` |

**Notas de lectura de la tabla**

- Todos los niveles locales se corrieron el **05/11/2026 sobre `77d5629`** y los siete terminaron con código de salida 0 [`U4_duraciones.txt`].
- **E2E: 1 caso APROBADO en los dos navegadores.** Es «una ruta del panel sin sesión pide iniciar sesión» (guardia de rutas, WEB-01, parte de CP-SIS-004), el único caso de los 24 que no necesita iniciar sesión. Comprueba las ocho rutas del panel [`E2_guardia-rutas.xml`].
- Los 8 casos de integración y los 8 del humo de inicio de sesión figuran como **BLOQUEADOS**, no como fallas: la causa única es DEF-WEB-01. En los XML salen como `failure`/`error` porque ni Vitest ni Playwright tienen un estado «bloqueado» [`I2_integracion.xml`, `E1_humo-login.xml`].
- Ninguna de las 9 pruebas de integración quedó **omitida**: las 9 se ejecutaron contra la API de QA.
- E2E: hay **24 casos por navegador** (48 en total) [`E0_listado-specs.xml`]. En Chromium se ejecutaron 9 (8 del humo + el guardia) y en Firefox 1 (el guardia).
- Las duraciones de los niveles locales se midieron con reloj e incluyen el arranque de la herramienta; las de Vitest y Playwright salen además del atributo `time` de cada XML.

## 4. COBERTURA

### 4.1 Por carpeta

Fuente de toda la tabla: [`evidencias/PR-04/web/U4_cobertura-summary.json`] (corrida del 05/11 sobre `77d5629`; idéntica a la del 03/11), agregando por carpeta. Umbrales: [`vitest.config.mts`].

| Carpeta | Líneas | Ramas | Funciones | Umbral exigido | ¿Cumple? |
|---|---|---|---|---|---|
| `src/lib` | **87,8 %** (122/139) | 81,7 % (116/142) | 82,5 % (33/40) | **80 % de líneas** | **Sí** |
| `src/services` | **73,9 %** (654/885) | 56,8 % (438/771) | 66,0 % (206/312) | **60 % de líneas** | **Sí** |
| `src/hooks` | **32,6 %** (298/915) | 14,2 % (65/457) | 13,8 % (26/189) | sin umbral (D-WEB-05) | — |
| **Total medido (todo `src`)** | **28,1 %** (1385/4922) | 20,3 % (890/4392) | 23,6 % (347/1471) | sin umbral global | — |

Archivos medidos: 139 [`U4_cobertura-summary.json`].

**Aviso importante para el informe formal:** el total de 28,1 % **no es comparable** con el 53,1 % de la medición del 02/11. Hoy se mide **todo `src`** y antes solo `lib`, `services` y `hooks`: cambió el denominador, no la cantidad de pruebas. Si hace falta el número comparable, la lógica (las tres carpetas juntas) da **55,4 %** de líneas (1074/1939) [cálculo sobre `U4_cobertura-summary.json`].

### 4.2 Cobertura en código nuevo según SonarQube

| Medida | Valor | Fuente |
|---|---|---|
| Cobertura del código nuevo | **86,2 %** | [`evidencias/PR-03/web/sonar-resumen.md`, API `/api/measures/component`] |
| Líneas nuevas por cubrir | 368 | ídem |
| Líneas nuevas sin cubrir | 32 | ídem |
| Condición del Quality Gate | ≥ 80 % → **cumple** | [check-run «SonarCloud Code Analysis»] |

### 4.3 Qué queda fuera de la medición, y con qué decisión

**a) `coverage.include` de Vitest** [`vitest.config.mts`]: hoy vale `['src/**']`, es decir **no excluye nada**. Hasta el 03/11 valía `['src/lib/**', 'src/services/**', 'src/hooks/**']`, y eso dejaba fuera del informe `lcov` archivos que sí tienen pruebas, que SonarQube contaba con 0 %. Decisión: **D-WEB-13**.

**b) `sonar.coverage.exclusions`** [`sonar-project.properties`]: saca estos patrones del **cálculo** de cobertura (no del análisis: Sonar les sigue buscando bugs, *smells* y problemas de seguridad). Decisión: **D-WEB-13**, que a su vez aplica el alcance de **D-WEB-05**.

| Patrón excluido del cálculo | Decisión |
|---|---|
| `src/app/**/page.tsx` | D-WEB-13 (vistas → E2E, D-WEB-05) |
| `src/app/**/layout.tsx` | D-WEB-13 |
| `src/app/**/loading.tsx` | D-WEB-13 |
| `src/app/**/error.tsx` | D-WEB-13 |
| `src/app/**/not-found.tsx` | D-WEB-13 |
| `src/components/asistencia/AsistenciaModal.tsx` | D-WEB-13 |
| `src/components/asistencia/AsistenciaTable.tsx` | D-WEB-13 |
| `src/components/auth/Protected.tsx` | D-WEB-13 |
| `src/components/home/**` | D-WEB-13 (páginas informativas, WEB-INF-4) |
| `src/components/layout/**` | D-WEB-13 |
| `src/components/legal/**` | D-WEB-13 |
| `src/components/panel/**` | D-WEB-13 |
| `src/components/qr/QRAdminView.tsx` | D-WEB-13 |
| `src/components/qr/QRCard.tsx` | D-WEB-13 |
| `src/components/qr/QRCodigoModal.tsx` | D-WEB-13 |
| `src/components/qr/QRCodigosTable.tsx` | D-WEB-13 |
| `src/components/qr/QREstudianteView.tsx` | D-WEB-13 |
| `src/components/qr/QRScannerView.tsx` | D-WEB-13 |
| `src/components/ui/**` | D-WEB-13 |
| `src/components/usuarios/**` | D-WEB-13 |
| `src/types/**` | D-WEB-13 (solo tipos) |
| `proxy.ts` | D-WEB-13 |

**No** están excluidos: `src/hooks`, `src/lib`, `src/services`, `src/app/api/**` ni los componentes con lógica y prueba propia (`PasswordChecklist`, `SelectorHijo`, `RegistroMasivo`, `FallidosMasivo`). Por eso la lista va archivo por archivo en vez de `src/components/**` [`sonar-project.properties`, D-WEB-13].

**c) `sonar.exclusions`** (fuera de **todo** el análisis, no solo de la cobertura): `src/app/home/**`, `src/components/home/**`, `.next/**`, `coverage/**`, `e2e/**`, `public/**` [`sonar-project.properties`]. Son páginas informativas y salidas generadas.

---

## 5. DETALLE POR CASO DE PRUEBA

### 5.1 Unitarias y de componentes · 302 casos ejecutados, todos APROBADO

Fuente: `evidencias/PR-04/web/U3_unitarias.xml` (corrida del 03/11/2026 15:46 UTC). Los ID salen de `tests/trazabilidad.json` con la misma regla que usa `scripts/trazabilidad.mjs`; `UT-WEB-EXTRA-nnn` es una prueba que no estaba en la planeación.

| ID del caso | Nombre del test | Archivo | Resultado | Evidencia | Observación |
|---|---|---|---|---|---|
| UT-WEB-EXTRA-001 | quitarBarrasFinales (sin regex) > "/a/" → "/a" | `tests/apiBase.test.ts` | APROBADO | U3_unitarias.xml | Base de la API del proxy (arreglos de SonarQube, D-WEB-14) |
| UT-WEB-EXTRA-002 | quitarBarrasFinales (sin regex) > "/a///" → "/a" | `tests/apiBase.test.ts` | APROBADO | U3_unitarias.xml | Base de la API del proxy (arreglos de SonarQube, D-WEB-14) |
| UT-WEB-EXTRA-003 | quitarBarrasFinales (sin regex) > "/api/v1" → "/api/v1" | `tests/apiBase.test.ts` | APROBADO | U3_unitarias.xml | Base de la API del proxy (arreglos de SonarQube, D-WEB-14) |
| UT-WEB-EXTRA-004 | quitarBarrasFinales (sin regex) > "/" → "" | `tests/apiBase.test.ts` | APROBADO | U3_unitarias.xml | Base de la API del proxy (arreglos de SonarQube, D-WEB-14) |
| UT-WEB-EXTRA-005 | quitarBarrasFinales (sin regex) > "" → "" | `tests/apiBase.test.ts` | APROBADO | U3_unitarias.xml | Base de la API del proxy (arreglos de SonarQube, D-WEB-14) |
| UT-WEB-EXTRA-006 | quitarBarrasFinales (sin regex) > "///" → "" | `tests/apiBase.test.ts` | APROBADO | U3_unitarias.xml | Base de la API del proxy (arreglos de SonarQube, D-WEB-14) |
| UT-WEB-EXTRA-007 | quitarBarrasFinales (sin regex) > una cadena larga de barras no tarda más que una corta | `tests/apiBase.test.ts` | APROBADO | U3_unitarias.xml | Base de la API del proxy (arreglos de SonarQube, D-WEB-14) |
| UT-WEB-EXTRA-008 | apiBase > con una URL válida la devuelve | `tests/apiBase.test.ts` | APROBADO | U3_unitarias.xml | Base de la API del proxy (arreglos de SonarQube, D-WEB-14) |
| UT-WEB-EXTRA-009 | apiBase > recorta los espacios | `tests/apiBase.test.ts` | APROBADO | U3_unitarias.xml | Base de la API del proxy (arreglos de SonarQube, D-WEB-14) |
| UT-WEB-EXTRA-010 | apiBase > con undefined usa el valor por defecto y no lanza | `tests/apiBase.test.ts` | APROBADO | U3_unitarias.xml | Base de la API del proxy (arreglos de SonarQube, D-WEB-14) |
| UT-WEB-EXTRA-011 | apiBase > con "" usa el valor por defecto y no lanza | `tests/apiBase.test.ts` | APROBADO | U3_unitarias.xml | Base de la API del proxy (arreglos de SonarQube, D-WEB-14) |
| UT-WEB-EXTRA-012 | apiBase > con "   " usa el valor por defecto y no lanza | `tests/apiBase.test.ts` | APROBADO | U3_unitarias.xml | Base de la API del proxy (arreglos de SonarQube, D-WEB-14) |
| UT-WEB-EXTRA-013 | apiBase > con un valor que no es URL avisa nombrando la variable | `tests/apiBase.test.ts` | APROBADO | U3_unitarias.xml | Base de la API del proxy (arreglos de SonarQube, D-WEB-14) |
| UT-WEB-03 | toCamel > convierte llaves anidadas y en listas, sin tocar los valores | `tests/apiClient.test.ts` | APROBADO | U3_unitarias.xml | WEB-02 · cookies |
| UT-WEB-03 | toCamel > deja intactos null y primitivos | `tests/apiClient.test.ts` | APROBADO | U3_unitarias.xml | WEB-02 · cookies |
| UT-WEB-03 | apiFetch > envía el token como Bearer y devuelve la respuesta en camelCase | `tests/apiClient.test.ts` | APROBADO | U3_unitarias.xml | WEB-02 · cookies |
| UT-WEB-03 | apiFetch > sin token no envía Authorization | `tests/apiClient.test.ts` | APROBADO | U3_unitarias.xml | WEB-02 · cookies |
| UT-WEB-03 | apiFetch > un 204 devuelve null | `tests/apiClient.test.ts` | APROBADO | U3_unitarias.xml | WEB-02 · cookies |
| UT-WEB-03 | apiFetch > un error usa el detail de FastAPI | `tests/apiClient.test.ts` | APROBADO | U3_unitarias.xml | WEB-02 · cookies |
| UT-WEB-03 | apiFetch > un 422 muestra el primer error de validación, no "[object Object]" | `tests/apiClient.test.ts` | APROBADO | U3_unitarias.xml | WEB-02 · cookies |
| UT-WEB-03 | errorMessage > cae al código HTTP cuando no hay detail utilizable | `tests/apiClient.test.ts` | APROBADO | U3_unitarias.xml | WEB-02 · cookies |
| UT-WEB-03 | WEB-02 · sin token en el navegador > getClientToken ya no existe | `tests/apiClient.test.ts` | APROBADO | U3_unitarias.xml | WEB-02 · cookies |
| UT-WEB-03 | WEB-02 · sin token en el navegador > en el navegador apiFetch llama al proxy del servidor y no manda Authorization | `tests/apiClient.test.ts` | APROBADO | U3_unitarias.xml | WEB-02 · cookies |
| UT-WEB-03 | WEB-02 · sin token en el navegador > el error 409 de la API llega como ApiError con status | `tests/apiClient.test.ts` | APROBADO | U3_unitarias.xml | WEB-02 · cookies |
| UT-WEB-03 | WEB-02 · sin token en el navegador > src/services/dashboard/dashboardService.ts no lee el token desde el navegador | `tests/apiClient.test.ts` | APROBADO | U3_unitarias.xml | WEB-02 · cookies |
| UT-WEB-03 | WEB-02 · sin token en el navegador > src/services/notas/notasService.ts no lee el token desde el navegador | `tests/apiClient.test.ts` | APROBADO | U3_unitarias.xml | WEB-02 · cookies |
| UT-WEB-03 | WEB-02 · sin token en el navegador > src/services/reportes/reportesService.ts no lee el token desde el navegador | `tests/apiClient.test.ts` | APROBADO | U3_unitarias.xml | WEB-02 · cookies |
| UT-WEB-03 | proxy /api/proxy (WEB-02: el token nunca viaja por JavaScript) > agrega el Bearer desde la cookie httpOnly y reenvía la consulta | `tests/apiProxy.test.ts` | APROBADO | U3_unitarias.xml | WEB-02 · cookies y proxy |
| UT-WEB-03 | proxy /api/proxy (WEB-02: el token nunca viaja por JavaScript) > sin cookie de acceso responde 401 y no llama a la API | `tests/apiProxy.test.ts` | APROBADO | U3_unitarias.xml | WEB-02 · cookies y proxy |
| UT-WEB-03 | proxy /api/proxy (WEB-02: el token nunca viaja por JavaScript) > reenvía el cuerpo y el tipo de contenido de un POST | `tests/apiProxy.test.ts` | APROBADO | U3_unitarias.xml | WEB-02 · cookies y proxy |
| UT-WEB-03 | proxy /api/proxy (WEB-02: el token nunca viaja por JavaScript) > conserva el tipo y Content-Disposition de una descarga | `tests/apiProxy.test.ts` | APROBADO | U3_unitarias.xml | WEB-02 · cookies y proxy |
| UT-WEB-03 | proxy /api/proxy (WEB-02: el token nunca viaja por JavaScript) > un 404 de la API llega con su detail | `tests/apiProxy.test.ts` | APROBADO | U3_unitarias.xml | WEB-02 · cookies y proxy |
| UT-WEB-03 | proxy /api/proxy (WEB-02: el token nunca viaja por JavaScript) > no permite salir hacia otra ruta con .. | `tests/apiProxy.test.ts` | APROBADO | U3_unitarias.xml | WEB-02 · cookies y proxy |
| UT-WEB-03 | proxy /api/proxy (WEB-02: el token nunca viaja por JavaScript) > endurecimiento (D-WEB-03) > rechaza una ruta que intenta salir de /api/v1 | `tests/apiProxy.test.ts` | APROBADO | U3_unitarias.xml | WEB-02 · cookies y proxy |
| UT-WEB-03 | proxy /api/proxy (WEB-02: el token nunca viaja por JavaScript) > endurecimiento (D-WEB-03) > rechaza %2e%2e y %2f | `tests/apiProxy.test.ts` | APROBADO | U3_unitarias.xml | WEB-02 · cookies y proxy |
| UT-WEB-03 | proxy /api/proxy (WEB-02: el token nunca viaja por JavaScript) > endurecimiento (D-WEB-03) > OPTIONS y TRACE → 405 | `tests/apiProxy.test.ts` | APROBADO | U3_unitarias.xml | WEB-02 · cookies y proxy |
| UT-WEB-03 | proxy /api/proxy (WEB-02: el token nunca viaja por JavaScript) > endurecimiento (D-WEB-03) > cuerpo de 6 MB → 413 | `tests/apiProxy.test.ts` | APROBADO | U3_unitarias.xml | WEB-02 · cookies y proxy |
| UT-WEB-03 | proxy /api/proxy (WEB-02: el token nunca viaja por JavaScript) > endurecimiento (D-WEB-03) > ignora un Authorization, una cookie y un host enviados por el navegador | `tests/apiProxy.test.ts` | APROBADO | U3_unitarias.xml | WEB-02 · cookies y proxy |
| UT-WEB-03 | proxy /api/proxy (WEB-02: el token nunca viaja por JavaScript) > endurecimiento (D-WEB-03) > no devuelve set-cookie de la API | `tests/apiProxy.test.ts` | APROBADO | U3_unitarias.xml | WEB-02 · cookies y proxy |
| UT-WEB-03 | proxy /api/proxy (WEB-02: el token nunca viaja por JavaScript) > endurecimiento (D-WEB-03) > POST con Origin ajeno → 403 | `tests/apiProxy.test.ts` | APROBADO | U3_unitarias.xml | WEB-02 · cookies y proxy |
| UT-WEB-03 | proxy /api/proxy (WEB-02: el token nunca viaja por JavaScript) > endurecimiento (D-WEB-03) > POST con el Origin de la web pasa | `tests/apiProxy.test.ts` | APROBADO | U3_unitarias.xml | WEB-02 · cookies y proxy |
| UT-WEB-03 | proxy /api/proxy (WEB-02: el token nunca viaja por JavaScript) > endurecimiento (D-WEB-03) > sin cookie no llama a fetch | `tests/apiProxy.test.ts` | APROBADO | U3_unitarias.xml | WEB-02 · cookies y proxy |
| UT-WEB-03 | proxy /api/proxy (WEB-02: el token nunca viaja por JavaScript) > endurecimiento (D-WEB-03) > API caída → 502 con detail, sin stack | `tests/apiProxy.test.ts` | APROBADO | U3_unitarias.xml | WEB-02 · cookies y proxy |
| UT-WEB-03 | proxy /api/proxy (WEB-02: el token nunca viaja por JavaScript) > endurecimiento (D-WEB-03) > el destino siempre queda bajo la API configurada | `tests/apiProxy.test.ts` | APROBADO | U3_unitarias.xml | WEB-02 · cookies y proxy |
| UT-WEB-EXTRA-014 | arquitectura (reglas 1 a 4) > regla 1: ninguna vista (*Client.tsx ni componente) llama a la API directamente | `tests/arquitectura.test.ts` | APROBADO | U3_unitarias.xml | Reglas de código testeable leídas del código fuente |
| UT-WEB-EXTRA-015 | arquitectura (reglas 1 a 4) > regla 3: ningún código lee el token de acceso desde el navegador | `tests/arquitectura.test.ts` | APROBADO | U3_unitarias.xml | Reglas de código testeable leídas del código fuente |
| UT-WEB-EXTRA-016 | arquitectura (reglas 1 a 4) > regla 4: las páginas toman el rol del token, no de la cookie eys_user | `tests/arquitectura.test.ts` | APROBADO | U3_unitarias.xml | Reglas de código testeable leídas del código fuente |
| UT-WEB-EXTRA-017 | arquitectura (reglas 1 a 4) > WEB-01/08: ya no existe src/services/supabase ni algo que lo importe | `tests/arquitectura.test.ts` | APROBADO | U3_unitarias.xml | Reglas de código testeable leídas del código fuente |
| UT-WEB-EXTRA-018 | arquitectura (reglas 1 a 4) > WEB-01: el guardia de rutas es proxy.ts y usa sessionMiddleware | `tests/arquitectura.test.ts` | APROBADO | U3_unitarias.xml | Reglas de código testeable leídas del código fuente |
| UT-WEB-EXTRA-019 | arquitectura (reglas 1 a 4) > WEB-INF-4: hay un solo despliegue (se eliminó el flujo de Azure) | `tests/arquitectura.test.ts` | APROBADO | U3_unitarias.xml | Reglas de código testeable leídas del código fuente |
| UT-WEB-EXTRA-020 | arquitectura (reglas 1 a 4) > los módulos 'use server' solo exportan funciones async (si no, el build los deja sin exports) | `tests/arquitectura.test.ts` | APROBADO | U3_unitarias.xml | Reglas de código testeable leídas del código fuente |
| IT-WEB-02 | asociadoActions (WEB-03 · IT-WEB-02) > si /padres/me/hijos responde 404, usa /padres/me y devuelve un solo hijo | `tests/asociadoActions.test.ts` | APROBADO | U3_unitarias.xml | WEB-03 · contrato /padres/me/hijos |
| IT-WEB-02 | asociadoActions (WEB-03 · IT-WEB-02) > si /padres/me/hijos responde 500, no usa /padres/me y propaga el error | `tests/asociadoActions.test.ts` | APROBADO | U3_unitarias.xml | WEB-03 · contrato /padres/me/hijos |
| IT-WEB-02 | asociadoActions (WEB-03 · IT-WEB-02) > con /padres/me/hijos disponible, no llama a /padres/me | `tests/asociadoActions.test.ts` | APROBADO | U3_unitarias.xml | WEB-03 · contrato /padres/me/hijos |
| IT-WEB-02 | asociadoActions (WEB-03 · IT-WEB-02) > getHijosAction llama GET /padres/me/hijos y devuelve los hijos en camelCase | `tests/asociadoActions.test.ts` | APROBADO | U3_unitarias.xml | WEB-03 · contrato /padres/me/hijos |
| IT-WEB-02 | asociadoActions (WEB-03 · IT-WEB-02) > con el hijo 11 llama /padres/me/hijos y luego /estudiantes/11/notas | `tests/asociadoActions.test.ts` | APROBADO | U3_unitarias.xml | WEB-03 · contrato /padres/me/hijos |
| IT-WEB-02 | asociadoActions (WEB-03 · IT-WEB-02) > sin id pedido usa el primer hijo (10) | `tests/asociadoActions.test.ts` | APROBADO | U3_unitarias.xml | WEB-03 · contrato /padres/me/hijos |
| IT-WEB-02 | asociadoActions (WEB-03 · IT-WEB-02) > un padre sin hijos recibe info null y no pide notas | `tests/asociadoActions.test.ts` | APROBADO | U3_unitarias.xml | WEB-03 · contrato /padres/me/hijos |
| IT-WEB-02 | asociadoActions (WEB-03 · IT-WEB-02) > horario del padre muestra error si /estudiantes/{id} falla | `tests/asociadoActions.test.ts` | APROBADO | U3_unitarias.xml | WEB-03 · contrato /padres/me/hijos |
| IT-WEB-02 | asociadoActions (WEB-03 · IT-WEB-02) > horario del padre muestra error si /horarios falla | `tests/asociadoActions.test.ts` | APROBADO | U3_unitarias.xml | WEB-03 · contrato /padres/me/hijos |
| IT-WEB-02 | asociadoActions (WEB-03 · IT-WEB-02) > horario del padre sin curso asignado no es un error | `tests/asociadoActions.test.ts` | APROBADO | U3_unitarias.xml | WEB-03 · contrato /padres/me/hijos |
| IT-WEB-02 | asociadoActions (WEB-03 · IT-WEB-02) > si la API falla, el error llega con el detail para mostrarlo | `tests/asociadoActions.test.ts` | APROBADO | U3_unitarias.xml | WEB-03 · contrato /padres/me/hijos |
| UT-WEB-EXTRA-021 | notas del estudiante asociado (WEB-03) > resuelve el nombre de la materia y la etiqueta del periodo | `tests/asociadoViewer.test.ts` | APROBADO | U3_unitarias.xml | Notas, novedades y horario del estudiante asociado (WEB-03) |
| UT-WEB-EXTRA-022 | novedades del estudiante asociado (WEB-03) > resuelve el tipo y la gravedad desde /tipos-novedad | `tests/asociadoViewer.test.ts` | APROBADO | U3_unitarias.xml | Notas, novedades y horario del estudiante asociado (WEB-03) |
| UT-WEB-EXTRA-023 | novedades del estudiante asociado (WEB-03) > un padre sin hijos no pide novedades | `tests/asociadoViewer.test.ts` | APROBADO | U3_unitarias.xml | Notas, novedades y horario del estudiante asociado (WEB-03) |
| UT-WEB-EXTRA-024 | horario del estudiante asociado (WEB-03) > ordena por día y hora, nombra la materia y trae el curso | `tests/asociadoViewer.test.ts` | APROBADO | U3_unitarias.xml | Notas, novedades y horario del estudiante asociado (WEB-03) |
| UT-WEB-EXTRA-025 | horario del estudiante asociado (WEB-03) > si /cursos/{id} falla, el horario se muestra igual sin los datos del curso | `tests/asociadoViewer.test.ts` | APROBADO | U3_unitarias.xml | Notas, novedades y horario del estudiante asociado (WEB-03) |
| UT-WEB-EXTRA-026 | estudiante que entra a su propia información (WEB-03) > usa /estudiantes/me y no pide hijos | `tests/asociadoViewer.test.ts` | APROBADO | U3_unitarias.xml | Notas, novedades y horario del estudiante asociado (WEB-03) |
| UT-WEB-EXTRA-027 | estudiante que entra a su propia información (WEB-03) > si /estudiantes/me no trae id, no hay estudiante asociado | `tests/asociadoViewer.test.ts` | APROBADO | U3_unitarias.xml | Notas, novedades y horario del estudiante asociado (WEB-03) |
| UT-WEB-EXTRA-028 | otros roles no tienen estudiante asociado > un docente recibe info null sin llamar a la API | `tests/asociadoViewer.test.ts` | APROBADO | U3_unitarias.xml | Notas, novedades y horario del estudiante asociado (WEB-03) |
| UT-WEB-EXTRA-029 | otros roles no tienen estudiante asociado > sin sesión tampoco | `tests/asociadoViewer.test.ts` | APROBADO | U3_unitarias.xml | Notas, novedades y horario del estudiante asociado (WEB-03) |
| UT-WEB-03 | cookies de sesión (WEB-02) > eys_access y eys_refresh son httpOnly | `tests/authCookies.test.ts` | APROBADO | U3_unitarias.xml | WEB-02 · cookies |
| UT-WEB-03 | cookies de sesión (WEB-02) > todas las cookies llevan secure en producción y sameSite lax | `tests/authCookies.test.ts` | APROBADO | U3_unitarias.xml | WEB-02 · cookies |
| UT-WEB-03 | cookies de sesión (WEB-02) > fuera de producción no exige secure (desarrollo en http://localhost) | `tests/authCookies.test.ts` | APROBADO | U3_unitarias.xml | WEB-02 · cookies |
| UT-WEB-03 | cookies de sesión (WEB-02) > el inicio de sesión abre la ventana de inactividad con eys_last httpOnly | `tests/authCookies.test.ts` | APROBADO | U3_unitarias.xml | WEB-02 · cookies |
| UT-WEB-03 | cookies de sesión (WEB-02) > eys_user guarda solo lo necesario para mostrar el nombre, sin token | `tests/authCookies.test.ts` | APROBADO | U3_unitarias.xml | WEB-02 · cookies |
| UT-WEB-03 | decodeRol (WEB-02: el rol sale del token, no de eys_user) > un token con rol padre devuelve padre | `tests/decodeRol.test.ts` | APROBADO | U3_unitarias.xml | WEB-02 · cookies |
| UT-WEB-03 | decodeRol (WEB-02: el rol sale del token, no de eys_user) > entiende nombre_rol e id_rol del backend | `tests/decodeRol.test.ts` | APROBADO | U3_unitarias.xml | WEB-02 · cookies |
| UT-WEB-03 | decodeRol (WEB-02: el rol sale del token, no de eys_user) > un token ilegible o sin rol devuelve null | `tests/decodeRol.test.ts` | APROBADO | U3_unitarias.xml | WEB-02 · cookies |
| UT-WEB-03 | decodeRol (WEB-02: el rol sale del token, no de eys_user) > getServerUser toma el rol del token aunque eys_user diga admin | `tests/decodeRol.test.ts` | APROBADO | U3_unitarias.xml | WEB-02 · cookies |
| UT-WEB-03 | decodeRol (WEB-02: el rol sale del token, no de eys_user) > sin token de acceso no hay usuario aunque exista eys_user | `tests/decodeRol.test.ts` | APROBADO | U3_unitarias.xml | WEB-02 · cookies |
| UT-WEB-04 | elegirHijoActivo (WEB-03) > con hijos [10, 11] y el id 11 devuelve el 11 | `tests/hijoActivo.test.ts` | APROBADO | U3_unitarias.xml | WEB-03 · varios hijos |
| UT-WEB-04 | elegirHijoActivo (WEB-03) > con un id ajeno devuelve el primero (10) | `tests/hijoActivo.test.ts` | APROBADO | U3_unitarias.xml | WEB-03 · varios hijos |
| UT-WEB-04 | elegirHijoActivo (WEB-03) > sin id devuelve el primero (10) | `tests/hijoActivo.test.ts` | APROBADO | U3_unitarias.xml | WEB-03 · varios hijos |
| UT-WEB-04 | elegirHijoActivo (WEB-03) > con el id como texto de la URL (?hijo=11) también lo encuentra | `tests/hijoActivo.test.ts` | APROBADO | U3_unitarias.xml | WEB-03 · varios hijos |
| UT-WEB-04 | elegirHijoActivo (WEB-03) > sin hijos devuelve null | `tests/hijoActivo.test.ts` | APROBADO | U3_unitarias.xml | WEB-03 · varios hijos |
| UT-WEB-04 | elegirHijoActivo (WEB-03) > el mensaje para un padre sin vínculos es 'No hay estudiantes vinculados' | `tests/hijoActivo.test.ts` | APROBADO | U3_unitarias.xml | WEB-03 · varios hijos |
| UT-WEB-08 | notasService · boletín y mensajes (WEB-09) > el texto del periodo sin notas es el del criterio de aceptación | `tests/notasService.test.ts` | APROBADO | U3_unitarias.xml | WEB-09 · boletín y mensajes |
| UT-WEB-08 | notasService · boletín y mensajes (WEB-09) > un 404 sin datos lanza «No hay datos disponibles para generar el boletín.» | `tests/notasService.test.ts` | APROBADO | U3_unitarias.xml | WEB-09 · boletín y mensajes |
| UT-WEB-08 | notasService · boletín y mensajes (WEB-09) > otro error lanza el detail de la API | `tests/notasService.test.ts` | APROBADO | U3_unitarias.xml | WEB-09 · boletín y mensajes |
| UT-WEB-08 | notasService · boletín y mensajes (WEB-09) > pide el PDF al proxy del servidor, sin token en el navegador | `tests/notasService.test.ts` | APROBADO | U3_unitarias.xml | WEB-09 · boletín y mensajes |
| UT-WEB-EXTRA-030 | política de contraseñas > acepta una contraseña que cumple las cinco reglas | `tests/password.test.ts` | APROBADO | U3_unitarias.xml | Política de contraseñas (base de WEB-05) |
| UT-WEB-EXTRA-031 | política de contraseñas > rechaza Ab1# por la regla length | `tests/password.test.ts` | APROBADO | U3_unitarias.xml | Política de contraseñas (base de WEB-05) |
| UT-WEB-EXTRA-032 | política de contraseñas > rechaza colegio#2026 por la regla upper | `tests/password.test.ts` | APROBADO | U3_unitarias.xml | Política de contraseñas (base de WEB-05) |
| UT-WEB-EXTRA-033 | política de contraseñas > rechaza COLEGIO#2026 por la regla lower | `tests/password.test.ts` | APROBADO | U3_unitarias.xml | Política de contraseñas (base de WEB-05) |
| UT-WEB-EXTRA-034 | política de contraseñas > rechaza Colegio#ocho por la regla number | `tests/password.test.ts` | APROBADO | U3_unitarias.xml | Política de contraseñas (base de WEB-05) |
| UT-WEB-EXTRA-035 | política de contraseñas > rechaza Colegio2026 por la regla special | `tests/password.test.ts` | APROBADO | U3_unitarias.xml | Política de contraseñas (base de WEB-05) |
| UT-WEB-EXTRA-036 | permisos por rol > solo el administrador gestiona usuarios | `tests/permissions.test.ts` | APROBADO | U3_unitarias.xml | Prueba no planeada |
| UT-WEB-EXTRA-037 | permisos por rol > las notas las escribe el docente; el admin solo las lee | `tests/permissions.test.ts` | APROBADO | U3_unitarias.xml | Prueba no planeada |
| UT-WEB-EXTRA-038 | permisos por rol > estudiante y padre solo leen lo propio | `tests/permissions.test.ts` | APROBADO | U3_unitarias.xml | Prueba no planeada |
| UT-WEB-EXTRA-039 | permisos por rol > escanear QR es de docentes y administradores | `tests/permissions.test.ts` | APROBADO | U3_unitarias.xml | Prueba no planeada |
| UT-WEB-EXTRA-040 | mapRolToKey > traduce los nombres de rol del backend | `tests/permissions.test.ts` | APROBADO | U3_unitarias.xml | Prueba no planeada |
| UT-WEB-EXTRA-041 | mapRolToKey > traduce el id_rol de la base (1 docente, 2 estudiante, 3 admin, 4 padre) | `tests/permissions.test.ts` | APROBADO | U3_unitarias.xml | Prueba no planeada |
| UT-WEB-EXTRA-042 | mapRolToKey > un rol desconocido no se convierte en ninguno | `tests/permissions.test.ts` | APROBADO | U3_unitarias.xml | Prueba no planeada |
| UT-WEB-05 | WEB-04 · permiso de borrar asistencia > can('docente','delete','asistencia') es false: la API se lo niega con 403 | `tests/permissions.test.ts` | APROBADO | U3_unitarias.xml | WEB-04 · permisos |
| UT-WEB-05 | WEB-04 · permiso de borrar asistencia > can('admin','delete','asistencia') es true | `tests/permissions.test.ts` | APROBADO | U3_unitarias.xml | WEB-04 · permisos |
| IT-WEB-01 | contrato PERMISSIONS ↔ roles de la API > PERMISSIONS no concede nada que la API rechace (0 diferencias) | `tests/permissions.test.ts` | APROBADO | U3_unitarias.xml | WEB-04 · contrato con la API |
| UT-WEB-EXTRA-043 | register (WEB-05 · validación antes de llamar a la API) > sin correo pide completar los campos y no llama a la API | `tests/register.test.ts` | APROBADO | U3_unitarias.xml | Validación por rol de register (WEB-05, cobertura D-WEB-13) |
| UT-WEB-EXTRA-044 | register (WEB-05 · validación antes de llamar a la API) > sin contraseña pide completar los campos y no llama a la API | `tests/register.test.ts` | APROBADO | U3_unitarias.xml | Validación por rol de register (WEB-05, cobertura D-WEB-13) |
| UT-WEB-EXTRA-045 | register (WEB-05 · validación antes de llamar a la API) > sin nombre pide completar los campos y no llama a la API | `tests/register.test.ts` | APROBADO | U3_unitarias.xml | Validación por rol de register (WEB-05, cobertura D-WEB-13) |
| UT-WEB-EXTRA-046 | register (WEB-05 · validación antes de llamar a la API) > sin apellido pide completar los campos y no llama a la API | `tests/register.test.ts` | APROBADO | U3_unitarias.xml | Validación por rol de register (WEB-05, cobertura D-WEB-13) |
| UT-WEB-EXTRA-047 | register (WEB-05 · validación antes de llamar a la API) > sin tipo de documento pide completar los campos y no llama a la API | `tests/register.test.ts` | APROBADO | U3_unitarias.xml | Validación por rol de register (WEB-05, cobertura D-WEB-13) |
| UT-WEB-EXTRA-048 | register (WEB-05 · validación antes de llamar a la API) > sin número de documento pide completar los campos y no llama a la API | `tests/register.test.ts` | APROBADO | U3_unitarias.xml | Validación por rol de register (WEB-05, cobertura D-WEB-13) |
| UT-WEB-EXTRA-049 | register (WEB-05 · validación antes de llamar a la API) > sin rol pide completar los campos y no llama a la API | `tests/register.test.ts` | APROBADO | U3_unitarias.xml | Validación por rol de register (WEB-05, cobertura D-WEB-13) |
| UT-WEB-EXTRA-050 | register (WEB-05 · validación antes de llamar a la API) > un rol que no es un número tampoco pasa (Number.isNaN) | `tests/register.test.ts` | APROBADO | U3_unitarias.xml | Validación por rol de register (WEB-05, cobertura D-WEB-13) |
| UT-WEB-EXTRA-051 | register (WEB-05 · validación antes de llamar a la API) > una contraseña sin carácter especial se rechaza con el motivo | `tests/register.test.ts` | APROBADO | U3_unitarias.xml | Validación por rol de register (WEB-05, cobertura D-WEB-13) |
| UT-WEB-EXTRA-052 | register (WEB-05 · validación antes de llamar a la API) > un rol desconocido se rechaza | `tests/register.test.ts` | APROBADO | U3_unitarias.xml | Validación por rol de register (WEB-05, cobertura D-WEB-13) |
| UT-WEB-EXTRA-053 | register (WEB-05 · validación antes de llamar a la API) > estudiante sin curso se rechaza con su motivo | `tests/register.test.ts` | APROBADO | U3_unitarias.xml | Validación por rol de register (WEB-05, cobertura D-WEB-13) |
| UT-WEB-EXTRA-054 | register (WEB-05 · validación antes de llamar a la API) > padre sin id del estudiante se rechaza con su motivo | `tests/register.test.ts` | APROBADO | U3_unitarias.xml | Validación por rol de register (WEB-05, cobertura D-WEB-13) |
| UT-WEB-EXTRA-055 | register (WEB-05 · validación antes de llamar a la API) > padre sin parentesco se rechaza con su motivo | `tests/register.test.ts` | APROBADO | U3_unitarias.xml | Validación por rol de register (WEB-05, cobertura D-WEB-13) |
| UT-WEB-EXTRA-056 | register (WEB-05 · validación antes de llamar a la API) > docente sin especialización se rechaza con su motivo | `tests/register.test.ts` | APROBADO | U3_unitarias.xml | Validación por rol de register (WEB-05, cobertura D-WEB-13) |
| UT-WEB-EXTRA-057 | register (WEB-05 · validación antes de llamar a la API) > admin sin cargo se rechaza con su motivo | `tests/register.test.ts` | APROBADO | U3_unitarias.xml | Validación por rol de register (WEB-05, cobertura D-WEB-13) |
| UT-WEB-EXTRA-058 | register (WEB-05 · validación antes de llamar a la API) > estudiante válido manda id_curso_actual como número y el correo en minúsculas | `tests/register.test.ts` | APROBADO | U3_unitarias.xml | Validación por rol de register (WEB-05, cobertura D-WEB-13) |
| UT-WEB-EXTRA-059 | register (WEB-05 · validación antes de llamar a la API) > padre válido manda id_estudiante_vinculado y parentesco | `tests/register.test.ts` | APROBADO | U3_unitarias.xml | Validación por rol de register (WEB-05, cobertura D-WEB-13) |
| UT-WEB-EXTRA-060 | register (WEB-05 · validación antes de llamar a la API) > docente válido manda id_especializacion y la institución si viene | `tests/register.test.ts` | APROBADO | U3_unitarias.xml | Validación por rol de register (WEB-05, cobertura D-WEB-13) |
| UT-WEB-EXTRA-061 | register (WEB-05 · validación antes de llamar a la API) > si la API responde con error, el detail llega al formulario | `tests/register.test.ts` | APROBADO | U3_unitarias.xml | Validación por rol de register (WEB-05, cobertura D-WEB-13) |
| UT-WEB-07 | clasificarResultados (WEB-06) > 2 éxitos, un 409 y un 500 → 2 guardados, 1 duplicado y 1 fallido | `tests/registroMasivo.test.ts` | APROBADO | U3_unitarias.xml | WEB-06 · registro masivo |
| UT-WEB-07 | clasificarResultados (WEB-06) > un error sin status (red caída) va a fallidos con un motivo legible | `tests/registroMasivo.test.ts` | APROBADO | U3_unitarias.xml | WEB-06 · registro masivo |
| UT-WEB-07 | clasificarResultados (WEB-06) > con una lista vacía devuelve tres listas vacías | `tests/registroMasivo.test.ts` | APROBADO | U3_unitarias.xml | WEB-06 · registro masivo |
| UT-WEB-07 | reintento (WEB-06) > itemsParaReintento deja solo los estudiantes fallidos, con su estado original | `tests/registroMasivo.test.ts` | APROBADO | U3_unitarias.xml | WEB-06 · registro masivo |
| UT-WEB-07 | reintento (WEB-06) > Reintentar envía a la API solo el fallido | `tests/registroMasivo.test.ts` | APROBADO | U3_unitarias.xml | WEB-06 · registro masivo |
| UT-WEB-07 | crearRegistrosMasivoAction (WEB-06) > manda un POST /asistencia por estudiante y clasifica 409 y 500 | `tests/registroMasivo.test.ts` | APROBADO | U3_unitarias.xml | WEB-06 · registro masivo |
| UT-WEB-07 | crearRegistrosMasivoAction (WEB-06) > el segundo envío del mismo curso deja a todos como duplicados (409) | `tests/registroMasivo.test.ts` | APROBADO | U3_unitarias.xml | WEB-06 · registro masivo |
| UT-WEB-06 | resetPassword (WEB-05) > no llama a la API si la contraseña no tiene carácter especial (Colegio2026) | `tests/resetPassword.test.ts` | APROBADO | U3_unitarias.xml | WEB-05 · restablecer contraseña |
| UT-WEB-06 | resetPassword (WEB-05) > con una contraseña válida y confirmación igual llama POST /auth/reset-password y devuelve success | `tests/resetPassword.test.ts` | APROBADO | U3_unitarias.xml | WEB-05 · restablecer contraseña |
| UT-WEB-06 | resetPassword (WEB-05) > con confirmación distinta devuelve 'Las contraseñas no coinciden.' | `tests/resetPassword.test.ts` | APROBADO | U3_unitarias.xml | WEB-05 · restablecer contraseña |
| UT-WEB-06 | resetPassword (WEB-05) > sin token devuelve el error de enlace inválido | `tests/resetPassword.test.ts` | APROBADO | U3_unitarias.xml | WEB-05 · restablecer contraseña |
| UT-WEB-06 | resetPassword (WEB-05) > si la API responde 401 (enlace ya usado) devuelve el mensaje de la API | `tests/resetPassword.test.ts` | APROBADO | U3_unitarias.xml | WEB-05 · restablecer contraseña |
| UT-WEB-02 | guardia de rutas del panel > las rutas públicas pasan sin sesión | `tests/routeGuard.test.ts` | APROBADO | U3_unitarias.xml | WEB-01 · sesión y rutas |
| UT-WEB-02 | guardia de rutas del panel > sin sesión /admin manda al login | `tests/routeGuard.test.ts` | APROBADO | U3_unitarias.xml | WEB-01 · sesión y rutas |
| UT-WEB-02 | guardia de rutas del panel > un token ilegible manda al login | `tests/routeGuard.test.ts` | APROBADO | U3_unitarias.xml | WEB-01 · sesión y rutas |
| UT-WEB-02 | guardia de rutas del panel > el administrador entra a /admin | `tests/routeGuard.test.ts` | APROBADO | U3_unitarias.xml | WEB-01 · sesión y rutas |
| UT-WEB-02 | guardia de rutas del panel > un docente que intenta /admin vuelve a su panel | `tests/routeGuard.test.ts` | APROBADO | U3_unitarias.xml | WEB-01 · sesión y rutas |
| UT-WEB-02 | guardia de rutas del panel > cualquier rol con sesión entra a /general | `tests/routeGuard.test.ts` | APROBADO | U3_unitarias.xml | WEB-01 · sesión y rutas |
| UT-WEB-02 | guardia de rutas del panel > un token vencido y sin refresh manda al login | `tests/routeGuard.test.ts` | APROBADO | U3_unitarias.xml | WEB-01 · sesión y rutas |
| UT-WEB-02 | WEB-01 · renovación de la sesión > con el acceso vencido y un refresco válido pide /auth/refresh y entrega la cookie eys_access nueva | `tests/routeGuard.test.ts` | APROBADO | U3_unitarias.xml | WEB-01 · sesión y rutas |
| UT-WEB-02 | WEB-01 · renovación de la sesión > con el refresco inválido (401) redirige a /?login=1 y borra las tres cookies | `tests/routeGuard.test.ts` | APROBADO | U3_unitarias.xml | WEB-01 · sesión y rutas |
| UT-WEB-02 | WEB-01 · renovación de la sesión > sin cookies redirige a /?login=1 | `tests/routeGuard.test.ts` | APROBADO | U3_unitarias.xml | WEB-01 · sesión y rutas |
| UT-WEB-02 | WEB-01 · renovación de la sesión > un padre que entra a /usuarios vuelve a /general | `tests/routeGuard.test.ts` | APROBADO | U3_unitarias.xml | WEB-01 · sesión y rutas |
| UT-WEB-02 | WEB-01 · renovación de la sesión > un docente puede entrar a /qr/escanear | `tests/routeGuard.test.ts` | APROBADO | U3_unitarias.xml | WEB-01 · sesión y rutas |
| UT-WEB-02 | WEB-01 · renovación de la sesión > un estudiante no entra a /qr/escanear | `tests/routeGuard.test.ts` | APROBADO | U3_unitarias.xml | WEB-01 · sesión y rutas |
| UT-WEB-02 | WEB-01 · renovación de la sesión > todas las rutas del panel están protegidas, no solo /admin y /general | `tests/routeGuard.test.ts` | APROBADO | U3_unitarias.xml | WEB-01 · sesión y rutas |
| UT-WEB-02 | WEB-01 · renovación de la sesión > con 31 minutos sin actividad no pide /auth/refresh: redirige y borra las cookies | `tests/routeGuard.test.ts` | APROBADO | U3_unitarias.xml | WEB-01 · sesión y rutas |
| UT-WEB-02 | WEB-01 · renovación de la sesión > con 10 minutos de actividad y el acceso vencido renueva y actualiza eys_last | `tests/routeGuard.test.ts` | APROBADO | U3_unitarias.xml | WEB-01 · sesión y rutas |
| UT-WEB-02 | WEB-01 · renovación de la sesión > eys_last es httpOnly para que ningún script pueda estirar la sesión | `tests/routeGuard.test.ts` | APROBADO | U3_unitarias.xml | WEB-01 · sesión y rutas |
| UT-WEB-02 | WEB-01 · renovación de la sesión > el refresco deja la cookie nueva también en la petición que ve la página | `tests/routeGuard.test.ts` | APROBADO | U3_unitarias.xml | WEB-01 · sesión y rutas |
| UT-WEB-02 | WEB-01 · inactividad configurable (CP-SIS-065 a escala) > sin variable o con un valor inválido la regla es de 30 minutos | `tests/routeGuard.test.ts` | APROBADO | U3_unitarias.xml | WEB-01 · sesión y rutas |
| UT-WEB-02 | WEB-01 · inactividad configurable (CP-SIS-065 a escala) > SESSION_IDLE_MINUTES=1 la reduce a 1 minuto | `tests/routeGuard.test.ts` | APROBADO | U3_unitarias.xml | WEB-01 · sesión y rutas |
| UT-WEB-02 | mapa único de rutas por rol (WEB-01) > /admin, /usuarios y /reportes son solo del administrador | `tests/routeRoles.test.ts` | APROBADO | U3_unitarias.xml | WEB-01 · sesión y rutas |
| UT-WEB-02 | mapa único de rutas por rol (WEB-01) > notas, asistencia, novedades, horarios, perfil y general admiten a todos los roles | `tests/routeRoles.test.ts` | APROBADO | U3_unitarias.xml | WEB-01 · sesión y rutas |
| UT-WEB-02 | mapa único de rutas por rol (WEB-01) > /qr/escanear es de administrador y docente | `tests/routeRoles.test.ts` | APROBADO | U3_unitarias.xml | WEB-01 · sesión y rutas |
| UT-WEB-02 | mapa único de rutas por rol (WEB-01) > docente puede entrar a /qr/escanear | `tests/routeRoles.test.ts` | APROBADO | U3_unitarias.xml | WEB-01 · sesión y rutas |
| UT-WEB-02 | mapa único de rutas por rol (WEB-01) > docente no puede entrar a /qr (Mi QR) | `tests/routeRoles.test.ts` | APROBADO | U3_unitarias.xml | WEB-01 · sesión y rutas |
| UT-WEB-02 | mapa único de rutas por rol (WEB-01) > estudiante no puede entrar a /qr/escanear | `tests/routeRoles.test.ts` | APROBADO | U3_unitarias.xml | WEB-01 · sesión y rutas |
| UT-WEB-02 | mapa único de rutas por rol (WEB-01) > el enlace de escanear aparece en el riel del docente y no en el del estudiante | `tests/routeRoles.test.ts` | APROBADO | U3_unitarias.xml | WEB-01 · sesión y rutas |
| UT-WEB-02 | mapa único de rutas por rol (WEB-01) > una subruta hereda la regla de su prefijo más largo | `tests/routeRoles.test.ts` | APROBADO | U3_unitarias.xml | WEB-01 · sesión y rutas |
| UT-WEB-02 | mapa único de rutas por rol (WEB-01) > una ruta fuera del mapa no está protegida | `tests/routeRoles.test.ts` | APROBADO | U3_unitarias.xml | WEB-01 · sesión y rutas |
| UT-WEB-02 | mapa único de rutas por rol (WEB-01) > ningún enlace del PanelSidebar es visible para un rol que la ruta no permite | `tests/routeRoles.test.ts` | APROBADO | U3_unitarias.xml | WEB-01 · sesión y rutas |
| UT-WEB-EXTRA-062 | serverFetch (WEB-INF-1) > con datos: manda el token por parámetro y devuelve el JSON sin tocar | `tests/serverFetch.test.ts` | APROBADO | U3_unitarias.xml | serverFetch y ApiError (WEB-INF-1) |
| UT-WEB-EXTRA-063 | serverFetch (WEB-INF-1) > con lista vacía devuelve []; con un 204 devuelve null | `tests/serverFetch.test.ts` | APROBADO | U3_unitarias.xml | serverFetch y ApiError (WEB-INF-1) |
| UT-WEB-EXTRA-064 | serverFetch (WEB-INF-1) > con error lanza ApiError con status, mensaje legible y detail original | `tests/serverFetch.test.ts` | APROBADO | U3_unitarias.xml | serverFetch y ApiError (WEB-INF-1) |
| UT-WEB-EXTRA-065 | serverFetch (WEB-INF-1) > sin token no manda Authorization | `tests/serverFetch.test.ts` | APROBADO | U3_unitarias.xml | serverFetch y ApiError (WEB-INF-1) |
| UT-WEB-EXTRA-066 | Servicios · notasActions > getNotasAction manda el Bearer del servidor y mapea la nota a número | `tests/services/actionsNotasNovedadesReportes.test.ts` | APROBADO | U3_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-067 | Servicios · notasActions > con lista vacía devuelve [] | `tests/services/actionsNotasNovedadesReportes.test.ts` | APROBADO | U3_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-068 | Servicios · notasActions > getEstudiantesAction arma el nombre completo o uno provisional | `tests/services/actionsNotasNovedadesReportes.test.ts` | APROBADO | U3_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-069 | Servicios · notasActions > createNotaAction manda el cuerpo en snake_case | `tests/services/actionsNotasNovedadesReportes.test.ts` | APROBADO | U3_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-070 | Servicios · notasActions > getNotasBootstrapAction junta las cuatro consultas | `tests/services/actionsNotasNovedadesReportes.test.ts` | APROBADO | U3_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-071 | Servicios · notasActions > un error de la API lanza con su detail | `tests/services/actionsNotasNovedadesReportes.test.ts` | APROBADO | U3_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-072 | Servicios · notasActions > un 500 sin cuerpo lanza HTTP 500 | `tests/services/actionsNotasNovedadesReportes.test.ts` | APROBADO | U3_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-073 | Servicios · novedadesActions > getNovedadesAction cruza el estudiante por id y usa uno provisional si falta | `tests/services/actionsNotasNovedadesReportes.test.ts` | APROBADO | U3_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-074 | Servicios · novedadesActions > getNovedadesBootstrapAction resuelve nombre y gravedad del tipo | `tests/services/actionsNotasNovedadesReportes.test.ts` | APROBADO | U3_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-075 | Servicios · novedadesActions > cursos y estudiantes con lista vacía devuelven [] | `tests/services/actionsNotasNovedadesReportes.test.ts` | APROBADO | U3_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-076 | Servicios · novedadesActions > crear manda la fecha de hoy; actualizar solo lo informado; borrar hace DELETE | `tests/services/actionsNotasNovedadesReportes.test.ts` | APROBADO | U3_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-077 | Servicios · novedadesActions > un 403 lanza con su detail | `tests/services/actionsNotasNovedadesReportes.test.ts` | APROBADO | U3_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-078 | Servicios · reportesActions > getReportesAction mapea y completa parametros vacío | `tests/services/actionsNotasNovedadesReportes.test.ts` | APROBADO | U3_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-079 | Servicios · reportesActions > con lista vacía devuelve [] | `tests/services/actionsNotasNovedadesReportes.test.ts` | APROBADO | U3_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-080 | Servicios · reportesActions > crear, actualizar estado y borrar | `tests/services/actionsNotasNovedadesReportes.test.ts` | APROBADO | U3_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-081 | Servicios · reportesActions > un 404 lanza con su detail | `tests/services/actionsNotasNovedadesReportes.test.ts` | APROBADO | U3_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-082 | Servicios · dashboardActions (KPI del administrador) > calcula totales, promedio, aprobación, asistencia y novedades activas | `tests/services/dashboardActions.test.ts` | APROBADO | U3_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-083 | Servicios · dashboardActions (KPI del administrador) > arma las gráficas: estudiantes por curso, usuarios por rol y promedio por materia | `tests/services/dashboardActions.test.ts` | APROBADO | U3_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-084 | Servicios · dashboardActions (KPI del administrador) > sin datos devuelve ceros y promedios nulos, no lanza | `tests/services/dashboardActions.test.ts` | APROBADO | U3_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-085 | Servicios · dashboardActions (KPI del administrador) > si un endpoint falla (500 o sin red) esa lista cuenta como vacía | `tests/services/dashboardActions.test.ts` | APROBADO | U3_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-086 | Servicios · dashboardActions (KPI del administrador) > los atajos devuelven el valor del KPI y 0 si no hay dato | `tests/services/dashboardActions.test.ts` | APROBADO | U3_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-087 | Servicios · dashboardActions (KPI del administrador) > las series sin endpoint dedicado devuelven [] | `tests/services/dashboardActions.test.ts` | APROBADO | U3_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-088 | Servicios · dashboardService > rutaPadre agrega id_estudiante solo cuando hay un hijo activo | `tests/services/dashboardService.test.ts` | APROBADO | U3_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-089 | Servicios · dashboardService > docente: mapea los contadores (cliente y servidor) | `tests/services/dashboardService.test.ts` | APROBADO | U3_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-090 | Servicios · dashboardService > estudiante: promedios nulos pasan a 0 | `tests/services/dashboardService.test.ts` | APROBADO | U3_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-091 | Servicios · dashboardService > padre: arma un hijo con el id pedido | `tests/services/dashboardService.test.ts` | APROBADO | U3_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-092 | Servicios · dashboardService > con error de la API o sin red devuelve el estado vacío, no lanza | `tests/services/dashboardService.test.ts` | APROBADO | U3_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-093 | Servicios · dashboardService > los helpers heredados devuelven valores neutros | `tests/services/dashboardService.test.ts` | APROBADO | U3_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-094 | Servicios · horariosService > getHorarios mapea a camelCase y ordena por día y hora | `tests/services/horariosService.test.ts` | APROBADO | U3_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-095 | Servicios · horariosService > con lista vacía devuelve [] | `tests/services/horariosService.test.ts` | APROBADO | U3_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-096 | Servicios · horariosService > cursos y materias activos/todos usan su consulta y mapean los campos | `tests/services/horariosService.test.ts` | APROBADO | U3_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-097 | Servicios · horariosService > crear curso, materia y especialización manda el cuerpo en snake_case | `tests/services/horariosService.test.ts` | APROBADO | U3_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-098 | Servicios · horariosService > actualizar manda solo los campos informados | `tests/services/horariosService.test.ts` | APROBADO | U3_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-099 | Servicios · horariosService > eliminar es una baja lógica (PUT activo=false) | `tests/services/horariosService.test.ts` | APROBADO | U3_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-100 | Servicios · horariosService > crear horario devuelve el id y asignar profesor lo vincula | `tests/services/horariosService.test.ts` | APROBADO | U3_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-101 | Servicios · horariosService > getProfesores arma el nombre y ordena alfabéticamente | `tests/services/horariosService.test.ts` | APROBADO | U3_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-102 | Servicios · horariosService > asignaciones: lista, crea con fecha_finalizacion nula y getAsignacionesProfesores es vacío | `tests/services/horariosService.test.ts` | APROBADO | U3_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-103 | Servicios · horariosService > un 422 lanza con el detail de la API | `tests/services/horariosService.test.ts` | APROBADO | U3_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-104 | Servicios · horariosService > un 500 lanza HTTP 500 | `tests/services/horariosService.test.ts` | APROBADO | U3_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-105 | Servicios · novedadesService > getNovedades mapea y arma código y nombre provisionales del estudiante | `tests/services/novedadesQrService.test.ts` | APROBADO | U3_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-106 | Servicios · novedadesService > con lista vacía devuelve [] en novedades, tipos, cursos y estudiantes | `tests/services/novedadesQrService.test.ts` | APROBADO | U3_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-107 | Servicios · novedadesService > tipos, cursos y estudiantes se mapean a camelCase | `tests/services/novedadesQrService.test.ts` | APROBADO | U3_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-108 | Servicios · novedadesService > crear, actualizar y borrar una novedad | `tests/services/novedadesQrService.test.ts` | APROBADO | U3_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-109 | Servicios · novedadesService > un 403 lanza con el detail | `tests/services/novedadesQrService.test.ts` | APROBADO | U3_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-110 | Servicios · qrService > getQRImageUrl codifica el código y fija el tamaño | `tests/services/novedadesQrService.test.ts` | APROBADO | U3_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-111 | Servicios · qrService > readQRFromImage devuelve el contenido leído | `tests/services/novedadesQrService.test.ts` | APROBADO | U3_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-112 | Servicios · qrService > readQRFromImage devuelve null si no hay símbolo o trae error | `tests/services/novedadesQrService.test.ts` | APROBADO | U3_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-113 | Servicios · qrService > readQRFromImage lanza si el servicio externo falla | `tests/services/novedadesQrService.test.ts` | APROBADO | U3_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-114 | Servicios · usuarioService (perfil) > getMiPerfil mapea el perfil y resuelve la foto relativa contra el backend | `tests/services/usuarioService.test.ts` | APROBADO | U3_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-115 | Servicios · usuarioService (perfil) > getMiPerfil devuelve null si la API falla | `tests/services/usuarioService.test.ts` | APROBADO | U3_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-116 | Servicios · usuarioService (perfil) > updateMiPerfil manda solo los campos informados | `tests/services/usuarioService.test.ts` | APROBADO | U3_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-117 | Servicios · usuarioService (perfil) > uploadAvatar acepta un texto o un objeto con la URL | `tests/services/usuarioService.test.ts` | APROBADO | U3_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-118 | Servicios · usuarioService (perfil) > getAvatarUrl no inventa una URL | `tests/services/usuarioService.test.ts` | APROBADO | U3_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-119 | Servicios · usuarioService (perfil) > getMiPerfilProfesor busca al profesor por idUsuario en la lista y trae sus especializaciones | `tests/services/usuarioService.test.ts` | APROBADO | U3_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-120 | Servicios · usuarioService (perfil) > getMiPerfilProfesor devuelve null si no hay fila para ese usuario o falla la API | `tests/services/usuarioService.test.ts` | APROBADO | U3_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-121 | Servicios · usuarioService (perfil) > getMiPerfilAdmin busca en la lista; null si no está | `tests/services/usuarioService.test.ts` | APROBADO | U3_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-122 | Servicios · usuarioService (perfil) > actualizar profesor y administrador usa snake_case | `tests/services/usuarioService.test.ts` | APROBADO | U3_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-123 | Servicios · usuarioService (perfil) > insertAdminPerfil crea el perfil Activo con la fecha de hoy | `tests/services/usuarioService.test.ts` | APROBADO | U3_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-124 | Servicios · usuarioService (perfil) > getMiEPS usa /estudiantes/me y luego /ips; [] si no hay estudiante o falla | `tests/services/usuarioService.test.ts` | APROBADO | U3_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-125 | Servicios · usuarioService (perfil) > upsertMiEPS manda la afiliación activa con fecha de hoy | `tests/services/usuarioService.test.ts` | APROBADO | U3_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-126 | Servicios · usuarioService (perfil) > getMiEstudianteInfo devuelve id y curso; null si la lista viene vacía | `tests/services/usuarioService.test.ts` | APROBADO | U3_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-127 | Servicios · usuarioService (perfil) > updateEstudianteCurso y getCursosParaPerfil | `tests/services/usuarioService.test.ts` | APROBADO | U3_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-128 | Servicios · usuariosService > getUsuarios pide los activos y agrega el nombre del rol | `tests/services/usuariosService.test.ts` | APROBADO | U3_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-129 | Servicios · usuariosService > getPendingUsuarios pide los inactivos y con lista vacía devuelve [] | `tests/services/usuariosService.test.ts` | APROBADO | U3_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-130 | Servicios · usuariosService > getUsuarioById devuelve el usuario y null si la API falla | `tests/services/usuariosService.test.ts` | APROBADO | U3_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-131 | Servicios · usuariosService > createUsuario manda el cuerpo en snake_case con nulos para lo opcional | `tests/services/usuariosService.test.ts` | APROBADO | U3_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-132 | Servicios · usuariosService > updateUsuario manda solo lo que cambió | `tests/services/usuariosService.test.ts` | APROBADO | U3_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-133 | Servicios · usuariosService > toggleUsuarioEstado manda el estado como query param | `tests/services/usuariosService.test.ts` | APROBADO | U3_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-134 | Servicios · usuariosService > validarUsuario cambia el rol y luego activa | `tests/services/usuariosService.test.ts` | APROBADO | U3_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-135 | Servicios · usuariosService > deleteUsuario y rechazarUsuario hacen DELETE | `tests/services/usuariosService.test.ts` | APROBADO | U3_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-136 | Servicios · usuariosService > un 409 por correo duplicado lanza con el detail | `tests/services/usuariosService.test.ts` | APROBADO | U3_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-137 | FallidosMasivo (WEB-06) > sin fallidos no renderiza nada | `tests/components/FallidosMasivo.test.tsx` | APROBADO | U3_unitarias.xml | Fallidos del registro masivo (WEB-06, cobertura D-WEB-13) |
| UT-WEB-EXTRA-138 | FallidosMasivo (WEB-06) > lista cada estudiante por nombre con su motivo | `tests/components/FallidosMasivo.test.tsx` | APROBADO | U3_unitarias.xml | Fallidos del registro masivo (WEB-06, cobertura D-WEB-13) |
| UT-WEB-EXTRA-139 | FallidosMasivo (WEB-06) > con un solo fallido el texto va en singular | `tests/components/FallidosMasivo.test.tsx` | APROBADO | U3_unitarias.xml | Fallidos del registro masivo (WEB-06, cobertura D-WEB-13) |
| UT-WEB-EXTRA-140 | FallidosMasivo (WEB-06) > Reintentar y Descartar avisan al llamador | `tests/components/FallidosMasivo.test.tsx` | APROBADO | U3_unitarias.xml | Fallidos del registro masivo (WEB-06, cobertura D-WEB-13) |
| UT-WEB-EXTRA-141 | FallidosMasivo (WEB-06) > mientras se reenvía, los dos botones están deshabilitados | `tests/components/FallidosMasivo.test.tsx` | APROBADO | U3_unitarias.xml | Fallidos del registro masivo (WEB-06, cobertura D-WEB-13) |
| UT-WEB-04 | HorariosViewerClient (WEB-03 · horario del estudiante asociado) > con error muestra el mensaje y un botón de reintentar, no una pantalla vacía | `tests/components/HorariosViewerClient.test.tsx` | APROBADO | U3_unitarias.xml | WEB-03 · horario del estudiante asociado |
| UT-WEB-04 | HorariosViewerClient (WEB-03 · horario del estudiante asociado) > reintentar vuelve a pedir los datos al servidor | `tests/components/HorariosViewerClient.test.tsx` | APROBADO | U3_unitarias.xml | WEB-03 · horario del estudiante asociado |
| UT-WEB-04 | HorariosViewerClient (WEB-03 · horario del estudiante asociado) > sin error y sin curso avisa que el estudiante no tiene curso | `tests/components/HorariosViewerClient.test.tsx` | APROBADO | U3_unitarias.xml | WEB-03 · horario del estudiante asociado |
| UT-WEB-04 | HorariosViewerClient (WEB-03 · horario del estudiante asociado) > con bloques muestra la grilla del curso | `tests/components/HorariosViewerClient.test.tsx` | APROBADO | U3_unitarias.xml | WEB-03 · horario del estudiante asociado |
| UT-WEB-08 | NotasViewerClient (WEB-09) > con rol padre aparece «Descargar boletín» y llama downloadBoletinPdf con el id del hijo | `tests/components/NotasViewerClient.test.tsx` | APROBADO | U3_unitarias.xml | WEB-09 · boletín y mensajes |
| UT-WEB-08 | NotasViewerClient (WEB-09) > al elegir un periodo sin notas muestra el texto exacto del criterio de aceptación | `tests/components/NotasViewerClient.test.tsx` | APROBADO | U3_unitarias.xml | WEB-09 · boletín y mensajes |
| UT-WEB-08 | NotasViewerClient (WEB-09) > un periodo con notas no muestra el mensaje de periodo vacío | `tests/components/NotasViewerClient.test.tsx` | APROBADO | U3_unitarias.xml | WEB-09 · boletín y mensajes |
| UT-WEB-08 | NotasViewerClient (WEB-09) > si el boletín no tiene datos muestra el mensaje de la API con notifyError | `tests/components/NotasViewerClient.test.tsx` | APROBADO | U3_unitarias.xml | WEB-09 · boletín y mensajes |
| UT-WEB-08 | NotasViewerClient (WEB-09) > sin estudiante asociado no ofrece el boletín | `tests/components/NotasViewerClient.test.tsx` | APROBADO | U3_unitarias.xml | WEB-09 · boletín y mensajes |
| UT-WEB-06 | WEB-05 · PasswordChecklist (reglas en vivo) > con Colegio2026 la regla «Un carácter especial» aparece como pendiente | `tests/components/PasswordChecklist.test.tsx` | APROBADO | U3_unitarias.xml | WEB-05 · reglas en vivo |
| UT-WEB-06 | WEB-05 · PasswordChecklist (reglas en vivo) > con Colegio#2026 las cinco reglas aparecen cumplidas | `tests/components/PasswordChecklist.test.tsx` | APROBADO | U3_unitarias.xml | WEB-05 · reglas en vivo |
| UT-WEB-06 | WEB-05 · PasswordChecklist (reglas en vivo) > anuncia los cambios con aria-live | `tests/components/PasswordChecklist.test.tsx` | APROBADO | U3_unitarias.xml | WEB-05 · reglas en vivo |
| UT-WEB-06 | WEB-05 · PasswordChecklist (reglas en vivo) > con ocultarSiVacio no dibuja nada mientras el campo está vacío | `tests/components/PasswordChecklist.test.tsx` | APROBADO | U3_unitarias.xml | WEB-05 · reglas en vivo |
| UT-WEB-06 | WEB-05 · página reset-password > el botón está deshabilitado con Colegio2026 y habilitado con Colegio#2026 confirmada | `tests/components/PasswordChecklist.test.tsx` | APROBADO | U3_unitarias.xml | WEB-05 · reglas en vivo |
| UT-WEB-06 | WEB-05 · página reset-password > deshabilitado si las contraseñas no coinciden | `tests/components/PasswordChecklist.test.tsx` | APROBADO | U3_unitarias.xml | WEB-05 · reglas en vivo |
| UT-WEB-07 | RegistroMasivo (WEB-06) > lista a cada fallido por nombre con los botones Reintentar y Descartar | `tests/components/RegistroMasivo.test.tsx` | APROBADO | U3_unitarias.xml | WEB-06 · registro masivo |
| UT-WEB-07 | RegistroMasivo (WEB-06) > Reintentar reenvía solo al estudiante fallido | `tests/components/RegistroMasivo.test.tsx` | APROBADO | U3_unitarias.xml | WEB-06 · registro masivo |
| UT-WEB-07 | RegistroMasivo (WEB-06) > Descartar quita al fallido de la lista sin llamar a la API | `tests/components/RegistroMasivo.test.tsx` | APROBADO | U3_unitarias.xml | WEB-06 · registro masivo |
| UT-WEB-07 | RegistroMasivo (WEB-06) > cuando todos ya estaban registrados dice «ya registrado» y no ofrece reintentar | `tests/components/RegistroMasivo.test.tsx` | APROBADO | U3_unitarias.xml | WEB-06 · registro masivo |
| UT-WEB-04 | SelectorHijo (WEB-03) > con un solo hijo no se ve | `tests/components/SelectorHijo.test.tsx` | APROBADO | U3_unitarias.xml | WEB-03 · varios hijos |
| UT-WEB-04 | SelectorHijo (WEB-03) > con dos hijos se ve y al elegir el segundo cambia ?hijo= | `tests/components/SelectorHijo.test.tsx` | APROBADO | U3_unitarias.xml | WEB-03 · varios hijos |
| UT-WEB-04 | SelectorHijo (WEB-03) > muestra al hijo activo como seleccionado | `tests/components/SelectorHijo.test.tsx` | APROBADO | U3_unitarias.xml | WEB-03 · varios hijos |
| UT-WEB-04 | SelectorHijo (WEB-03) > conserva los demás parámetros de la URL | `tests/components/SelectorHijo.test.tsx` | APROBADO | U3_unitarias.xml | WEB-03 · varios hijos |
| UT-WEB-EXTRA-142 | carga inicial de los hooks de pantalla > useReportes > sin datos del servidor pide los datos una sola vez y apaga loading | `tests/hooks/cargaInicial.test.tsx` | APROBADO | U3_unitarias.xml | Carga inicial de los hooks (arreglos de SonarQube, D-WEB-14) |
| UT-WEB-EXTRA-143 | carga inicial de los hooks de pantalla > useReportes > con datos del servidor no vuelve a pedirlos | `tests/hooks/cargaInicial.test.tsx` | APROBADO | U3_unitarias.xml | Carga inicial de los hooks (arreglos de SonarQube, D-WEB-14) |
| UT-WEB-EXTRA-144 | carga inicial de los hooks de pantalla > useReportes > si la carga falla, el mensaje queda en error y loading se apaga | `tests/hooks/cargaInicial.test.tsx` | APROBADO | U3_unitarias.xml | Carga inicial de los hooks (arreglos de SonarQube, D-WEB-14) |
| UT-WEB-EXTRA-145 | carga inicial de los hooks de pantalla > useNotas > sin datos del servidor pide los datos una sola vez y apaga loading | `tests/hooks/cargaInicial.test.tsx` | APROBADO | U3_unitarias.xml | Carga inicial de los hooks (arreglos de SonarQube, D-WEB-14) |
| UT-WEB-EXTRA-146 | carga inicial de los hooks de pantalla > useNotas > con datos del servidor no vuelve a pedirlos | `tests/hooks/cargaInicial.test.tsx` | APROBADO | U3_unitarias.xml | Carga inicial de los hooks (arreglos de SonarQube, D-WEB-14) |
| UT-WEB-EXTRA-147 | carga inicial de los hooks de pantalla > useNotas > si la carga falla, el mensaje queda en error y loading se apaga | `tests/hooks/cargaInicial.test.tsx` | APROBADO | U3_unitarias.xml | Carga inicial de los hooks (arreglos de SonarQube, D-WEB-14) |
| UT-WEB-EXTRA-148 | carga inicial de los hooks de pantalla > useUsuarios > sin datos del servidor pide los datos una sola vez y apaga loading | `tests/hooks/cargaInicial.test.tsx` | APROBADO | U3_unitarias.xml | Carga inicial de los hooks (arreglos de SonarQube, D-WEB-14) |
| UT-WEB-EXTRA-149 | carga inicial de los hooks de pantalla > useUsuarios > con datos del servidor no vuelve a pedirlos | `tests/hooks/cargaInicial.test.tsx` | APROBADO | U3_unitarias.xml | Carga inicial de los hooks (arreglos de SonarQube, D-WEB-14) |
| UT-WEB-EXTRA-150 | carga inicial de los hooks de pantalla > useUsuarios > si la carga falla, el mensaje queda en error y loading se apaga | `tests/hooks/cargaInicial.test.tsx` | APROBADO | U3_unitarias.xml | Carga inicial de los hooks (arreglos de SonarQube, D-WEB-14) |
| UT-WEB-EXTRA-151 | carga inicial de los hooks de pantalla > useAsistencia > sin datos del servidor pide los datos una sola vez y apaga loading | `tests/hooks/cargaInicial.test.tsx` | APROBADO | U3_unitarias.xml | Carga inicial de los hooks (arreglos de SonarQube, D-WEB-14) |
| UT-WEB-EXTRA-152 | carga inicial de los hooks de pantalla > useAsistencia > con datos del servidor no vuelve a pedirlos | `tests/hooks/cargaInicial.test.tsx` | APROBADO | U3_unitarias.xml | Carga inicial de los hooks (arreglos de SonarQube, D-WEB-14) |
| UT-WEB-EXTRA-153 | carga inicial de los hooks de pantalla > useAsistencia > si la carga falla, el mensaje queda en error y loading se apaga | `tests/hooks/cargaInicial.test.tsx` | APROBADO | U3_unitarias.xml | Carga inicial de los hooks (arreglos de SonarQube, D-WEB-14) |
| UT-WEB-EXTRA-154 | carga inicial de los hooks de pantalla > useHorarios > sin datos del servidor pide los datos una sola vez y apaga loading | `tests/hooks/cargaInicial.test.tsx` | APROBADO | U3_unitarias.xml | Carga inicial de los hooks (arreglos de SonarQube, D-WEB-14) |
| UT-WEB-EXTRA-155 | carga inicial de los hooks de pantalla > useHorarios > con datos del servidor no vuelve a pedirlos | `tests/hooks/cargaInicial.test.tsx` | APROBADO | U3_unitarias.xml | Carga inicial de los hooks (arreglos de SonarQube, D-WEB-14) |
| UT-WEB-EXTRA-156 | carga inicial de los hooks de pantalla > useHorarios > si la carga falla, el mensaje queda en error y loading se apaga | `tests/hooks/cargaInicial.test.tsx` | APROBADO | U3_unitarias.xml | Carga inicial de los hooks (arreglos de SonarQube, D-WEB-14) |
| UT-WEB-01 | UT-WEB-01 · usePermissions (WEB-04) > admin: el hook devuelve lo mismo que PERMISSIONS para cada recurso y acción | `tests/hooks/usePermissions.test.tsx` | APROBADO | U3_unitarias.xml | WEB-INF-1 · entorno |
| UT-WEB-01 | UT-WEB-01 · usePermissions (WEB-04) > docente: el hook devuelve lo mismo que PERMISSIONS para cada recurso y acción | `tests/hooks/usePermissions.test.tsx` | APROBADO | U3_unitarias.xml | WEB-INF-1 · entorno |
| UT-WEB-01 | UT-WEB-01 · usePermissions (WEB-04) > estudiante: el hook devuelve lo mismo que PERMISSIONS para cada recurso y acción | `tests/hooks/usePermissions.test.tsx` | APROBADO | U3_unitarias.xml | WEB-INF-1 · entorno |
| UT-WEB-01 | UT-WEB-01 · usePermissions (WEB-04) > padre: el hook devuelve lo mismo que PERMISSIONS para cada recurso y acción | `tests/hooks/usePermissions.test.tsx` | APROBADO | U3_unitarias.xml | WEB-INF-1 · entorno |
| UT-WEB-01 | UT-WEB-01 · usePermissions (WEB-04) > docente no puede borrar asistencia | `tests/hooks/usePermissions.test.tsx` | APROBADO | U3_unitarias.xml | WEB-INF-1 · entorno |
| UT-WEB-01 | UT-WEB-01 · usePermissions (WEB-04) > docente puede crear asistencia | `tests/hooks/usePermissions.test.tsx` | APROBADO | U3_unitarias.xml | WEB-INF-1 · entorno |
| UT-WEB-01 | UT-WEB-01 · usePermissions (WEB-04) > padre no puede crear usuarios | `tests/hooks/usePermissions.test.tsx` | APROBADO | U3_unitarias.xml | WEB-INF-1 · entorno |
| UT-WEB-01 | UT-WEB-01 · usePermissions (WEB-04) > sin rol no puede nada | `tests/hooks/usePermissions.test.tsx` | APROBADO | U3_unitarias.xml | WEB-INF-1 · entorno |
| UT-WEB-EXTRA-157 | Servicios · reportesService > fileUrl: vacío, absoluta y relativa | `tests/services/reportesService.test.tsx` | APROBADO | U3_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-158 | Servicios · reportesService > validarArchivoReporte rechaza el formato y el tamaño | `tests/services/reportesService.test.tsx` | APROBADO | U3_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-159 | Servicios · reportesService > getReportes mapea a camelCase; con lista vacía devuelve [] | `tests/services/reportesService.test.tsx` | APROBADO | U3_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-160 | Servicios · reportesService > crear, actualizar y borrar un reporte | `tests/services/reportesService.test.tsx` | APROBADO | U3_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-161 | Servicios · reportesService > downloadReporteArchivo lanza con el detail si la API responde error | `tests/services/reportesService.test.tsx` | APROBADO | U3_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-162 | Servicios · reportesService > downloadReporteArchivo descarga con el nombre del Content-Disposition | `tests/services/reportesService.test.tsx` | APROBADO | U3_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-163 | Servicios · themeService > lee el tema guardado y, sin nada guardado, el preferido del sistema | `tests/services/reportesService.test.tsx` | APROBADO | U3_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-164 | Servicios · themeService > applyTheme pone la clase dark y persiste | `tests/services/reportesService.test.tsx` | APROBADO | U3_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |

### 5.2 Integración / contrato contra QA · 9 casos ejecutados

Fuente: `evidencias/PR-05/web/I2_integracion.xml` (03/11/2026 15:18 UTC). Ninguno quedó omitido: los 9 se ejecutaron contra la API de QA.

| ID del caso | Nombre del test | Archivo | Resultado | Evidencia | Observación |
|---|---|---|---|---|---|
| IT-WEB-03 | IT-WEB-03 · contrato de lectura por rol > admin: usuarios, asistencia del día y reportes | `tests/integration/contrato-api.int.test.ts` | BLOQUEADO | I2_integracion.xml | BLOQUEADO por DEF-WEB-01 — Login de admin falló: HTTP 500 |
| IT-WEB-03 | IT-WEB-03 · contrato de lectura por rol > docente: notas, novedades, horarios y asignaciones | `tests/integration/contrato-api.int.test.ts` | BLOQUEADO | I2_integracion.xml | BLOQUEADO por DEF-WEB-01 — Login de docente falló: HTTP 500 |
| IT-WEB-03 | IT-WEB-03 · contrato de lectura por rol > estudiante: notas, novedades y horario del estudiante asociado | `tests/integration/contrato-api.int.test.ts` | BLOQUEADO | I2_integracion.xml | BLOQUEADO por DEF-WEB-01 — Login de estudiante falló: HTTP 500 |
| IT-WEB-03 | IT-WEB-03 · contrato de lectura por rol > padre: notas, novedades y horario del estudiante asociado | `tests/integration/contrato-api.int.test.ts` | BLOQUEADO | I2_integracion.xml | BLOQUEADO por DEF-WEB-01 — Login de padre falló: HTTP 500 |
| IT-WEB-04 | IT-WEB-04 · inicio del estudiante (BE-03) > GET /dashboard/estudiante responde 200 y el inicio carga | `tests/integration/contrato-api.int.test.ts` | BLOQUEADO | I2_integracion.xml | BLOQUEADO por DEF-WEB-01 — Login de estudiante falló: HTTP 500 |
| IT-WEB-05 | IT-WEB-05 · errores reales de la API llegan como mensaje > 401: sin token | `tests/integration/contrato-api.int.test.ts` | APROBADO | I2_integracion.xml | No necesita base de datos |
| IT-WEB-05 | IT-WEB-05 · errores reales de la API llegan como mensaje > 403: un padre pide la lista de usuarios | `tests/integration/contrato-api.int.test.ts` | BLOQUEADO | I2_integracion.xml | BLOQUEADO por DEF-WEB-01 — Login de padre falló: HTTP 500 |
| IT-WEB-05 | IT-WEB-05 · errores reales de la API llegan como mensaje > 404: un recurso que no existe | `tests/integration/contrato-api.int.test.ts` | BLOQUEADO | I2_integracion.xml | BLOQUEADO por DEF-WEB-01 — Login de admin falló: HTTP 500 |
| IT-WEB-05 | IT-WEB-05 · errores reales de la API llegan como mensaje > 422: cuerpo inválido, con el primer mensaje de validación | `tests/integration/contrato-api.int.test.ts` | BLOQUEADO | I2_integracion.xml | BLOQUEADO por DEF-WEB-01 — Login de admin falló: HTTP 500 |

### 5.3 E2E ejecutados · 10 ejecuciones (9 casos en Chromium, 1 en Firefox)

Dos corridas: el humo de inicio de sesión del 03/11 (`E1_humo-login.xml`, Chromium) y el guardia de rutas del 05/11 (`E2_guardia-rutas.xml`, Chromium y Firefox).

**El único caso APROBADO** es el guardia de rutas, porque es el único de los 24 que no necesita iniciar sesión:

| CP-SIS que cubre | Nombre del test | Spec (navegador) | Resultado | Evidencia | Observación |
|---|---|---|---|---|---|
| CP-SIS-004 (parte: guardia de rutas, WEB-01) | una ruta del panel sin sesión pide iniciar sesión | `e2e/sesion.spec.ts` (chromium) | **APROBADO** | E2_guardia-rutas.xml | Comprueba las 8 rutas del panel: `/usuarios`, `/reportes`, `/notas`, `/asistencia`, `/novedades`, `/horarios`, `/perfil` y `/qr`. 49,6 s |
| CP-SIS-004 (parte: guardia de rutas, WEB-01) | una ruta del panel sin sesión pide iniciar sesión | `e2e/sesion.spec.ts` (firefox) | **APROBADO** | E2_guardia-rutas.xml | Mismas 8 rutas. 53,1 s |

Los 8 del humo de inicio de sesión siguen bloqueados:

| CP-SIS que cubre | Nombre del test | Spec (navegador) | Resultado | Evidencia | Observación |
|---|---|---|---|---|---|
| CP-SIS-001 / CP-SIS-006 | inicio de sesión · admin › el admin llega a su inicio con los datos cargados | `e2e/login-roles.spec.ts` (chromium) | BLOQUEADO | E1_humo-login.xml | Falla por DEF-WEB-01: el inicio de sesión no pasa de `/?login=1` |
| CP-SIS-001 / CP-SIS-006 | inicio de sesión · admin › el menú del admin solo trae los módulos de su rol | `e2e/login-roles.spec.ts` (chromium) | BLOQUEADO | E1_humo-login.xml | Falla por DEF-WEB-01: el inicio de sesión no pasa de `/?login=1` |
| CP-SIS-001 / CP-SIS-006 | inicio de sesión · docente › el docente llega a su inicio con los datos cargados | `e2e/login-roles.spec.ts` (chromium) | BLOQUEADO | E1_humo-login.xml | Error de la prueba por DEF-WEB-01: el inicio de sesión no pasa de `/?login=1` |
| CP-SIS-001 / CP-SIS-006 | inicio de sesión · docente › el menú del docente solo trae los módulos de su rol | `e2e/login-roles.spec.ts` (chromium) | BLOQUEADO | E1_humo-login.xml | Error de la prueba por DEF-WEB-01: el inicio de sesión no pasa de `/?login=1` |
| CP-SIS-001 / CP-SIS-006 | inicio de sesión · estudiante › el estudiante llega a su inicio con los datos cargados | `e2e/login-roles.spec.ts` (chromium) | BLOQUEADO | E1_humo-login.xml | Error de la prueba por DEF-WEB-01: el inicio de sesión no pasa de `/?login=1` |
| CP-SIS-001 / CP-SIS-006 | inicio de sesión · estudiante › el menú del estudiante solo trae los módulos de su rol | `e2e/login-roles.spec.ts` (chromium) | BLOQUEADO | E1_humo-login.xml | Falla por DEF-WEB-01: el inicio de sesión no pasa de `/?login=1` |
| CP-SIS-001 / CP-SIS-006 | inicio de sesión · padre › el padre llega a su inicio con los datos cargados | `e2e/login-roles.spec.ts` (chromium) | BLOQUEADO | E1_humo-login.xml | Error de la prueba por DEF-WEB-01: el inicio de sesión no pasa de `/?login=1` |
| CP-SIS-001 / CP-SIS-006 | inicio de sesión · padre › el menú del padre solo trae los módulos de su rol | `e2e/login-roles.spec.ts` (chromium) | BLOQUEADO | E1_humo-login.xml | Falla por DEF-WEB-01: el inicio de sesión no pasa de `/?login=1` |

### 5.4 E2E enumerados y no ejecutados · 24 casos distintos (48 con los dos navegadores)

Fuente: `evidencias/PR-06/web/E0_listado-specs.xml`, que es la salida de `playwright test --list` y **no** una corrida.

| CP-SIS que cubre | Nombre del test | Spec | Resultado | Evidencia | Observación |
|---|---|---|---|---|---|
| CP-SIS-051, CP-SIS-054 | boletín del padre (WEB-09) › el padre descarga un PDF | `e2e/boletin-padre.spec.ts` | NO EJECUTADO | E0_listado-specs.xml | chromium y firefox.  |
| CP-SIS-051, CP-SIS-054 | boletín del padre (WEB-09) › un periodo sin notas muestra el texto exacto del criterio de aceptación | `e2e/boletin-padre.spec.ts` | NO EJECUTADO | E0_listado-specs.xml | chromium y firefox.  |
| CP-SIS-001, CP-SIS-006 | inicio de sesión · admin › el admin llega a su inicio con los datos cargados | `e2e/login-roles.spec.ts` | BLOQUEADO (corrido en Chromium) | E0_listado-specs.xml | chromium y firefox.  |
| CP-SIS-001, CP-SIS-006 | inicio de sesión · admin › el menú del admin solo trae los módulos de su rol | `e2e/login-roles.spec.ts` | BLOQUEADO (corrido en Chromium) | E0_listado-specs.xml | chromium y firefox.  |
| CP-SIS-001, CP-SIS-006 | inicio de sesión · docente › el docente llega a su inicio con los datos cargados | `e2e/login-roles.spec.ts` | BLOQUEADO (corrido en Chromium) | E0_listado-specs.xml | chromium y firefox.  |
| CP-SIS-001, CP-SIS-006 | inicio de sesión · docente › el menú del docente solo trae los módulos de su rol | `e2e/login-roles.spec.ts` | BLOQUEADO (corrido en Chromium) | E0_listado-specs.xml | chromium y firefox.  |
| CP-SIS-001, CP-SIS-006 | inicio de sesión · estudiante › el estudiante llega a su inicio con los datos cargados | `e2e/login-roles.spec.ts` | BLOQUEADO (corrido en Chromium) | E0_listado-specs.xml | chromium y firefox.  |
| CP-SIS-001, CP-SIS-006 | inicio de sesión · estudiante › el menú del estudiante solo trae los módulos de su rol | `e2e/login-roles.spec.ts` | BLOQUEADO (corrido en Chromium) | E0_listado-specs.xml | chromium y firefox.  |
| CP-SIS-001, CP-SIS-006 | inicio de sesión · padre › el menú del padre solo trae los módulos de su rol | `e2e/login-roles.spec.ts` | BLOQUEADO (corrido en Chromium) | E0_listado-specs.xml | chromium y firefox.  |
| CP-SIS-001, CP-SIS-006 | inicio de sesión · padre › el padre llega a su inicio con los datos cargados | `e2e/login-roles.spec.ts` | BLOQUEADO (corrido en Chromium) | E0_listado-specs.xml | chromium y firefox.  |
| CP-SIS-060 | el padre de prueba cambia de hijo y cambian notas, asistencia y novedades | `e2e/padre-dos-hijos.spec.ts` | NO EJECUTADO | E0_listado-specs.xml | chromium y firefox. **Falla esperada** (`test.fail`) mientras `E2E_BE07` no sea `true`: NO cuenta como aprobado |
| CP-SIS-060 | un padre con un solo hijo no ve el selector | `e2e/padre-dos-hijos.spec.ts` | NO EJECUTADO | E0_listado-specs.xml | chromium y firefox. **Falla esperada** (`test.fail`) mientras `E2E_BE07` no sea `true`: NO cuenta como aprobado |
| CP-SIS-037, 038, 039, 041 | registro masivo (WEB-06) › con la red cortada, los fallidos se listan por nombre con Reintentar y Descartar | `e2e/registro-masivo.spec.ts` | NO EJECUTADO | E0_listado-specs.xml | chromium y firefox. El caso «todos salen ya registrado» es **falla esperada** (`test.fail`) mientras `E2E_BE08` no sea `true` |
| CP-SIS-037, 038, 039, 041 | registro masivo (WEB-06) › la segunda vez con el mismo curso, todos salen «ya registrado» | `e2e/registro-masivo.spec.ts` | NO EJECUTADO | E0_listado-specs.xml | chromium y firefox. El caso «todos salen ya registrado» es **falla esperada** (`test.fail`) mientras `E2E_BE08` no sea `true` |
| CP-SIS-014 | el padre que se registra ve los datos de su hijo vinculado | `e2e/registro-padre.spec.ts` | NO EJECUTADO | E0_listado-specs.xml | chromium y firefox.  |
| CP-SIS-004, CP-SIS-065 | sesión (WEB-01) › a escala (QA con SESSION_IDLE_MINUTES=1) › 70 s sin actividad cierran la sesión (equivale a los 31 min de la regla real) | `e2e/sesion.spec.ts` | NO EJECUTADO | E0_listado-specs.xml | chromium y firefox. Los dos casos «a escala» necesitan `E2E_SESSION_IDLE_MINUTES=1` (D-WEB-07); sin eso quedan BLOQUEADOS |
| CP-SIS-004, CP-SIS-065 | sesión (WEB-01) › a escala (QA con SESSION_IDLE_MINUTES=1) › una sesión usada durante 4 minutos con actividad cada 15 s sigue funcionando (CP-SIS-065) | `e2e/sesion.spec.ts` | NO EJECUTADO | E0_listado-specs.xml | chromium y firefox. Los dos casos «a escala» necesitan `E2E_SESSION_IDLE_MINUTES=1` (D-WEB-07); sin eso quedan BLOQUEADOS |
| CP-SIS-004, CP-SIS-065 | sesión (WEB-01) › con 31 minutos sin actividad se cierra la sesión y vuelve al inicio de sesión | `e2e/sesion.spec.ts` | NO EJECUTADO | E0_listado-specs.xml | chromium y firefox. Los dos casos «a escala» necesitan `E2E_SESSION_IDLE_MINUTES=1` (D-WEB-07); sin eso quedan BLOQUEADOS |
| CP-SIS-004, CP-SIS-065 | sesión (WEB-01) › con el acceso vencido y un refresco válido la sesión se renueva sola | `e2e/sesion.spec.ts` | NO EJECUTADO | E0_listado-specs.xml | chromium y firefox. Los dos casos «a escala» necesitan `E2E_SESSION_IDLE_MINUTES=1` (D-WEB-07); sin eso quedan BLOQUEADOS |
| CP-SIS-004, CP-SIS-065 | sesión (WEB-01) › el token de acceso no se puede leer desde JavaScript | `e2e/sesion.spec.ts` | NO EJECUTADO | E0_listado-specs.xml | chromium y firefox. Los dos casos «a escala» necesitan `E2E_SESSION_IDLE_MINUTES=1` (D-WEB-07); sin eso quedan BLOQUEADOS |
| CP-SIS-004, CP-SIS-065 | una ruta del panel sin sesión pide iniciar sesión | `e2e/sesion.spec.ts` | NO EJECUTADO | E0_listado-specs.xml | chromium y firefox. Los dos casos «a escala» necesitan `E2E_SESSION_IDLE_MINUTES=1` (D-WEB-07); sin eso quedan BLOQUEADOS |
| CP-SIS-019, 021, 022, 025, 027, 028 | gestión de usuarios (admin) › crear con un campo vacío no guarda e indica el campo (CP-SIS-021) | `e2e/usuarios.spec.ts` | NO EJECUTADO | E0_listado-specs.xml | chromium y firefox.  |
| CP-SIS-019, 021, 022, 025, 027, 028 | gestión de usuarios (admin) › crear, filtrar, editar y eliminar un docente de prueba | `e2e/usuarios.spec.ts` | NO EJECUTADO | E0_listado-specs.xml | chromium y firefox.  |
| CP-SIS-019, 021, 022, 025, 027, 028 | gestión de usuarios (admin) › un filtro sin coincidencias muestra un mensaje informativo (CP-SIS-028) | `e2e/usuarios.spec.ts` | NO EJECUTADO | E0_listado-specs.xml | chromium y firefox.  |


### 5.5 Casos de la planeación sin prueba automatizada

| Grupo | Situación | Fuente |
|---|---|---|
| CP-SIS del frontend | La planeación de sistema define **65 casos CP-SIS**; los specs de Playwright cubren **15** de forma explícita (CP-SIS-001, 004, 006, 014, 019, 021, 022, 025, 027, 028, 037, 051, 054, 060, 065) | [`planeacion/tests/Sistema/planeacion-pruebas-sistema-frontend-web.md`, `grep CP-SIS e2e/`] |
| Los otros 50 CP-SIS | **NO DISPONIBLE** su reparto exacto entre «prueba manual» y «sin cubrir»: la planeación de sistema no marca una columna de automatización y este informe no la inventa. Hay que mirarlos uno a uno en ese documento | — |
| CP-SIS-038, 039, 041 | Cubiertos dentro de `registro-masivo.spec.ts` (sin una prueba por caso) | [`e2e/registro-masivo.spec.ts`] |
| CP-SIS-096, CP-SIS-098 | Sin spec propio; los vigilan las unitarias de rutas (`tests/routeRoles.test.ts`) por decisión D-WEB-01 | [`docs/decisiones-qa.md`, D-WEB-01] |
| CP-NF-012, CP-NF-013 | No automatizados. CP-NF-012 queda cubierto por gitleaks en el CI; CP-NF-013 por las unitarias de cookies y proxy | [`.github/workflows/ci.yml`, `tests/authCookies.test.ts`, `tests/apiProxy.test.ts`] |
| CP-INT-040, 062, 076 | Mencionados en la planeación de integración; **sin prueba automatizada en el frontend**. CP-INT-060 sí la tiene (IT-WEB-04) | [`tests/trazabilidad.json`, planeación de integración] |
| Pruebas manuales (24 casos) | Todas NO EJECUTADAS, ver sección 14 | [`docs/pruebas-manuales-pr06-web.md`] |

---

## 6. TRAZABILIDAD

Resultado de `npm run trazabilidad`, tal como lo dejó el script [`docs/trazabilidad-ut-web.md`, generado el 03/11/2026]:

| Grupo | Resultado |
|---|---|
| UT-WEB-01 a 08 (planeadas, PR-04) | **126 de 126 pasan** |
| UT-WEB-EXTRA (no planeadas) | **164 de 164 pasan** |
| IT-WEB-01 a 05 (contrato, PR-05) | **12 de 21 pasan** · «Omitida» = necesita `QA_API_URL` |

Total mapeado: **311 pruebas** (126 UT + 164 extra + 21 IT) [salida de `node scripts/trazabilidad.mjs`].

### 6.1 Correcciones del frontend con y sin prueba

El frontend tiene **12 correcciones** definidas (no existe WEB-07): WEB-01 a WEB-06, WEB-08, WEB-09 y WEB-INF-1 a WEB-INF-4 [`planeacion/tests/Especificaciones/planeacion-frontend-web.md`].

| Corrección | ¿Tiene regla en `tests/trazabilidad.json`? | ID y pruebas |
|---|---|---|
| WEB-01 · sesión y rutas | **Sí** | UT-WEB-02 — `tests/routeGuard.test.ts`, `tests/routeRoles.test.ts` |
| WEB-02 · cookies y proxy | **Sí** | UT-WEB-03 — `tests/authCookies.test.ts`, `tests/decodeRol.test.ts`, `tests/apiClient.test.ts`, `tests/apiProxy.test.ts` |
| WEB-03 · varios hijos | **Sí** | UT-WEB-04 e IT-WEB-02 — `tests/hijoActivo.test.ts`, `tests/components/SelectorHijo.test.tsx`, `tests/components/HorariosViewerClient.test.tsx`, `tests/asociadoActions.test.ts` |
| WEB-04 · permisos | **Sí** | UT-WEB-05 e IT-WEB-01 — `tests/permissions.test.ts` |
| WEB-05 · contraseña | **Sí** | UT-WEB-06 — `tests/resetPassword.test.ts`, `tests/components/PasswordChecklist.test.tsx` |
| WEB-06 · registro masivo | **Sí** | UT-WEB-07 — `tests/registroMasivo.test.ts`, `tests/components/RegistroMasivo.test.tsx` |
| WEB-09 · boletín y mensajes | **Sí** | UT-WEB-08 — `tests/components/NotasViewerClient.test.tsx`, `tests/notasService.test.ts` |
| WEB-INF-1 · entorno de pruebas | **Sí** | UT-WEB-01 — `tests/hooks/usePermissions.test.tsx` |
| WEB-08 · fuera Supabase y 0 advertencias | **No** tiene regla propia | La vigilan `tests/arquitectura.test.ts` («ya no existe src/services/supabase») y el lint en 0 advertencias, pero quedan clasificadas como UT-WEB-EXTRA |
| WEB-INF-2 · cobertura | **No** tiene regla propia | La vigilan los umbrales de `vitest.config.mts` y el paso `npm run test:cov` del CI |
| WEB-INF-3 · E2E con Playwright | **No** tiene regla propia | La vigila la existencia y ejecución de `e2e/*.spec.ts`; el script de trazabilidad solo lee Vitest, no Playwright |
| WEB-INF-4 · Sonar, gitleaks y un solo despliegue | **No** tiene regla propia | La vigilan `tests/arquitectura.test.ts` («hay un solo despliegue») y los pasos de gitleaks y Sonar del CI |

**Resumen: 8 de las 12 correcciones tienen al menos una prueba mapeada con ID.** Las 4 restantes (WEB-08, WEB-INF-2, WEB-INF-3, WEB-INF-4) **no están sin probar**, pero su vigilancia no está mapeada en `tests/trazabilidad.json`: o la hace el CI, o cae en el grupo UT-WEB-EXTRA. Si el informe formal exige trazabilidad ID a ID, hay que agregarles una regla al mapa.

**Limitación del script:** `scripts/trazabilidad.mjs` solo lee los informes JSON de Vitest, así que **los E2E de Playwright no entran en `docs/trazabilidad-ut-web.md`**. La trazabilidad de los CP-SIS está en la sección 5.3 y 5.4 de este informe.

---

## 7. SONARQUBE

### 7.1 Estado del Quality Gate

| Ámbito | Estado | Fecha | Fuente |
|---|---|---|---|
| **Pull request #34** (commit `d251ae2`) | **Passed** | 03/11/2026 15:55:54 UTC | [check-run «SonarCloud Code Analysis»; `evidencias/PR-03/web/sonar-resumen.md`] |
| **Pull request #34** (commit `77d5629`, el de hoy) | **NO DISPONIBLE todavía**: el commit del 05/11 no se ha subido, así que el CI no lo ha analizado. Solo toca `e2e/` y `playwright.config.ts`, que `sonar.exclusions` deja fuera del análisis | — | [`sonar-project.properties`] |
| **Rama principal del proyecto** | **NONE** (nunca se ha analizado una rama, solo el PR) | — | [API `/api/qualitygates/project_status`, respuesta `{"status":"NONE"}`] |

Panel: `https://sonarcloud.io/dashboard?id=marianacortes0_proyecto-eyesschool&pullRequest=34`.

### 7.2 Medidas del código nuevo

Todas de [`evidencias/PR-03/web/sonar-resumen.md`], que a su vez las tomó de la API `/api/measures/component` del PR 34:

| Medida | Valor | Condición del gate |
|---|---|---|
| Cobertura del código nuevo | **86,2 %** (368 por cubrir, 32 sin cubrir) | ≥ 80 % ✔ |
| Issues nuevos (*code smells* incluidos) | **0** | 0 ✔ |
| Issues aceptados | 0 | — |
| Bugs nuevos | **0** | — |
| Vulnerabilidades nuevas | **0** | — |
| *Security hotspots* nuevos | **0** | 0 por revisar ✔ |
| Duplicación en código nuevo | **0,0 %** | ≤ 3 % ✔ |
| Reliability | **A** | A ✔ |
| Security | **A** | A ✔ |
| Maintainability | **A** | A ✔ |
| Líneas nuevas analizadas | 4 786 | — |

*Hotspots revisados:* 0 porque **no hay ninguno** en el código nuevo; no es que queden sin revisar.

### 7.3 Issues corregidos en esta rama

Los 9 que Sonar reportó en el PR, cada uno con su arreglo y su prueba [`docs/decisiones-qa.md`, D-WEB-14; commit `2252786`]:

| Archivo y línea | Regla | Arreglo | Prueba que lo vigila |
|---|---|---|---|
| `src/lib/utils/hijoActivo.ts:28` | `Prefer Number.NaN over NaN` | `Number.NaN` | `tests/hijoActivo.test.ts` |
| `src/app/api/proxy/[...path]/route.ts:16` | Regex con *backtracking* super-lineal | `quitarBarrasFinales()` recorre desde el final, sin regex | `tests/apiBase.test.ts` (incluye una entrada de 50 000 barras que debe tardar menos de 100 ms) |
| `src/app/api/proxy/[...path]/route.ts:14-15` | `'' ?? fallback` dejaba pasar la cadena vacía | `apiBase()` trata vacío y espacios como no definido y avisa nombrando `NEXT_PUBLIC_API_URL` | `tests/apiBase.test.ts` (`''`, `'   '`, `undefined`, `'sin-protocolo'`) |
| `src/hooks/useNotas.ts:77` | Promesa sin esperar | `void fetchAll()` | `tests/hooks/cargaInicial.test.tsx` |
| `src/hooks/useUsuarios.ts:100` | Promesa sin esperar | `void fetchBootstrap()` | ídem |
| `src/hooks/useReportes.ts:49` | Promesa sin esperar | `void fetchAll()` | ídem |
| `src/hooks/useAsistencia.ts:100` | Promesa sin esperar | `void fetchAll()` | ídem |
| `src/hooks/useHorarios.ts:112` | Promesa sin esperar | `void fetchAll()` | ídem |
| `src/app/(dashboard)/qr/escanear/EscanearClient.tsx:66 y 71` | Promesa sin esperar (2 issues) | `void fetchToday()` | ídem (los casos de fallo comprueban que `void` no esconde un rechazo) |

Además, de la misma regla de `Number.*` y sin que Sonar los hubiera listado: `isNaN`, `parseInt` y `parseFloat` en `src/auth/actions.ts` y `src/app/(dashboard)/notas/NotasClient.tsx`, con radio 10 explícito [commit `2252786`].

### 7.4 Issues dejados abiertos

**En el código nuevo: ninguno** (0 issues nuevos) [sección 7.2].

Lo que sí queda documentado y **no** es un issue de Sonar: las **25 excepciones de ESLint** (`eslint-disable`), con su motivo una por una [`docs/eslint-excepciones.md`, D-WEB-06]. Ninguna de las 25 está en archivos creados en esta rama; 22 aparecieron al pasar el CI a `--max-warnings=0`. `sonar-project.properties` no excluye nada por ellas.

**Ningún issue se marcó como *falso positivo* ni como *won't fix*, y ningún umbral se bajó** [D-WEB-13, D-WEB-14].

---

## 8. SEGURIDAD

### 8.1 gitleaks

gitleaks 8.21.2, **81 commits** analizados el 05/11/2026, informe con `--redact` [`evidencias/PR-03/web/gitleaks.json`].

| Hallazgo | Regla | Archivo | Línea | Commit | Fecha | Estado |
|---|---|---|---|---|---|---|
| 1 | `jwt` | `check-profs.js` | 5 | `b7e20f56` | 13/04/2026 | **Histórico, abierto** |
| 2 | `generic-api-key` | `diag.json` | 5 | `b7e20f56` | 13/04/2026 | **Histórico, abierto** |
| 3 | `jwt` | `setup-samuel.js` | 5 | `b7e20f56` | 13/04/2026 | **Histórico, abierto** |
| 4 | `jwt` | `diagnose-docente.js` | 6 | `b7e20f56` | 13/04/2026 | **Histórico, abierto** |

- **Hallazgos nuevos: 0.** Los cuatro están en un único commit del 13/04/2026, en archivos de diagnóstico que se revirtieron ese mismo día y hoy no existen en el árbol de trabajo [`git log --diff-filter=D`, D-WEB-09].
- Son claves del proyecto Supabase `odenqixjgsrgehnyllfn`. **Borrar los archivos no las invalida:** siguen abiertas hasta que se elimine o pause ese proyecto (acción externa 1, y defecto DEF-028 de la planeación).
- El valor de cada secreto aparece como `REDACTED` en el informe; **este documento no lo reproduce**.
- El CI corre `gitleaks/gitleaks-action@v2` en cada PR [`.github/workflows/ci.yml`].

### 8.2 npm audit

`npm audit --omit=dev --audit-level=high` → **`found 0 vulnerabilities`** [`evidencias/PR-03/web/npm-audit.txt`]. Desglose por severidad: **0 críticas, 0 altas, 0 medias, 0 bajas** en dependencias de producción (la salida no lista ninguna). El mismo paso corre en el CI y falla con cualquier vulnerabilidad alta o crítica [`.github/workflows/ci.yml`].

### 8.3 Estado de los archivos `.env`

| Archivo | ¿Versionado? | ¿Tiene valores secretos? | Fuente |
|---|---|---|---|
| `.env.example` | **Sí** | **No.** Solo nombres, con `NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1` (valor público de desarrollo), `SESSION_IDLE_MINUTES=30` y `RESEND_API_KEY=` vacío | [`git ls-files`, lectura del archivo] |
| `.env.test.example` | **Sí** | **No.** Correos del seed y URL de QA; `QA_PASSWORD=` vacío y un comentario que dice que se entrega por canal privado | [`git ls-files`, lectura del archivo] |
| `.env` | No (ignorado) | Está **vacío**: 0 bytes | [`git check-ignore`, `wc -c`] |
| `.env.test.local` | No (ignorado por la regla `.gitignore:34`) | Sí tiene la clave de QA; **no se transcribe nada de él en este informe** | [`git check-ignore -v`] |

Ningún `.env` con valores está versionado hoy ni estuvo en la historia: el único `.env*` que aparece en la historia es `.env.test.example` [`git log --all --diff-filter=A -- '*.env*'`, D-WEB-09]. `.gitignore` cubre `.env*` con las dos excepciones `!.env.example` y `!.env.test.example`.

En Netlify se omite del escaneo de secretos **solo** `NEXT_PUBLIC_API_URL`, que es pública por diseño porque Next la graba en el JavaScript del navegador; ninguna variable con un secreto real se agrega a esa lista [`netlify.toml`, D-WEB-09].

### 8.4 Proxy, cabeceras y restricciones (D-WEB-03)

Todas las reglas las vigila `tests/apiProxy.test.ts`, **17 casos, todos APROBADO** [`U3_unitarias.xml`].

| Restricción | Comportamiento | Prueba |
|---|---|---|
| Destino | Siempre bajo `${NEXT_PUBLIC_API_URL}/…`, construido con `new URL()` | `tests/apiProxy.test.ts` |
| Segmentos vacíos, `.`, `..`, `://`, `\` o codificados (`%2e%2e`, `%2f`) | **400** | ídem |
| Métodos | Solo GET, POST, PUT, PATCH y DELETE; cualquier otro **405** (OPTIONS y HEAD se exportan solo para responder 405) | ídem |
| Cuerpo mayor de 5 MB | **413** | ídem |
| Cabeceras que entran | Solo `content-type`, `accept` y `accept-language` | ídem |
| `Authorization` | Se añade en el servidor y **solo** desde la cookie `eys_access` (httpOnly) | ídem |
| Cabeceras que salen | Solo `content-type`, `content-disposition` y `content-length` | ídem |
| `Origin` ajeno en métodos con cuerpo | **403** (protección CSRF por cabecera `Origin`, sin token) | ídem |
| Sin cookie de sesión | **401**, sin llamar a la API | ídem |
| API caída | **502** con `{"detail":"No se pudo contactar el servidor."}` | ídem |

Cookies de sesión: `eys_access` es **httpOnly** desde WEB-02. El E2E que comprueba que no se puede leer desde JavaScript (`e2e/sesion.spec.ts`) sigue **NO EJECUTADO** por DEF-WEB-01, porque necesita iniciar sesión [`E0_listado-specs.xml`].

Guardia de rutas: **verificado el 05/11** en Chromium y Firefox. Sin sesión, las ocho rutas del panel acaban en `/?login=1` [`evidencias/PR-06/web/E2_guardia-rutas.xml`]. Observación de rendimiento, no de seguridad: en Netlify la redirección no es un 307 del guardia, sino una redirección de cliente que tarda varios segundos.

Cabeceras de seguridad HTTP de la web (CSP, HSTS, X-Frame-Options): **NO DISPONIBLE.** No hay evidencia de que se hayan revisado; el ZAP baseline que las vería está entre las pruebas manuales pendientes [`docs/pruebas-manuales-pr06-web.md`, sección 3].

---

## 9. DEFECTOS

### 9.1 Defectos abiertos detectados en esta jornada

| ID | Título | Severidad | Componente | Caso que lo detectó | Pasos | Esperado | Obtenido | Evidencia | Estado | Azure Boards |
|---|---|---|---|---|---|---|---|---|---|---|
| **DEF-WEB-01** | La API de QA no puede consultar su base de datos | **Alta** | **Backend** (API `apieyeschool-q`) | Preflight de la sección 2.3 de la planeación de cierre; bloquea IT-WEB-03/04/05 y los E2E | 1) `POST /api/v1/auth/login` con una cuenta del seed y su clave. 2) Igual con un correo inexistente. 3) `GET /api/v1/cursos` sin token. 4) `POST /api/v1/auth/login` sin el campo `password` | 1) 200 · 2) **401** · 3) 200 con los 10 cursos · 4) 422 | 1) **500** · 2) **500** · 3) **500** · 4) 422 (correcto) | `evidencias/PR-05/web/I1_preflight-qa.txt`, `docs/defectos/DEF-WEB-01.md`, `I2_integracion.xml`, `E1_humo-login.xml` | **Abierto** | **Sin registrar** (acción externa 11) |

**Por qué se concluye que es la base y no la aplicación:** un cuerpo inválido devuelve 422, así que la ruta y el esquema funcionan; pero un login con un usuario que **no existe** devuelve 500 en vez de 401, y ese 500 solo puede venir de la consulta a la base [`docs/defectos/DEF-WEB-01.md`].

### 9.2 Defectos de la planeación, ya corregidos en esta rama

De [`planeacion/tests/GestionDefectos/planeacion-gestion-defectos-frontend-web.md`]. Son los defectos que originaron las correcciones WEB-xx; su arreglo está en los commits de la rama y lo vigilan las pruebas de la sección 5.

| ID | Corrección | Título | Severidad | Caso que lo detectó | Estado |
|---|---|---|---|---|---|
| DEF-020 | WEB-01 | La sesión no se renueva, no se cierra por inactividad y el middleware solo protege `/admin` y `/general` | Alta (P2) | CP-SIS-004, CP-SIS-065 | Corregido (commit `2812cee`); CP-SIS-065 **sin verificar en E2E** |
| DEF-021 | WEB-02 | El token de acceso se lee desde JavaScript, las cookies no son `secure` y el rol sale de una cookie sin firma | Alta (P2) | CP-NF-013 | Corregido (commits `2812cee`, proxy endurecido) |
| DEF-022 | WEB-03 | La web solo conoce un hijo por padre | Alta (P2) | CP-SIS-060 | Corregido con respaldo (D-WEB-02); **CP-SIS-060 bloqueado por BE-07** |
| DEF-023 | WEB-04 | El docente ve la acción de borrar asistencia, que la API le niega | Media (P3) | CP-INT-076, CP-SIS-064 | Corregido (commit `66ea9b2`) |
| DEF-024 | WEB-05 | Restablecer la contraseña solo exige 8 caracteres | Alta (P2) | CP-SIS-017 | Corregido (commit `66ea9b2`) |
| DEF-025 | WEB-06 | El registro masivo no dice qué estudiantes fallaron ni deja reintentar | Media (P3) | CP-SIS-038, 039, 041 | Corregido (commit `04ac4d2`) |
| DEF-026 | WEB-08 | Código heredado de Supabase y 28 advertencias de ESLint | Baja (P4) | PR-03 | Corregido (commit `c2c21fd`); 25 excepciones documentadas (D-WEB-06) |
| DEF-027 | WEB-09 | El padre no puede descargar el boletín y los mensajes de notas no coinciden con los CA | Media (P3) | CP-SIS-051, 054, 055 | Corregido (commit `07f6310`); **E2E sin ejecutar** |
| DEF-028 | WEB-SA-3 | El historial de git conserva una clave `service_role` de Supabase (commit `b7e20f5`) | **Crítica (P1)** | CP-NF-012 | **Abierto.** Solo se cierra al eliminar el proyecto Supabase (acción externa 1); gitleaks lo sigue reportando |

Los ID de Azure Boards de DEF-020 a DEF-028: **NO DISPONIBLE** (la planeación no los registra y no hay acceso a Azure Boards desde aquí).

### 9.3 Lo que NO es defecto del producto

| Hecho | Causa | Qué es |
|---|---|---|
| Los 8 casos de integración y los 8 E2E «fallan» | DEF-WEB-01: la base de QA no responde | **Bloqueo de entorno.** En los XML salen como `failure`/`error` porque la herramienta no tiene estado «bloqueado» |
| Hoy toda la API devuelve 403 `This web app is stopped` | **Mariana pausó la Web App a propósito** | Pausa deliberada, no caída ni defecto |
| `/login` de la web devuelve 404 | El inicio de sesión es un modal sobre `/`, no una página | **Expectativa equivocada de la planeación de cierre**, no defecto de la web |
| `https://qaeyesschool.netlify.app` devuelve 404 | El contexto `develop` se publica al fusionar el PR #34 | Pendiente de despliegue |
| La integración fallaba con «Invalid URL» | A `QA_API_URL` en `.env.test.local` le faltaba el `https://` | **Error de configuración local**, corregido hoy (no se tocó ningún otro valor) |
| El login del padre devolvía 422 en la integración | No existía `E2E_PADRE_EMAIL`: la plantilla distingue `..._UN_HIJO_` de `..._DOS_HIJOS_` | **Defecto de la configuración de pruebas**, corregido en `tests/setup/loadEnvTest.ts` con el mismo alias que ya usaba `playwright.config.ts` (commit `b991e88`) |
| ESLint analizaba el reporte HTML de Playwright | `evidencias/**` no estaba en los ignorados de ESLint | **Defecto de configuración**, corregido en `eslint.config.mjs` (commit `8abe760`) |
| `/usuarios` sin sesión devuelve 200 por HTTP | En Netlify el guardia no responde con un 307: la ruta se renderiza y la redirección llega por el cliente | **No es defecto.** La redirección ocurre y el E2E del guardia pasa en los dos navegadores. Sí deja un aviso de rendimiento (tarda segundos) |
| El E2E del guardia de rutas fallaba el 05/11 | Tres causas de tiempos, ninguna de la web: `page.goto` esperaba el evento `load` de una portada con vídeos y una fuente de Google que tarda 14,9 s en esta red; `expect` esperaba 5 s una redirección de cliente más lenta; y los dos navegadores en paralelo agotaban el ancho de banda | **Prueba frágil**, corregida sin debilitar la comprobación: `domcontentloaded`, 20 s por ruta, 180 s la prueba y `workers: 1` (commit `77d5629`) |

---

## 10. BLOQUEOS Y RIESGOS ABIERTOS

### 10.1 Casos bloqueados y qué los desbloquea

| Casos | Cuántos | Por qué | Qué lo desbloquea |
|---|---|---|---|
| IT-WEB-03 (4 casos), IT-WEB-04 (1), IT-WEB-05 (3 de 4) | **8** | DEF-WEB-01: el login contra QA devuelve 500 | Arreglar `DATABASE_URL` / la base de QA y reanudar la Web App (acciones externas 6 y 12) |
| E2E de `login-roles.spec.ts` en Chromium | **8** | Lo mismo: la web se queda en `/?login=1` | Lo mismo |
| E2E de los demás specs que necesitan sesión | **15 por navegador** (38 ejecuciones pendientes) | No se corrieron: fallarían por la misma causa, y `registro-masivo` y `registro-padre` **escriben** en la base | Lo mismo, más `npm run qa:datos` para llenar `E2E_ESTUDIANTE_VINCULADO_ID` |
| E2E del guardia de rutas | **0: ya está APROBADO** | Es el único caso que no necesita sesión | — (hecho el 05/11 en Chromium y Firefox) |
| CP-SIS-060 (`padre-dos-hijos.spec.ts`) | 1 caso (2 ejecuciones) | **BE-07**: `/padres/me/hijos` no existe en QA (confirmado contra el `openapi.json`: 43 de 44 rutas existen) | Desplegar BE-07 y poner `E2E_BE07=true` (acción externa 9) |
| «La segunda vez con el mismo curso, todos salen ya registrado» | 1 caso (2 ejecuciones) | **BE-08**: sin el 409 por duplicado la API duplica el registro | Desplegar BE-08 y poner `E2E_BE08=true` (acción externa 9) |
| CP-SIS-065 a escala (2 casos) | 2 casos (4 ejecuciones) | Falta confirmar que `SESSION_IDLE_MINUTES=1` aplique al contexto *Deploy Previews* de Netlify | Confirmarlo y poner `E2E_SESSION_IDLE_MINUTES=1` (acción externa 2) |
| Pruebas manuales | **24** | Nadie las ha ejecutado | Que alguien las corra con `docs/pruebas-manuales-pr06-web.md` |
| Captura del Quality Gate | 1 evidencia | No se puede generar desde el repositorio | Que Mariana la tome del panel de SonarQube |

Fuentes: [`I2_integracion.xml`, `E1_humo-login.xml`, `E0_listado-specs.xml`, `I1_contrato_rutas.json`, `docs/decisiones-qa.md` D-WEB-07 y D-WEB-12, `docs/acciones-externas.md`].

### 10.2 Riesgos para producción

| Riesgo | Por qué | Evidencia |
|---|---|---|
| **Nada del frontend se ha probado de punta a punta contra una API real** | Los 24 E2E y 8 de los 9 casos de contrato están bloqueados. La integración web ↔ API solo está verificada «en papel»: 43 de 44 rutas existen en el `openapi.json`, pero no se ha comprobado ni un campo de respuesta real | `I1_contrato_rutas.json`, `I2_integracion.xml` |
| **La clave `service_role` de Supabase sigue siendo válida** | DEF-028 y los 4 hallazgos de gitleaks: borrar los archivos no invalida las claves | `evidencias/PR-03/web/gitleaks.json` |
| **`QA_PASSWORD` apareció en capturas** y no se ha rotado | Anotado como pendiente en la acción externa 7 | `docs/acciones-externas.md` |
| **El respaldo de `/padres/me` llegará a producción** | D-WEB-02 permite fusionar antes que BE-07, pero el padre con varios hijos verá solo uno hasta que BE-07 esté desplegado | `docs/decisiones-qa.md` D-WEB-02 |
| **CP-SIS-065 (cierre por inactividad) nunca se verificó en un navegador** | La regla de 30 minutos solo está probada en unitarias; los dos escenarios a escala están bloqueados | D-WEB-07 |
| **Cobertura de `src/hooks` en 32,6 % y de ramas en 14,2 %** | Las pantallas dependían de los E2E, que no corrieron: hoy no hay red de seguridad para los hooks de pantalla | `U3_cobertura-summary.json` |
| **Las cabeceras de seguridad HTTP no se han revisado** | El ZAP baseline está entre las manuales pendientes | `docs/pruebas-manuales-pr06-web.md` |
| **Variables de producción en Vercel sin revisar** | La acción externa 5 (quitar Supabase, apuntar a la API de producción) sigue pendiente; si se fusiona a `main` antes, producción podría apuntar mal | `docs/acciones-externas.md` |

---

## 11. DECISIONES

Texto copiado de [`docs/decisiones-qa.md`]. Se mantiene el número, la fecha, la opción aplicada y la prueba que vigila cada decisión.

| ID | Qué se decidió | Por qué | Prueba que la vigila |
|---|---|---|---|
| **D-WEB-01** · Acceso a `/qr/escanear` (02/11) | Opción A: rutas separadas, `/qr` admin+estudiante y `/qr/escanear` admin+docente. La separación ya existía en `src/lib/auth/routeRoles.ts`; faltaban las pruebas que la vigilen | Los casos CP-SIS-096 y CP-SIS-098 y US005/US006 piden al docente escanear en la web | `tests/routeRoles.test.ts` (4 casos) y el contrato `PERMISSIONS ↔ apiRoles` de `tests/permissions.test.ts` |
| **D-WEB-02** · Respaldo de hijos sin BE-07 (02/11) | Opción A: `getHijosAction` llama a `/padres/me/hijos`; si responde 404 o 405 arma un solo hijo con `GET /padres/me` (más `/estudiantes/{id}` para el curso, tolerando que falle). Otro error (401, 403, 500, red) se propaga | Así la web se puede fusionar antes que BE-07 sin romper notas, novedades, horarios ni asistencia del padre | `tests/asociadoActions.test.ts` (404 → un hijo; 500 → propaga; disponible → no llama a `/padres/me`) |
| **D-WEB-03** · Reglas del proxy (02/11) | Opción A con regla de origen por cabecera `Origin`, sin token CSRF. Lista completa de reglas en la sección 8.4 | El proxy es lo único que toca el token (WEB-02); no debe ser un reenviador abierto | `tests/apiProxy.test.ts`, bloque «endurecimiento» |
| **D-WEB-04** · Checklist de contraseña (02/11) | Opción A: se extrajo a `src/components/auth/PasswordChecklist.tsx` (`aria-live="polite"` y texto «cumplida/pendiente» para lector de pantalla) y se usa en registro y en `reset-password`; el botón «Actualizar» queda deshabilitado si no cumple o no coincide | Cubre los criterios de aceptación de WEB-05 (reglas en vivo) | `tests/components/PasswordChecklist.test.tsx` |
| **D-WEB-05** · Alcance de la cobertura (02/11) | Opción A: la cobertura se mide sobre `src/lib` y `src/services`; los hooks y componentes de pantalla se cubren con Playwright (PR-06). Umbrales 80 % y 60 % de líneas; `src/hooks` sin umbral | — | `tests/services/*` y los umbrales de `vitest.config.mts` |
| **D-WEB-06** · `eslint-disable` (02/11) | Se dejan las 25 excepciones, documentadas una por una en `docs/eslint-excepciones.md`, cada una con su motivo en la línea | Pasar las lecturas del navegador al montar a `useSyncExternalStore` puede causar errores de hidratación y no se puede validar sin la corrida E2E; las imágenes QR vienen de un origen variable y Material Symbols no se puede pasar a `next/font` | `sonar-project.properties` no excluye nada por ellas. Seguimiento: evaluar `useSyncExternalStore` después del PR-06 |
| **D-WEB-07** · CP-SIS-065 (02/11) | Opción **B**, no la A: el reloj simulado de Playwright solo mueve el reloj del navegador, pero el proxy mide la inactividad con el reloj del servidor. Se usa `SESSION_IDLE_MINUTES` (30 por defecto) y dos escenarios a escala contra QA con `SESSION_IDLE_MINUTES=1` | Con `page.clock` la sesión no se habría cerrado | La regla real (30 min) la prueban las unitarias de `updateSession` e `inactividadMs`; los escenarios a escala están en `e2e/sesion.spec.ts`. Alternativa C (40 min reales con vídeo) en `docs/pruebas-manuales-pr06-web.md` |
| **D-WEB-08** · `main_eyesschool.yml` (02/11) | Se borra el flujo de despliegue a la Web App de Azure `EyesSchool`; producción está en Vercel | Si en la acción externa 4 esa Web App recibe tráfico real, se restaura con `git restore` y se anota | `tests/arquitectura.test.ts` («hay un solo despliegue») |
| **D-WEB-09** · Despliegue de QA y escaneo de secretos (03/11) | Opción A con la configuración versionada en `netlify.toml`: `npm run build`, publish `.next`, `NODE_VERSION=20` y `SECRETS_SCAN_OMIT_KEYS=NEXT_PUBLIC_API_URL`. No se usó la alternativa B (`SECRETS_SCAN_ENABLED=false`) | `NEXT_PUBLIC_*` es pública por diseño: Next la graba en el JavaScript del navegador, así que el escaneo siempre la encuentra; no es una fuga. **Ninguna variable con un secreto real se agrega a esa lista** | Revisión de `.env` y gitleaks (secciones 8.1 y 8.3) |
| **D-WEB-10** · `planeacion/Bugs/bugs.md` (03/11) | Se restauró con `git restore` porque nadie confirmó que sus 455 líneas estén en Azure Boards, y no son defectos con ID: son requisitos funcionales sueltos | Para borrarlo hay que confirmar antes que esos requisitos estén en Azure Boards | Acción externa 10 |
| **D-WEB-11** · Horario del estudiante asociado con error y reintento (03/11) | Opción A: `Hijo.cursoNoDisponible` distingue «no tiene curso» de «no se pudo consultar el curso»; `getHorarioAsociadoAction` devuelve `MSG_HORARIO_ERROR` y `HorariosViewerClient` lo muestra con `role="alert"` y un botón **Reintentar** | Antes, si `/estudiantes/{id}` fallaba, el padre veía «El estudiante aún no está asignado a un curso» o una pantalla vacía | `tests/asociadoActions.test.ts` (3 casos) y `tests/components/HorariosViewerClient.test.tsx` (4 casos) |
| **D-WEB-12** · Contrato contra el `openapi.json` de QA (03/11) | Adelantar la parte del contrato que no necesita base ni credenciales: `scripts/contrato-rutas.mjs` compara las rutas que llama la web con el `openapi.json`. **43 de 44 existen**; falta `/padres/me/hijos` (BE-07) | La API estaba arriba pero toda ruta con datos daba 500, así que no se podían correr las pruebas de contrato | `evidencias/PR-05/web/I1_contrato_rutas.json`. **No reemplaza** a la corrida de contrato del PR-05 |
| **D-WEB-13** · Exclusiones de cobertura en Sonar (03/11) | Dos pasos, en este orden: 1) pruebas reales (`cargaInicial`, `apiBase`, `FallidosMasivo`, `register`, `asociadoViewer`); 2) `sonar.coverage.exclusions` con las vistas que D-WEB-05 asigna a los E2E, archivo por archivo. La planeación la llama «D-WEB-11», pero ese número ya estaba usado | El gate fallaba por cobertura. La causa principal era que `coverage.include` dejaba fuera del `lcov` archivos **que sí tienen pruebas**, y Sonar los contaba con 0 % | Umbrales de `vitest.config.mts` intactos; cobertura nueva 86,2 % (sección 7.2) |
| **D-WEB-14** · Arreglos de Reliability (03/11) | Los 9 issues de Sonar corregidos con su prueba (detalle en la sección 7.3) | Reliability pasó de C a A | `tests/apiBase.test.ts`, `tests/hooks/cargaInicial.test.tsx`, `tests/hijoActivo.test.ts`. **Ningún issue se marcó como falso positivo ni won't fix** |
| **Menores** (02/11) | Mapeo de trazabilidad por `tests/trazabilidad.json` en vez de prefijar cada `describe`; `padre-dos-hijos` y la segunda corrida de `registro-masivo` con `test.fail()` hasta que `E2E_BE07`/`E2E_BE08` valgan `true`; la evidencia «antes del arreglo» son los commits `test(...)` del historial, sin una corrida U0 separada | — | `npm run trazabilidad` |

---

## 12. ACCIONES EXTERNAS

Estado de cada fila de [`docs/acciones-externas.md`]. Ningún secreto reproducido.

| # | Acción | Responsable | Estado |
|---|---|---|---|
| 1 | Eliminar o pausar el proyecto Supabase `odenqixjgsrgehnyllfn`: las 4 claves del commit `b7e20f5` siguen válidas | Andrés Acero | **Pendiente** (hallazgo abierto; DEF-028) |
| 3 | `SONAR_TOKEN` en GitHub Secrets e importar el proyecto en SonarQube Cloud | Samuel Sierra | **Hecha** el 03/11/2026. Quality Gate **Passed**. Falta solo la captura del panel |
| 4 | Revisar en *Metrics* que la Web App vieja de Azure `EyesSchool` no recibe tráfico y detenerla | Andrés Acero | **Pendiente** |
| 5 | Variables en Vercel (producción): quitar Supabase y dejar `NEXT_PUBLIC_API_URL` de producción | Andrés Acero | **Pendiente** (bloquea `develop` → `main`) |
| 5b | Variables y despliegue en Netlify (QA) | Mariana Cortés | **Hecha** con el deploy preview del PR #34 (responde 200). Falta confirmar `SESSION_IDLE_MINUTES=1` en *Deploy Previews*, y `qaeyesschool.netlify.app` se publica al fusionar |
| 6 | Terminar QA: base Postgres con el seed, `DATABASE_URL`, `SECRET_KEY`, `ENVIRONMENT=qa`, Startup Command | Mariana Cortés | **Pendiente.** Es DEF-WEB-01: autenticación y validación responden, pero toda consulta a la base da 500 |
| 7 | Entregar `QA_PASSWORD` por canal privado | Samuel Sierra | **Hecha** el 03/11/2026 (`.env.test.local` completo). **Pendiente rotarlo**: apareció en capturas |
| 8 | Crear en Azure Boards la tarea «Quitar respaldo de /padres/me (WEB-03)» | Mariana Cortés | **Pendiente** |
| 9 | Fusionar y desplegar BE-07 y BE-08, y poner `E2E_BE07`/`E2E_BE08` en `true` | Equipo backend | **Pendiente** (bloquea CP-SIS-060 y un caso de registro masivo) |
| 10 | Confirmar si los requisitos de `planeacion/Bugs/bugs.md` están en Azure Boards | Mariana Cortés | **Pendiente** |
| 11 | Pasar **DEF-WEB-01** a Azure Boards y enlazarlo con `AB#<id>` | Mariana Cortés | **Pendiente** |
| 12 | Rotar la contraseña de la base de Render y actualizar `DATABASE_URL` en Azure + *Restart*. Puede ser la causa de DEF-WEB-01 | Mariana Cortés | **Pendiente** |
| 13 | Entregar la lista de las 17 ramas remotas viejas para decidir cuáles se borran | Mariana Cortés | **Pendiente.** El asistente no borra ninguna |

Hechas: **3 de 13.** No existe una fila «2» en el documento.

---

## 13. RAMAS Y PULL REQUESTS

### 13.1 Estado del PR #34

| Dato | Valor | Fuente |
|---|---|---|
| Título | «Feat/web calidad pruebas» | [API `/pulls/34`] |
| Dirección | `feat/web-calidad-pruebas` → **`develop`** | ídem |
| Estado | **Abierto, no fusionado.** `mergeable_state: clean` (sin conflictos) | ídem |
| Commits | **31** | ídem y [`git rev-list --count origin/develop..HEAD`] |
| Archivos cambiados | 169 (+14 187 / −1 065 líneas) | [API `/pulls/34`] |
| Creado | 03/11/2026 01:41 UTC | ídem |
| Última actualización | 03/11/2026 15:55 UTC | ídem |
| **Aprobaciones** | **Ninguna.** 0 revisiones y 0 revisores solicitados | [API `/pulls/34/reviews`] |

### 13.2 Checks del CI sobre `d251ae2`

| Check | Conclusión | Terminó |
|---|---|---|
| Lint, tipos, pruebas y build | **success** | 03/11/2026 15:56:21 UTC |
| SonarCloud Code Analysis | **success** (Quality Gate Passed) | 03/11/2026 15:55:54 UTC |
| Header rules · qaeyesschool (Netlify) | success | 15:54:02 UTC |
| Redirect rules · qaeyesschool (Netlify) | success | 15:54:02 UTC |
| Pages changed · qaeyesschool (Netlify) | neutral | 15:54:02 UTC |
| Vercel Preview Comments | success | 15:53:51 UTC |

Fuente: [API de GitHub `/commits/d251ae2/check-runs`]. **Los 6 checks están en verde o neutro; ninguno falla.**

Deploy preview de Netlify: la URL `https://deploy-preview-34--qaeyesschool.netlify.app` responde **200** [comprobación del 03/11 22:31 UTC]. No aparece un check específico `deploy/netlify` en la lista de arriba.

### 13.3 ¿Se fusionó?

**No.** El PR #34 sigue abierto; no se ha fusionado a `develop` ni a `main`, y no se ha creado la etiqueta `web-v1.0.0`. Requisitos que la planeación pone para fusionar: CI verde (**cumplido**), Quality Gate Passed (**cumplido**), deploy preview verde (**cumplido**), `RESUMEN-web.md` completo (**cumplido**) y aprobación de una persona más del equipo (**pendiente**).

### 13.4 Los 31 commits de la rama

Del más reciente al más antiguo [`git log --oneline origin/develop..HEAD`]:

| # | Hash | Mensaje |
|---|---|---|
| 31 | `d251ae2` | docs(sonar): Quality Gate Passed, cobertura nueva 86,2 % |
| 30 | `8ce9da3` | docs: fija el commit de las evidencias |
| 29 | `4df8e63` | test(cobertura): el lcov mide todo src y pruebas para register y el asociado |
| 28 | `7c858f5` | docs: informe del cierre del 03/11 (Sonar y corrida completa) |
| 27 | `8abe760` | test(evidencias): corrida U3, integracion I2 y humo E2E sobre el commit b991e88 |
| 26 | `b991e88` | test(int): E2E_PADRE_EMAIL sale del padre con dos hijos |
| 25 | `2252786` | fix(sonar): Number.*, regex del proxy sin backtracking y promesas con void |
| 24 | `0ee35ea` | docs: informe de la jornada del 03/11 (cifras y bloqueos de QA) |
| 23 | `b42ab39` | test(evidencias): aclara que el junit de PR-06 es solo el listado de specs |
| 22 | `8e0fb09` | test(evidencias): corrida U2, cobertura y preflight de QA |
| 21 | `30e4532` | fix(horarios): error con reintento si el horario del padre no carga |
| 20 | `95bb94e` | chore(despliegue): netlify.toml, .env.example y escaneo de secretos |
| 19 | `eb3ca29` | docs(qa): planeaciones de pruebas |
| 18 | `428a879` | ci(sonar): projectKey, organization y exclusiones |
| 17 | `5bdd3c3` | docs: corrige el conteo de commits en el informe |
| 16 | `d62ce7c` | docs: trazabilidad, decisiones, acciones externas, pruebas manuales y evidencias U1 |
| 15 | `5024ecc` | test(services): cobertura de servicios con fetch simulado (umbral 60 %) |
| 14 | `ac953a9` | test(int): contrato contra QA (PR-05) |
| 13 | `4d141cc` | test(e2e): specs de Playwright y CP-SIS-065 a escala (WEB-INF-3) |
| 12 | `2f92127` | ci: calidad, gitleaks y sonar; se elimina el despliegue viejo de Azure (WEB-INF-4) |
| 11 | `c2c21fd` | chore: elimina supabase y advertencias de ESLint, con excepciones documentadas (WEB-08) |
| 10 | `07f6310` | fix(notas): boletín y mensajes del padre (WEB-09) |
| 9 | `04ac4d2` | fix(asistencia): registro masivo con guardados, duplicados y fallidos (WEB-06) |
| 8 | `66ea9b2` | fix(permisos,auth): docente sin borrar asistencia; política y reglas en vivo al restablecer (WEB-04, WEB-05) |
| 7 | `2e70a7c` | feat(padre): varios hijos con respaldo mientras no exista BE-07 (WEB-03) |
| 6 | `2812cee` | fix(auth): sesión, inactividad, cookies httpOnly y proxy endurecido (WEB-01, WEB-02) |
| 5 | `a470c7b` | refactor(api): serverFetch y ApiError (WEB-INF-1) |
| 4 | `9305317` | chore(test): entorno vitest, cobertura y helpers (WEB-INF-1/2) |
| 3 | `e5f9bde` | test: Vitest para permisos, guardia de rutas, cliente API y contraseñas; CI |
| 2 | `5a5dea6` | fix(api): mostrar el error de validación de FastAPI en vez de [object Object] |
| 1 | `70716e3` | fix(deps): actualizar Next.js a 16.4.3 y resend |

### 13.5 Ramas viejas

Hay 17 ramas remotas antiguas según la planeación de cierre. **Este informe no las lista ni toca ninguna**: la lista se entrega con `git branch -r --merged origin/main` y Mariana decide (acción externa 13).

---

## 14. PRUEBAS MANUALES

Directorio `evidencias/PR-06/web/manuales/`: **no existe** [`ls`]. **Ninguna** prueba manual tiene captura.

| Bloque | Casos | Con captura | Faltan |
|---|---|---|---|
| 1 · Lighthouse (rendimiento, accesibilidad, buenas prácticas, SEO ≥ 90) en 7 páginas por rol | 7 | 0 | **7** |
| 2 · axe DevTools (0 violaciones serias o críticas) en 5 pantallas | 5 | 0 | **5** |
| 3 · ZAP baseline contra la web de QA (0 alertas altas) | 1 | 0 | **1** |
| 4 · Cámara QR en Chrome móvil (3 pasos) | 3 | 0 | **3** |
| 5 · API caída: login, `/notas` y descarga del boletín | 3 | 0 | **3** |
| 6 · Brave con escudos en «Agresivo»: login, recarga y descarga del boletín | 3 | 0 | **3** |
| 7 · Sesión de 40 minutos (CP-SIS-065, alternativa C) | 2 | 0 | **2** |
| **Total** | **24** | **0** | **24** |

Fuente: [`docs/pruebas-manuales-pr06-web.md`], donde las columnas *Fecha*, *Ejecutó*, *Resultado* y *Evidencia* están vacías en los 24 casos.

**Responsive 375 / 768 / 1920:** la planeación de pruebas manuales **no tiene un bloque propio de responsive**. Lighthouse se pide en modo Escritorio y luego Móvil, lo que cubre parte, pero no hay casos para 375, 768 y 1920 px. **NO DISPONIBLE**: hay que agregarlos al documento antes de ejecutarlos.

---

## 15. LO QUE NO SÉ O NO PUDE COMPROBAR

| # | Punto | Por qué | Qué haría falta |
|---|---|---|---|
| 1 | ~~Duración de los niveles~~ | **CERRADO el 05/11**: medidas y guardadas en `U4_duraciones.txt` | — |
| 2 | ~~Evidencias de un commit distinto a HEAD~~ | **CERRADO el 05/11**: todo se volvió a correr sobre `77d5629` | — |
| 3 | ~~El guardia de rutas nunca se verificó en navegador~~ | **CERRADO el 05/11**: APROBADO en Chromium y Firefox sobre las 8 rutas | — |
| 4 | Si el seed está cargado en la base de QA, y cuántos usuarios y estudiantes tiene | Toda consulta a la base sigue dando 500 el 05/11 | Arreglar DEF-WEB-01 y correr `npm run qa:datos` |
| 5 | Resultado de los 15 casos E2E que necesitan sesión, en los dos navegadores | No se ejecutaron: fallarían por DEF-WEB-01, y dos specs escriben en la base | Entorno de QA operativo |
| 6 | Resultado de los 8 casos de contrato bloqueados | DEF-WEB-01 (vuelto a comprobar el 05/11) | Lo mismo |
| 7 | CP-SIS-065 verificado en navegador | Falta confirmar `SESSION_IDLE_MINUTES=1` en *Deploy Previews* | Acción externa 2, y luego `E2E_SESSION_IDLE_MINUTES=1` |
| 8 | CP-SIS-060 (padre con dos hijos) | BE-07 no está en QA | Acción externa 9 |
| 9 | El reparto de los 50 CP-SIS restantes entre «manual» y «sin cubrir» | La planeación de sistema no tiene columna de automatización | Revisarla caso a caso con quien la escribió |
| 10 | ID de Azure Boards de DEF-020 a DEF-028 y de DEF-WEB-01 | No hay acceso a Azure Boards desde el repositorio | Consultarlos en Azure Boards |
| 11 | Captura del Quality Gate (`sonar-quality-gate.png`) | No se puede generar desde el repositorio | Que Mariana la tome del panel |
| 12 | Quality Gate de la **rama** (no del PR), y el análisis del commit `77d5629` | SonarQube responde `status: NONE` para la rama; el commit del 05/11 no se ha subido | Subir el commit y fusionar a `develop` |
| 13 | Cabeceras de seguridad HTTP de la web de QA (CSP, HSTS, X-Frame-Options) | No se revisaron; el ZAP baseline está pendiente | Correr el bloque 3 de las pruebas manuales |
| 14 | Las 24 pruebas manuales y el responsive 375/768/1920 | Nadie las ha ejecutado, y el responsive no está escrito como casos | Ejecutarlas y, antes, agregar los casos de responsive al documento |
| 15 | Si DEF-WEB-01 es `DATABASE_URL`, red o credenciales de Postgres | El cuerpo del 500 no trae detalle y no hay acceso al *Log stream* de Azure. El 502 de un intento apunta a que el proceso se cae al conectar | Leer el log de `apieyeschool-q` en el portal de Azure |
| 16 | Rendimiento y accesibilidad medidos (Lighthouse, axe) | Pendientes de ejecución manual | Bloques 1 y 2 de las pruebas manuales |
| 17 | Duración de gitleaks y del análisis de Sonar | gitleaks lo corre su propio binario y Sonar corre en el CI; no se cronometraron | Medirlos si el informe formal lo exige |
