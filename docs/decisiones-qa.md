# Registro de decisiones de QA — Frontend web

Cada decisión toma la opción por defecto (A) del documento de cierre del frontend, salvo donde se indica.

## D-WEB-01 · Acceso a /qr/escanear
- Fecha: 02/11/2026
- Opción aplicada: A (rutas separadas: `/qr` admin+estudiante; `/qr/escanear` admin+docente). La separación ya existía en `src/lib/auth/routeRoles.ts`; faltaban las pruebas que la vigilen.
- Por qué: los casos CP-SIS-096 y CP-SIS-098 y US005/US006 piden al docente escanear en la web.
- Pruebas que la vigilan: `tests/routeRoles.test.ts` («docente puede entrar a /qr/escanear», «docente no puede entrar a /qr (Mi QR)», «estudiante no puede entrar a /qr/escanear», «el enlace de escanear aparece en el riel del docente…») y el contrato `PERMISSIONS ↔ apiRoles` de `tests/permissions.test.ts` (sin diferencias).

## D-WEB-02 · Respaldo de hijos mientras no exista BE-07
- Fecha: 02/11/2026
- Opción aplicada: A. `getHijosAction` llama a `/padres/me/hijos`; si responde 404 o 405 arma un solo hijo con `GET /padres/me` (más `/estudiantes/{id}` para el curso, tolerando que falle). Otro error (401, 403, 500, red) se propaga.
- Por qué: así la web se puede fusionar antes que BE-07 sin romper notas, novedades, horarios ni asistencia del padre.
- Pruebas: `tests/asociadoActions.test.ts` (404 → un hijo, 500 → propaga y no usa `/padres/me`, disponible → no llama a `/padres/me`).
- Pendiente: quitar el respaldo cuando BE-07 esté en producción (`docs/acciones-externas.md`, fila 8).

