# Informe de estado de pruebas · Frontend web Eyes School

> **Para quien rellena los informes formales PR-03 a PR-07 (parte web).** Cada dato lleva entre corchetes el archivo o el comando del que sale. Donde no hay dato dice **NO DISPONIBLE** con el motivo. Ninguna cifra está estimada ni redondeada por gusto: si una medición no existe, no se inventa.
>
> **Vocabulario usado en todo el informe:** **APROBADO** (pasó) · **FALLA** (defecto del producto, con su ficha DEF-WEB) · **BLOQUEADO** (depende de otra cosa: BE-08, entorno, datos o configuración) · **NO EJECUTADO** (no se corrió) · **INESTABLE** (solo E2E: falló por **tiempo agotado** —carga, login o navegación del deploy preview— y no por una comprobación, o dio resultados distintos entre corridas sin cambio de código. **No cuenta como aprobado**).
>
> Las rutas de evidencia son relativas a la raíz del repositorio. Se abrevian: `U6_*` = `evidencias/PR-04/web/`, `I4_*` = `evidencias/PR-05/web/`, `E3_*` a `E9_*` = `evidencias/PR-06/web/`.
>
> **Actualizado el 11/11/2026 por la tarde.** La base de QA volvió el 10/11 (DEF-WEB-01 cerrado) y se corrieron por primera vez la integración y los 48 E2E. Salieron **14 fallos E2E causados por tres defectos de la web** (DEF-WEB-02, 03 y 04). **Los tres se corrigieron en esta rama y están verificados en QA**: en la corrida E7 y sus repeticiones (E8, E9) hay **0 FALLA**. Queda abierto DEF-WEB-05 (Baja), que no causaba ningún fallo E2E.

---

## 1. IDENTIFICACIÓN

| Dato | Valor | Fuente |
|---|---|---|
| Repositorio | `marianacortes0/proyecto-eyesschool` | [`git remote`] |
| Rama | `feat/web-calidad-pruebas` | [`git branch --show-current`] |
| Commit de las pruebas | **`7d927df`** para los niveles locales (U6) y la integración (I4); `e886144` para la corrida E2E completa con las correcciones (E7); `e387ee4` para sus repeticiones (E8, E9). Detalle en la 1.1 | [`evidencias/commit.txt`] |
| Pull request | **#34**, `feat/web-calidad-pruebas` → `develop`, abierto, no fusionado | [API de GitHub `/pulls/34`] |
| Commits de la rama por delante de `develop` | **51** (incluido el de este informe) | [`git rev-list --count origin/develop..HEAD`] |
| Árbol de trabajo limpio | **No.** Sigue modificado `.vscode/settings.json` (agrega `"python.terminal.useEnvFile": true`), un cambio tuyo que no afecta a código ni a pruebas y que no se versiona | [`git status --porcelain`] |

### 1.1 ¿Todas las evidencias salen del mismo commit?

**Del mismo código de la app, sí; del mismo hash, no.** `src/` es idéntico en `e886144`, `e387ee4` y `7d927df`: después de `e886144` solo cambiaron dos archivos de `e2e/` y documentos.

| Corrida | Commit | ¿Qué cambia respecto de `7d927df`? |
|---|---|---|
| U6 · niveles locales | **`7d927df`** | Nada |
| I4 · integración (10 casos) | **`7d927df`** | Nada |
| E7 · E2E completa con las correcciones | `e886144` | Solo `e2e/padre-dos-hijos.spec.ts` y `e2e/sesion.spec.ts` (oráculos de D-WEB-17, puntos 5 y 6) |
| E8 · repetición de los fallos de E7 | `e387ee4` | Solo `e2e/sesion.spec.ts` |
| E9 · cierre por inactividad y acceso vencido | `e387ee4` + el `e2e/sesion.spec.ts` de `7d927df` | Nada en lo que corre |
| Histórico de esta jornada: I3, E3 a E6, U5 | `8bdc307`, `73bf2b2`, `360b599`, `c3e491f` | Antes de las correcciones: sirven para el «antes» de cada defecto |

**El deploy preview contra el que corrieron E7 a E9** es el de `e886144`, publicado a las 17:25:45 UTC [estado `netlify/qaeyesschool/deploy-preview` del commit]. Se comprobó que sirve el código nuevo: el HTML ya tiene un solo `<main>` (DEF-WEB-02).

### 1.2 Fecha y hora de cada corrida

