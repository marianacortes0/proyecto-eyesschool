# Planeación de correcciones — Frontend Web (Next.js) · Eyes School

> **Tipo de documento:** planeación de QA. No contiene el código de las correcciones: define qué cambiar, dónde, con qué diseño para que quede testeable y qué pruebas lo demuestran.
> **Pensado para:** cualquier desarrollador o una IA que no conoce el proyecto. Todas las rutas y números de línea se verificaron contra el código el 28/10/2026.
> **Elaboró:** Mariana Cortés (QA) · **Revisa:** Samuel Sierra (líder de pruebas) · **Aprueba:** Sergio Gómez (PO)
> **Plazo:** sprints S7 (29 oct – 6 nov 2026) y S8 (7 – 14 nov 2026). Liberación `v1.1.0` el 14 nov 2026.

---

## 1. Contexto técnico

| Dato | Valor |
|---|---|
| Repositorio | `github.com/marianacortes0/proyecto-eyesschool` |
| Rama base | `chore/calidad-seguridad` (25 oct 2026). `main` es del 18 jun 2026 y está desactualizada |
| Stack | Next.js 16 (App Router), React 19.2, TypeScript, Tailwind CSS, React-Toastify |
| API | API FastAPI de Eyes School en `NEXT_PUBLIC_API_URL` (por defecto `http://localhost:8000/api/v1`) |
| Sesión | Cookies `eys_access` (token, 30 min), `eys_refresh` (7 días) y `eys_user` (JSON con id, rol y nombre, 7 días), creadas en `src/auth/actions.ts` → `setAuthCookies` |
| Protección de rutas | `middleware.ts` (raíz) → `updateSession` de `src/services/supabase/middleware.ts` |
| Despliegue | Producción en **Vercel** (`proyecto-eyesschool.vercel.app`), decisión del PO del 30/10/2026. Hoy también existe `.github/workflows/main_eyesschool.yml`, que despliega a una Azure Web App «EyesSchool»; se elimina en WEB-INF-4 |
| CI | GitHub Actions `.github/workflows/ci.yml`: ESLint, `tsc`, Vitest, build y `npm audit` |

### 1.1 Arquitectura por capas (obligatoria)

| Capa | Carpeta | Qué va ahí |
|---|---|---|
| Página de servidor | `src/app/(dashboard)/<módulo>/page.tsx` | Lee usuario y rol, carga datos iniciales y elige la vista: por ejemplo `NovedadesClient` para admin/docente y `NovedadesViewerClient` para padre/estudiante |
| Vista | `src/app/(dashboard)/<módulo>/*Client.tsx`, `src/components/` | Interfaz, sin `fetch` |
| Lógica de vista | `src/hooks/use<Módulo>.ts` (17 hooks) | Estado y coordinación |
| Servicios | `src/services/<módulo>/*Actions.ts` (Server Actions `'use server'`) y `*Service.ts` | Llamadas a la API. `src/services/asociado/asociadoActions.ts` concentra lo que ven padre y estudiante |
| Cliente HTTP | `src/services/api/client.ts` | `apiFetch`, `toCamel`, `errorMessage`, `getClientToken` |
| Reglas puras | `src/lib/utils/permissions.ts`, `password.ts`; `src/lib/auth/server.ts` | Permisos por rol, política de contraseña, usuario del servidor |

### 1.2 Cómo se prueba hoy

- Vitest con `environment: 'node'` e `include: ['tests/**/*.test.ts']` (`vitest.config.ts`). Hay 28 pruebas en 4 archivos (`permissions`, `apiClient`, `routeGuard`, `password`) y todas pasan (verificado el 28/10/2026). `tsc` no reporta errores y ESLint da 0 errores y 28 advertencias.
- `fetch` se simula con `vi.stubGlobal`. No hay pruebas de hooks ni de componentes, ni medición de cobertura, ni pruebas de punta a punta (E2E).

```bash
npm ci
npx vitest run
npx tsc --noEmit
npx eslint .
```

### 1.3 Patrón para que cada corrección quede testeable