## D-WEB-03 · Reglas del proxy /api/proxy
- Fecha: 02/11/2026
- Opción aplicada: A, con la regla de origen por cabecera `Origin` (sin token CSRF).
- Reglas: destino siempre bajo `${API}/…` con `new URL()`; segmentos vacíos, `.`, `..`, `://`, `\` o codificados (`%2e%2e`, `%2f`) → 400; solo GET/POST/PUT/PATCH/DELETE (otro → 405); cuerpo > 5 MB → 413; solo pasan `content-type`, `accept` y `accept-language`; `Authorization` sale solo de la cookie `eys_access`; de vuelta solo `content-type`, `content-disposition` y `content-length`; `Origin` ajeno en métodos con cuerpo → 403; sin cookie → 401 sin llamar a la API; API caída → 502 con `{"detail":"No se pudo contactar el servidor."}`.
- Por qué: el proxy es lo único que toca el token (WEB-02); no debe ser un reenviador abierto.
- Pruebas: `tests/apiProxy.test.ts` (bloque «endurecimiento»).
- Nota: se exporta `OPTIONS` y `HEAD` solo para responder 405 de forma explícita; TRACE y CONNECT no llegan al handler de Next.

## D-WEB-04 · Checklist de contraseña
- Fecha: 02/11/2026
- Opción aplicada: A. El registro tenía el bloque dentro de `SignupModal`; se extrajo a `src/components/auth/PasswordChecklist.tsx` (lista con `aria-live="polite"` y texto «cumplida/pendiente» para lector de pantalla) y se usa en el registro y en `reset-password`. El botón «Actualizar» queda deshabilitado si la contraseña no cumple o no coincide con la confirmación.
- Pruebas: `tests/components/PasswordChecklist.test.tsx`.
- Los criterios de aceptación de WEB-05 (reglas en vivo) quedan cubiertos.

## D-WEB-05 · Alcance de la cobertura
- Fecha: 02/11/2026
- Opción aplicada: A. La cobertura del frontend se mide sobre `src/lib` y `src/services`; los hooks y componentes de pantalla se cubren con Playwright (PR-06).
- Umbrales (`vitest.config.mts`): `src/lib/**` 80 % de líneas (85,3 % al 02/11) y `src/services/**` 60 % (68,2 % al 02/11, antes 11,9 %). `src/hooks` no lleva umbral (0,4 %); solo se prueban los hooks con lógica propia (`usePermissions`, `usePagination`, `useAsistencia`).
- Pruebas: `tests/services/*`.

## D-WEB-06 · eslint-disable
- Fecha: 02/11/2026
- Opción aplicada: la alternativa de la sección 6.4 («dejar las excepciones, documentadas una por una»). Las 25 excepciones están en `docs/eslint-excepciones.md`, cada una con su motivo en la línea.
- Por qué: pasar las lecturas del navegador al montar a `useSyncExternalStore` o a `useState(() => …)` puede causar errores de hidratación y no se puede validar sin la corrida E2E contra QA; las imágenes QR vienen de un origen variable (servicio externo o avatar de la API) y el link de Material Symbols no se puede pasar a `next/font`.
- `sonar-project.properties` no excluye nada de las excepciones.
- Seguimiento: evaluar `useSyncExternalStore` después del PR-06.

## D-WEB-07 · CP-SIS-065 (sesión de 40 min)
- Fecha: 02/11/2026
- Opción aplicada: B, no la A. El reloj simulado de Playwright (`page.clock`) solo mueve el reloj del navegador, pero el proxy mide la inactividad con el reloj del servidor, así que no habría cerrado la sesión.
- Cómo: `SESSION_IDLE_MINUTES` (por defecto 30) la lee `inactividadMs()` en `src/lib/auth/cookies.ts`. `e2e/sesion.spec.ts` corre dos escenarios a escala contra una web de QA con `SESSION_IDLE_MINUTES=1` (4 min con actividad cada 15 s siguen en sesión; 70 s sin actividad la cierran). Se activan con `E2E_SESSION_IDLE_MINUTES`; sin ese dato se omiten como «Pendiente».
- La regla real (30 min) la prueban las unitarias de `updateSession` (`ahora` por parámetro) y `inactividadMs`.
- Alternativa C (40 min reales con video) queda en `docs/pruebas-manuales-pr06-web.md`.

## D-WEB-08 · main_eyesschool.yml
- Fecha: 02/11/2026
- Opción aplicada: se borra el flujo de despliegue a la Web App de Azure `EyesSchool`; producción está en Vercel (https://proyecto-eyesschool.vercel.app).
- Condición: si en la acción externa 4 (`docs/acciones-externas.md`) la Web App recibe tráfico real, se restaura con `git restore .github/workflows/main_eyesschool.yml` y se anota aquí.
- Prueba que lo vigila: `tests/arquitectura.test.ts` («hay un solo despliegue»; habría que quitarla si se restaura).

## D-WEB-09 · Despliegue de la web de QA y escaneo de secretos
- Fecha: 03/11/2026
- Opción aplicada: A, con la configuración en el repositorio (`netlify.toml`) en vez de solo en el panel: `command = "npm run build"`, `publish = ".next"`, `NODE_VERSION = "20"` y `SECRETS_SCAN_OMIT_KEYS = "NEXT_PUBLIC_API_URL"`. Así la causa y el motivo de la omisión quedan versionados y revisables.
- Por qué se omite esa variable: `NEXT_PUBLIC_*` es pública por diseño (Next la graba en el JavaScript del navegador), así que el escaneo de Netlify siempre la encuentra; no es una fuga. **Ninguna variable con un secreto real se agrega a esa lista**: esas se leen en el servidor. No se usó la alternativa B (`SECRETS_SCAN_ENABLED=false`).
- A qué API apunta cada despliegue sigue fuera del repositorio (Netlify / Vercel → *Environment variables*), con `.env.example` como plantilla de nombres.
- Revisión de `.env` (sección 1.2): ningún `.env` versionado hoy ni en la historia; el único archivo `.env*` del repositorio es `.env.test.example` (solo nombres). `.gitignore` cubre `.env*` con `!.env.example` y `!.env.test.example`. El `.env` local está vacío (0 bytes).
- gitleaks 8.21.2 sobre los 67 commits (`evidencias/PR-03/web/gitleaks.json`, con `--redact`): 4 hallazgos, los 4 en el commit `b7e20f5` (13/04/2026), en `check-profs.js`, `diag.json`, `diagnose-docente.js` y `setup-samuel.js`, archivos de diagnóstico que el mismo día se revirtieron y hoy no existen. Son claves del proyecto Supabase `odenqixjgsrgehnyllfn`: **borrar los archivos no las invalida**, así que la mitigación es la acción externa 1 (eliminar o pausar ese proyecto). El árbol de trabajo de hoy no tiene hallazgos. El CI ya corre `gitleaks/gitleaks-action@v2` en cada PR.

## D-WEB-10 · `planeacion/Bugs/bugs.md` restaurado
- Fecha: 03/11/2026
- Opción aplicada: la rama condicional («si no, restaurarlo»). Se restauró con `git restore` porque nadie confirmó que sus 455 líneas estén en Azure Boards y no son defectos con id: son requisitos funcionales sueltos (mensajes de confirmación, historial de asistencia) que no se repiten en `planeacion/tests/GestionDefectos/` (DEF-020 a DEF-028).
- Para borrarlo hay que confirmar antes que esos requisitos estén en Azure Boards (acción externa 10).

## D-WEB-11 · Horario del estudiante asociado con error y reintento
- Fecha: 03/11/2026
- Opción aplicada: A. Antes, si `/estudiantes/{id}` fallaba, el padre veía «El estudiante aún no está asignado a un curso» (el error se tragaba con `.catch(() => null)`) o una pantalla vacía.
- Cómo: `Hijo.cursoNoDisponible` distingue «no tiene curso» de «no se pudo consultar el curso», `getHorarioAsociadoAction` devuelve `error: MSG_HORARIO_ERROR` («No pudimos cargar el horario. Intenta de nuevo.») —también si fallan `/horarios` o `/materias`— y `HorariosViewerClient` muestra ese mensaje con `role="alert"` y un botón **Reintentar** que llama a `router.refresh()`.
- Pruebas: `tests/asociadoActions.test.ts` («horario del padre muestra error si /estudiantes/{id} falla», «… si /horarios falla», «sin curso asignado no es un error») y `tests/components/HorariosViewerClient.test.tsx` (4 casos).

## D-WEB-12 · Contrato verificado contra el `openapi.json` de QA
- Fecha: 03/11/2026
- Situación: la API de QA está arriba (`/docs` 200) pero toda ruta que consulta la base responde 500, y la web de QA todavía no tiene despliegue (404), así que las 9 pruebas de integración y los 48 E2E no se pueden ejecutar (`evidencias/PR-05/web/I1_preflight-qa.txt`).
- Opción aplicada: adelantar la parte del contrato que no necesita base ni credenciales. `scripts/contrato-rutas.mjs` (`npm run qa:contrato-rutas`) saca las rutas que llaman `apiFetch`/`serverFetch` en `src` y las compara con el `openapi.json` de QA: **43 de 44 existen**; la única que falta es `/padres/me/hijos` (BE-07), lo que confirma que el respaldo de D-WEB-02 sigue siendo necesario y que `E2E_BE07` queda en `false`. Informe: `evidencias/PR-05/web/I1_contrato_rutas.json`.
- No reemplaza a `I1_contrato_qa.xml` (PR-05), que exige la base de QA en pie.

## D-WEB-13 · Exclusiones de cobertura en SonarQube
- Fecha: 03/11/2026
- Nota de numeración: la planeación de cierre la llama «D-WEB-11», pero ese número ya estaba usado (horario del estudiante asociado). Es la misma decisión.
- Problema: el Quality Gate fallaba con 60,6 % de cobertura en código nuevo. Había **dos** causas, y la principal no era la que se suponía:
  1. **El informe `lcov` no incluía archivos que sí tienen pruebas.** `coverage.include` en `vitest.config.mts` era `['src/lib/**', 'src/services/**', 'src/hooks/**']`, así que el proxy (96 % con 17 pruebas), `PasswordChecklist` (100 %), `SelectorHijo` (100 %), `RegistroMasivo` (86 %), `FallidosMasivo` (100 %), `NotasViewerClient` (97 %) y `HorariosViewerClient` (81 %) **no aparecían en el lcov** y Sonar los contaba con 0 %: 107 de las 158 líneas nuevas sin cubrir. Ahora se mide todo `src` y qué queda fuera del cálculo lo decide `sonar.coverage.exclusions`, que es su lugar.
  2. Además, `sonar.sources=src,proxy.ts` no tenía `sonar.coverage.exclusions`, así que las páginas y vistas que D-WEB-05 asigna a los E2E contaban como código sin cubrir.
- Opción aplicada: A, en dos pasos y en este orden.
  1. **Pruebas reales primero.** `tests/hooks/cargaInicial.test.tsx` (15 casos) cubre la carga inicial de `useReportes`, `useNotas`, `useUsuarios`, `useAsistencia` y `useHorarios` —justo las líneas que Sonar marcó como promesas sin esperar—, `tests/apiBase.test.ts` (12) los arreglos del proxy, `tests/components/FallidosMasivo.test.tsx` (5) el componente nuevo de WEB-06, `tests/register.test.ts` (19) la validación por rol de `register` (0 % → 68,8 %) y `tests/asociadoViewer.test.ts` (9) el mapeo de notas, novedades y horario del estudiante asociado más el camino del rol estudiante (45,8 % → **100 %**). Efecto: `src/hooks` pasó de 0,4 % a **32,6 %** y `src/lib` de 85,5 % a **87,8 %**. Los umbrales de `vitest.config.mts` no se tocaron.
  2. **Alinear Sonar con D-WEB-05:** `sonar.coverage.exclusions` con `page/layout/loading/error/not-found.tsx` de `src/app`, `src/types/**`, `proxy.ts` y los componentes de pantalla **uno por uno**. Quedan **dentro** de la cobertura `src/hooks`, `src/lib`, `src/services`, `src/app/api/**` y los componentes con lógica y prueba propia: `PasswordChecklist`, `SelectorHijo`, `RegistroMasivo` y `FallidosMasivo`.
- Esto solo saca esos archivos del **cálculo de cobertura**: Sonar los sigue analizando por bugs, *code smells* y seguridad, y `sonar.exclusions` no creció.
- Cobertura estimada del código nuevo tras los dos pasos: **~86 %** (350 líneas nuevas, ~302 cubiertas), contra el 64,4 % del análisis del 03/11 a mediodía. El valor real lo dice el CI.
- Qué cubre cada vista excluida: `login-roles.spec.ts` (inicio y paneles por rol), `usuarios.spec.ts` (`/usuarios` y su modal), `boletin-padre.spec.ts` (`/notas` del padre), `registro-masivo.spec.ts` (QR y asistencia masiva), `registro-padre.spec.ts` (registro y vínculo), `sesion.spec.ts` (guardia de rutas y layout), `padre-dos-hijos.spec.ts` (selector de hijo).

## D-WEB-14 · Arreglos de SonarQube (Reliability)
- Fecha: 03/11/2026
- Qué se corrigió, con su prueba:
  - `src/lib/utils/hijoActivo.ts`: `NaN` → `Number.NaN`. Y, de la misma regla, `isNaN`/`parseInt`/`parseFloat` → `Number.*` en `src/auth/actions.ts` y `src/app/(dashboard)/notas/NotasClient.tsx`, con radio 10 explícito en los `parseInt`.
  - Proxy: la regex `/\/+$/` (backtracking super-lineal) se reemplazó por `quitarBarrasFinales`, que recorre desde el final. Y `process.env.NEXT_PUBLIC_API_URL ?? …` dejaba pasar la cadena vacía, con lo que `new URL('')` rompía el build en Netlify: ahora `apiBase()` trata vacío y espacios como no definido y un valor sin protocolo lanza un error que nombra la variable. Las dos funciones viven en `src/lib/utils/apiBase.ts` porque un `route.ts` solo debe exportar métodos HTTP. Pruebas: `tests/apiBase.test.ts`, incluida una con 50 000 barras que debe tardar menos de 100 ms.
  - Promesas sin esperar (`useNotas`, `useUsuarios`, `useReportes`, `useAsistencia`, `useHorarios` y las dos de `EscanearClient`): las cinco funciones de carga y `fetchToday` ya atrapan sus propios errores y los dejan en `error`, así que llevan `void`. **No se usó `void` para esconder un rechazo**: lo prueban los casos «si la carga falla, el mensaje queda en error y loading se apaga» de `tests/hooks/cargaInicial.test.tsx`.
- Ningún issue se marcó como *falso positivo* ni *won't fix*, y ningún umbral bajó.

## Otras decisiones menores (02/11/2026)
- **Mapeo de trazabilidad:** se usó `tests/trazabilidad.json` (alternativa de 6.1) en vez de prefijar cada `describe`, para no renombrar los archivos de prueba. El script `npm run trazabilidad` regenera `docs/trazabilidad-ut-web.md`.
- **Specs que dependen del backend:** `padre-dos-hijos` (BE-07) y la segunda corrida de `registro-masivo` (BE-08) corren con `test.fail()` hasta que `E2E_BE07` / `E2E_BE08` valgan `true`.
- **Evidencia antes del arreglo (TDD):** los commits `test(...)` del historial. No se reconstruyó una corrida U0 separada.