| Corrida | Fecha y hora (UTC) | Duración | Fuente |
|---|---|---|---|
| Tipos (`tsc --noEmit`) | 11/11/2026, corrida U6 (~18:42) | **11,2 s** | [`U6_duraciones.txt`, `U6_tsc.txt`] |
| Lint (ESLint) | ídem | **33,7 s** | [`U6_duraciones.txt`, `U6_eslint.json`] |
| Unitarias y de componentes | ídem | **26,5 s** (14,8 s de pruebas) | [`U6_duraciones.txt`, `U6_unitarias.xml`] |
| Cobertura (`test:cov`) | ídem | **29,0 s** | [`U6_duraciones.txt`, `U6_cobertura.txt`] |
| Trazabilidad | ídem | **26,7 s** | [`U6_duraciones.txt`] |
| Build de producción | ídem | **33,6 s** | [`U6_duraciones.txt`, `U6_build.txt`] |
| Auditoría de dependencias | ídem | **4,8 s** | [`U6_duraciones.txt`, `npm-audit.txt`] |
| Integración / contrato (I4) | 11/11/2026 ~18:45 | **59,4 s** | [`I4_integracion.xml`] |
| **E2E completa con las correcciones (E7)** | 11/11/2026 **17:28 → 18:23** | **54,6 min** | [`E7_e2e.xml`, `E7_e2e-consola.txt`] |
| E2E repetición (E8) | 11/11/2026 18:25 → 18:35 | **10,0 min** | [`E8_reintento.xml`] |
| E2E inactividad (E9) | 11/11/2026 ~18:38 | **1,8 min** | [`E9_inactividad.xml`] |
| Preflight del entorno (I3) | 10/11/2026 **23:36** | — | [`I3_preflight-qa.txt`] |
| Integración / contrato (I3) | 10/11/2026 ~23:37 | **73,5 s** | [atributo `time` de `I3_integracion.xml`] |
| *Histórico* · E2E completa, descubrimiento (E3) | 10/11/2026 23:53 → 11/11 00:42 | **49,0 min** | [`E3_e2e-consola.txt`] |
| *Histórico* · E2E completa sin correcciones (E4) | 11/11/2026 00:55 → 01:31 | **35,9 min** | [`E4_e2e.xml`, `E4_e2e-consola.txt`] |
| *Histórico* · E2E reintento (E5) | 11/11/2026 01:35 → 01:52 | **16,1 min** | [`E5_reintento.xml`] |
| *Histórico* · E2E registro del padre (E6) | 11/11/2026 **01:54** | 59,9 s + 1,6 min | [`E6_registro-padre.xml`] |
| gitleaks | 11/11/2026 18:46 | **1,44 s** (lo informa el binario) | [`gitleaks.json`] |
| SonarQube Cloud (PR #34, `e886144`) | 11/11/2026 **17:27:19** | — | [check-run «SonarCloud Code Analysis»] |

Las duraciones de los niveles locales se midieron con reloj e incluyen el arranque de la herramienta. El build de U6 se corrió con `NEXT_PUBLIC_API_URL=https://api.example.invalid/api/v1` solo en ese paso, igual que el CI [`U6_duraciones.txt`, `.github/workflows/ci.yml`]. Motivo: tu `.env` local tiene esa variable sin `https://` (acción externa 17).

### 1.3 Versiones

| Herramienta | Versión | Fuente |
|---|---|---|
| Node.js (local) | **24.21.0** | [`node -v`] |
| Node.js (CI) | 24.x | [`.github/workflows/ci.yml`] |
| Node.js (Netlify) | 20 | [`netlify.toml`] |
| Next.js | **16.4.3** | [`package-lock.json`] |
| React / React DOM | 19.2.4 | [`package-lock.json`] |
| TypeScript | 5.9.3 | [`npx tsc --version`] |
| Vitest y `@vitest/coverage-v8` | **4.1.12** | [`package-lock.json`] |
| ESLint | 9.39.4 | [`package-lock.json`] |
| Playwright | **1.64.1** | [`npx playwright --version`] |
| gitleaks | 8.21.2 | [binario local] |

### 1.4 Navegadores

| Navegador | Versión | Usado en |
|---|---|---|
| Chromium (Chrome for Testing) | **156.0.8078.4** (build Playwright v1248) | E3 a E9 |
| Firefox | **157.0** (build Playwright v1555) | E3 a E9 |

Fuente: [`npx playwright install --dry-run chromium firefox`]. Ventana de 1920×1080 en los dos [`playwright.config.ts`].

### 1.5 URL del entorno (sin credenciales)

| Pieza | URL | Fuente |
|---|---|---|
| Web de QA | `https://deploy-preview-34--qaeyesschool.netlify.app` (deploy preview del PR #34) | [`.env.test.example`, `playwright.config.ts`] |
| Web de QA del contexto `develop` | `https://qaeyesschool.netlify.app` — **404**, se publica al fusionar | [`I3_preflight-qa.txt`] |
| API de QA | `https://apieyeschool-q-g4hfgrgvepbecacc.chilecentral-01.azurewebsites.net/api/v1` | [`I3_preflight-qa.txt`] |
| Web de producción (no se tocó) | `https://proyecto-eyesschool.vercel.app` | [`docs/acciones-externas.md`] |

### 1.6 Quién ejecutó qué

| Parte | Quién |
|---|---|
| Niveles automatizados, preflight, integración, E2E, diagnósticos, **corrección de DEF-WEB-02, 03 y 04**, correcciones de las pruebas, fichas de defectos, gestión de defectos en GitHub y documentos | La IA (Claude, en VS Code), en el equipo de Mariana |
| Base de QA en pie y `QA_PASSWORD` aplicada a las cuentas del seed (10/11) | Mariana Cortés / equipo backend, fuera del repositorio |
| Pruebas manuales del nivel 11 | **Nadie todavía** (sección 14) |
| Revisión y aprobación del PR #34 | **Nadie todavía** (sección 13) |

---

## 2. ENTORNO DE QA

### 2.1 Preflight

Cuatro mediciones. La vigente es la **D** [`I3_preflight-qa.txt`].

| Comprobación | Esperado | A · 03/11 15:11 | B · 03/11 22:31 | C · 05/11 20:57 | **D · 10/11 23:36** |
|---|---|---|---|---|---|
| API `/docs` | 200 | 200 | 403 | 200 | **200** |
| API `/openapi.json` | 200 | 200 | 403 | 200 | **200** (62 rutas) |
| API `/api/v1/cursos` sin token | 200 | 500 | 403 | 500 | **200**, con los 10 cursos del seed |
| API `/api/v1/auth/me` sin token | 401 | 401 | 403 | 401 | **401** |
| API `POST /auth/login` con cuerpo inválido | 422 | 422 | 403 | 422 | **422** |
| API `POST /auth/login` con un correo inexistente | 401 | 500 | 403 | — | **401** |
| API `POST /auth/login` admin, docente, estudiante, padre de 1 hijo y padre de 2 hijos | 200 | 500 | 403 | 500 | **200 los cinco** |
| Web `/` del deploy preview | 200 | 200 | 200 | 200 | **200** |
| Web `/usuarios` sin sesión (HTTP) | 307 | — | — | 200 | **200** (ver abajo) |
| Web `https://qaeyesschool.netlify.app` | 200 | 404 | 404 | 404 | **404** |

**Lectura:** la API y su base funcionan. DEF-WEB-01 queda **cerrado** (sección 9).

`/usuarios` sin sesión devuelve 200 y no 307. El 05/11 se interpretó como una redirección de cliente propia de Netlify. La causa real era DEF-WEB-04: **el proxy no se ejecutaba en ningún entorno**. Desde `138db97` el proxy está en `src/`. En local (`next start`) las rutas del panel sin sesión responden **307**. En Netlify el proxy corre (borra la sesión inactiva), pero su 307 no llega al navegador y la redirección a `/?login=1` la hace la página (D-WEB-18).

### 2.2 ¿Hay base de datos operativa hoy?

**Sí.** `/cursos` devuelve los 10 cursos del seed, un correo inexistente recibe 401 y las cinco cuentas de prueba inician sesión [`I3_preflight-qa.txt`]. El contrato de rutas encuentra **44 de 44** rutas de la web en el `openapi.json`, incluida `/padres/me/hijos` (BE-07, que ya está desplegado) [`I3_contrato_rutas.json`].

### 2.3 Datos de prueba

| Dato | Valor | Fuente |
|---|---|---|
| Seed cargado | **Sí**: 10 cursos, las 5 cuentas del seed y el estudiante sintético `SYN0101` | [`I3_preflight-qa.txt`, `npm run qa:datos`] |
| Usuarios en QA | **112** al cierre: los 110 de antes más 2 cuentas `qa.…@example.com` (ids 135 y 136) creadas a las 16:55 UTC del 11/11, fuera de estas pruebas (ver 9.4). Ninguna cuenta de E2E | [`GET /usuarios` paginado, solo lectura] |
| Estudiante vinculado para CP-SIS-014 | `SYN0101` → id **4**, «María Rodríguez» (datos sintéticos) | [`npm run qa:datos`] |
| Hijos del padre de dos hijos | `GET /padres/me/hijos` → 2 filas: «Sofía Rodríguez» (id 1) y «Santiago López» (id 3) | [llamada directa a la API de QA, 10/11] |

**Cuentas del seed usadas en las pruebas** (solo correos; las claves viven únicamente en `.env.test.local`, que no se versiona) [`.env.test.example`]:

| Rol | Correo |
|---|---|
| Administrador | `admin@eyesschool.edu.co` |
| Docente | `carlos.jimenez@eyes.edu.co` |
| Estudiante | `sofia.rodriguez@student.eyes.co` |
| Padre con un hijo | `roberto.diaz@gmail.com` |
| Padre con dos hijos | `rosa.perez@gmail.com` |

### 2.4 Variables del entorno de pruebas

`.env.test.local` existe y está ignorado por git [`git check-ignore -v .env.test.local` → regla `.gitignore:34`]. El 10/11 se llenaron `E2E_ESTUDIANTE_VINCULADO_ID` y `E2E_ESTUDIANTE_VINCULADO_NOMBRE` con la salida de `npm run qa:datos`, y se puso `E2E_BE07=true` porque `/padres/me/hijos` ya está en el `openapi.json` de QA. Siguen vacías:
- `E2E_BE08`: el `openapi.json` no documenta ningún 409, así que no se puede confirmar BE-08.
- `E2E_SESSION_IDLE_MINUTES`: falta confirmar `SESSION_IDLE_MINUTES=1` en Netlify.

**No se transcribe ningún valor.**

---

## 3. RESULTADOS POR NIVEL

Una fila por nivel. Los totales salen de los XML JUnit, no de la memoria.

| Nivel | Herramienta | Total | Aprobadas | Fallan | Bloqueadas | Otras | Duración | Evidencia |
|---|---|---|---|---|---|---|---|---|
| Tipos | `tsc --noEmit` | — | **0 errores** | 0 | 0 | — | 11,2 s | `U6_tsc.txt` |
| Lint | ESLint, `--max-warnings=0` | **199 archivos** | **0 errores y 0 advertencias** | 0 | 0 | — | 33,7 s | `U6_eslint.json` |
| Unitarias | Vitest, proyecto `unitarias` (node) | **272** en 26 archivos | **272** | 0 | 0 | 0 | — | `U6_unitarias.xml` |
| Componentes | Vitest, proyecto `componentes` (jsdom) | **59** en 9 archivos | **59** | 0 | 0 | 0 | — | `U6_unitarias.xml` |
| Unitarias + componentes | Vitest 4.1.12 | **331** en 35 archivos | **331** | 0 | 0 | 0 | 26,5 s | `U6_unitarias.xml` |
| Cobertura | `@vitest/coverage-v8` | 141 archivos | **cumple los dos umbrales** | 0 | 0 | — | 29,0 s | `U6_cobertura.txt`, `U6_cobertura-summary.json` |
| Trazabilidad | `npm run trazabilidad` | **341** pruebas mapeadas | — | 0 | 0 | — | 26,7 s | `docs/trazabilidad-ut-web.md` |
| Integración / contrato contra QA | Vitest, `vitest.integration.config.mts` | **10** | **10** | 0 | 0 | 0 | 59,4 s | `I4_integracion.xml` |
| Contrato de rutas web ↔ `openapi.json` | `npm run qa:contrato-rutas` | **44** rutas | **44** | 0 | 0 | — | — | `I3_contrato_rutas.json` |
| E2E Chromium | Playwright 1.64.1 | **24** | **21** | **0** | **3** | 0 | E7: ver 5.3 | `E7_e2e.xml`, `E8_reintento.xml`, `E9_inactividad.xml` |
| E2E Firefox | Playwright 1.64.1 | **24** | **14** | **0** | **3** | 7 INESTABLE | E7: ver 5.3 | ídem |
| Build | `next build` | — | **compila**, con `ƒ Proxy (Middleware)` | 0 | 0 | — | 33,6 s | `U6_build.txt` |
| Auditoría de dependencias | `npm audit --omit=dev --audit-level=high` | — | **0 vulnerabilidades** | 0 | 0 | — | 4,8 s | `evidencias/PR-03/web/npm-audit.txt` |
| Secretos | gitleaks 8.21.2, `--redact` | **97 commits** | — | **4 hallazgos históricos** (0 nuevos) | 0 | — | 1,44 s | `evidencias/PR-03/web/gitleaks.json` |
| SonarQube Cloud | CI del PR #34, commit `e886144` | — | **Quality Gate: Passed** | 0 issues nuevos | 0 | — | — | sección 7 |
| CI del PR #34 | GitHub Actions, commit `e886144` | — | **success** | 0 | 0 | — | — | sección 13.2 |
| Pruebas manuales | Lighthouse, axe, ZAP, Brave, Chrome móvil | **24 casos** | 0 | 0 | 0 | **24 NO EJECUTADOS** | — | `docs/pruebas-manuales-pr06-web.md` |

**Notas de lectura de la tabla**

- **E2E: 48 ejecuciones → 35 APROBADO, 0 FALLA, 6 BLOQUEADO y 7 INESTABLE.** Antes de las correcciones (E4) eran 22 APROBADO y 14 FALLA. Los 14 fallos venían de DEF-WEB-02 (8), DEF-WEB-03 (4) y DEF-WEB-04 (2), y **los 14 pasan ahora**. Detalle en la 5.3.
- Los 7 INESTABLE son todos de **Firefox**: en E7 se les agotó el tiempo (carga de la portada o login) y en la repetición pasaron. Ninguno falló por una comprobación.
- Los 6 BLOQUEADO: 2 de BE-08 (falla esperada que falló como se esperaba; Playwright la cuenta como pasada) y 4 de CP-SIS-065 a escala (falta `E2E_SESSION_IDLE_MINUTES`).
- JUnit de E7: `tests="48" failures="1" errors="7" skipped="4"`. La única *failure* fue el oráculo del padre con dos hijos (D-WEB-17 punto 5); los 7 *errors* son los tiempos agotados de Firefox.
- La integración pasó de 1 de 9 (05/11) a 9 de 9 (I3) y a **10 de 10** (I4), con el caso nuevo que vigila DEF-WEB-03.
- Unitarias: 302 (05/11) → 327 (U5, +25 de `tests/defectos.test.ts`) → **331** (U6, +4 de las correcciones: 2 de arquitectura y 2 del mapeo de hijos).

---

## 4. COBERTURA

### 4.1 Por carpeta

Fuente: [`U6_cobertura-summary.json`] (11/11, sobre `7d927df`), agregado por carpeta. Umbrales: [`vitest.config.mts`], **sin tocar**.

| Carpeta | Líneas | Ramas | Funciones | Umbral exigido | ¿Cumple? |
|---|---|---|---|---|---|
| `src/lib` | **87,8 %** (122/139) | 81,7 % (116/142) | 82,5 % (33/40) | **80 % de líneas** | **Sí** |
| `src/services` | **73,9 %** (654/885) | 57,2 % (442/773) | 66,0 % (206/312) | **60 % de líneas** | **Sí** |
| `src/hooks` | **32,6 %** (298/915) | 14,2 % (65/457) | 13,8 % (26/189) | sin umbral (D-WEB-05) | — |
| **Total medido (todo `src`)** | **28,1 %** (1385/4925) | 20,3 % (894/4394) | 23,6 % (347/1473) | sin umbral global | — |

Archivos medidos: 141 (entran `src/proxy.ts` y `src/app/(auth)/layout.tsx`). La lógica (las tres carpetas juntas) da **55,4 %** de líneas (1074/1939). Los umbrales de `vitest.config.mts` no se tocaron.

**Aviso para el informe formal:** el 28,1 % no es comparable con el 53,1 % del 02/11. Hoy se mide todo `src` y antes solo `lib`, `services` y `hooks`: cambió el denominador, no la cantidad de pruebas (D-WEB-13).

### 4.2 Cobertura en código nuevo según SonarQube

| Medida | Valor | Fuente |
|---|---|---|
| Cobertura del código nuevo | **86,6 %** | [API `/api/measures/component?pullRequest=34`, análisis de `e886144`] |
| Líneas nuevas por cubrir | 368 | ídem |
| Líneas nuevas sin cubrir | 32 | ídem |
| Condición del Quality Gate | ≥ 80 % → **cumple** | [API `/api/qualitygates/project_status?pullRequest=34`] |

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
| `src/proxy.ts` (antes `proxy.ts`, DEF-WEB-04) | D-WEB-13 |

**No** están excluidos: `src/hooks`, `src/lib`, `src/services`, `src/app/api/**` ni los componentes con lógica y prueba propia (`PasswordChecklist`, `SelectorHijo`, `RegistroMasivo`, `FallidosMasivo`). Por eso la lista va archivo por archivo en vez de `src/components/**` [`sonar-project.properties`, D-WEB-13].

**c) `sonar.exclusions`** (fuera de **todo** el análisis, no solo de la cobertura): `src/app/home/**`, `src/components/home/**`, `.next/**`, `coverage/**`, `e2e/**`, `public/**` [`sonar-project.properties`]. Son páginas informativas y salidas generadas.

---

## 5. DETALLE POR CASO DE PRUEBA

### 5.1 Unitarias y de componentes · 331 casos ejecutados, todos APROBADO

Fuente: `U6_unitarias.xml` (11/11/2026, commit `7d927df`). IDs según `tests/trazabilidad.json`: los casos sin regla propia se numeran como `UT-WEB-EXTRA-nnn` en el orden del XML, así que **la numeración de los EXTRA no coincide con la del informe anterior**.

| ID del caso | Nombre del test | Archivo | Resultado | Evidencia | Observación |
|---|---|---|---|---|---|
| UT-WEB-EXTRA-001 | tests/apiBase.test.ts | `tests/apiBase.test.ts` | APROBADO | U6_unitarias.xml | Base de la API del proxy (arreglos de SonarQube, D-WEB-14) |
| UT-WEB-EXTRA-002 | tests/apiBase.test.ts | `tests/apiBase.test.ts` | APROBADO | U6_unitarias.xml | Base de la API del proxy (arreglos de SonarQube, D-WEB-14) |
| UT-WEB-EXTRA-003 | tests/apiBase.test.ts | `tests/apiBase.test.ts` | APROBADO | U6_unitarias.xml | Base de la API del proxy (arreglos de SonarQube, D-WEB-14) |
| UT-WEB-EXTRA-004 | tests/apiBase.test.ts | `tests/apiBase.test.ts` | APROBADO | U6_unitarias.xml | Base de la API del proxy (arreglos de SonarQube, D-WEB-14) |
| UT-WEB-EXTRA-005 | tests/apiBase.test.ts | `tests/apiBase.test.ts` | APROBADO | U6_unitarias.xml | Base de la API del proxy (arreglos de SonarQube, D-WEB-14) |
| UT-WEB-EXTRA-006 | tests/apiBase.test.ts | `tests/apiBase.test.ts` | APROBADO | U6_unitarias.xml | Base de la API del proxy (arreglos de SonarQube, D-WEB-14) |
| UT-WEB-EXTRA-007 | tests/apiBase.test.ts | `tests/apiBase.test.ts` | APROBADO | U6_unitarias.xml | Base de la API del proxy (arreglos de SonarQube, D-WEB-14) |
| UT-WEB-EXTRA-008 | tests/apiBase.test.ts | `tests/apiBase.test.ts` | APROBADO | U6_unitarias.xml | Base de la API del proxy (arreglos de SonarQube, D-WEB-14) |
| UT-WEB-EXTRA-009 | tests/apiBase.test.ts | `tests/apiBase.test.ts` | APROBADO | U6_unitarias.xml | Base de la API del proxy (arreglos de SonarQube, D-WEB-14) |
| UT-WEB-EXTRA-010 | tests/apiBase.test.ts | `tests/apiBase.test.ts` | APROBADO | U6_unitarias.xml | Base de la API del proxy (arreglos de SonarQube, D-WEB-14) |
| UT-WEB-EXTRA-011 | tests/apiBase.test.ts | `tests/apiBase.test.ts` | APROBADO | U6_unitarias.xml | Base de la API del proxy (arreglos de SonarQube, D-WEB-14) |
| UT-WEB-EXTRA-012 | tests/apiBase.test.ts | `tests/apiBase.test.ts` | APROBADO | U6_unitarias.xml | Base de la API del proxy (arreglos de SonarQube, D-WEB-14) |
| UT-WEB-EXTRA-013 | tests/apiBase.test.ts | `tests/apiBase.test.ts` | APROBADO | U6_unitarias.xml | Base de la API del proxy (arreglos de SonarQube, D-WEB-14) |
| UT-WEB-03 | tests/apiClient.test.ts | `tests/apiClient.test.ts` | APROBADO | U6_unitarias.xml | WEB-02 · cookies |
| UT-WEB-03 | tests/apiClient.test.ts | `tests/apiClient.test.ts` | APROBADO | U6_unitarias.xml | WEB-02 · cookies |
| UT-WEB-03 | tests/apiClient.test.ts | `tests/apiClient.test.ts` | APROBADO | U6_unitarias.xml | WEB-02 · cookies |
| UT-WEB-03 | tests/apiClient.test.ts | `tests/apiClient.test.ts` | APROBADO | U6_unitarias.xml | WEB-02 · cookies |
| UT-WEB-03 | tests/apiClient.test.ts | `tests/apiClient.test.ts` | APROBADO | U6_unitarias.xml | WEB-02 · cookies |
| UT-WEB-03 | tests/apiClient.test.ts | `tests/apiClient.test.ts` | APROBADO | U6_unitarias.xml | WEB-02 · cookies |
| UT-WEB-03 | tests/apiClient.test.ts | `tests/apiClient.test.ts` | APROBADO | U6_unitarias.xml | WEB-02 · cookies |
| UT-WEB-03 | tests/apiClient.test.ts | `tests/apiClient.test.ts` | APROBADO | U6_unitarias.xml | WEB-02 · cookies |
| UT-WEB-03 | tests/apiClient.test.ts | `tests/apiClient.test.ts` | APROBADO | U6_unitarias.xml | WEB-02 · cookies |
| UT-WEB-03 | tests/apiClient.test.ts | `tests/apiClient.test.ts` | APROBADO | U6_unitarias.xml | WEB-02 · cookies |
| UT-WEB-03 | tests/apiClient.test.ts | `tests/apiClient.test.ts` | APROBADO | U6_unitarias.xml | WEB-02 · cookies |
| UT-WEB-03 | tests/apiClient.test.ts | `tests/apiClient.test.ts` | APROBADO | U6_unitarias.xml | WEB-02 · cookies |
| UT-WEB-03 | tests/apiClient.test.ts | `tests/apiClient.test.ts` | APROBADO | U6_unitarias.xml | WEB-02 · cookies |
| UT-WEB-03 | tests/apiClient.test.ts | `tests/apiClient.test.ts` | APROBADO | U6_unitarias.xml | WEB-02 · cookies |
| UT-WEB-03 | tests/apiProxy.test.ts | `tests/apiProxy.test.ts` | APROBADO | U6_unitarias.xml | WEB-02 · cookies y proxy |
| UT-WEB-03 | tests/apiProxy.test.ts | `tests/apiProxy.test.ts` | APROBADO | U6_unitarias.xml | WEB-02 · cookies y proxy |
| UT-WEB-03 | tests/apiProxy.test.ts | `tests/apiProxy.test.ts` | APROBADO | U6_unitarias.xml | WEB-02 · cookies y proxy |
| UT-WEB-03 | tests/apiProxy.test.ts | `tests/apiProxy.test.ts` | APROBADO | U6_unitarias.xml | WEB-02 · cookies y proxy |
| UT-WEB-03 | tests/apiProxy.test.ts | `tests/apiProxy.test.ts` | APROBADO | U6_unitarias.xml | WEB-02 · cookies y proxy |
| UT-WEB-03 | tests/apiProxy.test.ts | `tests/apiProxy.test.ts` | APROBADO | U6_unitarias.xml | WEB-02 · cookies y proxy |
| UT-WEB-03 | tests/apiProxy.test.ts | `tests/apiProxy.test.ts` | APROBADO | U6_unitarias.xml | WEB-02 · cookies y proxy |
| UT-WEB-03 | tests/apiProxy.test.ts | `tests/apiProxy.test.ts` | APROBADO | U6_unitarias.xml | WEB-02 · cookies y proxy |
| UT-WEB-03 | tests/apiProxy.test.ts | `tests/apiProxy.test.ts` | APROBADO | U6_unitarias.xml | WEB-02 · cookies y proxy |
| UT-WEB-03 | tests/apiProxy.test.ts | `tests/apiProxy.test.ts` | APROBADO | U6_unitarias.xml | WEB-02 · cookies y proxy |
| UT-WEB-03 | tests/apiProxy.test.ts | `tests/apiProxy.test.ts` | APROBADO | U6_unitarias.xml | WEB-02 · cookies y proxy |
| UT-WEB-03 | tests/apiProxy.test.ts | `tests/apiProxy.test.ts` | APROBADO | U6_unitarias.xml | WEB-02 · cookies y proxy |
| UT-WEB-03 | tests/apiProxy.test.ts | `tests/apiProxy.test.ts` | APROBADO | U6_unitarias.xml | WEB-02 · cookies y proxy |
| UT-WEB-03 | tests/apiProxy.test.ts | `tests/apiProxy.test.ts` | APROBADO | U6_unitarias.xml | WEB-02 · cookies y proxy |
| UT-WEB-03 | tests/apiProxy.test.ts | `tests/apiProxy.test.ts` | APROBADO | U6_unitarias.xml | WEB-02 · cookies y proxy |
| UT-WEB-03 | tests/apiProxy.test.ts | `tests/apiProxy.test.ts` | APROBADO | U6_unitarias.xml | WEB-02 · cookies y proxy |
| UT-WEB-03 | tests/apiProxy.test.ts | `tests/apiProxy.test.ts` | APROBADO | U6_unitarias.xml | WEB-02 · cookies y proxy |
| UT-WEB-EXTRA-014 | tests/arquitectura.test.ts | `tests/arquitectura.test.ts` | APROBADO | U6_unitarias.xml | Reglas de código testeable leídas del código fuente |
| UT-WEB-EXTRA-015 | tests/arquitectura.test.ts | `tests/arquitectura.test.ts` | APROBADO | U6_unitarias.xml | Reglas de código testeable leídas del código fuente |
| UT-WEB-EXTRA-016 | tests/arquitectura.test.ts | `tests/arquitectura.test.ts` | APROBADO | U6_unitarias.xml | Reglas de código testeable leídas del código fuente |
| UT-WEB-EXTRA-017 | tests/arquitectura.test.ts | `tests/arquitectura.test.ts` | APROBADO | U6_unitarias.xml | Reglas de código testeable leídas del código fuente |
| UT-WEB-EXTRA-018 | tests/arquitectura.test.ts | `tests/arquitectura.test.ts` | APROBADO | U6_unitarias.xml | Reglas de código testeable leídas del código fuente |
| UT-WEB-EXTRA-019 | tests/arquitectura.test.ts | `tests/arquitectura.test.ts` | APROBADO | U6_unitarias.xml | Reglas de código testeable leídas del código fuente |
| UT-WEB-EXTRA-020 | tests/arquitectura.test.ts | `tests/arquitectura.test.ts` | APROBADO | U6_unitarias.xml | Reglas de código testeable leídas del código fuente |
| UT-WEB-EXTRA-021 | tests/arquitectura.test.ts | `tests/arquitectura.test.ts` | APROBADO | U6_unitarias.xml | Reglas de código testeable leídas del código fuente |
| UT-WEB-EXTRA-022 | tests/arquitectura.test.ts | `tests/arquitectura.test.ts` | APROBADO | U6_unitarias.xml | Reglas de código testeable leídas del código fuente |
| IT-WEB-02 | tests/asociadoActions.test.ts | `tests/asociadoActions.test.ts` | APROBADO | U6_unitarias.xml | WEB-03 · contrato /padres/me/hijos |
| IT-WEB-02 | tests/asociadoActions.test.ts | `tests/asociadoActions.test.ts` | APROBADO | U6_unitarias.xml | WEB-03 · contrato /padres/me/hijos |
| IT-WEB-02 | tests/asociadoActions.test.ts | `tests/asociadoActions.test.ts` | APROBADO | U6_unitarias.xml | WEB-03 · contrato /padres/me/hijos |
| IT-WEB-02 | tests/asociadoActions.test.ts | `tests/asociadoActions.test.ts` | APROBADO | U6_unitarias.xml | WEB-03 · contrato /padres/me/hijos |
| IT-WEB-02 | tests/asociadoActions.test.ts | `tests/asociadoActions.test.ts` | APROBADO | U6_unitarias.xml | WEB-03 · contrato /padres/me/hijos |
| IT-WEB-02 | tests/asociadoActions.test.ts | `tests/asociadoActions.test.ts` | APROBADO | U6_unitarias.xml | WEB-03 · contrato /padres/me/hijos |
| IT-WEB-02 | tests/asociadoActions.test.ts | `tests/asociadoActions.test.ts` | APROBADO | U6_unitarias.xml | WEB-03 · contrato /padres/me/hijos |
| IT-WEB-02 | tests/asociadoActions.test.ts | `tests/asociadoActions.test.ts` | APROBADO | U6_unitarias.xml | WEB-03 · contrato /padres/me/hijos |
| IT-WEB-02 | tests/asociadoActions.test.ts | `tests/asociadoActions.test.ts` | APROBADO | U6_unitarias.xml | WEB-03 · contrato /padres/me/hijos |
| IT-WEB-02 | tests/asociadoActions.test.ts | `tests/asociadoActions.test.ts` | APROBADO | U6_unitarias.xml | WEB-03 · contrato /padres/me/hijos |
| IT-WEB-02 | tests/asociadoActions.test.ts | `tests/asociadoActions.test.ts` | APROBADO | U6_unitarias.xml | WEB-03 · contrato /padres/me/hijos |
| IT-WEB-02 | tests/asociadoActions.test.ts | `tests/asociadoActions.test.ts` | APROBADO | U6_unitarias.xml | WEB-03 · contrato /padres/me/hijos |
| IT-WEB-02 | tests/asociadoActions.test.ts | `tests/asociadoActions.test.ts` | APROBADO | U6_unitarias.xml | WEB-03 · contrato /padres/me/hijos |
| UT-WEB-EXTRA-023 | tests/asociadoViewer.test.ts | `tests/asociadoViewer.test.ts` | APROBADO | U6_unitarias.xml | Notas, novedades y horario del estudiante asociado (WEB-03) |
| UT-WEB-EXTRA-024 | tests/asociadoViewer.test.ts | `tests/asociadoViewer.test.ts` | APROBADO | U6_unitarias.xml | Notas, novedades y horario del estudiante asociado (WEB-03) |
| UT-WEB-EXTRA-025 | tests/asociadoViewer.test.ts | `tests/asociadoViewer.test.ts` | APROBADO | U6_unitarias.xml | Notas, novedades y horario del estudiante asociado (WEB-03) |
| UT-WEB-EXTRA-026 | tests/asociadoViewer.test.ts | `tests/asociadoViewer.test.ts` | APROBADO | U6_unitarias.xml | Notas, novedades y horario del estudiante asociado (WEB-03) |
| UT-WEB-EXTRA-027 | tests/asociadoViewer.test.ts | `tests/asociadoViewer.test.ts` | APROBADO | U6_unitarias.xml | Notas, novedades y horario del estudiante asociado (WEB-03) |
| UT-WEB-EXTRA-028 | tests/asociadoViewer.test.ts | `tests/asociadoViewer.test.ts` | APROBADO | U6_unitarias.xml | Notas, novedades y horario del estudiante asociado (WEB-03) |
| UT-WEB-EXTRA-029 | tests/asociadoViewer.test.ts | `tests/asociadoViewer.test.ts` | APROBADO | U6_unitarias.xml | Notas, novedades y horario del estudiante asociado (WEB-03) |
| UT-WEB-EXTRA-030 | tests/asociadoViewer.test.ts | `tests/asociadoViewer.test.ts` | APROBADO | U6_unitarias.xml | Notas, novedades y horario del estudiante asociado (WEB-03) |
| UT-WEB-EXTRA-031 | tests/asociadoViewer.test.ts | `tests/asociadoViewer.test.ts` | APROBADO | U6_unitarias.xml | Notas, novedades y horario del estudiante asociado (WEB-03) |
| UT-WEB-03 | tests/authCookies.test.ts | `tests/authCookies.test.ts` | APROBADO | U6_unitarias.xml | WEB-02 · cookies |
| UT-WEB-03 | tests/authCookies.test.ts | `tests/authCookies.test.ts` | APROBADO | U6_unitarias.xml | WEB-02 · cookies |
| UT-WEB-03 | tests/authCookies.test.ts | `tests/authCookies.test.ts` | APROBADO | U6_unitarias.xml | WEB-02 · cookies |
| UT-WEB-03 | tests/authCookies.test.ts | `tests/authCookies.test.ts` | APROBADO | U6_unitarias.xml | WEB-02 · cookies |
| UT-WEB-03 | tests/authCookies.test.ts | `tests/authCookies.test.ts` | APROBADO | U6_unitarias.xml | WEB-02 · cookies |
| UT-WEB-03 | tests/decodeRol.test.ts | `tests/decodeRol.test.ts` | APROBADO | U6_unitarias.xml | WEB-02 · cookies |
| UT-WEB-03 | tests/decodeRol.test.ts | `tests/decodeRol.test.ts` | APROBADO | U6_unitarias.xml | WEB-02 · cookies |
| UT-WEB-03 | tests/decodeRol.test.ts | `tests/decodeRol.test.ts` | APROBADO | U6_unitarias.xml | WEB-02 · cookies |
| UT-WEB-03 | tests/decodeRol.test.ts | `tests/decodeRol.test.ts` | APROBADO | U6_unitarias.xml | WEB-02 · cookies |
| UT-WEB-03 | tests/decodeRol.test.ts | `tests/decodeRol.test.ts` | APROBADO | U6_unitarias.xml | WEB-02 · cookies |
| UT-WEB-EXTRA-032 | tests/defectos.test.ts | `tests/defectos.test.ts` | APROBADO | U6_unitarias.xml | Gestión de defectos en GitHub Issues (D-WEB-15) |
| UT-WEB-EXTRA-033 | tests/defectos.test.ts | `tests/defectos.test.ts` | APROBADO | U6_unitarias.xml | Gestión de defectos en GitHub Issues (D-WEB-15) |
| UT-WEB-EXTRA-034 | tests/defectos.test.ts | `tests/defectos.test.ts` | APROBADO | U6_unitarias.xml | Gestión de defectos en GitHub Issues (D-WEB-15) |
| UT-WEB-EXTRA-035 | tests/defectos.test.ts | `tests/defectos.test.ts` | APROBADO | U6_unitarias.xml | Gestión de defectos en GitHub Issues (D-WEB-15) |
| UT-WEB-EXTRA-036 | tests/defectos.test.ts | `tests/defectos.test.ts` | APROBADO | U6_unitarias.xml | Gestión de defectos en GitHub Issues (D-WEB-15) |
| UT-WEB-EXTRA-037 | tests/defectos.test.ts | `tests/defectos.test.ts` | APROBADO | U6_unitarias.xml | Gestión de defectos en GitHub Issues (D-WEB-15) |
| UT-WEB-EXTRA-038 | tests/defectos.test.ts | `tests/defectos.test.ts` | APROBADO | U6_unitarias.xml | Gestión de defectos en GitHub Issues (D-WEB-15) |
| UT-WEB-EXTRA-039 | tests/defectos.test.ts | `tests/defectos.test.ts` | APROBADO | U6_unitarias.xml | Gestión de defectos en GitHub Issues (D-WEB-15) |
| UT-WEB-EXTRA-040 | tests/defectos.test.ts | `tests/defectos.test.ts` | APROBADO | U6_unitarias.xml | Gestión de defectos en GitHub Issues (D-WEB-15) |
| UT-WEB-EXTRA-041 | tests/defectos.test.ts | `tests/defectos.test.ts` | APROBADO | U6_unitarias.xml | Gestión de defectos en GitHub Issues (D-WEB-15) |
| UT-WEB-EXTRA-042 | tests/defectos.test.ts | `tests/defectos.test.ts` | APROBADO | U6_unitarias.xml | Gestión de defectos en GitHub Issues (D-WEB-15) |
| UT-WEB-EXTRA-043 | tests/defectos.test.ts | `tests/defectos.test.ts` | APROBADO | U6_unitarias.xml | Gestión de defectos en GitHub Issues (D-WEB-15) |
| UT-WEB-EXTRA-044 | tests/defectos.test.ts | `tests/defectos.test.ts` | APROBADO | U6_unitarias.xml | Gestión de defectos en GitHub Issues (D-WEB-15) |
| UT-WEB-EXTRA-045 | tests/defectos.test.ts | `tests/defectos.test.ts` | APROBADO | U6_unitarias.xml | Gestión de defectos en GitHub Issues (D-WEB-15) |
| UT-WEB-EXTRA-046 | tests/defectos.test.ts | `tests/defectos.test.ts` | APROBADO | U6_unitarias.xml | Gestión de defectos en GitHub Issues (D-WEB-15) |
| UT-WEB-EXTRA-047 | tests/defectos.test.ts | `tests/defectos.test.ts` | APROBADO | U6_unitarias.xml | Gestión de defectos en GitHub Issues (D-WEB-15) |
| UT-WEB-EXTRA-048 | tests/defectos.test.ts | `tests/defectos.test.ts` | APROBADO | U6_unitarias.xml | Gestión de defectos en GitHub Issues (D-WEB-15) |
| UT-WEB-EXTRA-049 | tests/defectos.test.ts | `tests/defectos.test.ts` | APROBADO | U6_unitarias.xml | Gestión de defectos en GitHub Issues (D-WEB-15) |
| UT-WEB-EXTRA-050 | tests/defectos.test.ts | `tests/defectos.test.ts` | APROBADO | U6_unitarias.xml | Gestión de defectos en GitHub Issues (D-WEB-15) |
| UT-WEB-EXTRA-051 | tests/defectos.test.ts | `tests/defectos.test.ts` | APROBADO | U6_unitarias.xml | Gestión de defectos en GitHub Issues (D-WEB-15) |
| UT-WEB-EXTRA-052 | tests/defectos.test.ts | `tests/defectos.test.ts` | APROBADO | U6_unitarias.xml | Gestión de defectos en GitHub Issues (D-WEB-15) |
| UT-WEB-EXTRA-053 | tests/defectos.test.ts | `tests/defectos.test.ts` | APROBADO | U6_unitarias.xml | Gestión de defectos en GitHub Issues (D-WEB-15) |
| UT-WEB-EXTRA-054 | tests/defectos.test.ts | `tests/defectos.test.ts` | APROBADO | U6_unitarias.xml | Gestión de defectos en GitHub Issues (D-WEB-15) |
| UT-WEB-EXTRA-055 | tests/defectos.test.ts | `tests/defectos.test.ts` | APROBADO | U6_unitarias.xml | Gestión de defectos en GitHub Issues (D-WEB-15) |
| UT-WEB-EXTRA-056 | tests/defectos.test.ts | `tests/defectos.test.ts` | APROBADO | U6_unitarias.xml | Gestión de defectos en GitHub Issues (D-WEB-15) |
| UT-WEB-04 | tests/hijoActivo.test.ts | `tests/hijoActivo.test.ts` | APROBADO | U6_unitarias.xml | WEB-03 · varios hijos |
| UT-WEB-04 | tests/hijoActivo.test.ts | `tests/hijoActivo.test.ts` | APROBADO | U6_unitarias.xml | WEB-03 · varios hijos |
| UT-WEB-04 | tests/hijoActivo.test.ts | `tests/hijoActivo.test.ts` | APROBADO | U6_unitarias.xml | WEB-03 · varios hijos |
| UT-WEB-04 | tests/hijoActivo.test.ts | `tests/hijoActivo.test.ts` | APROBADO | U6_unitarias.xml | WEB-03 · varios hijos |
| UT-WEB-04 | tests/hijoActivo.test.ts | `tests/hijoActivo.test.ts` | APROBADO | U6_unitarias.xml | WEB-03 · varios hijos |
| UT-WEB-04 | tests/hijoActivo.test.ts | `tests/hijoActivo.test.ts` | APROBADO | U6_unitarias.xml | WEB-03 · varios hijos |
| UT-WEB-08 | tests/notasService.test.ts | `tests/notasService.test.ts` | APROBADO | U6_unitarias.xml | WEB-09 · boletín y mensajes |
| UT-WEB-08 | tests/notasService.test.ts | `tests/notasService.test.ts` | APROBADO | U6_unitarias.xml | WEB-09 · boletín y mensajes |
| UT-WEB-08 | tests/notasService.test.ts | `tests/notasService.test.ts` | APROBADO | U6_unitarias.xml | WEB-09 · boletín y mensajes |
| UT-WEB-08 | tests/notasService.test.ts | `tests/notasService.test.ts` | APROBADO | U6_unitarias.xml | WEB-09 · boletín y mensajes |
| UT-WEB-EXTRA-057 | tests/password.test.ts | `tests/password.test.ts` | APROBADO | U6_unitarias.xml | Política de contraseñas (base de WEB-05) |
| UT-WEB-EXTRA-058 | tests/password.test.ts | `tests/password.test.ts` | APROBADO | U6_unitarias.xml | Política de contraseñas (base de WEB-05) |
| UT-WEB-EXTRA-059 | tests/password.test.ts | `tests/password.test.ts` | APROBADO | U6_unitarias.xml | Política de contraseñas (base de WEB-05) |
| UT-WEB-EXTRA-060 | tests/password.test.ts | `tests/password.test.ts` | APROBADO | U6_unitarias.xml | Política de contraseñas (base de WEB-05) |
| UT-WEB-EXTRA-061 | tests/password.test.ts | `tests/password.test.ts` | APROBADO | U6_unitarias.xml | Política de contraseñas (base de WEB-05) |
| UT-WEB-EXTRA-062 | tests/password.test.ts | `tests/password.test.ts` | APROBADO | U6_unitarias.xml | Política de contraseñas (base de WEB-05) |
| UT-WEB-EXTRA-063 | tests/permissions.test.ts | `tests/permissions.test.ts` | APROBADO | U6_unitarias.xml | Prueba no planeada |
| UT-WEB-EXTRA-064 | tests/permissions.test.ts | `tests/permissions.test.ts` | APROBADO | U6_unitarias.xml | Prueba no planeada |
| UT-WEB-EXTRA-065 | tests/permissions.test.ts | `tests/permissions.test.ts` | APROBADO | U6_unitarias.xml | Prueba no planeada |
| UT-WEB-EXTRA-066 | tests/permissions.test.ts | `tests/permissions.test.ts` | APROBADO | U6_unitarias.xml | Prueba no planeada |
| UT-WEB-EXTRA-067 | tests/permissions.test.ts | `tests/permissions.test.ts` | APROBADO | U6_unitarias.xml | Prueba no planeada |
| UT-WEB-EXTRA-068 | tests/permissions.test.ts | `tests/permissions.test.ts` | APROBADO | U6_unitarias.xml | Prueba no planeada |
| UT-WEB-EXTRA-069 | tests/permissions.test.ts | `tests/permissions.test.ts` | APROBADO | U6_unitarias.xml | Prueba no planeada |
| UT-WEB-EXTRA-070 | tests/permissions.test.ts | `tests/permissions.test.ts` | APROBADO | U6_unitarias.xml | Prueba no planeada |
| UT-WEB-EXTRA-071 | tests/permissions.test.ts | `tests/permissions.test.ts` | APROBADO | U6_unitarias.xml | Prueba no planeada |
| UT-WEB-EXTRA-072 | tests/permissions.test.ts | `tests/permissions.test.ts` | APROBADO | U6_unitarias.xml | Prueba no planeada |
| UT-WEB-EXTRA-073 | tests/register.test.ts | `tests/register.test.ts` | APROBADO | U6_unitarias.xml | Validación por rol de register (WEB-05, cobertura D-WEB-13) |
| UT-WEB-EXTRA-074 | tests/register.test.ts | `tests/register.test.ts` | APROBADO | U6_unitarias.xml | Validación por rol de register (WEB-05, cobertura D-WEB-13) |
| UT-WEB-EXTRA-075 | tests/register.test.ts | `tests/register.test.ts` | APROBADO | U6_unitarias.xml | Validación por rol de register (WEB-05, cobertura D-WEB-13) |
| UT-WEB-EXTRA-076 | tests/register.test.ts | `tests/register.test.ts` | APROBADO | U6_unitarias.xml | Validación por rol de register (WEB-05, cobertura D-WEB-13) |
| UT-WEB-EXTRA-077 | tests/register.test.ts | `tests/register.test.ts` | APROBADO | U6_unitarias.xml | Validación por rol de register (WEB-05, cobertura D-WEB-13) |
| UT-WEB-EXTRA-078 | tests/register.test.ts | `tests/register.test.ts` | APROBADO | U6_unitarias.xml | Validación por rol de register (WEB-05, cobertura D-WEB-13) |
| UT-WEB-EXTRA-079 | tests/register.test.ts | `tests/register.test.ts` | APROBADO | U6_unitarias.xml | Validación por rol de register (WEB-05, cobertura D-WEB-13) |
| UT-WEB-EXTRA-080 | tests/register.test.ts | `tests/register.test.ts` | APROBADO | U6_unitarias.xml | Validación por rol de register (WEB-05, cobertura D-WEB-13) |
| UT-WEB-EXTRA-081 | tests/register.test.ts | `tests/register.test.ts` | APROBADO | U6_unitarias.xml | Validación por rol de register (WEB-05, cobertura D-WEB-13) |
| UT-WEB-EXTRA-082 | tests/register.test.ts | `tests/register.test.ts` | APROBADO | U6_unitarias.xml | Validación por rol de register (WEB-05, cobertura D-WEB-13) |
| UT-WEB-EXTRA-083 | tests/register.test.ts | `tests/register.test.ts` | APROBADO | U6_unitarias.xml | Validación por rol de register (WEB-05, cobertura D-WEB-13) |
| UT-WEB-EXTRA-084 | tests/register.test.ts | `tests/register.test.ts` | APROBADO | U6_unitarias.xml | Validación por rol de register (WEB-05, cobertura D-WEB-13) |
| UT-WEB-EXTRA-085 | tests/register.test.ts | `tests/register.test.ts` | APROBADO | U6_unitarias.xml | Validación por rol de register (WEB-05, cobertura D-WEB-13) |
| UT-WEB-EXTRA-086 | tests/register.test.ts | `tests/register.test.ts` | APROBADO | U6_unitarias.xml | Validación por rol de register (WEB-05, cobertura D-WEB-13) |
| UT-WEB-EXTRA-087 | tests/register.test.ts | `tests/register.test.ts` | APROBADO | U6_unitarias.xml | Validación por rol de register (WEB-05, cobertura D-WEB-13) |
| UT-WEB-EXTRA-088 | tests/register.test.ts | `tests/register.test.ts` | APROBADO | U6_unitarias.xml | Validación por rol de register (WEB-05, cobertura D-WEB-13) |
| UT-WEB-EXTRA-089 | tests/register.test.ts | `tests/register.test.ts` | APROBADO | U6_unitarias.xml | Validación por rol de register (WEB-05, cobertura D-WEB-13) |
| UT-WEB-EXTRA-090 | tests/register.test.ts | `tests/register.test.ts` | APROBADO | U6_unitarias.xml | Validación por rol de register (WEB-05, cobertura D-WEB-13) |
| UT-WEB-EXTRA-091 | tests/register.test.ts | `tests/register.test.ts` | APROBADO | U6_unitarias.xml | Validación por rol de register (WEB-05, cobertura D-WEB-13) |
| UT-WEB-07 | tests/registroMasivo.test.ts | `tests/registroMasivo.test.ts` | APROBADO | U6_unitarias.xml | WEB-06 · registro masivo |
| UT-WEB-07 | tests/registroMasivo.test.ts | `tests/registroMasivo.test.ts` | APROBADO | U6_unitarias.xml | WEB-06 · registro masivo |
| UT-WEB-07 | tests/registroMasivo.test.ts | `tests/registroMasivo.test.ts` | APROBADO | U6_unitarias.xml | WEB-06 · registro masivo |
| UT-WEB-07 | tests/registroMasivo.test.ts | `tests/registroMasivo.test.ts` | APROBADO | U6_unitarias.xml | WEB-06 · registro masivo |
| UT-WEB-07 | tests/registroMasivo.test.ts | `tests/registroMasivo.test.ts` | APROBADO | U6_unitarias.xml | WEB-06 · registro masivo |
| UT-WEB-07 | tests/registroMasivo.test.ts | `tests/registroMasivo.test.ts` | APROBADO | U6_unitarias.xml | WEB-06 · registro masivo |
| UT-WEB-07 | tests/registroMasivo.test.ts | `tests/registroMasivo.test.ts` | APROBADO | U6_unitarias.xml | WEB-06 · registro masivo |
| UT-WEB-06 | tests/resetPassword.test.ts | `tests/resetPassword.test.ts` | APROBADO | U6_unitarias.xml | WEB-05 · restablecer contraseña |
| UT-WEB-06 | tests/resetPassword.test.ts | `tests/resetPassword.test.ts` | APROBADO | U6_unitarias.xml | WEB-05 · restablecer contraseña |
| UT-WEB-06 | tests/resetPassword.test.ts | `tests/resetPassword.test.ts` | APROBADO | U6_unitarias.xml | WEB-05 · restablecer contraseña |
| UT-WEB-06 | tests/resetPassword.test.ts | `tests/resetPassword.test.ts` | APROBADO | U6_unitarias.xml | WEB-05 · restablecer contraseña |
| UT-WEB-06 | tests/resetPassword.test.ts | `tests/resetPassword.test.ts` | APROBADO | U6_unitarias.xml | WEB-05 · restablecer contraseña |
| UT-WEB-02 | tests/routeGuard.test.ts | `tests/routeGuard.test.ts` | APROBADO | U6_unitarias.xml | WEB-01 · sesión y rutas |
| UT-WEB-02 | tests/routeGuard.test.ts | `tests/routeGuard.test.ts` | APROBADO | U6_unitarias.xml | WEB-01 · sesión y rutas |
| UT-WEB-02 | tests/routeGuard.test.ts | `tests/routeGuard.test.ts` | APROBADO | U6_unitarias.xml | WEB-01 · sesión y rutas |
| UT-WEB-02 | tests/routeGuard.test.ts | `tests/routeGuard.test.ts` | APROBADO | U6_unitarias.xml | WEB-01 · sesión y rutas |
| UT-WEB-02 | tests/routeGuard.test.ts | `tests/routeGuard.test.ts` | APROBADO | U6_unitarias.xml | WEB-01 · sesión y rutas |
| UT-WEB-02 | tests/routeGuard.test.ts | `tests/routeGuard.test.ts` | APROBADO | U6_unitarias.xml | WEB-01 · sesión y rutas |
| UT-WEB-02 | tests/routeGuard.test.ts | `tests/routeGuard.test.ts` | APROBADO | U6_unitarias.xml | WEB-01 · sesión y rutas |
| UT-WEB-02 | tests/routeGuard.test.ts | `tests/routeGuard.test.ts` | APROBADO | U6_unitarias.xml | WEB-01 · sesión y rutas |
| UT-WEB-02 | tests/routeGuard.test.ts | `tests/routeGuard.test.ts` | APROBADO | U6_unitarias.xml | WEB-01 · sesión y rutas |
| UT-WEB-02 | tests/routeGuard.test.ts | `tests/routeGuard.test.ts` | APROBADO | U6_unitarias.xml | WEB-01 · sesión y rutas |
| UT-WEB-02 | tests/routeGuard.test.ts | `tests/routeGuard.test.ts` | APROBADO | U6_unitarias.xml | WEB-01 · sesión y rutas |
| UT-WEB-02 | tests/routeGuard.test.ts | `tests/routeGuard.test.ts` | APROBADO | U6_unitarias.xml | WEB-01 · sesión y rutas |
| UT-WEB-02 | tests/routeGuard.test.ts | `tests/routeGuard.test.ts` | APROBADO | U6_unitarias.xml | WEB-01 · sesión y rutas |
| UT-WEB-02 | tests/routeGuard.test.ts | `tests/routeGuard.test.ts` | APROBADO | U6_unitarias.xml | WEB-01 · sesión y rutas |
| UT-WEB-02 | tests/routeGuard.test.ts | `tests/routeGuard.test.ts` | APROBADO | U6_unitarias.xml | WEB-01 · sesión y rutas |
| UT-WEB-02 | tests/routeGuard.test.ts | `tests/routeGuard.test.ts` | APROBADO | U6_unitarias.xml | WEB-01 · sesión y rutas |
| UT-WEB-02 | tests/routeGuard.test.ts | `tests/routeGuard.test.ts` | APROBADO | U6_unitarias.xml | WEB-01 · sesión y rutas |
| UT-WEB-02 | tests/routeGuard.test.ts | `tests/routeGuard.test.ts` | APROBADO | U6_unitarias.xml | WEB-01 · sesión y rutas |
| UT-WEB-02 | tests/routeGuard.test.ts | `tests/routeGuard.test.ts` | APROBADO | U6_unitarias.xml | WEB-01 · sesión y rutas |
| UT-WEB-02 | tests/routeGuard.test.ts | `tests/routeGuard.test.ts` | APROBADO | U6_unitarias.xml | WEB-01 · sesión y rutas |
| UT-WEB-02 | tests/routeRoles.test.ts | `tests/routeRoles.test.ts` | APROBADO | U6_unitarias.xml | WEB-01 · sesión y rutas |
| UT-WEB-02 | tests/routeRoles.test.ts | `tests/routeRoles.test.ts` | APROBADO | U6_unitarias.xml | WEB-01 · sesión y rutas |
| UT-WEB-02 | tests/routeRoles.test.ts | `tests/routeRoles.test.ts` | APROBADO | U6_unitarias.xml | WEB-01 · sesión y rutas |
| UT-WEB-02 | tests/routeRoles.test.ts | `tests/routeRoles.test.ts` | APROBADO | U6_unitarias.xml | WEB-01 · sesión y rutas |
| UT-WEB-02 | tests/routeRoles.test.ts | `tests/routeRoles.test.ts` | APROBADO | U6_unitarias.xml | WEB-01 · sesión y rutas |
| UT-WEB-02 | tests/routeRoles.test.ts | `tests/routeRoles.test.ts` | APROBADO | U6_unitarias.xml | WEB-01 · sesión y rutas |
| UT-WEB-02 | tests/routeRoles.test.ts | `tests/routeRoles.test.ts` | APROBADO | U6_unitarias.xml | WEB-01 · sesión y rutas |
| UT-WEB-02 | tests/routeRoles.test.ts | `tests/routeRoles.test.ts` | APROBADO | U6_unitarias.xml | WEB-01 · sesión y rutas |
| UT-WEB-02 | tests/routeRoles.test.ts | `tests/routeRoles.test.ts` | APROBADO | U6_unitarias.xml | WEB-01 · sesión y rutas |
| UT-WEB-02 | tests/routeRoles.test.ts | `tests/routeRoles.test.ts` | APROBADO | U6_unitarias.xml | WEB-01 · sesión y rutas |
| UT-WEB-EXTRA-092 | tests/serverFetch.test.ts | `tests/serverFetch.test.ts` | APROBADO | U6_unitarias.xml | serverFetch y ApiError (WEB-INF-1) |
| UT-WEB-EXTRA-093 | tests/serverFetch.test.ts | `tests/serverFetch.test.ts` | APROBADO | U6_unitarias.xml | serverFetch y ApiError (WEB-INF-1) |
| UT-WEB-EXTRA-094 | tests/serverFetch.test.ts | `tests/serverFetch.test.ts` | APROBADO | U6_unitarias.xml | serverFetch y ApiError (WEB-INF-1) |
| UT-WEB-EXTRA-095 | tests/serverFetch.test.ts | `tests/serverFetch.test.ts` | APROBADO | U6_unitarias.xml | serverFetch y ApiError (WEB-INF-1) |
| UT-WEB-EXTRA-096 | tests/services/actionsNotasNovedadesReportes.test.ts | `tests/services/actionsNotasNovedadesReportes.test.ts` | APROBADO | U6_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-097 | tests/services/actionsNotasNovedadesReportes.test.ts | `tests/services/actionsNotasNovedadesReportes.test.ts` | APROBADO | U6_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-098 | tests/services/actionsNotasNovedadesReportes.test.ts | `tests/services/actionsNotasNovedadesReportes.test.ts` | APROBADO | U6_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-099 | tests/services/actionsNotasNovedadesReportes.test.ts | `tests/services/actionsNotasNovedadesReportes.test.ts` | APROBADO | U6_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-100 | tests/services/actionsNotasNovedadesReportes.test.ts | `tests/services/actionsNotasNovedadesReportes.test.ts` | APROBADO | U6_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-101 | tests/services/actionsNotasNovedadesReportes.test.ts | `tests/services/actionsNotasNovedadesReportes.test.ts` | APROBADO | U6_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-102 | tests/services/actionsNotasNovedadesReportes.test.ts | `tests/services/actionsNotasNovedadesReportes.test.ts` | APROBADO | U6_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-103 | tests/services/actionsNotasNovedadesReportes.test.ts | `tests/services/actionsNotasNovedadesReportes.test.ts` | APROBADO | U6_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-104 | tests/services/actionsNotasNovedadesReportes.test.ts | `tests/services/actionsNotasNovedadesReportes.test.ts` | APROBADO | U6_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-105 | tests/services/actionsNotasNovedadesReportes.test.ts | `tests/services/actionsNotasNovedadesReportes.test.ts` | APROBADO | U6_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-106 | tests/services/actionsNotasNovedadesReportes.test.ts | `tests/services/actionsNotasNovedadesReportes.test.ts` | APROBADO | U6_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-107 | tests/services/actionsNotasNovedadesReportes.test.ts | `tests/services/actionsNotasNovedadesReportes.test.ts` | APROBADO | U6_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-108 | tests/services/actionsNotasNovedadesReportes.test.ts | `tests/services/actionsNotasNovedadesReportes.test.ts` | APROBADO | U6_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-109 | tests/services/actionsNotasNovedadesReportes.test.ts | `tests/services/actionsNotasNovedadesReportes.test.ts` | APROBADO | U6_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-110 | tests/services/actionsNotasNovedadesReportes.test.ts | `tests/services/actionsNotasNovedadesReportes.test.ts` | APROBADO | U6_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-111 | tests/services/actionsNotasNovedadesReportes.test.ts | `tests/services/actionsNotasNovedadesReportes.test.ts` | APROBADO | U6_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-112 | tests/services/dashboardActions.test.ts | `tests/services/dashboardActions.test.ts` | APROBADO | U6_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-113 | tests/services/dashboardActions.test.ts | `tests/services/dashboardActions.test.ts` | APROBADO | U6_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-114 | tests/services/dashboardActions.test.ts | `tests/services/dashboardActions.test.ts` | APROBADO | U6_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-115 | tests/services/dashboardActions.test.ts | `tests/services/dashboardActions.test.ts` | APROBADO | U6_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-116 | tests/services/dashboardActions.test.ts | `tests/services/dashboardActions.test.ts` | APROBADO | U6_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-117 | tests/services/dashboardActions.test.ts | `tests/services/dashboardActions.test.ts` | APROBADO | U6_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-118 | tests/services/dashboardService.test.ts | `tests/services/dashboardService.test.ts` | APROBADO | U6_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-119 | tests/services/dashboardService.test.ts | `tests/services/dashboardService.test.ts` | APROBADO | U6_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-120 | tests/services/dashboardService.test.ts | `tests/services/dashboardService.test.ts` | APROBADO | U6_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-121 | tests/services/dashboardService.test.ts | `tests/services/dashboardService.test.ts` | APROBADO | U6_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-122 | tests/services/dashboardService.test.ts | `tests/services/dashboardService.test.ts` | APROBADO | U6_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-123 | tests/services/dashboardService.test.ts | `tests/services/dashboardService.test.ts` | APROBADO | U6_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-124 | tests/services/horariosService.test.ts | `tests/services/horariosService.test.ts` | APROBADO | U6_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-125 | tests/services/horariosService.test.ts | `tests/services/horariosService.test.ts` | APROBADO | U6_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-126 | tests/services/horariosService.test.ts | `tests/services/horariosService.test.ts` | APROBADO | U6_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-127 | tests/services/horariosService.test.ts | `tests/services/horariosService.test.ts` | APROBADO | U6_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-128 | tests/services/horariosService.test.ts | `tests/services/horariosService.test.ts` | APROBADO | U6_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-129 | tests/services/horariosService.test.ts | `tests/services/horariosService.test.ts` | APROBADO | U6_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-130 | tests/services/horariosService.test.ts | `tests/services/horariosService.test.ts` | APROBADO | U6_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-131 | tests/services/horariosService.test.ts | `tests/services/horariosService.test.ts` | APROBADO | U6_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-132 | tests/services/horariosService.test.ts | `tests/services/horariosService.test.ts` | APROBADO | U6_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-133 | tests/services/horariosService.test.ts | `tests/services/horariosService.test.ts` | APROBADO | U6_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-134 | tests/services/horariosService.test.ts | `tests/services/horariosService.test.ts` | APROBADO | U6_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-135 | tests/services/novedadesQrService.test.ts | `tests/services/novedadesQrService.test.ts` | APROBADO | U6_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-136 | tests/services/novedadesQrService.test.ts | `tests/services/novedadesQrService.test.ts` | APROBADO | U6_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-137 | tests/services/novedadesQrService.test.ts | `tests/services/novedadesQrService.test.ts` | APROBADO | U6_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-138 | tests/services/novedadesQrService.test.ts | `tests/services/novedadesQrService.test.ts` | APROBADO | U6_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-139 | tests/services/novedadesQrService.test.ts | `tests/services/novedadesQrService.test.ts` | APROBADO | U6_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-140 | tests/services/novedadesQrService.test.ts | `tests/services/novedadesQrService.test.ts` | APROBADO | U6_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-141 | tests/services/novedadesQrService.test.ts | `tests/services/novedadesQrService.test.ts` | APROBADO | U6_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-142 | tests/services/novedadesQrService.test.ts | `tests/services/novedadesQrService.test.ts` | APROBADO | U6_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-143 | tests/services/novedadesQrService.test.ts | `tests/services/novedadesQrService.test.ts` | APROBADO | U6_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-144 | tests/services/usuarioService.test.ts | `tests/services/usuarioService.test.ts` | APROBADO | U6_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-145 | tests/services/usuarioService.test.ts | `tests/services/usuarioService.test.ts` | APROBADO | U6_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-146 | tests/services/usuarioService.test.ts | `tests/services/usuarioService.test.ts` | APROBADO | U6_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-147 | tests/services/usuarioService.test.ts | `tests/services/usuarioService.test.ts` | APROBADO | U6_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-148 | tests/services/usuarioService.test.ts | `tests/services/usuarioService.test.ts` | APROBADO | U6_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-149 | tests/services/usuarioService.test.ts | `tests/services/usuarioService.test.ts` | APROBADO | U6_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-150 | tests/services/usuarioService.test.ts | `tests/services/usuarioService.test.ts` | APROBADO | U6_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-151 | tests/services/usuarioService.test.ts | `tests/services/usuarioService.test.ts` | APROBADO | U6_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-152 | tests/services/usuarioService.test.ts | `tests/services/usuarioService.test.ts` | APROBADO | U6_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-153 | tests/services/usuarioService.test.ts | `tests/services/usuarioService.test.ts` | APROBADO | U6_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-154 | tests/services/usuarioService.test.ts | `tests/services/usuarioService.test.ts` | APROBADO | U6_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-155 | tests/services/usuarioService.test.ts | `tests/services/usuarioService.test.ts` | APROBADO | U6_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-156 | tests/services/usuarioService.test.ts | `tests/services/usuarioService.test.ts` | APROBADO | U6_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-157 | tests/services/usuarioService.test.ts | `tests/services/usuarioService.test.ts` | APROBADO | U6_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-158 | tests/services/usuariosService.test.ts | `tests/services/usuariosService.test.ts` | APROBADO | U6_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-159 | tests/services/usuariosService.test.ts | `tests/services/usuariosService.test.ts` | APROBADO | U6_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-160 | tests/services/usuariosService.test.ts | `tests/services/usuariosService.test.ts` | APROBADO | U6_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-161 | tests/services/usuariosService.test.ts | `tests/services/usuariosService.test.ts` | APROBADO | U6_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-162 | tests/services/usuariosService.test.ts | `tests/services/usuariosService.test.ts` | APROBADO | U6_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-163 | tests/services/usuariosService.test.ts | `tests/services/usuariosService.test.ts` | APROBADO | U6_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-164 | tests/services/usuariosService.test.ts | `tests/services/usuariosService.test.ts` | APROBADO | U6_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-165 | tests/services/usuariosService.test.ts | `tests/services/usuariosService.test.ts` | APROBADO | U6_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-166 | tests/services/usuariosService.test.ts | `tests/services/usuariosService.test.ts` | APROBADO | U6_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-167 | tests/components/FallidosMasivo.test.tsx | `tests/components/FallidosMasivo.test.tsx` | APROBADO | U6_unitarias.xml | Fallidos del registro masivo (WEB-06, cobertura D-WEB-13) |
| UT-WEB-EXTRA-168 | tests/components/FallidosMasivo.test.tsx | `tests/components/FallidosMasivo.test.tsx` | APROBADO | U6_unitarias.xml | Fallidos del registro masivo (WEB-06, cobertura D-WEB-13) |
| UT-WEB-EXTRA-169 | tests/components/FallidosMasivo.test.tsx | `tests/components/FallidosMasivo.test.tsx` | APROBADO | U6_unitarias.xml | Fallidos del registro masivo (WEB-06, cobertura D-WEB-13) |
| UT-WEB-EXTRA-170 | tests/components/FallidosMasivo.test.tsx | `tests/components/FallidosMasivo.test.tsx` | APROBADO | U6_unitarias.xml | Fallidos del registro masivo (WEB-06, cobertura D-WEB-13) |
| UT-WEB-EXTRA-171 | tests/components/FallidosMasivo.test.tsx | `tests/components/FallidosMasivo.test.tsx` | APROBADO | U6_unitarias.xml | Fallidos del registro masivo (WEB-06, cobertura D-WEB-13) |
| UT-WEB-04 | tests/components/HorariosViewerClient.test.tsx | `tests/components/HorariosViewerClient.test.tsx` | APROBADO | U6_unitarias.xml | WEB-03 · horario del estudiante asociado |
| UT-WEB-04 | tests/components/HorariosViewerClient.test.tsx | `tests/components/HorariosViewerClient.test.tsx` | APROBADO | U6_unitarias.xml | WEB-03 · horario del estudiante asociado |
| UT-WEB-04 | tests/components/HorariosViewerClient.test.tsx | `tests/components/HorariosViewerClient.test.tsx` | APROBADO | U6_unitarias.xml | WEB-03 · horario del estudiante asociado |
| UT-WEB-04 | tests/components/HorariosViewerClient.test.tsx | `tests/components/HorariosViewerClient.test.tsx` | APROBADO | U6_unitarias.xml | WEB-03 · horario del estudiante asociado |
| UT-WEB-08 | tests/components/NotasViewerClient.test.tsx | `tests/components/NotasViewerClient.test.tsx` | APROBADO | U6_unitarias.xml | WEB-09 · boletín y mensajes |
| UT-WEB-08 | tests/components/NotasViewerClient.test.tsx | `tests/components/NotasViewerClient.test.tsx` | APROBADO | U6_unitarias.xml | WEB-09 · boletín y mensajes |
| UT-WEB-08 | tests/components/NotasViewerClient.test.tsx | `tests/components/NotasViewerClient.test.tsx` | APROBADO | U6_unitarias.xml | WEB-09 · boletín y mensajes |
| UT-WEB-08 | tests/components/NotasViewerClient.test.tsx | `tests/components/NotasViewerClient.test.tsx` | APROBADO | U6_unitarias.xml | WEB-09 · boletín y mensajes |
| UT-WEB-08 | tests/components/NotasViewerClient.test.tsx | `tests/components/NotasViewerClient.test.tsx` | APROBADO | U6_unitarias.xml | WEB-09 · boletín y mensajes |
| UT-WEB-06 | tests/components/PasswordChecklist.test.tsx | `tests/components/PasswordChecklist.test.tsx` | APROBADO | U6_unitarias.xml | WEB-05 · reglas en vivo |
| UT-WEB-06 | tests/components/PasswordChecklist.test.tsx | `tests/components/PasswordChecklist.test.tsx` | APROBADO | U6_unitarias.xml | WEB-05 · reglas en vivo |
| UT-WEB-06 | tests/components/PasswordChecklist.test.tsx | `tests/components/PasswordChecklist.test.tsx` | APROBADO | U6_unitarias.xml | WEB-05 · reglas en vivo |
| UT-WEB-06 | tests/components/PasswordChecklist.test.tsx | `tests/components/PasswordChecklist.test.tsx` | APROBADO | U6_unitarias.xml | WEB-05 · reglas en vivo |
| UT-WEB-06 | tests/components/PasswordChecklist.test.tsx | `tests/components/PasswordChecklist.test.tsx` | APROBADO | U6_unitarias.xml | WEB-05 · reglas en vivo |
| UT-WEB-06 | tests/components/PasswordChecklist.test.tsx | `tests/components/PasswordChecklist.test.tsx` | APROBADO | U6_unitarias.xml | WEB-05 · reglas en vivo |
| UT-WEB-07 | tests/components/RegistroMasivo.test.tsx | `tests/components/RegistroMasivo.test.tsx` | APROBADO | U6_unitarias.xml | WEB-06 · registro masivo |
| UT-WEB-07 | tests/components/RegistroMasivo.test.tsx | `tests/components/RegistroMasivo.test.tsx` | APROBADO | U6_unitarias.xml | WEB-06 · registro masivo |
| UT-WEB-07 | tests/components/RegistroMasivo.test.tsx | `tests/components/RegistroMasivo.test.tsx` | APROBADO | U6_unitarias.xml | WEB-06 · registro masivo |
| UT-WEB-07 | tests/components/RegistroMasivo.test.tsx | `tests/components/RegistroMasivo.test.tsx` | APROBADO | U6_unitarias.xml | WEB-06 · registro masivo |
| UT-WEB-04 | tests/components/SelectorHijo.test.tsx | `tests/components/SelectorHijo.test.tsx` | APROBADO | U6_unitarias.xml | WEB-03 · varios hijos |
| UT-WEB-04 | tests/components/SelectorHijo.test.tsx | `tests/components/SelectorHijo.test.tsx` | APROBADO | U6_unitarias.xml | WEB-03 · varios hijos |
| UT-WEB-04 | tests/components/SelectorHijo.test.tsx | `tests/components/SelectorHijo.test.tsx` | APROBADO | U6_unitarias.xml | WEB-03 · varios hijos |
| UT-WEB-04 | tests/components/SelectorHijo.test.tsx | `tests/components/SelectorHijo.test.tsx` | APROBADO | U6_unitarias.xml | WEB-03 · varios hijos |
| UT-WEB-EXTRA-172 | tests/hooks/cargaInicial.test.tsx | `tests/hooks/cargaInicial.test.tsx` | APROBADO | U6_unitarias.xml | Carga inicial de los hooks (arreglos de SonarQube, D-WEB-14) |
| UT-WEB-EXTRA-173 | tests/hooks/cargaInicial.test.tsx | `tests/hooks/cargaInicial.test.tsx` | APROBADO | U6_unitarias.xml | Carga inicial de los hooks (arreglos de SonarQube, D-WEB-14) |
| UT-WEB-EXTRA-174 | tests/hooks/cargaInicial.test.tsx | `tests/hooks/cargaInicial.test.tsx` | APROBADO | U6_unitarias.xml | Carga inicial de los hooks (arreglos de SonarQube, D-WEB-14) |
| UT-WEB-EXTRA-175 | tests/hooks/cargaInicial.test.tsx | `tests/hooks/cargaInicial.test.tsx` | APROBADO | U6_unitarias.xml | Carga inicial de los hooks (arreglos de SonarQube, D-WEB-14) |
| UT-WEB-EXTRA-176 | tests/hooks/cargaInicial.test.tsx | `tests/hooks/cargaInicial.test.tsx` | APROBADO | U6_unitarias.xml | Carga inicial de los hooks (arreglos de SonarQube, D-WEB-14) |
| UT-WEB-EXTRA-177 | tests/hooks/cargaInicial.test.tsx | `tests/hooks/cargaInicial.test.tsx` | APROBADO | U6_unitarias.xml | Carga inicial de los hooks (arreglos de SonarQube, D-WEB-14) |
| UT-WEB-EXTRA-178 | tests/hooks/cargaInicial.test.tsx | `tests/hooks/cargaInicial.test.tsx` | APROBADO | U6_unitarias.xml | Carga inicial de los hooks (arreglos de SonarQube, D-WEB-14) |
| UT-WEB-EXTRA-179 | tests/hooks/cargaInicial.test.tsx | `tests/hooks/cargaInicial.test.tsx` | APROBADO | U6_unitarias.xml | Carga inicial de los hooks (arreglos de SonarQube, D-WEB-14) |
| UT-WEB-EXTRA-180 | tests/hooks/cargaInicial.test.tsx | `tests/hooks/cargaInicial.test.tsx` | APROBADO | U6_unitarias.xml | Carga inicial de los hooks (arreglos de SonarQube, D-WEB-14) |
| UT-WEB-EXTRA-181 | tests/hooks/cargaInicial.test.tsx | `tests/hooks/cargaInicial.test.tsx` | APROBADO | U6_unitarias.xml | Carga inicial de los hooks (arreglos de SonarQube, D-WEB-14) |
| UT-WEB-EXTRA-182 | tests/hooks/cargaInicial.test.tsx | `tests/hooks/cargaInicial.test.tsx` | APROBADO | U6_unitarias.xml | Carga inicial de los hooks (arreglos de SonarQube, D-WEB-14) |
| UT-WEB-EXTRA-183 | tests/hooks/cargaInicial.test.tsx | `tests/hooks/cargaInicial.test.tsx` | APROBADO | U6_unitarias.xml | Carga inicial de los hooks (arreglos de SonarQube, D-WEB-14) |
| UT-WEB-EXTRA-184 | tests/hooks/cargaInicial.test.tsx | `tests/hooks/cargaInicial.test.tsx` | APROBADO | U6_unitarias.xml | Carga inicial de los hooks (arreglos de SonarQube, D-WEB-14) |
| UT-WEB-EXTRA-185 | tests/hooks/cargaInicial.test.tsx | `tests/hooks/cargaInicial.test.tsx` | APROBADO | U6_unitarias.xml | Carga inicial de los hooks (arreglos de SonarQube, D-WEB-14) |
| UT-WEB-EXTRA-186 | tests/hooks/cargaInicial.test.tsx | `tests/hooks/cargaInicial.test.tsx` | APROBADO | U6_unitarias.xml | Carga inicial de los hooks (arreglos de SonarQube, D-WEB-14) |
| UT-WEB-01 | tests/hooks/usePermissions.test.tsx | `tests/hooks/usePermissions.test.tsx` | APROBADO | U6_unitarias.xml | WEB-INF-1 · entorno |
| UT-WEB-01 | tests/hooks/usePermissions.test.tsx | `tests/hooks/usePermissions.test.tsx` | APROBADO | U6_unitarias.xml | WEB-INF-1 · entorno |
| UT-WEB-01 | tests/hooks/usePermissions.test.tsx | `tests/hooks/usePermissions.test.tsx` | APROBADO | U6_unitarias.xml | WEB-INF-1 · entorno |
| UT-WEB-01 | tests/hooks/usePermissions.test.tsx | `tests/hooks/usePermissions.test.tsx` | APROBADO | U6_unitarias.xml | WEB-INF-1 · entorno |
| UT-WEB-01 | tests/hooks/usePermissions.test.tsx | `tests/hooks/usePermissions.test.tsx` | APROBADO | U6_unitarias.xml | WEB-INF-1 · entorno |
| UT-WEB-01 | tests/hooks/usePermissions.test.tsx | `tests/hooks/usePermissions.test.tsx` | APROBADO | U6_unitarias.xml | WEB-INF-1 · entorno |
| UT-WEB-01 | tests/hooks/usePermissions.test.tsx | `tests/hooks/usePermissions.test.tsx` | APROBADO | U6_unitarias.xml | WEB-INF-1 · entorno |
| UT-WEB-01 | tests/hooks/usePermissions.test.tsx | `tests/hooks/usePermissions.test.tsx` | APROBADO | U6_unitarias.xml | WEB-INF-1 · entorno |
| UT-WEB-EXTRA-187 | tests/services/reportesService.test.tsx | `tests/services/reportesService.test.tsx` | APROBADO | U6_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-188 | tests/services/reportesService.test.tsx | `tests/services/reportesService.test.tsx` | APROBADO | U6_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-189 | tests/services/reportesService.test.tsx | `tests/services/reportesService.test.tsx` | APROBADO | U6_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-190 | tests/services/reportesService.test.tsx | `tests/services/reportesService.test.tsx` | APROBADO | U6_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-191 | tests/services/reportesService.test.tsx | `tests/services/reportesService.test.tsx` | APROBADO | U6_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-192 | tests/services/reportesService.test.tsx | `tests/services/reportesService.test.tsx` | APROBADO | U6_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-193 | tests/services/reportesService.test.tsx | `tests/services/reportesService.test.tsx` | APROBADO | U6_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |
| UT-WEB-EXTRA-194 | tests/services/reportesService.test.tsx | `tests/services/reportesService.test.tsx` | APROBADO | U6_unitarias.xml | Cobertura de servicios (umbral 60 %, D-WEB-05) |

### 5.2 Integración / contrato contra QA · 10 casos, todos APROBADO

Fuente: `I4_integracion.xml` (11/11/2026, ~18:45 UTC, 59,4 s, commit `7d927df`). Los 10 se ejecutaron contra la API de QA, con sesiones reales de cada rol. La corrida anterior, I3 (9 casos), también pasó entera.

| ID del caso | Nombre del test | Archivo | Resultado | Evidencia | Observación |
|---|---|---|---|---|---|
| IT-WEB-03 | contrato de lectura por rol › admin: usuarios, asistencia del día y reportes | `tests/integration/contrato-api.int.test.ts` | APROBADO | I4_integracion.xml | Campos obligatorios definidos tras el mapeo |
| IT-WEB-03 | contrato de lectura por rol › docente: notas, novedades, horarios y asignaciones | ídem | APROBADO | I4_integracion.xml | ídem |
| IT-WEB-03 | contrato de lectura por rol › estudiante: notas, novedades y horario del estudiante asociado | ídem | APROBADO | I4_integracion.xml | ídem |
| IT-WEB-03 | contrato de lectura por rol › padre: notas, novedades y horario del estudiante asociado | ídem | APROBADO | I4_integracion.xml | Solo exige que el nombre no llegue `undefined`; por eso hacía falta el caso siguiente |
| IT-WEB-03 | padre: los hijos de /padres/me/hijos llegan con su nombre real, no con el respaldo | ídem | APROBADO | I4_integracion.xml | **Nuevo (DEF-WEB-03).** Sin la corrección fallaba contra QA (hijos 1 y 3 sin nombre) |
| IT-WEB-04 | inicio del estudiante (BE-03) › GET /dashboard/estudiante responde 200 y el inicio carga | ídem | APROBADO | I4_integracion.xml | BE-03 ya está en QA |
| IT-WEB-05 | errores de la API › 401: sin token | ídem | APROBADO | I4_integracion.xml | — |
| IT-WEB-05 | errores de la API › 403: un padre pide la lista de usuarios | ídem | APROBADO | I4_integracion.xml | — |
| IT-WEB-05 | errores de la API › 404: un recurso que no existe | ídem | APROBADO | I4_integracion.xml | — |
| IT-WEB-05 | errores de la API › 422: cuerpo inválido, con el primer mensaje de validación | ídem | APROBADO | I4_integracion.xml | — |

### 5.3 E2E · 48 ejecuciones (24 casos × Chromium y Firefox)

**Corridas de esta jornada**, todas contra el deploy preview del PR #34:

| Corrida | Qué es | Resultado de Playwright | Evidencia |
|---|---|---|---|
| E3 | Primera corrida completa: **descubrimiento** de DEF-WEB-02 a 05 y de los defectos de las pruebas | 21 pasan · 23 fallan · 4 omitidos | `E3_e2e-consola.txt` (solo consola) |
| E4 | Completa con las pruebas corregidas, **antes de corregir la app** | 24 pasan · 20 fallan · 4 omitidos | `E4_e2e.xml` |
| E5, E6 | Repeticiones de E4 (inestables y registro del padre) | 7/12 y 0/2 | `E5_reintento.xml`, `E6_registro-padre.xml` |
| **E7** | **Corrida de referencia, completa, con DEF-WEB-02, 03 y 04 corregidos** (`e886144`) | **36 pasan · 8 fallan · 4 omitidos** | `E7_e2e.xml`, `E7_e2e-consola.txt` |
| E8 | Repetición de los 8 fallos de E7 | 12 pasan · 2 fallan | `E8_reintento.xml` |
| E9 | Cierre por inactividad y acceso vencido, con la espera de 20 s | 4 pasan | `E9_inactividad.xml` |

**Regla para el resultado final:** vale E7. Si el caso se repitió en E8 o E9, se miran todas las corridas. Si falló en E7 solo por tiempo agotado y pasó al repetirlo, se marca INESTABLE. En la columna *Corridas*: ✔ pasó, ✘ falló, — omitido.

| CP-SIS | Caso | Spec (navegador) | Resultado | Corridas | Observación |
|---|---|---|---|---|---|
| CP-SIS-051, 054 | boletín del padre (WEB-09) › el padre descarga un PDF | `e2e/boletin-padre.spec.ts` (chromium) | **APROBADO** | E7 ✔ | Aprobado en E7. |
| CP-SIS-051, 054 | boletín del padre (WEB-09) › un periodo sin notas muestra el texto exacto del criterio de aceptación | `e2e/boletin-padre.spec.ts` (chromium) | **APROBADO** | E7 ✔ | Aprobado en E7. |
| CP-SIS-001 / 006 | inicio de sesión · admin › el admin llega a su inicio con los datos cargados | `e2e/login-roles.spec.ts` (chromium) | **APROBADO** | E7 ✔ | Aprobado en E7. Antes FALLA por DEF-WEB-02, corregido. |
| CP-SIS-001 / 006 | inicio de sesión · admin › el menú del admin solo trae los módulos de su rol | `e2e/login-roles.spec.ts` (chromium) | **APROBADO** | E7 ✔ | Aprobado en E7. |
| CP-SIS-001 / 006 | inicio de sesión · docente › el docente llega a su inicio con los datos cargados | `e2e/login-roles.spec.ts` (chromium) | **APROBADO** | E7 ✔ | Aprobado en E7. Antes FALLA por DEF-WEB-02, corregido. |
| CP-SIS-001 / 006 | inicio de sesión · docente › el menú del docente solo trae los módulos de su rol | `e2e/login-roles.spec.ts` (chromium) | **APROBADO** | E7 ✔ | Aprobado en E7. |
| CP-SIS-001 / 006 | inicio de sesión · estudiante › el estudiante llega a su inicio con los datos cargados | `e2e/login-roles.spec.ts` (chromium) | **APROBADO** | E7 ✔ | Aprobado en E7. Antes FALLA por DEF-WEB-02, corregido. |
| CP-SIS-001 / 006 | inicio de sesión · estudiante › el menú del estudiante solo trae los módulos de su rol | `e2e/login-roles.spec.ts` (chromium) | **APROBADO** | E7 ✔ | Aprobado en E7. |
| CP-SIS-001 / 006 | inicio de sesión · padre › el padre llega a su inicio con los datos cargados | `e2e/login-roles.spec.ts` (chromium) | **APROBADO** | E7 ✔ | Aprobado en E7. Antes FALLA por DEF-WEB-02, corregido. |
| CP-SIS-001 / 006 | inicio de sesión · padre › el menú del padre solo trae los módulos de su rol | `e2e/login-roles.spec.ts` (chromium) | **APROBADO** | E7 ✔ | Aprobado en E7. |
| CP-SIS-060 | el padre de prueba cambia de hijo y cambian notas, asistencia y novedades | `e2e/padre-dos-hijos.spec.ts` (chromium) | **APROBADO** | E7 ✘ · E8 ✔ | E7: la prueba buscaba el nombre en la `<option>` oculta (oráculo, D-WEB-17 punto 5). E8: aprobado. Antes FALLA por DEF-WEB-03, corregido. |
| CP-SIS-060 | un padre con un solo hijo no ve el selector | `e2e/padre-dos-hijos.spec.ts` (chromium) | **APROBADO** | E7 ✔ | Aprobado en E7. |
| CP-SIS-037, 038, 039, 041 | registro masivo (WEB-06) › la segunda vez con el mismo curso, todos salen «ya registrado» | `e2e/registro-masivo.spec.ts` (chromium) | **BLOQUEADO** | E7 ✔ | BE-08: falla esperada (`test.fail`) que falló como se esperaba; Playwright la cuenta como pasada. No cuenta como aprobado |
| CP-SIS-037, 038, 039, 041 | registro masivo (WEB-06) › con la red cortada, los fallidos se listan por nombre con Reintentar y Descartar | `e2e/registro-masivo.spec.ts` (chromium) | **APROBADO** | E7 ✔ · E8 ✔ | Aprobado en E7. |
| CP-SIS-014 | el padre que se registra ve los datos de su hijo vinculado | `e2e/registro-padre.spec.ts` (chromium) | **APROBADO** | E7 ✔ · E8 ✔ | Aprobado en E7. Antes FALLA por DEF-WEB-03, corregido. |
| CP-SIS-004 / 065 | sesión (WEB-01) › con 31 minutos sin actividad se cierra la sesión y vuelve al inicio de sesión | `e2e/sesion.spec.ts` (chromium) | **APROBADO** | E7 ✔ · E8 ✔ · E9 ✔ | Aprobado en E7. Antes FALLA por DEF-WEB-04, corregido. |
| CP-SIS-004 / 065 | sesión (WEB-01) › con el acceso vencido y un refresco válido la sesión se renueva sola | `e2e/sesion.spec.ts` (chromium) | **APROBADO** | E7 ✔ · E8 ✔ · E9 ✔ | Aprobado en E7. |
| CP-SIS-004 / 065 | sesión (WEB-01) › el token de acceso no se puede leer desde JavaScript | `e2e/sesion.spec.ts` (chromium) | **APROBADO** | E7 ✔ | Aprobado en E7. |
| CP-SIS-004 / 065 | sesión (WEB-01) › a escala (QA con SESSION_IDLE_MINUTES=1) › una sesión usada durante 4 minutos con actividad cada 15 s sigue funcionando (CP-SIS-065) | `e2e/sesion.spec.ts` (chromium) | **BLOQUEADO** | E7 — | Falta `E2E_SESSION_IDLE_MINUTES=1` (acción externa 5b). El proxy ya corre, así que deberían poder ejecutarse en cuanto se configure |
| CP-SIS-004 / 065 | sesión (WEB-01) › a escala (QA con SESSION_IDLE_MINUTES=1) › 70 s sin actividad cierran la sesión (equivale a los 31 min de la regla real) | `e2e/sesion.spec.ts` (chromium) | **BLOQUEADO** | E7 — | Falta `E2E_SESSION_IDLE_MINUTES=1` (acción externa 5b). El proxy ya corre, así que deberían poder ejecutarse en cuanto se configure |
| CP-SIS-004 / 065 | una ruta del panel sin sesión pide iniciar sesión | `e2e/sesion.spec.ts` (chromium) | **APROBADO** | E7 ✔ | Aprobado en E7. |
| CP-SIS-019, 021, 022, 025, 027, 028 | gestión de usuarios (admin) › crear, filtrar, editar y eliminar un docente de prueba | `e2e/usuarios.spec.ts` (chromium) | **APROBADO** | E7 ✔ · E8 ✔ | Aprobado en E7. |
| CP-SIS-019, 021, 022, 025, 027, 028 | gestión de usuarios (admin) › crear con un campo vacío no guarda e indica el campo (CP-SIS-021) | `e2e/usuarios.spec.ts` (chromium) | **APROBADO** | E7 ✔ | Aprobado en E7. |
| CP-SIS-019, 021, 022, 025, 027, 028 | gestión de usuarios (admin) › un filtro sin coincidencias muestra un mensaje informativo (CP-SIS-028) | `e2e/usuarios.spec.ts` (chromium) | **APROBADO** | E7 ✔ · E8 ✔ | Aprobado en E7. |
| CP-SIS-051, 054 | boletín del padre (WEB-09) › el padre descarga un PDF | `e2e/boletin-padre.spec.ts` (firefox) | **APROBADO** | E7 ✔ | Aprobado en E7. |
| CP-SIS-051, 054 | boletín del padre (WEB-09) › un periodo sin notas muestra el texto exacto del criterio de aceptación | `e2e/boletin-padre.spec.ts` (firefox) | **APROBADO** | E7 ✔ | Aprobado en E7. |
| CP-SIS-001 / 006 | inicio de sesión · admin › el admin llega a su inicio con los datos cargados | `e2e/login-roles.spec.ts` (firefox) | **APROBADO** | E7 ✔ | Aprobado en E7. Antes FALLA por DEF-WEB-02, corregido. |
| CP-SIS-001 / 006 | inicio de sesión · admin › el menú del admin solo trae los módulos de su rol | `e2e/login-roles.spec.ts` (firefox) | **APROBADO** | E7 ✔ | Aprobado en E7. |
| CP-SIS-001 / 006 | inicio de sesión · docente › el docente llega a su inicio con los datos cargados | `e2e/login-roles.spec.ts` (firefox) | **APROBADO** | E7 ✔ | Aprobado en E7. Antes FALLA por DEF-WEB-02, corregido. |
| CP-SIS-001 / 006 | inicio de sesión · docente › el menú del docente solo trae los módulos de su rol | `e2e/login-roles.spec.ts` (firefox) | **APROBADO** | E7 ✔ | Aprobado en E7. |
| CP-SIS-001 / 006 | inicio de sesión · estudiante › el estudiante llega a su inicio con los datos cargados | `e2e/login-roles.spec.ts` (firefox) | **APROBADO** | E7 ✔ | Aprobado en E7. Antes FALLA por DEF-WEB-02, corregido. |
| CP-SIS-001 / 006 | inicio de sesión · estudiante › el menú del estudiante solo trae los módulos de su rol | `e2e/login-roles.spec.ts` (firefox) | **APROBADO** | E7 ✔ | Aprobado en E7. |
| CP-SIS-001 / 006 | inicio de sesión · padre › el padre llega a su inicio con los datos cargados | `e2e/login-roles.spec.ts` (firefox) | **APROBADO** | E7 ✔ | Aprobado en E7. Antes FALLA por DEF-WEB-02, corregido. |
| CP-SIS-001 / 006 | inicio de sesión · padre › el menú del padre solo trae los módulos de su rol | `e2e/login-roles.spec.ts` (firefox) | **APROBADO** | E7 ✔ | Aprobado en E7. |
| CP-SIS-060 | el padre de prueba cambia de hijo y cambian notas, asistencia y novedades | `e2e/padre-dos-hijos.spec.ts` (firefox) | **INESTABLE** | E7 ✘ · E8 ✔ | E7: tiempo agotado (carga de la portada o login de Firefox); E8: aprobado. Antes FALLA por DEF-WEB-03, corregido. |
| CP-SIS-060 | un padre con un solo hijo no ve el selector | `e2e/padre-dos-hijos.spec.ts` (firefox) | **APROBADO** | E7 ✔ | Aprobado en E7. |
| CP-SIS-037, 038, 039, 041 | registro masivo (WEB-06) › la segunda vez con el mismo curso, todos salen «ya registrado» | `e2e/registro-masivo.spec.ts` (firefox) | **BLOQUEADO** | E7 ✔ | BE-08: falla esperada (`test.fail`) que falló como se esperaba; Playwright la cuenta como pasada. No cuenta como aprobado |
| CP-SIS-037, 038, 039, 041 | registro masivo (WEB-06) › con la red cortada, los fallidos se listan por nombre con Reintentar y Descartar | `e2e/registro-masivo.spec.ts` (firefox) | **INESTABLE** | E7 ✘ · E8 ✔ | E7: tiempo agotado (carga de la portada o login de Firefox); E8: aprobado. |
| CP-SIS-014 | el padre que se registra ve los datos de su hijo vinculado | `e2e/registro-padre.spec.ts` (firefox) | **INESTABLE** | E7 ✘ · E8 ✔ | E7: tiempo agotado (carga de la portada o login de Firefox); E8: aprobado. Antes FALLA por DEF-WEB-03, corregido. |
| CP-SIS-004 / 065 | sesión (WEB-01) › con 31 minutos sin actividad se cierra la sesión y vuelve al inicio de sesión | `e2e/sesion.spec.ts` (firefox) | **INESTABLE** | E7 ✘ · E8 ✘ · E9 ✔ | E7: tiempo agotado al iniciar sesión; E8: la prueba esperaba 5 s la redirección de cliente (D-WEB-17 punto 6); E9: aprobado. Antes FALLA por DEF-WEB-04, corregido. |
| CP-SIS-004 / 065 | sesión (WEB-01) › con el acceso vencido y un refresco válido la sesión se renueva sola | `e2e/sesion.spec.ts` (firefox) | **INESTABLE** | E7 ✘ · E8 ✘ · E9 ✔ | E7: tiempo agotado (carga de la portada o login de Firefox); E8 también; E9: aprobado. |
| CP-SIS-004 / 065 | sesión (WEB-01) › el token de acceso no se puede leer desde JavaScript | `e2e/sesion.spec.ts` (firefox) | **APROBADO** | E7 ✔ | Aprobado en E7. |
| CP-SIS-004 / 065 | sesión (WEB-01) › a escala (QA con SESSION_IDLE_MINUTES=1) › una sesión usada durante 4 minutos con actividad cada 15 s sigue funcionando (CP-SIS-065) | `e2e/sesion.spec.ts` (firefox) | **BLOQUEADO** | E7 — | Falta `E2E_SESSION_IDLE_MINUTES=1` (acción externa 5b). El proxy ya corre, así que deberían poder ejecutarse en cuanto se configure |
| CP-SIS-004 / 065 | sesión (WEB-01) › a escala (QA con SESSION_IDLE_MINUTES=1) › 70 s sin actividad cierran la sesión (equivale a los 31 min de la regla real) | `e2e/sesion.spec.ts` (firefox) | **BLOQUEADO** | E7 — | Falta `E2E_SESSION_IDLE_MINUTES=1` (acción externa 5b). El proxy ya corre, así que deberían poder ejecutarse en cuanto se configure |
| CP-SIS-004 / 065 | una ruta del panel sin sesión pide iniciar sesión | `e2e/sesion.spec.ts` (firefox) | **APROBADO** | E7 ✔ | Aprobado en E7. |
| CP-SIS-019, 021, 022, 025, 027, 028 | gestión de usuarios (admin) › crear, filtrar, editar y eliminar un docente de prueba | `e2e/usuarios.spec.ts` (firefox) | **INESTABLE** | E7 ✘ · E8 ✔ | E7: tiempo agotado (carga de la portada o login de Firefox); E8: aprobado. |
| CP-SIS-019, 021, 022, 025, 027, 028 | gestión de usuarios (admin) › crear con un campo vacío no guarda e indica el campo (CP-SIS-021) | `e2e/usuarios.spec.ts` (firefox) | **APROBADO** | E7 ✔ | Aprobado en E7. |
| CP-SIS-019, 021, 022, 025, 027, 028 | gestión de usuarios (admin) › un filtro sin coincidencias muestra un mensaje informativo (CP-SIS-028) | `e2e/usuarios.spec.ts` (firefox) | **INESTABLE** | E7 ✘ · E8 ✔ | E7: tiempo agotado (carga de la portada o login de Firefox); E8: aprobado. |

**Conteo por navegador:** Chromium 21 APROBADO · 3 BLOQUEADO. Firefox 14 APROBADO · 7 INESTABLE · 3 BLOQUEADO. **0 FALLA.**

**Antes y después de las correcciones** (mismos 48 casos): E4 → 22 APROBADO, 14 FALLA, 6 BLOQUEADO, 6 INESTABLE. E7 a E9 → **35 APROBADO, 0 FALLA, 6 BLOQUEADO, 7 INESTABLE.**

**Observación de rendimiento, no un defecto:** en el deploy preview el login tarda **14,4 s** (admin) y **17,1 s** (docente) desde el clic, y el registro de un padre **36,0 s** (medido con Chromium el 10/11). La portada tarda ~20 s en disparar `load` (vídeos, reproductor de YouTube, fuente de iconos de Google), y en Firefox bastante más: es el origen de los 7 INESTABLE. La planeación de sistema no fija un umbral de tiempo para el login; CP-NF-005 (Lighthouse) es el caso que lo mediría.

### 5.4 E2E no ejecutados

**Ninguno.** Los 48 se ejecutaron en E7. Los 4 que quedaron «omitidos» son los de CP-SIS-065 a escala y figuran como BLOQUEADO en la 5.3.

### 5.5 Casos de la planeación sin prueba automatizada

| Grupo | Situación | Fuente |
|---|---|---|
| CP-SIS del frontend | La planeación de sistema define **65 casos CP-SIS**; los specs de Playwright cubren **15** de forma explícita (CP-SIS-001, 004, 006, 014, 019, 021, 022, 025, 027, 028, 037, 051, 054, 060, 065) | [`planeacion/tests/Sistema/planeacion-pruebas-sistema-frontend-web.md`, `grep CP-SIS e2e/`] |
| Los otros 50 CP-SIS | **NO DISPONIBLE** su reparto exacto entre «prueba manual» y «sin cubrir»: la planeación de sistema no marca una columna de automatización y este informe no la inventa | — |
| CP-SIS-038, 039, 041 | Cubiertos dentro de `registro-masivo.spec.ts` (sin una prueba por caso) | [`e2e/registro-masivo.spec.ts`] |
| CP-SIS-096, CP-SIS-098 | Sin spec propio; los vigilan las unitarias de rutas (`tests/routeRoles.test.ts`) por D-WEB-01 | [`docs/decisiones-qa.md`] |
| CP-NF-012, CP-NF-013 | No automatizados como E2E. CP-NF-012 queda cubierto por gitleaks en el CI; CP-NF-013 por las unitarias de cookies y proxy y por el E2E «el token de acceso no se puede leer desde JavaScript» (APROBADO) | [`.github/workflows/ci.yml`, `tests/authCookies.test.ts`, `E7_e2e.xml`] |
| CP-INT-040, 062, 076 | Sin prueba automatizada en el frontend. CP-INT-060 sí la tiene (IT-WEB-04) | [`tests/trazabilidad.json`] |
| Pruebas manuales (24 casos) | Todas NO EJECUTADAS, ver sección 14 | [`docs/pruebas-manuales-pr06-web.md`] |

---

## 6. TRAZABILIDAD

Resultado de `npm run trazabilidad` el 11/11/2026 [`docs/trazabilidad-ut-web.md`]:

| Grupo | Resultado |
|---|---|
| UT-WEB-01 a 08 (planeadas, PR-04) | **126 de 126 pasan** |
| UT-WEB-EXTRA (no planeadas) | **191 de 191 pasan** (incluye las 25 de `tests/defectos.test.ts`, motivo «Gestión de defectos en GitHub Issues (D-WEB-15)») |
| IT-WEB-01 a 05 (contrato, PR-05) | **14 de 24 pasan** en la corrida del script, que no carga `.env.test.local`: las 10 de `contrato-api.int.test.ts` figuran como «Omitida». En la corrida real de integración las 10 pasan (`I4_integracion.xml`) |

Total mapeado: **341 pruebas** (126 UT + 191 extra + 24 IT) [salida de `node scripts/trazabilidad.mjs`].

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

**Lo que la trazabilidad no mostraba:** WEB-01 tenía sus pruebas mapeadas y todas pasaban, pero la corrección no funcionaba en ejecución (DEF-WEB-04): las unitarias llaman `updateSession` directamente y no comprobaban que Next cargara el proxy. Con WEB-03 pasaba lo mismo: la unitaria usaba una forma de respuesta equivocada (DEF-WEB-03). Las dos lagunas quedaron cubiertas con reglas de arquitectura y con un caso de integración contra QA. Tener una prueba mapeada no basta: por eso hacían falta los E2E.

**Limitación del script:** `scripts/trazabilidad.mjs` solo lee los informes JSON de Vitest, así que los E2E de Playwright no entran en `docs/trazabilidad-ut-web.md`. La trazabilidad de los CP-SIS está en la 5.3.

---

## 7. SONARQUBE

### 7.1 Estado del Quality Gate

| Ámbito | Estado | Fecha | Fuente |
|---|---|---|---|
| **Pull request #34**, commit **`e886144`** (con las correcciones) | **Passed** | 11/11/2026 17:27:19 UTC | [check-run «SonarCloud Code Analysis»; API `/api/qualitygates/project_status?pullRequest=34`] |
| Pull request #34, commit `d251ae2` (histórico) | Passed | 03/11/2026 15:55:54 UTC | [`evidencias/PR-03/web/sonar-resumen.md`] |
| Rama principal del proyecto | **NONE** (nunca se ha analizado una rama, solo el PR) | 11/11/2026 | [API `/api/qualitygates/project_status`, `{"status":"NONE"}`] |

Panel: `https://sonarcloud.io/dashboard?id=marianacortes0_proyecto-eyesschool&pullRequest=34`.

### 7.2 Medidas del código nuevo

De la API `/api/measures/component` del PR 34, análisis de `e886144` (11/11/2026):

| Medida | Valor | Condición del gate |
|---|---|---|
| Cobertura del código nuevo | **86,6 %** (368 por cubrir, 32 sin cubrir, según la misma API) | ≥ 80 % ✔ |
| Issues nuevos | **0** | — |
| Bugs nuevos | **0** | — |
| Vulnerabilidades nuevas | **0** | — |
| *Security hotspots* nuevos | **0** (revisados: 100 %) | 100 % ✔ |
| Duplicación en código nuevo | **0,0 %** | ≤ 3 % ✔ |
| Reliability · Security · Maintainability | **A · A · A** | A ✔ |
| Líneas nuevas | 5 090 | — |

Las líneas nuevas pasaron de 4 786 (03/11) a 5 090. Lo agregado desde entonces está casi todo en `e2e/`, `scripts/` y `tests/`, fuera de `sonar.sources`, que desde `138db97` es solo `src` porque el proxy ya vive ahí. Sonar **no analiza** `scripts/defectos/*.mjs`; lo vigilan sus 25 pruebas unitarias.

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

gitleaks 8.21.2, **97 commits** analizados el 11/11/2026, informe con `--redact` [`evidencias/PR-03/web/gitleaks.json`].

| Hallazgo | Regla | Archivo | Línea | Commit | Fecha | Estado |
|---|---|---|---|---|---|---|
| 1 | `generic-api-key` | `diag.json` | 5 | `b7e20f56` | 13/04/2026 | **Histórico, abierto** |
| 2 | `jwt` | `check-profs.js` | 5 | `b7e20f56` | 13/04/2026 | **Histórico, abierto** |
| 3 | `jwt` | `diagnose-docente.js` | 6 | `b7e20f56` | 13/04/2026 | **Histórico, abierto** |
| 4 | `jwt` | `setup-samuel.js` | 5 | `b7e20f56` | 13/04/2026 | **Histórico, abierto** |

- **Hallazgos nuevos: 0.** Los cuatro están en un único commit del 13/04/2026, en archivos de diagnóstico que se revirtieron ese mismo día.
- Son claves del proyecto Supabase `odenqixjgsrgehnyllfn`. **Borrar los archivos no las invalida** (acción externa 1, DEF-028).
- Además, antes de versionar se escanearon **sin git** las carpetas que se suben (`docs`, `evidencias`, `e2e`, `scripts`, `.github`, `tests`, `planeacion` y `playwright.config.ts`): **0 hallazgos** en cada una. Cada evidencia nueva se revisó también contra el valor de `QA_PASSWORD` y contra patrones de JWT y `Bearer`: ninguna los contiene.
- Las trazas de Playwright (`trace.zip`) guardan en texto plano lo que se escribe en el campo de contraseña. Viven en `test-results/` y `evidencias/PR-06/web/reporte-html/`, **las dos en `.gitignore`**, y se borraron después de cada corrida.

### 8.2 npm audit

`npm audit --omit=dev --audit-level=high` → **`found 0 vulnerabilities`** (11/11/2026) [`evidencias/PR-03/web/npm-audit.txt`]. 0 críticas, 0 altas, 0 medias, 0 bajas en dependencias de producción. El mismo paso corre en el CI.

### 8.3 Estado de los archivos `.env`

| Archivo | ¿Versionado? | Contenido | Fuente |
|---|---|---|---|
| `.env.example` | **Sí** | Solo nombres y valores públicos de desarrollo | [`git ls-files`] |
| `.env.test.example` | **Sí** | Correos del seed y URL de QA; `QA_PASSWORD=` vacío | [`git ls-files`] |
| `.env` | No (ignorado, `.gitignore:34`) | **Cambió el 10/11 a las 19:17** (el 05/11 estaba vacío). Tiene una sola variable, `NEXT_PUBLIC_API_URL`, **sin `https://`**, y por eso `npm run build` falla en local con «NEXT_PUBLIC_API_URL no es una URL válida». No se transcribe el valor (acción externa 17) | [lectura de nombres y forma, sin valores] |
| `.env.test.local` | No (ignorado, `.gitignore:34`) | Tiene la clave de QA; **no se transcribe nada** | [`git check-ignore -v`] |

Ningún `.env` con valores está versionado hoy ni estuvo en la historia [D-WEB-09].

### 8.4 Proxy, cabeceras y restricciones (D-WEB-03)

Hay que distinguir los dos «proxy» del proyecto:

- **`/api/proxy/[...path]`** (ruta de API, WEB-02) **sí funciona**: el deploy preview responde **401** sin cookie de sesión [`curl`, 10/11]. Sus reglas las vigila `tests/apiProxy.test.ts` (todo APROBADO en `U6_unitarias.xml`).
- **`src/proxy.ts`** (el antiguo *middleware*: guardia, inactividad, renovación) **se ejecuta desde `138db97`** (DEF-WEB-04 corregido). Antes estaba en la raíz y Next lo ignoraba.

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

Cookies de sesión: `eys_access` y `eys_refresh` son **httpOnly** [lectura de cookies tras el login, 10/11], y el E2E «el token de acceso no se puede leer desde JavaScript» está **APROBADO** en los dos navegadores [`E7_e2e.xml`].

Guardia de rutas sin sesión: el E2E pasa en los dos navegadores. En local (`next start`) las 7 rutas del panel responden **307** desde el proxy. En Netlify el proxy corre, pero su 307 no llega al navegador y redirige la página (D-WEB-18). Cierre por inactividad: el proxy borra `eys_access`, `eys_refresh`, `eys_user` y `eys_last` (comprobado con `curl` contra el deploy preview), y CP-SIS-004 pasa en los dos navegadores (E7, E9).

Cabeceras de seguridad HTTP de la web (CSP, HSTS, X-Frame-Options): **NO DISPONIBLE.** No se han revisado; las vería el ZAP baseline de las pruebas manuales.

---

## 9. DEFECTOS

Desde el 10/11 los defectos se gestionan en **GitHub Issues** con la plantilla **Defecto** y el workflow **Defectos** (D-WEB-15). La automatización empieza a funcionar al fusionar el PR #34, porque los eventos de issues usan la versión de `develop`. Por eso **ningún defecto tiene todavía número de issue**: la columna *Issue* dice NO DISPONIBLE hasta que se registren (acción externa 11). Un defecto «verificado en QA» espera a que QA lo cierre en su issue.

### 9.1 Defectos de esta jornada

| ID | Título | Severidad | Componente | Caso que lo detectó | Corrección | Verificación | Estado | Issue |
|---|---|---|---|---|---|---|---|---|
| **DEF-WEB-04** | `proxy.ts` estaba fuera de `src/` y Next no lo ejecutaba: la sesión no se cerraba por inactividad | **Alta** (P2) | Web | CP-SIS-004 | `138db97`: `src/proxy.ts` + regla de arquitectura | Build con `ƒ Proxy`; 307 en local; cookies borradas en QA; **CP-SIS-004 APROBADO en los dos navegadores** (E7, E9) | **Corregido y verificado en QA** | NO DISPONIBLE |
| **DEF-WEB-03** | El selector de hijos mostraba «Estudiante #1» en vez del nombre: la web no leía los campos de BE-07 | **Media** (P3) | Web | CP-SIS-060 y CP-SIS-014 | `4067c18`: `aHijo` lee `nombre_estudiante`; fixtures reales; IT-WEB-03 nuevo | **IT-WEB-03 nuevo APROBADO contra QA**; CP-SIS-060 y CP-SIS-014 APROBADO en los dos navegadores (E7, E8) | **Corregido y verificado en QA** | NO DISPONIBLE |
| **DEF-WEB-02** | Había dos elementos `<main>` anidados en todas las páginas | **Baja** (P4) | Web | CP-SIS-001 | `e886144`: el layout raíz usa `<div>`; portada y `(auth)` con su `<main>`; regla de arquitectura | HTML desplegado con un solo `<main>`; **CP-SIS-001 APROBADO en los 4 roles y los dos navegadores** (E7) | **Corregido y verificado en QA** | NO DISPONIBLE |
| **DEF-WEB-05** | El registro esconde el motivo cuando la API rechaza los datos (422) | **Baja** (P4) | Web | CP-SIS-014, al diagnosticar | Propuesta en la ficha; **no aplicada** | — | **Abierto** | NO DISPONIBLE |
| DEF-WEB-01 | La API de QA no podía consultar su base de datos | Alta | Backend | Preflight | Entorno (equipo backend) | I3 e I4 | **Cerrado el 10/11** · causa raíz: Entorno | NO DISPONIBLE |

Cada corrección tiene una prueba que **fallaba antes y pasa después** (detalle en `docs/defectos/DEF-WEB-0x.md` y D-WEB-18). **No queda ningún defecto Alto ni Crítico abierto de la web**, salvo DEF-028 (historial de git, acción externa 1).

### 9.2 Defectos de la planeación (DEF-020 a DEF-028)

De [`planeacion/tests/GestionDefectos/planeacion-gestion-defectos-frontend-web.md`].

| ID | Corrección | Título | Severidad | Caso que lo verifica | Estado según las pruebas de esta jornada |
|---|---|---|---|---|---|
| DEF-020 | WEB-01 | La sesión no se renueva, no se cierra por inactividad y el middleware solo protege `/admin` y `/general` | Alta (P2) | CP-SIS-004, 065 | **Verificado en QA desde DEF-WEB-04** (`138db97`). Hasta entonces el código de `2812cee` no se ejecutaba. CP-SIS-004 APROBADO en los dos navegadores; CP-SIS-065 a escala sigue BLOQUEADO por configuración (acción 5b) |
| DEF-021 | WEB-02 | El token de acceso se lee desde JavaScript, las cookies no son `secure` y el rol sale de una cookie sin firma | Alta (P2) | CP-NF-013 | **Verificado en QA:** `eys_access` httpOnly y el E2E del token APROBADO en los dos navegadores |
| DEF-022 | WEB-03 | La web solo conoce un hijo por padre | Alta (P2) | CP-SIS-060 | **Verificado en QA:** con BE-07 desplegado y DEF-WEB-03 corregido, el padre ve a sus dos hijos con su nombre y cambia entre ellos (E7, E8) |
| DEF-023 | WEB-04 | El docente ve la acción de borrar asistencia, que la API le niega | Media (P3) | CP-INT-076, CP-SIS-064 | Corregido (commit `66ea9b2`); sin E2E propio |
| DEF-024 | WEB-05 | Restablecer la contraseña solo exige 8 caracteres | Alta (P2) | CP-SIS-017 | Corregido (commit `66ea9b2`); sin E2E propio |
| DEF-025 | WEB-06 | El registro masivo no dice qué estudiantes fallaron ni deja reintentar | Media (P3) | CP-SIS-038, 039, 041 | **Verificado en QA:** «con la red cortada, los fallidos se listan…» APROBADO en los dos navegadores |
| DEF-026 | WEB-08 | Código heredado de Supabase y 28 advertencias de ESLint | Baja (P4) | PR-03 | **Verificado:** 0 advertencias (`U6_eslint.json`) |
| DEF-027 | WEB-09 | El padre no puede descargar el boletín y los mensajes de notas no coinciden con los CA | Media (P3) | CP-SIS-051, 054, 055 | **Verificado en QA:** los dos casos del boletín APROBADO en los dos navegadores |
| DEF-028 | WEB-SA-3 | El historial de git conserva una clave `service_role` de Supabase (commit `b7e20f5`) | **Crítica (P1)** | CP-NF-012 | **Abierto.** gitleaks lo sigue reportando; solo se cierra al eliminar el proyecto Supabase (acción externa 1) |

Número de issue de DEF-020 a DEF-028: **NO DISPONIBLE** (se registran al fusionar el PR #34, acción externa 15).

### 9.3 Lo que NO es defecto del producto

| Hecho | Causa | Qué es |
|---|---|---|
| E7: «el padre cambia de hijo» fallaba en Chromium | La prueba buscaba el nombre en la `<option>` del selector, oculta para Playwright; la página sí lo mostraba | **Oráculo de la prueba** (D-WEB-17 punto 5) |
| E8: «31 minutos sin actividad» fallaba en Firefox | Esperaba 5 s una redirección que en Netlify hace el cliente | **Tiempo de la prueba** (D-WEB-17 punto 6); con 20 s pasa (E9) |
| E3: 16 casos fallaban a los ~31 s en el login | La portada tarda ~20 s y el login 14–17 s: superaban los 30 s por defecto de Playwright | **Tiempos de la prueba**, corregido sin tocar la app (D-WEB-16) |
| «El menú del admin» fallaba por `/notas` | La prueba prohibía `/notas` al admin; `routeRoles` y `permissions.ts` se lo dan | **Oráculo equivocado de la prueba** (D-WEB-17). Ahora además exige que ningún enlace lleve a una ruta prohibida |
| «El padre que se registra…» fallaba | Usaba `@eyeschool.test`, dominio reservado que la API rechaza con 422; y comprobaba un `?registered=true` que la portada borra en el acto | **Dato y oráculo de la prueba** (D-WEB-17). El defecto real que mostró es DEF-WEB-05 |
| «Un padre con un solo hijo…» y los avisos de usuarios fallaban | Esperas de 5 s para Server Actions de 11–17 s. Las cuentas 114 y 115 **sí se crearon** | **Tiempos de la prueba** (D-WEB-17) |
| Los 2 casos de BE-08 «fallan» | Falla esperada: falta el 409 por duplicado | **Bloqueo del backend** (acción externa 9) |
| Netlify responde 200 (no 307) en las rutas del panel sin sesión, aun con el proxy activo | El adaptador de Netlify ejecuta el proxy de Node (aplica sus cookies) pero no entrega el 307 de `NextResponse.redirect` | **Comportamiento de la plataforma** (D-WEB-18). La página redirige igual; con `next start` y en Vercel el 307 sí llega |
| `npm run build` falla en el equipo de Mariana | `.env` local con `NEXT_PUBLIC_API_URL` sin `https://` | **Configuración local** (acción externa 17); `apiBase()` hace lo que debe |
| `npx vitest run` falló con «Vitest failed to find the current suite» en los 35 archivos | La sesión de trabajo abrió el proyecto como `c:\…` en vez de `C:\…`, y Vite cargó Vitest dos veces | **Entorno de ejecución.** Desde `C:\` pasan las 327 (U5) |
| Vista previa de **Vercel** en `failure` del 05/11 21:02 al 11/11 | Su log (captura del 11/11) mostró que el build se detenía en `apiBase.ts` porque `NEXT_PUBLIC_API_URL` de Vercel no era una URL válida | **Configuración de Vercel, no del código.** Corregida en el panel: en `b557b25` la vista previa de Vercel vuelve a **success** (18:47:07 UTC) |
| `qaeyesschool.netlify.app` responde 404 | El contexto `develop` se publica al fusionar | Pendiente de despliegue |

### 9.4 Datos de QA que dejaron las pruebas

Las pruebas que se cortaron a mitad dejaron cuentas de prueba. Antes de borrar cada una se comprobó que su correo era de E2E (`docente.e2e.<n>@example.com` o `padre.e2e.<n>@example.com`), y se borró por la API con la cuenta de admin:

| Cuenta | Origen | Borrada |
|---|---|---|
| 114 y 115 (docentes) | E3, `usuarios.spec.ts` interrumpida | 10/11 → 204 |
| 116 (padre) | Diagnóstico de DEF-WEB-05 (registro directo con `@example.com`) | 10/11 → 204 |
| 118 (docente) | E4, `usuarios.spec.ts` en Chromium | 11/11 → 204 |
| 121 (padre) | Diagnóstico del registro (36,0 s hasta el aviso) | 11/11 → 204 |

Las corridas E7 a E9 no dejaron cuentas: las pruebas borraron lo que crearon. Al cierre hay **112 usuarios**: los 110 originales más dos cuentas `qa.…@example.com` (ids 135 «SinVinculo» y 136 «PadreEst4», rol padre) creadas a las **16:55 UTC del 11/11**, antes de E7 (17:28) y con otro patrón de correo. **No son de estas pruebas** y no se tocaron (parecen del equipo backend). No se escribió nada en producción.

---

## 10. BLOQUEOS Y RIESGOS ABIERTOS

### 10.1 Casos bloqueados o pendientes y qué los desbloquea

| Casos | Cuántos | Por qué | Qué lo desbloquea |
|---|---|---|---|
| CP-SIS-065 a escala | 2 casos (4 ejecuciones) | Falta confirmar `SESSION_IDLE_MINUTES=1` en *Deploy Previews*. DEF-WEB-04 ya no lo impide | Acción externa 5b y `E2E_SESSION_IDLE_MINUTES=1` |
| «La segunda vez con el mismo curso…» | 1 caso (2 ejecuciones) | BE-08 no está confirmado en QA | Desplegar BE-08 y poner `E2E_BE08=true` (acción externa 9) |
| Casos INESTABLE | 7 ejecuciones (todas Firefox) | Tiempo agotado en el deploy preview (portada de ~20 s, login de 14–17 s, Firefox más lento) | Repetirlos cuando la portada cargue más rápido, o en un entorno con menos latencia. No se subieron más los tiempos para no esconder un problema real |
| Pruebas manuales | **24** | Nadie las ha ejecutado | `docs/pruebas-manuales-pr06-web.md` |
| Captura del Quality Gate | 1 evidencia | No se puede generar desde el repositorio | Que Mariana la tome del panel |

### 10.2 Riesgos para producción

| Riesgo | Por qué | Evidencia |
|---|---|---|
| **En Netlify el proxy no entrega el 307** | Hoy la página cubre la redirección, pero si una ruta nueva no valida la sesión en su `page.tsx`, en QA no la protegería el proxy | D-WEB-18 |
| **La clave `service_role` de Supabase sigue siendo válida** | DEF-028 y los 4 hallazgos de gitleaks | `evidencias/PR-03/web/gitleaks.json` |
| **`QA_PASSWORD` apareció en capturas** y no se ha rotado | Acción externa 7 | `docs/acciones-externas.md` |
| **Login de 14–17 s y portada de ~20 s en QA** | Los usuarios lo notarán; no hay umbral escrito | Observación de la 5.3 |
| **Cobertura de `src/hooks` en 32,6 %** | Las pantallas dependen de los E2E; hoy pasan, pero 7 son INESTABLE en Firefox | `U6_cobertura-summary.json` |
| **Cabeceras de seguridad HTTP sin revisar** | ZAP baseline pendiente | `docs/pruebas-manuales-pr06-web.md` |
| **Variables de producción en Vercel sin revisar** | Acción externa 5 | `docs/acciones-externas.md` |

---

## 11. DECISIONES

Resumen de [`docs/decisiones-qa.md`], con el número, la fecha, la opción aplicada y la prueba que vigila cada decisión.

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
| **D-WEB-10** · `planeacion/Bugs/bugs.md` (03/11) | Se restauró con `git restore` porque nadie confirmó que sus 455 líneas estén en Azure Boards, y no son defectos con ID: son requisitos funcionales sueltos | Para borrarlo hay que confirmar antes que esos requisitos estén registrados (desde D-WEB-15, como issues de GitHub) | Acción externa 10 |
| **D-WEB-11** · Horario del estudiante asociado con error y reintento (03/11) | Opción A: `Hijo.cursoNoDisponible` distingue «no tiene curso» de «no se pudo consultar el curso»; `getHorarioAsociadoAction` devuelve `MSG_HORARIO_ERROR` y `HorariosViewerClient` lo muestra con `role="alert"` y un botón **Reintentar** | Antes, si `/estudiantes/{id}` fallaba, el padre veía «El estudiante aún no está asignado a un curso» o una pantalla vacía | `tests/asociadoActions.test.ts` (3 casos) y `tests/components/HorariosViewerClient.test.tsx` (4 casos) |
| **D-WEB-12** · Contrato contra el `openapi.json` de QA (03/11) | Adelantar la parte del contrato que no necesita base ni credenciales: `scripts/contrato-rutas.mjs` compara las rutas que llama la web con el `openapi.json`. **43 de 44 existían** el 03/11; faltaba `/padres/me/hijos` (BE-07). **El 10/11: 44 de 44** (`I3_contrato_rutas.json`) | La API estaba arriba pero toda ruta con datos daba 500, así que no se podían correr las pruebas de contrato | `evidencias/PR-05/web/I1_contrato_rutas.json`. **No reemplaza** a la corrida de contrato del PR-05 |
| **D-WEB-13** · Exclusiones de cobertura en Sonar (03/11) | Dos pasos, en este orden: 1) pruebas reales (`cargaInicial`, `apiBase`, `FallidosMasivo`, `register`, `asociadoViewer`); 2) `sonar.coverage.exclusions` con las vistas que D-WEB-05 asigna a los E2E, archivo por archivo. La planeación la llama «D-WEB-11», pero ese número ya estaba usado | El gate fallaba por cobertura. La causa principal era que `coverage.include` dejaba fuera del `lcov` archivos **que sí tienen pruebas**, y Sonar los contaba con 0 % | Umbrales de `vitest.config.mts` intactos; cobertura nueva 86,2 % (sección 7.2) |
| **D-WEB-14** · Arreglos de Reliability (03/11) | Los 9 issues de Sonar corregidos con su prueba (detalle en la sección 7.3) | Reliability pasó de C a A | `tests/apiBase.test.ts`, `tests/hooks/cargaInicial.test.tsx`, `tests/hijoActivo.test.ts`. **Ningún issue se marcó como falso positivo ni won't fix** |
| **Menores** (02/11) | Mapeo de trazabilidad por `tests/trazabilidad.json` en vez de prefijar cada `describe`; `padre-dos-hijos` y la segunda corrida de `registro-masivo` con `test.fail()` hasta que `E2E_BE07`/`E2E_BE08` valgan `true`; la evidencia «antes del arreglo» son los commits `test(...)` del historial, sin una corrida U0 separada | — | `npm run trazabilidad` |
| **D-WEB-15** · Gestión de defectos en GitHub Issues (10/11) | Los defectos del PR-07 pasan de Azure Boards a **GitHub Issues** con la plantilla **Defecto**, la plantilla de PR (`Corrige #<n>`) y el workflow **Defectos** (`scripts/defectos/gestion.mjs`, sin acciones de terceros). Este clasifica, mueve el estado con los PR, reabre lo que un `Closes #<n>` cerró sin verificar, cuenta los reabiertos y exporta el CSV de los cortes. Se reescribió la planeación de gestión de defectos y las demás planeaciones apuntan a GitHub | Decisión del equipo. El proceso (estados, severidad, prioridad, verificación por QA) no cambia | `tests/defectos.test.ts` (25 casos), incluido que la plantilla y el workflow usen los mismos campos; prueba de humo contra una API de GitHub simulada (9 escenarios) |
| **D-WEB-16** · Tiempos de espera de los E2E (10/11) | `timeout: 90_000` por prueba y 45 s para llegar al inicio tras el login | Portada ~20 s + login 14–17 s superaban los 30 s por defecto. Las comprobaciones no cambian | E3 → E4 |
| **D-WEB-17** · Defectos de las pruebas E2E (10 y 11/11) | Se corrigieron solo oráculos y datos que contradecían la planeación o la API: el menú del admin (contra `routeRoles`, y ahora más estricto), el correo `.test` y el `?registered=true` del registro, las esperas de 5 s para Server Actions, el nombre del hijo buscado en la `<option>` oculta y la espera de la redirección de cliente tras el cierre por inactividad. **Nunca** se tocó una prueba para esconder un defecto: las de DEF-WEB-02, 03 y 04 siguieron fallando hasta corregir la app | Cada cambio con causa comprobada (sección 9.3) | E4 a E9 |
| **D-WEB-18** · Corrección de DEF-WEB-02, 03 y 04 (11/11) | Se corrigieron en el PR #34, un commit por defecto (`138db97`, `4067c18`, `e886144`), cada uno con una prueba que fallaba antes y pasa después. DEF-WEB-05 queda abierto | Pedido de Mariana: «arregla todos los fallos». Observación: en Netlify el 307 del proxy no llega (redirige la página) | `tests/arquitectura.test.ts`, `tests/asociadoActions.test.ts`, IT-WEB-03 nuevo, E7 a E9 |

---

## 12. ACCIONES EXTERNAS

Estado de cada fila de [`docs/acciones-externas.md`]. Ningún secreto reproducido.

| # | Acción | Responsable | Estado |
|---|---|---|---|
| 1 | Eliminar o pausar el proyecto Supabase `odenqixjgsrgehnyllfn` | Andrés Acero | **Pendiente** (DEF-028) |
| 3 | `SONAR_TOKEN` e importación en SonarQube Cloud | Samuel Sierra | **Hecha** el 03/11. Falta solo la captura del panel |
| 4 | Revisar y detener la Web App vieja de Azure `EyesSchool` | Andrés Acero | **Pendiente** |
| 5 | Variables de Vercel (producción) | Andrés Acero | **Pendiente** (bloquea `develop` → `main`) |
| 5b | Variables y despliegue en Netlify (QA) | Mariana Cortés | **Hecha** con el deploy preview. Falta confirmar `SESSION_IDLE_MINUTES=1` en *Deploy Previews* |
| 6 | Terminar QA: base con el seed, `DATABASE_URL`, `SECRET_KEY`, `ENVIRONMENT=qa` | Mariana Cortés | **Hecha** el 10/11 (DEF-WEB-01 cerrado) |
| 7 | Entregar `QA_PASSWORD` | Samuel Sierra | **Hecha** el 03/11. **Pendiente rotarla** |
| 8 | Crear en GitHub Issues la tarea «Quitar respaldo de /padres/me (WEB-03)» | Mariana Cortés | **Pendiente** |
| 9 | Desplegar BE-07 y BE-08 | Equipo backend | **BE-07 hecha** (10/11, en el `openapi.json`). **BE-08 pendiente** |
| 10 | Confirmar si los requisitos de `planeacion/Bugs/bugs.md` están como issues | Mariana Cortés | **Pendiente** |
| 11 | Registrar DEF-WEB-01 a 05 como issues (01 a 04 ya resueltos: se registran y QA los cierra) | Mariana Cortés | **Pendiente** (al fusionar el PR #34) |
| 12 | Rotar la contraseña de la base de Render | Mariana Cortés | **Pendiente**; ya no bloquea |
| 13 | Lista de ramas viejas para decidir cuáles se borran | Mariana Cortés | **Pendiente**. El asistente no borra ninguna |
| 14 | Fusionar el PR #34 para activar el workflow **Defectos** y crear las etiquetas | Mariana Cortés | **Pendiente** |
| 15 | Registrar DEF-020 a DEF-028 como issues | Mariana Cortés | **Pendiente** |
| 16 | Versionar `scripts/qa_reset_passwords.py` en el backend, con una comprobación de a qué base apunta | Equipo backend | **Pendiente** |
| 17 | Agregar `https://` al `NEXT_PUBLIC_API_URL` del `.env` local | Mariana Cortés | **Pendiente** |
| 18 | Decidir cuándo se corrigen DEF-WEB-02 a 05 | Mariana Cortés · Sergio Gómez (PO) | **Hecha** el 11/11: corregidos 02, 03 y 04. Queda DEF-WEB-05 (Baja) |
| 19 | Vercel: dar a `NEXT_PUBLIC_API_URL` la URL completa (`https://…/api/v1`) y volver a desplegar | Mariana Cortés / Andrés Acero | **Hecha** para *Preview*: la vista previa compila en `b557b25`. Falta confirmar la variable de *Production* antes de fusionar a `main` |

Hechas: **6 de 19** (3, 5b, 6, 7, 18 y 19 para *Preview*), más la parte BE-07 de la 9. No existe una fila «2».

---

## 13. RAMAS Y PULL REQUESTS

### 13.1 Estado del PR #34

| Dato | Valor | Fuente |
|---|---|---|
| Dirección | `feat/web-calidad-pruebas` → **`develop`** | [API `/pulls/34`] |
| Estado | **Abierto, no fusionado** | ídem |
| Commits | **51** | [`git rev-list --count origin/develop..HEAD`] |
| Archivos cambiados | 222 (+25 454 / −1 084 líneas) al subir `b557b25`; `mergeable_state: clean` | [API `/pulls/34`] |
| Creado | 03/11/2026 01:41 UTC | ídem |
| **Aprobaciones** | **Ninguna** (0 revisiones) | [API `/pulls/34/reviews`] |

### 13.2 Checks sobre `b557b25`

| Check | Conclusión | Terminó (UTC) |
|---|---|---|
| Lint, tipos, pruebas y build | **success** | 11/11/2026 18:49:15 |
| SonarCloud Code Analysis | **success** (Quality Gate passed) | 18:48:54 |
| `netlify/qaeyesschool/deploy-preview` | **success** | 18:47:24 |
| **Vercel** (estado del commit) | **success** (antes *failure* desde `8bdc307`) | 18:47:07 |
| Header rules · Redirect rules (Netlify) | success | 18:47:21 |
| Pages changed (Netlify) | neutral | 18:47:21 |
| Vercel Preview Comments | success | 18:47:08 |

Fuente: [API de GitHub `/commits/b557b25/check-runs` y `/status`]. **Todo en verde.** El commit de este informe solo agrega documentos.

### 13.3 ¿Se fusionó?

**No.** Requisitos para fusionar:
- CI verde: **cumplido**.
- Quality Gate Passed: **cumplido**.
- Deploy preview de Netlify verde: **cumplido**.
- `RESUMEN-web.md` al día: **cumplido**.
- Aprobación de una persona más: **pendiente**.

**Antes de fusionar a `main`** hay que confirmar la variable de *Production* en Vercel (acción 19); DEF-WEB-04 ya está corregido.

### 13.4 Los commits de la rama

Del más reciente al más antiguo [`git log --oneline origin/develop..HEAD`], más el commit que agrega este informe:

| # | Hash | Mensaje |
|---|---|---|
| 51 | (este commit) | docs: informe con DEF-WEB-02, 03 y 04 corregidos y verificados |
| 50 | `b557b25` | docs(defectos): DEF-WEB-02, 03 y 04 corregidos y verificados en QA |
| 49 | `4690662` | test(evidencias): verificación de DEF-WEB-02, 03 y 04 en QA |
| 48 | `7d927df` | test(e2e): el cierre por inactividad espera la redirección del cliente (20 s) |
| 47 | `e387ee4` | test(e2e): el nombre del hijo se busca en texto visible, no en la <option> |
| 46 | `e886144` | fix(a11y): un solo <main> por página (DEF-WEB-02) |
| 45 | `4067c18` | fix(padre): el nombre del hijo sale de nombre_estudiante de BE-07 (DEF-WEB-03) |
| 44 | `138db97` | fix(auth): el proxy pasa a src/ para que Next lo ejecute (DEF-WEB-04) |
| 43 | `438bc5a` | docs: corrige el conteo de commits del informe (42 hasta e84bf03) |
| 42 | `e84bf03` | docs: informe del 11/11 con la integración, los E2E completos y los defectos nuevos |
| 41 | `fade226` | test(trazabilidad): las pruebas de gestión de defectos tienen su motivo |
| 40 | `6b378e3` | docs(defectos): DEF-WEB-01 cerrado; DEF-WEB-02 a 05 de la corrida E2E |
| 39 | `f699c63` | test(evidencias): corridas del 10 y 11/11 con la base de QA en pie |
| 38 | `c3e491f` | test(e2e): el registro del padre se comprueba por el aviso, no por la URL |
| 37 | `360b599` | test(e2e): oráculo del menú, correo válido y esperas de las Server Actions |
| 36 | `f3b121d` | feat(defectos): gestión de defectos en GitHub Issues con Actions |
| 35 | `73bf2b2` | test(e2e): tiempos de espera acordes al login del deploy preview |
| 34 | `8bdc307` | docs: precisa que la corrida es de 77d5629 y las evidencias se versionan en cebc03d |
| 33 | `cebc03d` | test(evidencias): corrida U4 del 05/11 con duraciones y guardia de rutas aprobado |
| 32 | `77d5629` | test(e2e): el guardia de rutas pasa en Chromium y Firefox |
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

Este informe no las lista ni toca ninguna: la lista se entrega con `git branch -r --merged origin/main` y Mariana decide (acción externa 13).

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

**Observación nueva para el bloque de *responsive*:** con una ventana de 1280×720, el aviso de cookies tapa el botón «CREAR CUENTA» del modal de registro (DEF-WEB-05, «Observación aparte»).

---

## 15. LO QUE NO SÉ O NO PUDE COMPROBAR

| # | Punto | Por qué | Qué haría falta |
|---|---|---|---|
| 1 | ~~Si el seed está cargado y cuántos usuarios hay~~ | **CERRADO el 10/11**: seed verificado, 110 usuarios | — |
| 2 | ~~Resultado de los E2E con sesión y de los casos de contrato~~ | **CERRADO**: 9/9 de integración y 48 E2E ejecutados | — |
| 3 | ~~Si DEF-WEB-01 era la base~~ | **CERRADO el 10/11** | — |
| 4 | Que el proxy entregue el **307 en Vercel** | En local con `next start` sí; en Netlify no (D-WEB-18). La vista previa de Vercel ya compila, pero tiene la protección de Vercel activada: sin cuenta responde 302 a `vercel.com/sso-api` | Abrirla con una cuenta del equipo y pedir `/usuarios` sin sesión: debe redirigir a `/?login=1` |
| 5 | Qué componente renovaba la sesión con el acceso vencido mientras el proxy no corría | El E2E pasó también antes de corregir DEF-WEB-04 (E3, E5); no se rastreó | Revisar si hay dos mecanismos de renovación superpuestos (`/api/auth/refresh` y el proxy) |
| 6 | Si los 7 INESTABLE de Firefox fallan por algo más que el tiempo | En E7 fallaron por tiempo agotado y al repetirlos pasaron; en Chromium pasan | Repetirlos con un entorno más rápido o con traza de red |
| 7 | ~~Por qué falla la vista previa de Vercel~~ | **CERRADO el 11/11**: el log que compartió Mariana muestra `NEXT_PUBLIC_API_URL` inválida | Acción externa 19 |
| 8 | Si BE-08 está en QA | El `openapi.json` no documenta el 409 | Que backend lo confirme |
| 9 | CP-SIS-065 verificado en navegador | Falta `SESSION_IDLE_MINUTES=1` (DEF-WEB-04 ya corregido) | Acción 5b |
| 10 | Los parentescos `Abuela`, `Tío`, `Tía`, `Hermano` y `Hermana` del perfil del padre | `PadreCreate` del backend solo acepta `Padre`, `Madre`, `Tutor`, `Abuelo` y `Otro`. No se probó guardar uno de esos | Un caso de integración o E2E sobre `/perfil` del padre |
| 11 | El reparto de los 50 CP-SIS restantes entre «manual» y «sin cubrir» | La planeación de sistema no tiene columna de automatización | Revisarla caso a caso |
| 12 | Número de issue de DEF-020 a 028 y de DEF-WEB-01 a 05 | Se registran al fusionar el PR #34 | Acciones externas 11 y 15 |
| 13 | Captura del Quality Gate (`sonar-quality-gate.png`) | No se genera desde el repositorio | Que Mariana la tome del panel |
| 14 | Quality Gate de la **rama** | SonarQube responde `NONE`: solo se analiza el PR | Fusionar a `develop` |
| 15 | Cabeceras de seguridad HTTP de la web de QA | ZAP baseline pendiente | Bloque 3 de las pruebas manuales |
| 16 | Las 24 pruebas manuales y el *responsive* 375/768/1920 | Nadie las ha ejecutado | Ejecutarlas, y antes agregar los casos de *responsive* |
| 17 | El JUnit de la corrida E3 | Se sobrescribió por error con la salida de un `--list`; solo queda la consola | Nada: E4 es la corrida de referencia y sí tiene JUnit |