1. La decisión se saca a una función pura (`src/lib/utils/` o exportada desde el servicio): recibe datos y devuelve un resultado.
2. Las Server Actions reciben el token por parámetro mediante un helper común (WEB-INF-1). Así se prueban simulando solo `fetch`.
3. Los hooks y componentes se prueban con Testing Library en `jsdom`.
4. Los flujos completos se prueban con Playwright contra QA.

---

## 2. Resumen de hallazgos

| ID | Severidad | Hallazgo | Sprint | Responsable | Antes |
|---|---|---|---|---|---|
| WEB-01 | Alta | La sesión no se renueva: a los 30 min las llamadas fallan, y solo `/admin` y `/general` están protegidas por el middleware | S7 | Mariana Cortés | nuevo |
| WEB-02 | Alta | El token de acceso se puede leer desde JavaScript, ninguna cookie es `secure` y el rol sale de una cookie sin firma | S8 | Mariana Cortés | nuevo |
| WEB-03 | Alta | La web solo conoce un hijo por padre | S8 | Mariana Cortés | COR-07 |
| WEB-04 | Media | El docente ve una acción (borrar asistencia) que la API le niega | S7 | Mariana Cortés | COR-08 |
| WEB-05 | Alta | Restablecer la contraseña no aplica la política completa | S7 | Mariana Cortés | COR-09 |
| WEB-06 | Media | El registro masivo no dice qué estudiantes fallaron ni deja reintentar | S8 | Mariana Cortés | COR-11 |
| WEB-08 | Baja | Código heredado de Supabase y 28 advertencias de ESLint | S8 | Mariana Cortés | nuevo |
| WEB-09 | Media | El padre no puede descargar el boletín y la vista de notas no muestra los mensajes de los CA | S8 | Mariana Cortés | nuevo (H-02, H-03 y H-04 del PR-02) |
| WEB-INF-1 | Alta | Entorno para probar hooks y componentes + helper de API con token por parámetro | S7 | Mariana Cortés | — |
| WEB-INF-2 | Alta | Cobertura | S7 | Mariana Cortés | — |
| WEB-INF-3 | Media | Pruebas E2E con Playwright | S7–S8 | Samuel Sierra | — |
| WEB-INF-4 | Alta | SonarQube Cloud, `gitleaks` y un solo despliegue | S7 | Samuel Sierra | COR-14 |

**Comportamiento por diseño (no es defecto):** el formulario de registro permite que cualquier persona se registre como padre o acudiente y quede vinculada al estudiante que indique (`src/auth/actions.ts`, líneas 191–210). Es el objetivo del registro (decisión del PO del 30/10/2026). Antes figuraba como WEB-07 y se retiró. Se prueba como funcionalidad: el registro de padre crea la cuenta y el padre ve los datos de su hijo vinculado.

**Dependencias del backend que la web debe verificar (no hay que cambiar código de la web):**
- **BE-03:** hoy el inicio de estudiante y padre falla con 500 en `GET /dashboard/estudiante`, que la web llama en `src/services/dashboard/dashboardService.ts`, líneas 182 y 241. Cuando el backend lo corrija, verificar que el inicio carga.
- **BE-06:** la API rechazará notas mayores a 5.0. `NotasClient.tsx` (línea 443) ya valida 0.0–5.0; solo hay que confirmar que muestra bien el 422 si llega.
- **BE-09:** la API exigirá la política de contraseña; la web ya la aplica en el registro.
- **BE-18:** al registrar una novedad desde la web, la API enviará la notificación al acudiente. No requiere cambios en la web; se verifica en el escenario E2E de novedades junto con la app.
- **BE-10:** la API ignorará `registrado_por`. Se puede quitar del cuerpo en `asistenciaActions.ts` y en los servicios de notas y novedades sin romper nada.

---

## 3. Correcciones

### WEB-01 · Sesión sin renovación y rutas sin proteger — Alta

**Evidencia.**
- `middleware.ts` (raíz) importa `updateSession` de `src/services/supabase/middleware.ts`. Ese archivo **no renueva el token** (no contiene la palabra `refresh`) y solo protege `PROTECTED_ROUTES = ['/admin', '/general']` (línea 4).
- Existe una versión mejor, `src/lib/auth/sessionMiddleware.ts`, que renueva el acceso con `POST /auth/refresh` (líneas 36–79). **Ningún archivo la importa** y `tests/routeGuard.test.ts` prueba la versión vieja.
- `eys_access` vence a los 30 min y `eys_user` a los 7 días (`src/auth/actions.ts`, líneas 27–48). Después de 30 minutos, las páginas leen `eys_user` y se creen con sesión, pero cada llamada a la API responde 401.
- Rutas como `/usuarios`, `/reportes`, `/notas`, `/asistencia`, `/novedades`, `/qr`, `/horarios` y `/perfil` dependen de que cada `page.tsx` revise el usuario por su cuenta.

