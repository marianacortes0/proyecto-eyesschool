# Informe de implementación — Pruebas y código testeable del frontend web · Eyes School

> **Qué es:** resumen de lo implementado a partir de las planeaciones de `planeacion/tests/` (correcciones, unitarias, integración, sistema y análisis estático).
> **Para quién:** Mariana Cortés (QA), Samuel Sierra (líder de pruebas) y quien revise el PR.
> **Fecha:** 02/11/2026 · **Rama:** `feat/web-calidad-pruebas` (13 commits locales sobre `develop`; sin push). Actualizado al cierre el 02/11/2026: ver la sección 8.

---

## 1. Resultado de las verificaciones locales

| Verificación | Resultado |
|---|---|
| `npx vitest run` | **233 pruebas en 28 archivos, todas pasan** (línea base: 28 en 4; el primer informe tenía 121 en 19) |
| `npx tsc --noEmit` | 0 errores |
| `npx eslint . --max-warnings=0` | 0 errores y **0 advertencias** (línea base: 28) |
| `npm run build` | Compila (incluye `proxy.ts` y `/api/proxy/[...path]`) |
| `npm audit --omit=dev` | 0 vulnerabilidades |
| `npm run test:int` | 9 pruebas **omitidas**: no hay `QA_API_URL` (comportamiento esperado) |
| E2E (`npx playwright test`) | **No ejecutado**: no hay URL de QA ni usuarios (ver sección 5) |

**Cobertura medida por primera vez (`npm run test:cov`, línea base U1 del PR-04):**

| Carpeta | Líneas cubiertas |
|---|---|
| `src/lib` | 110 / 129 (85,3 %) · umbral 80 % |
| `src/services` | 600 / 880 (68,2 %), antes 11,9 % · umbral 60 % |
| `src/hooks` | 4 / 915 (0,4 %) |
| Total medido | ver `evidencias/PR-04/web/U1_cobertura.txt` (los hooks y las pantallas se cubren con Playwright; D-WEB-05) |

**Pruebas primero:** antes de tocar el código se ejecutó la suite con las pruebas nuevas: fallaban al menos 46 pruebas y 6 archivos no cargaban (módulos que aún no existían). Después de cada corrección pasaron.

## 2. Preparación del repositorio

`develop` no tenía la base de pruebas que la planeación da por hecha (Vitest, CI, `routeGuard`…). Está en `chore/calidad-seguridad`, que iba 3 commits por delante, así que se hizo el avance rápido local `develop ← origin/chore/calidad-seguridad` (sección 7 de la planeación). No se hizo push.

## 3. Archivos por corrección

### WEB-INF-1/2 · Entorno de pruebas y cobertura
| Archivo | Cambio |
|---|---|
| `vitest.config.mts` | Dos proyectos: `unitarias` (node, `*.test.ts`) y `componentes` (jsdom, `*.test.tsx`); cobertura v8 sobre `src/lib`, `src/services`, `src/hooks` |
| `vitest.integration.config.mts` | Config aparte para `tests/integration/**/*.int.test.ts` (timeout 20 s) |
| `tests/setup/nextMocks.ts` | Dobles de `next/headers` (`cookieJar`), `next/navigation`, `next/cache` |
| `tests/setup/rtl.ts`, `tests/setup/loadEnvTest.ts` | Limpieza del DOM entre pruebas; carga de `.env.test.local` |
| `tests/helpers.ts` | `jwt()`, `json()` compartidos |
| `src/services/api/serverFetch.ts` | `serverFetch(path, { token })`; lanza `ApiError` con `status` y `detail` |
| `src/services/api/client.ts` | Nueva clase `ApiError`; `getClientToken` eliminado; en el navegador `apiFetch` llama a `/api/proxy` |
| `src/services/asistencia/asistenciaActions.ts`, `src/services/asociado/asociadoActions.ts` | Migrados a `serverFetch` (las copias de `apiFetch` con `cookies()` ya no existen aquí) |
| `package.json` | Scripts `test:cov`, `test:int`, `e2e`; dependencias de desarrollo `jsdom`, `@testing-library/{react,dom,user-event}`, `@vitest/coverage-v8`, `@playwright/test` |
| `tests/hooks/usePermissions.test.tsx` | Prueba de humo con `renderHook` |
| `tests/serverFetch.test.ts` | Datos / lista vacía y 204 / error |