**Diseño:**
- `middleware.ts` pasa a usar `src/lib/auth/sessionMiddleware.ts`. Borrar `src/services/supabase/` (WEB-08).
- Ampliar la protección a todo el panel. Usar un mapa único de ruta → roles en `src/lib/auth/routeRoles.ts`, consumido por el middleware y por `PanelSidebar`:
  - `/admin`, `/usuarios`, `/reportes`: admin.
  - `/notas`, `/asistencia`, `/novedades`, `/horarios`, `/perfil`, `/general`: todos los roles autenticados.
  - `/qr/escanear`: admin y docente.
- Si la renovación falla: borrar las tres cookies y redirigir a `/?login=1`.
- **Inactividad (decisión del PO del 30/10/2026, CA-US017.5):** la sesión se cierra tras 30 minutos sin actividad. El middleware guarda la hora de la última petición en una cookie `eys_last` (`httpOnly`). Si pasaron más de 30 minutos, no renueva: borra las cookies y redirige a `/?login=1`. La hora llega como parámetro (`ahora`) para que la prueba la controle.
- Next.js 16 renombra `middleware.ts` a `proxy.ts`. Hacer la migración con el codemod oficial dentro de esta misma tarea y confirmar el comportamiento con las pruebas.

**Por qué queda testeable:** el mapa de rutas es un objeto puro y el middleware es una función que recibe un `NextRequest`, que ya se prueba así en `tests/routeGuard.test.ts`.

| Prueba (`tests/routeGuard.test.ts`, contra el módulo nuevo) | Entrada | Resultado esperado |
|---|---|---|
| Acceso vencido y refresco válido | Cookie `eys_access` vencida, `eys_refresh` válida, `fetch` simulado responde 200 | Pide `/auth/refresh` y responde con la cookie `eys_access` nueva |
| Refresco inválido | `fetch` responde 401 | Redirige a `/?login=1` y borra las cookies |
| Sin cookies | — | Redirige a `/?login=1` |
| Padre entra a `/usuarios` | Token con rol padre | Redirige a `/general` |
| Docente entra a `/qr/escanear` | Token con rol docente | Deja pasar |
| Inactividad | `eys_last` de hace 31 min y refresco válido | No pide `/auth/refresh`; redirige a `/?login=1` y borra las cookies |
| Actividad reciente | `eys_last` de hace 10 min y acceso vencido | Renueva y actualiza `eys_last` |
| Mapa único | `routeRoles` contra los enlaces de `PanelSidebar` | Ningún enlace visible para un rol que la ruta no permite |

**Aceptado cuando:** pasan las pruebas, no queda ningún archivo que importe `src/services/supabase/` y, en QA, una sesión abierta 40 minutos sigue funcionando.

---

### WEB-02 · Cookies de sesión — Alta

**Evidencia.** En `src/auth/actions.ts`, `setAuthCookies`:
- `eys_access` tiene `httpOnly: false` (línea 31): cualquier script de la página puede leer el token.
- `eys_user` también es `httpOnly: false` (línea 48).
- Ninguna cookie usa `secure: true`.
- `src/lib/auth/server.ts` (`getServerUser`) toma el rol de `eys_user`, un JSON sin firma que el usuario puede editar. La API sigue validando, pero la web mostraría pantallas de otro rol.
- Tres servicios leen el token desde el navegador con `getClientToken`/`apiFetchClient`: `src/services/dashboard/dashboardService.ts`, `src/services/notas/notasService.ts` y `src/services/reportes/reportesService.ts`.

**Diseño:**
- Pasar las llamadas de esos tres servicios a Server Actions, o a un route handler `src/app/api/proxy/[...path]/route.ts` que agregue el token desde la cookie en el servidor. Después: `eys_access` con `httpOnly: true`, y eliminar `getClientToken`.
- Todas las cookies con `secure: process.env.NODE_ENV === 'production'` y `sameSite: 'lax'`.
- El rol de las páginas sale del token (`eys_access`, el mismo que valida la API) con una función `decodeRol(token)` en `src/lib/auth/`. `eys_user` queda solo para mostrar el nombre.

| Prueba | Archivo | Resultado esperado |
|---|---|---|
| Opciones de cookies | `tests/authCookies.test.ts` (simula `next/headers` y captura `set`) | `eys_access` y `eys_refresh` con `httpOnly: true`; todas con `secure` en producción |
| Rol desde el token | `tests/decodeRol.test.ts` | Token con rol padre → `padre`, aunque `eys_user` diga `admin` |
| Sin token en el navegador | `tests/apiClient.test.ts` | `getClientToken` ya no existe; los tres servicios llaman al servidor |

**Riesgo:** toca tres servicios usados en el inicio, notas y reportes. Va en S8, después de WEB-INF-3, para validarlo con E2E.

---

### WEB-03 · Un solo hijo por padre — Alta (depende de BE-07)

**Evidencia.**
- `resolveAsociado()` (`src/services/asociado/asociadoActions.ts`, línea 74) y `resolveAsociadoConCurso()` (línea 213) obtienen el estudiante del padre con `GET /dashboard/padre`, que devuelve un solo `idEstudiante`. Los usan las páginas de notas, novedades y horario del padre.
- `dashboardService.ts` (líneas 199 y 258) hace lo mismo para el inicio.

**Diseño:**
- `getHijosAction()` en `asociadoActions.ts` → `GET /padres/me/hijos` (BE-07). Devuelve `Hijo[]` con `idEstudiante`, `nombre`, `documento`, `parentesco` e `idCursoActual`.
- Función pura `elegirHijoActivo(hijos, idSolicitado)` en `src/lib/utils/hijoActivo.ts`: devuelve el hijo pedido, o el primero, o `null` si no hay.
- `resolveAsociado` y `resolveAsociadoConCurso` reciben `idEstudiante?` y usan las dos anteriores. Las páginas leen `?hijo=<id>` de la URL.
- `dashboardService` envía `?id_estudiante=` a `/dashboard/padre`.
- Componente `SelectorHijo` (`src/components/asociado/`), visible solo con dos hijos o más, que cambia `?hijo=`.

| Prueba | Archivo | Resultado esperado |
|---|---|---|
| Elige el pedido | `tests/hijoActivo.test.ts` | Hijos [10, 11], id 11 → 11 |
| Id ajeno o sin id | idem | → 10 |
| Sin hijos | idem | `null`, y la página muestra «No hay estudiantes vinculados» |
| Server Action | `tests/asociadoActions.test.ts` | Con `fetch` simulado llama `/padres/me/hijos` y luego `/estudiantes/11/notas` |
| Selector | `tests/components/SelectorHijo.test.tsx` | 1 hijo: no se ve; 2 hijos: al elegir el segundo cambia `?hijo=` |
| E2E | `e2e/padre-dos-hijos.spec.ts` | El padre de prueba cambia de hijo y cambian notas, asistencia y novedades |

**Aceptado cuando:** pasan las pruebas y un padre con un solo hijo ve exactamente lo mismo que hoy.

---

### WEB-04 · Permisos de la web distintos a los de la API — Media

**Evidencia.** `src/lib/utils/permissions.ts`, línea 30: el docente tiene `asistencia: ['create', 'read', 'update', 'delete']`, pero `DELETE /api/v1/asistencia/{id}` solo permite `admin`. El docente ve un botón que siempre falla con 403.

**Diseño:**
- Quitar `'delete'` de `asistencia` para el docente.
- Crear `tests/fixtures/apiRoles.ts` con la tabla de roles que permite la API por recurso y acción. Sale de `require_roles(...)` en `app/api/v1/*.py` del backend.
- Una prueba compara `PERMISSIONS` contra esa tabla: ninguna acción visible en la web que la API rechace.

| Prueba (`tests/permissions.test.ts`) | Resultado esperado |
|---|---|
| `can('docente','delete','asistencia')` | `false` |
| `can('admin','delete','asistencia')` | `true` |
| `PERMISSIONS` contra `apiRoles` | 0 diferencias |