### WEB-01 · Sesión y rutas
| Archivo | Cambio |
|---|---|
| `src/lib/auth/sessionMiddleware.ts` | Reescrito: renueva con `/auth/refresh`, deja la cookie nueva también en la petición, cierra la sesión a los 30 min sin actividad (`eys_last`, httpOnly) y protege todo el panel. Recibe `ahora` por parámetro |
| `src/lib/auth/routeRoles.ts` | **Mapa único** ruta → roles (`rolesDeRuta`, `puedeEntrar`, `inicioDeRol`) |
| `src/lib/auth/navItems.ts` | Enlaces del riel por rol (pura); `PanelSidebar.tsx` ahora la usa |
| `src/lib/auth/jwt.ts`, `cookies.ts` | Decodificación del JWT; opciones y constantes de las cookies |
| `proxy.ts` (antes `middleware.ts`) | Convención de Next 16; se renombró a mano (equivale al codemod) |
| `src/services/supabase/` | **Eliminado** |
| `tests/routeGuard.test.ts` | Reescrito contra el módulo nuevo: 7 casos previos + 11 nuevos (los 8 de la planeación y 3 extra: todas las rutas, `eys_last` httpOnly, cookie en la petición) |
| `tests/routeRoles.test.ts` | Mapa único contra los enlaces del sidebar |

### WEB-02 · Cookies de sesión
| Archivo | Cambio |
|---|---|
| `src/auth/actions.ts` | `eys_access` y `eys_refresh` `httpOnly`; todas `secure` en producción y `sameSite: lax`; nueva `eys_last` |
| `src/app/api/auth/refresh/route.ts` | Cookie de acceso httpOnly y misma limpieza de sesión |
| `src/app/api/proxy/[...path]/route.ts` | **Nuevo**: agrega el Bearer desde la cookie, reenvía cuerpo y `Content-Disposition`, rechaza `..` |
| `src/lib/auth/decodeRol.ts`, `src/lib/auth/server.ts` | El rol sale del token; sin token de acceso no hay usuario |
| `notasService.ts`, `reportesService.ts`, `dashboardService.ts` | Pasan por el proxy; ya no leen el token |
| `tests/authCookies.test.ts`, `decodeRol.test.ts`, `apiProxy.test.ts`, `apiClient.test.ts` (4 casos nuevos) | Cubren lo anterior |

### WEB-03 · Varios hijos (depende de BE-07)
| Archivo | Cambio |
|---|---|
| `src/lib/utils/hijoActivo.ts` | `elegirHijoActivo`, tipo `Hijo`, `MSG_SIN_HIJOS` |
| `src/services/asociado/asociadoActions.ts` | `getHijosAction` (`GET /padres/me/hijos`), `getAsociadoAction`; las acciones reciben `idEstudiante` |
| `src/components/asociado/SelectorHijo.tsx` | Visible con 2 hijos o más; cambia `?hijo=` |
| Páginas `notas`, `novedades`, `horarios`, `asistencia`, `general` | Leen `?hijo=` y muestran el selector |
| `dashboardService.ts` | `?id_estudiante=` hacia `/dashboard/padre` |
| `tests/hijoActivo.test.ts`, `asociadoActions.test.ts`, `components/SelectorHijo.test.tsx` | 6 + 5 + 4 casos |

### WEB-04 · Permisos
`src/lib/utils/permissions.ts` (el docente ya no borra asistencia) · `tests/fixtures/apiRoles.ts` (tabla armada con los `require_roles` del backend) · `tests/permissions.test.ts` (3 casos nuevos, incluida la prueba de contrato).

### WEB-05 · Restablecer contraseña
`src/auth/actions.ts` (`resetPassword` usa `isPasswordValid` y nombra la regla que falta) · `tests/resetPassword.test.ts` (5 casos). **Pendiente de la parte visual:** `src/app/(auth)/reset-password/page.tsx` aún no muestra las reglas en vivo (la planeación lo pide; no se tocó).

### WEB-06 · Registro masivo
`src/services/asistencia/asistenciaService.ts` (`clasificarResultados`, `itemsParaReintento`, tipos) · `asistenciaActions.ts` (resultado `{ guardados, duplicados, fallidos }`) · `src/components/asistencia/FallidosMasivo.tsx` (nuevo) · `src/components/qr/RegistroMasivo.tsx` · `src/hooks/useAsistencia.ts` · `tests/registroMasivo.test.ts` (7) · `tests/components/RegistroMasivo.test.tsx` (4).

### WEB-09 · Boletín y mensajes
`notasService.ts` (`MSG_SIN_NOTAS_PERIODO`, `MSG_SIN_BOLETIN`, 404 → mensaje del CA) · `NotasViewerClient.tsx` · `tests/notasService.test.ts` (4) · `tests/components/NotasViewerClient.test.tsx` (5).

### WEB-08 · Código heredado y advertencias
`src/services/supabase/` borrado · 28 advertencias → 0: 1 corregida con `usePagination` (se deriva la página sin efecto), 5 ternarios de `HorariosClient.tsx` pasados a `if/else`, 1 importación sin uso, y **20 documentadas** con `eslint-disable-next-line … -- motivo` (lectura del navegador al montar, imágenes de QR externas, fuente del layout raíz) · `eslint.config.mjs` ignora `coverage/`, `playwright-report/`, `test-results/`.

### WEB-INF-3 · Playwright
`playwright.config.ts` · `e2e/utils.ts` · `e2e/login-roles.spec.ts` · `sesion.spec.ts` · `padre-dos-hijos.spec.ts` · `registro-masivo.spec.ts` · `registro-padre.spec.ts` · `boletin-padre.spec.ts` · `usuarios.spec.ts`.

### WEB-INF-4 · Calidad y despliegue
`.github/workflows/ci.yml` (`eslint --max-warnings=0`, `test:cov`, gitleaks, SonarQube, `fetch-depth: 0`) · `sonar-project.properties` · `.github/workflows/main_eyesschool.yml` **eliminado** · `.gitignore`.

### Integración (PR-05)
`tests/integration/contrato-api.int.test.ts` (IT-WEB-03, 04 y 05; se omite sin `QA_API_URL`) · IT-WEB-01 e IT-WEB-02 están en `permissions.test.ts` y `asociadoActions.test.ts` · `tests/arquitectura.test.ts` (6 reglas de la sección 5 y criterios de aceptación de WEB-01/04 vigilados leyendo el código).

## 4. Discrepancias entre la planeación y el código

1. **Boletín del padre (WEB-09):** la planeación dice que `NotasViewerClient.tsx` no tiene opción de boletín. Ya tenía un botón «Descargar boletín PDF». Se renombró a «Descargar boletín» y se agregó lo que sí faltaba (texto del periodo vacío, mensaje del 404, ruta por el proxy).
2. **`/padres/me/hijos` no existe todavía en el backend** (`padres.py` solo tiene `/padres/me`). Hasta que BE-07 llegue a `develop`, las páginas de notas, novedades, horarios y asistencia del padre fallan al cargar. El inicio (`/general`) sí degrada al vínculo de siempre.
3. **Tabla `apiRoles`:** armada con el backend local `backend-Eyes-School` (rama `developer`). La prueba de contrato encontró **una sola diferencia**, la de WEB-04.
4. **Ruta `/qr`:** la planeación no la lista. Se fijó en admin + estudiante, que es lo que ya mostraba el sidebar con `can('read','qr')`.

## 5. Pendiente o no hecho (y por qué)