---

### WEB-05 · Restablecer contraseña sin la política completa — Alta

**Evidencia.** `resetPassword` (`src/auth/actions.ts`, líneas 140–149) solo comprueba `password.length < 8`. El registro del mismo archivo sí usa `isPasswordValid`. Tras BE-09, la API rechazará lo mismo con 422, pero el usuario debe ver el motivo antes de enviar.

**Diseño:**
- Reemplazar la comprobación por `isPasswordValid(password)` y armar el mensaje con `passwordChecks` (las reglas que faltan).
- `src/app/(auth)/reset-password/page.tsx` muestra las reglas en vivo, igual que el registro.

| Prueba (`tests/resetPassword.test.ts`, `fetch` simulado) | Resultado esperado |
|---|---|
| `Colegio2026` | `{ error }` y no llama a la API |
| `Colegio#2026` + confirmación igual | Llama `POST /auth/reset-password` y devuelve `{ success }` |
| Confirmación distinta | `{ error: 'Las contraseñas no coinciden.' }` |
| Sin token | `{ error }` de enlace inválido |
| La API responde 401 (enlace ya usado, BE-13) | `{ error }` con el mensaje de la API |

---

### WEB-06 · Registro masivo sin detalle de fallos — Media (mejor con BE-08)

**Evidencia.**
- `crearRegistrosMasivoAction` (`src/services/asistencia/asistenciaActions.ts`, líneas 81–112) hace un `POST /asistencia` por estudiante con `Promise.allSettled` y devuelve `{ ok, fail, errores }`: solo cuenta y textos, sin decir de quién (tipo `RegistroMasivoResult`, línea 74).
- `src/components/qr/RegistroMasivo.tsx` muestra «N no se pudieron registrar (¿ya marcados hoy?)», sin lista ni reintento.

**Diseño:**
- Resultado nuevo: `{ guardados: number[], duplicados: number[], fallidos: { idEstudiante, motivo }[] }`.
- Función pura `clasificarResultados(items, resultados)` exportada desde el servicio. Con BE-08, un 409 va a `duplicados` y cualquier otro error a `fallidos`. Para distinguir el 409, `apiFetch` debe lanzar un error con `status`.
- `RegistroMasivo.tsx` lista los fallidos por nombre con Reintentar (reenvía solo esos) y Descartar.

| Prueba | Archivo | Resultado esperado |
|---|---|---|
| Clasificación | `tests/registroMasivo.test.ts` | 2 éxitos, un 409 y un 500 → 2 guardados, 1 duplicado, 1 fallido |
| Reintento | idem | Reintentar envía solo el fallido |
| Vista | `tests/components/RegistroMasivo.test.tsx` | Aparecen el nombre del fallido y los dos botones |
| E2E | `e2e/registro-masivo.spec.ts` | La segunda vez con el mismo curso, todos salen «ya registrado» |

---

### WEB-09 · Boletín y mensajes en la vista de notas del padre — Media (decisión del PO del 30/10/2026)

**Evidencia.**
- `src/app/(dashboard)/notas/page.tsx` envía al padre y al estudiante a `NotasViewerClient.tsx`, que no tiene opción de boletín. `downloadBoletinPdf` (`src/services/notas/notasService.ts`, línea 123) solo se usa en `NotasClient.tsx`, la vista del docente. La API sí permite el rol padre (H-02).
- Con un periodo sin notas, `NotasViewerClient.tsx` (línea 131) muestra «Aún no hay notas registradas.» o «No hay notas con los filtros seleccionados.». CA-US011.3 exige «No hay notas registradas para este periodo.» (H-04).
- Cuando BE-19 responda 404, la web debe mostrar «No hay datos disponibles para generar el boletín.» (H-03).

**Diseño:**
- Botón «Descargar boletín» en `NotasViewerClient.tsx`, visible para padre y estudiante, que llama `downloadBoletinPdf(idEstudiante)` del estudiante asociado (o del hijo activo cuando exista WEB-03).
- `downloadBoletinPdf` lanza un error con el `detail` de la API si la respuesta no es 200; la vista lo muestra con `notifyError`.
- Constante `MSG_SIN_NOTAS_PERIODO = 'No hay notas registradas para este periodo.'` en `notasService.ts`, usada cuando el periodo elegido no tiene notas.