| Qué | Motivo |
|---|---|
| Ejecutar los E2E y las pruebas de integración | Faltan `E2E_BASE_URL`, `QA_API_URL`, `QA_PASSWORD` y los correos por rol. Los specs **no se han corrido**: sus selectores de formularios (usuarios, registro de padre, registro masivo) son los más propensos a ajustarse en la primera corrida |
| Datos de QA | Se marcan «Pendiente» y el spec se omite: `E2E_HIJO_1_NOMBRE`, `E2E_HIJO_2_NOMBRE`, `E2E_PADRE_UN_HIJO_EMAIL`, `E2E_JORNADA_MASIVO`, `E2E_CURSO_MASIVO`, `E2E_ESTUDIANTE_VINCULADO_ID`, `E2E_ESTUDIANTE_VINCULADO_NOMBRE` |
| CP-SIS-065 (sesión de 40 min) | Ya no es `test.fixme`: corre a escala contra una web de QA con `SESSION_IDLE_MINUTES=1` (D-WEB-07). Pendiente de desplegar así en QA |
| Resultado esperado de `usePermissions` | Resuelto: la prueba recorre los 4 roles contra `PERMISSIONS` (UT-WEB-01) |
| Reglas de contraseña en vivo en `reset-password/page.tsx` | Resuelto con `PasswordChecklist` (D-WEB-04) |
| Revocar la clave `service_role` de Supabase, crear `SONAR_TOKEN`, importar el proyecto en SonarQube Cloud, detener la Azure Web App, ajustar variables en Vercel | Acciones externas al repositorio |
| Quitar `registrado_por` del cuerpo (BE-10) | Opcional en la planeación y el backend actual todavía lo usa |
| Manuales del PR-06 (Lighthouse, axe, ZAP, cámara QR, API caída, Brave) y los documentos de UAT y gestión de defectos | Son ejecución manual o proceso; no se leyeron a fondo ni generan código |
| Push y PR | No se hicieron: la rama solo existe en local |

## 6. Cambios de comportamiento a revisar antes de liberar

- `eys_access` ya no se puede leer desde JavaScript: **toda** llamada del navegador pasa por `/api/proxy`. El build y los 121 casos pasan, pero no se probó la aplicación completa contra una API real; conviene un recorrido manual de cada módulo en QA.
- `getServerUser()` devuelve `null` si no hay token de acceso, aunque exista `eys_user`.
- La sesión se cierra a los 30 min sin actividad (cualquier petición cuenta como actividad).

## 7. Cómo ejecutar

```bash
npm ci
npm test                  # unitarias y de componentes
npm run test:cov          # con cobertura (coverage/)
npm run test:int          # contrato contra QA (necesita .env.test.local)
E2E_BASE_URL=... npx playwright test --project=chromium --project=firefox
```

---

## 8. Cierre del 02/11/2026 (instrucciones de cierre del frontend)

**Nuevos archivos y cambios**

| Tema | Archivos |
|---|---|
| Rama y commits | `feat/web-calidad-pruebas`, 13 commits por corrección (los cambios compartían archivos, por eso la prueba y el arreglo van juntos) |
| `/qr/escanear` del docente | `tests/routeRoles.test.ts` (4 pruebas nuevas); el mapa `src/lib/auth/routeRoles.ts` ya separaba la ruta |
| Padre sin BE-07 | `src/services/asociado/asociadoActions.ts` (respaldo a `/padres/me`), `tests/asociadoActions.test.ts` (3 pruebas) |
| Proxy endurecido | `src/app/api/proxy/[...path]/route.ts`, `tests/apiProxy.test.ts` (11 pruebas nuevas) |
| Reglas de contraseña en vivo | `src/components/auth/PasswordChecklist.tsx`, `src/app/(auth)/reset-password/page.tsx`, `src/components/home/SignupModal.tsx`, `tests/components/PasswordChecklist.test.tsx` |
| Trazabilidad | `tests/trazabilidad.json`, `scripts/trazabilidad.mjs` (`npm run trazabilidad`), `docs/trazabilidad-ut-web.md` |
| Evidencias U1 | `evidencias/PR-04/web/` (commit, junit, cobertura, ESLint) |
| Cobertura de servicios | `tests/services/*` (7 archivos), umbrales en `vitest.config.mts` |
| `eslint-disable` | `docs/eslint-excepciones.md` (25 excepciones documentadas) |
| `usePermissions` | `tests/hooks/usePermissions.test.tsx` (4 roles + 4 casos concretos) |
| CP-SIS-065 | `src/lib/auth/cookies.ts` (`inactividadMs`), `src/lib/auth/sessionMiddleware.ts`, `e2e/sesion.spec.ts` |
| E2E listos para correr | `.env.test.example`, `playwright.config.ts` (carga `.env.test.local`, evidencias en `evidencias/PR-06/web/`), `e2e/*.spec.ts` (`aria-label` en `SignupModal`, `test.fail()` con BE-07 y BE-08, limpieza de la cuenta creada) |
| Documentos | `docs/decisiones-qa.md`, `docs/acciones-externas.md`, `docs/pruebas-manuales-pr06-web.md` |

**Resultados al cierre:** `tsc` 0 errores · ESLint 0 advertencias · 233 pruebas pasan (9 de integración omitidas sin `QA_API_URL`) · `test:cov` cumple los umbrales · `build` compila.

**Lo que no se hizo o se hizo distinto:**
- CP-SIS-065 usa la alternativa B, no el reloj simulado (el proxy usa el reloj del servidor).
- Los 25 `eslint-disable` se documentaron pero no se refactorizaron (riesgo de hidratación sin E2E).
- La evidencia «antes del arreglo» (U0) no se reconstruyó; se apoya en el historial (`docs/decisiones-qa.md`, «Otras decisiones menores»).
- Los E2E y la integración siguen sin ejecutarse: dependen de QA (mañana, 03/11).
- No se hizo push ni PR; no se fusionó nada.
- `planeacion/tests/` sigue sin versionar (carpeta de planeación del equipo).

## 9. Jornada del 03/11/2026 (desbloquear el despliegue y correr las pruebas)

**Qué se hizo**

| Tema | Archivos / evidencia |
|---|---|
| `.env` y despliegue de Netlify | `netlify.toml` (build `npm run build`, publish `.next`, `NODE_VERSION=20`, `SECRETS_SCAN_OMIT_KEYS=NEXT_PUBLIC_API_URL`), `.env.example`, `.gitignore` (`!.env.example`) |
| Escaneo de secretos | gitleaks 8.21.2 sobre 67 commits → `evidencias/PR-03/web/gitleaks.json` (con `--redact`) |
| Planeaciones versionadas | `planeacion/tests/**` (8 documentos), revisados sin contraseñas ni URL con credenciales |
| `planeacion/Bugs/bugs.md` | Restaurado (D-WEB-10): sus 455 líneas son requisitos, no defectos con id |
| Horario del padre con error | `src/services/asociado/asociadoActions.ts`, `src/services/asociado/mensajes.ts`, `src/lib/utils/hijoActivo.ts`, `src/app/(dashboard)/horarios/HorariosViewerClient.tsx`, `tests/asociadoActions.test.ts` (3 pruebas), `tests/components/HorariosViewerClient.test.tsx` (4) |
| Regla nueva de arquitectura | `tests/arquitectura.test.ts`: los módulos `'use server'` solo exportan funciones async |
| Datos de QA | `scripts/qa-datos.mjs` (`npm run qa:datos`) imprime `E2E_ESTUDIANTE_VINCULADO_ID/NOMBRE` sin imprimir la contraseña ni el token |
| Contrato sin base de datos | `scripts/contrato-rutas.mjs` (`npm run qa:contrato-rutas`) → `evidencias/PR-05/web/I1_contrato_rutas.json` |
| Excepciones de ESLint | `docs/eslint-excepciones.md`: ninguna de las 25 viene de código nuevo de la rama |

**Cifras**