| Prueba | Archivo | Resultado esperado |
|---|---|---|
| Botón visible | `tests/components/NotasViewerClient.test.tsx` | Con rol padre aparece «Descargar boletín» y llama `downloadBoletinPdf` con el id del hijo |
| Sin notas en el periodo | idem | Muestra el texto exacto del CA |
| Boletín sin datos | `tests/notasService.test.ts` (`fetch` simulado con 404) | Lanza error con «No hay datos disponibles para generar el boletín.» |
| E2E | `e2e/boletin-padre.spec.ts` | El padre descarga un PDF |

---

### WEB-08 · Código heredado y advertencias — Baja

- Borrar `src/services/supabase/` después de WEB-01 y quitar cualquier dependencia `@supabase/*` que quede.
- Corregir las 28 advertencias de ESLint y activar `--max-warnings=0` en el CI.
- No hay pruebas nuevas; el criterio es `npx eslint . --max-warnings=0` en verde.

---

## 4. Infraestructura de pruebas

### WEB-INF-1 · Hooks, componentes y helper de API (S7, primero)

- Dependencias de desarrollo: `jsdom`, `@testing-library/react`, `@testing-library/dom`.
- `vitest.config.ts`:
  - `include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx']`.
  - `environmentMatchGlobs: [['tests/**/*.test.tsx', 'jsdom']]`.
  - `setupFiles: ['tests/setup/nextMocks.ts']`.
- `tests/setup/nextMocks.ts`: dobles de `next/headers` (cookies falsas) y `next/navigation` (`redirect`, `useRouter`, `useSearchParams`).
- Helper `src/services/api/serverFetch.ts` con `serverFetch(path, { token, ...init })`. Reemplaza las copias de `apiFetch` con `cookies()` en `novedadesActions.ts`, `asociadoActions.ts` y `asistenciaActions.ts`; se migran cuando se toca cada archivo. Lanza un error con `status` y `detail`.
- Prueba de humo: `tests/hooks/usePermissions.test.tsx` con `renderHook`.

### WEB-INF-2 · Cobertura (S7)

- `@vitest/coverage-v8`. En la configuración: `coverage: { provider: 'v8', reporter: ['text', 'lcov'], include: ['src/lib/**', 'src/services/**', 'src/hooks/**'] }`.
- Script `"test:cov": "vitest run --coverage"`, que reemplaza a `vitest run` en el CI.
- Medir la línea base en S7. Ninguna corrección la puede bajar. Las vistas (`*Client.tsx`) se cubren con E2E.

### WEB-INF-3 · E2E con Playwright (S7 montaje, S8 escenarios)

- `@playwright/test`, carpeta `e2e/` y `playwright.config.ts` con `baseURL = process.env.E2E_BASE_URL` (la URL de QA).
- Usuarios por rol desde variables (`E2E_ADMIN_EMAIL`, `E2E_DOCENTE_EMAIL`, `E2E_ESTUDIANTE_EMAIL`, `E2E_PADRE_EMAIL`, `E2E_PASSWORD`) con la contraseña de QA de BE-INF-2. Nunca escritos en el código.
- Escenarios mínimos:
  - Inicio de sesión de cada rol, con su inicio cargado (verifica BE-03).
  - Sesión de 40 min sin perderse (WEB-01).
  - Padre con dos hijos (WEB-03).
  - Registro masivo duplicado (WEB-06).
  - Registro de padre que ve los datos de su hijo vinculado (comportamiento por diseño).
- Corren contra QA después de cada despliegue; el resultado va al PR-06.

### WEB-INF-4 · SonarQube Cloud, secretos y un solo despliegue (S7)

- `ci.yml`: `npm run test:cov`, paso `SonarSource/sonarqube-scan-action` con secreto `SONAR_TOKEN` y `gitleaks/gitleaks-action`.
- `sonar-project.properties`:
  - `sonar.sources=src`
  - `sonar.tests=tests`
  - `sonar.javascript.lcov.reportPaths=coverage/lcov.info`
  - `sonar.exclusions=src/app/home/**,src/components/home/**` (páginas informativas)