| Corrida | Resultado |
|---|---|
| `npx tsc --noEmit` | 0 errores |
| `npx eslint . --max-warnings=0` | 0 errores y 0 advertencias |
| `npx vitest run` | **241 pruebas en 29 archivos, todas pasan** (eran 233 en 28) · `evidencias/PR-04/web/U2_unitarias.xml` |
| `npm run test:cov` | `src/lib` 85,5 % y `src/services` 68,8 % de líneas: cumple los umbrales (80 % / 60 %) · `evidencias/PR-04/web/U2_cobertura.txt` |
| `npm run build` | compila |
| `npm run trazabilidad` | 250 pruebas mapeadas (126 UT, 103 extra, 21 IT) |
| Contrato de rutas contra QA | **43 de 44**; falta `/padres/me/hijos` (BE-07) |
| `npx playwright test --list` | 48 casos en 7 specs compilan; navegadores instalados |

**Lo que sigue bloqueado (no es de la web)**

`evidencias/PR-05/web/I1_preflight-qa.txt`:

- La API de QA está arriba (`/docs` 200, `/openapi.json` 200) pero **`/api/v1/cursos` y `POST /api/v1/auth/login` responden 500**: la base de QA no responde (acción externa 6).
- **`https://qaeyesschool.netlify.app` responde 404**: todavía no hay despliegue publicado (acción externa 5b).
- Sin eso no se pueden ejecutar las 9 pruebas de integración (`I1_contrato_qa.xml`, PR-05) ni los 48 E2E (PR-06), y tampoco se puede obtener `E2E_ESTUDIANTE_VINCULADO_ID`. `QA_PASSWORD` sigue pendiente de entrega por canal privado (acción externa 7).
- `E2E_BE07=false` queda confirmado por el `openapi.json` de QA: `/padres/me/hijos` no existe allí, así que el respaldo de D-WEB-02 sigue en uso.

## 10. Cierre del 03/11/2026 · SonarQube y corrida completa

### 10.1 Arreglos de SonarQube (D-WEB-14)

| Issue de Sonar | Arreglo | Prueba |
|---|---|---|
| `Prefer Number.NaN over NaN` (`hijoActivo.ts:28`) | `Number.NaN`. De la misma regla: `isNaN`/`parseInt`/`parseFloat` → `Number.*` en `auth/actions.ts` y `NotasClient.tsx`, con radio 10 | `tests/hijoActivo.test.ts` (ya existía) |
| Regex con backtracking super-lineal (`proxy/route.ts:16`) | `quitarBarrasFinales()`, que recorre desde el final | `tests/apiBase.test.ts`, incluida una entrada de 50 000 barras bajo 100 ms |
| `'' ?? fallback` dejaba pasar la cadena vacía y `new URL('')` rompía el build en Netlify | `apiBase()` trata vacío y espacios como no definido; un valor sin protocolo lanza un error que nombra `NEXT_PUBLIC_API_URL` | `tests/apiBase.test.ts` (`''`, `'   '`, `undefined`, `'sin-protocolo'`) |
| 7 promesas sin esperar (`useNotas`, `useUsuarios`, `useReportes`, `useAsistencia`, `useHorarios`, `EscanearClient` ×2) | `void`, porque las seis funciones de carga atrapan sus errores y los dejan en `error` | `tests/hooks/cargaInicial.test.tsx`, 15 casos, con el caso de fallo de cada hook |

Las dos funciones del proxy viven en `src/lib/utils/apiBase.ts`: un `route.ts` solo debe exportar métodos HTTP.

### 10.2 Cobertura en código nuevo (D-WEB-13)

Primero pruebas, después exclusiones:

| Área | Antes | Ahora |
|---|---|---|
| `src/lib` | 85,5 % | **87,8 %** |
| `src/services` | 68,8 % | 68,8 % |
| `src/hooks` | 0,4 % | **32,6 %** |
| Total de líneas | 37,5 % | **53,1 %** |