- **Un solo despliegue (decisión del PO del 30/10/2026: Vercel):** borrar `.github/workflows/main_eyesschool.yml` y detener la Azure Web App «EyesSchool», para no tener dos versiones en línea con distinta configuración. En Vercel, revisar que `NEXT_PUBLIC_API_URL` apunte a la API de Azure y que la vista previa de `develop` apunte a la API de QA.

---

## 5. Reglas de código testeable para la web

1. **Las vistas no llaman a la API.** Ningún `*Client.tsx` ni componente usa `fetch`.
2. **Una sola forma de llamar a la API:** `serverFetch` con el token por parámetro.
3. **Ningún token en el navegador:** las llamadas con token pasan por el servidor (WEB-02).
4. **El rol sale del token, no de `eys_user`.**
5. **Reglas en funciones puras:** permisos, rutas por rol, contraseña, hijo activo, clasificación de resultados.
6. **Hooks delgados:** coordinan estado; no arman URLs ni interpretan códigos HTTP.
7. **Cada servicio o hook nuevo tiene tres pruebas:** con datos, con lista vacía y con error (mensaje para el usuario).
8. **Permisos de la web = roles de la API.** La prueba de contrato de WEB-04 lo vigila.
9. **Nombres de prueba que cuentan el escenario:** `it('no llama a la API si la contraseña no tiene carácter especial')`.

## 6. Definición de terminado

- [ ] La prueba que demuestra el defecto se escribió primero y fallaba antes del cambio.
- [ ] `npx eslint . --max-warnings=0` y `npx tsc --noEmit` sin errores.
- [ ] `npm run test:cov` en verde y la cobertura de `src/lib`, `src/services` y `src/hooks` no baja.
- [ ] `npm audit` sin vulnerabilidades críticas ni altas, `gitleaks` limpio y Quality Gate de SonarQube aprobado.
- [ ] Lighthouse Accessibility ≥ 90 en las páginas tocadas (meta del MC-01).
- [ ] PR revisado por otro integrante, con `Corrige #<n>` del defecto en GitHub Issues (plantilla del PR).
- [ ] Desplegado en QA y E2E del escenario en verde.

## 7. Ramas y calendario

- Primer día de S7: merge de `chore/calidad-seguridad` a `develop`.
- Ramas desde `develop`: `fix/WEB-xx-descripcion-corta`, `chore/WEB-INF-x-...`.
- Commits: `test(auth): reset rechaza contraseña sin carácter especial (WEB-05)` y luego `fix(auth): aplica la política completa al restablecer (WEB-05)`.
- Se libera junto con la API y la app como `v1.1.0` el 14 nov 2026.

| Sprint | Fechas | Trabajo |
|---|---|---|
| S7 | 29 oct – 1 nov | WEB-INF-1, WEB-INF-2, WEB-INF-4 |
| S7 | 2 – 6 nov | WEB-01, WEB-04, WEB-05, montaje de WEB-INF-3 |
| S8 | 7 – 11 nov | WEB-03 (cuando BE-07 esté en `develop`), WEB-06, WEB-09 |
| S8 | 11 – 14 nov | WEB-02, WEB-08, escenarios E2E, liberación |

**Riesgo de carga:** Mariana Cortés tiene la web completa y dos tareas de la app. Si S8 se aprieta, WEB-08 y WEB-02 (en ese orden) son las primeras en pasar a la siguiente versión, con el PO de acuerdo. WEB-02 queda registrada como riesgo aceptado en el PR-09.

## 8. Decisiones del PO

**Tomadas el 30/10/2026:** producción web en Vercel; API en Azure; base PostgreSQL en Render; Redis se elimina del sistema (no cambia nada en la web: la sesión sigue con `/auth/refresh` y `/auth/logout`); registro público de padres por diseño; cierre de sesión tras 30 minutos sin actividad (WEB-01); boletín y mensajes del padre (WEB-09); reportes de asistencia solo con registro y descarga en esta versión (US016, la generación automática se difiere).

**Pendiente:**

| # | Pregunta | Recomendación QA |
|---|---|---|
| D-W1 | ¿WEB-02 entra en esta versión o queda como riesgo aceptado? | Entra si WEB-INF-3 está listo a tiempo |