`sonar.coverage.exclusions` deja fuera del **cálculo** de cobertura las vistas que D-WEB-05 asigna a los E2E (`page`, `layout`, `loading`, `error`, `not-found`, componentes de pantalla uno por uno, `src/types/**`, `proxy.ts`). Siguen dentro `src/hooks`, `src/lib`, `src/services`, `src/app/api/**` y los componentes con prueba propia (`PasswordChecklist`, `SelectorHijo`, `RegistroMasivo`, `FallidosMasivo`). Ningún umbral de Vitest bajó y ningún issue se marcó como falso positivo.

### 10.3 Corrida completa (commit `b991e88`)

| Nivel | Resultado |
|---|---|
| 1 · tipos | 0 errores |
| 2 · lint | 0 errores y 0 advertencias en 193 archivos |
| 3 · unitarias y componentes | **274 pruebas en 32 archivos**, todas pasan |
| 4 · cobertura | `src/lib` 87,8 % · `src/services` 68,8 % (umbrales 80/60) |
| 5 · trazabilidad | 283 pruebas mapeadas (126 UT, 136 extra, 21 IT) |
| 6 · integración | **9 ejecutadas, ninguna omitida**: 1 pasa, 8 bloqueadas por DEF-WEB-01 |
| 7 · E2E | Humo de `login-roles` en Chromium: 8 casos, bloqueados por lo mismo. Los 48 quedan pendientes |
| 8 · build | compila |
| 9 · dependencias | 0 vulnerabilidades |
| 10 · secretos | gitleaks en 75 commits: los 4 hallazgos históricos de Supabase, nada nuevo |
| 11 · manuales | pendientes (Mariana) |

Resumen con todas las cifras: `evidencias/RESUMEN-web.md`.

### 10.4 Lo que bloquea el cierre

**DEF-WEB-01 (backend, alta):** la API de QA no puede consultar su base. `POST /auth/login` responde 500 incluso con un correo inexistente (debería ser 401), mientras un cuerpo inválido sí responde 422: la aplicación está sana y lo que falla es la base. Con eso resuelto, los niveles 6 y 7 se corren de una pasada, porque `.env.test.local` está completo y los navegadores están instalados.

Lo que sí quedó verificado: el deploy preview del PR #34 responde 200, el modal de inicio de sesión y los selectores de los E2E funcionan (el humo llena y envía el formulario), la autenticación de la API responde 401 sin token y el contrato cubre 43 de 44 rutas.

### 10.5 Quality Gate en verde (commit `8ce9da3`)

| Análisis | Cobertura nueva | Reliability | Gate |
|---|---|---|---|
| Antes de la jornada | 60,6 % | C | Falla |
| `8abe760` · arreglos de D-WEB-14 | 64,4 % | **A** | Falla (solo cobertura) |
| `8ce9da3` · `lcov` corregido + pruebas nuevas | **86,2 %** | A | **Passed** |

La causa principal de la cobertura baja no eran las exclusiones: `coverage.include` de Vitest dejaba fuera del informe `lcov` archivos que **sí** tienen pruebas (el proxy con sus 17 casos, `PasswordChecklist`, `SelectorHijo`, `RegistroMasivo`, `FallidosMasivo` y los dos `*ViewerClient`), y SonarQube los contaba con 0 %: 107 de las 158 líneas nuevas descubiertas eran código ya probado. Se pasó a medir todo `src` y se escribieron las pruebas que faltaban en los dos archivos con más líneas nuevas sin cubrir (`tests/register.test.ts`, 19 casos; `tests/asociadoViewer.test.ts`, 9).

Cifras finales: 368 líneas nuevas por cubrir con 32 sin cubrir, 0 issues nuevos, 0 vulnerabilidades, 0 *security hotspots*, 0,0 % de duplicación, y Reliability, Security y Maintainability en **A**. El CI del PR #34 («Lint, tipos, pruebas y build» y «SonarCloud Code Analysis») quedó verde. Resumen en `evidencias/PR-03/web/sonar-resumen.md`.

Con eso, de la definición de terminado quedan dos cosas, y ninguna es del frontend: **DEF-WEB-01** (la base de QA) para correr los niveles 6 y 7, y las pruebas manuales del nivel 11.
