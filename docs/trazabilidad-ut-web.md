# Trazabilidad de pruebas — Frontend web

> Generado con `node scripts/trazabilidad.mjs` (no editar a mano). Mapeo en `tests/trazabilidad.json`.
> Fecha de generación: 2026-11-18

## Resumen

| Grupo | Resultado |
|---|---|
| UT-WEB-01 a 12 (planeadas, PR-04; 09 a 12 desde WC-08) | 130 de 130 pasan |
| UT-WEB-EXTRA (no planeadas) | 291 de 291 pasan |
| IT-WEB-01 a 05 (contrato, PR-05) | 14 de 24 pasan · «Omitida» = necesita `QA_API_URL` |
| Casos de sistema E2E (PR-06) | 202 de 236 pasan · JUnit: `evidencias/PR-06/web/E25_e2e-local.xml`, `evidencias/PR-06/web/E26_usuarios-firefox.xml`, `evidencias/PR-06/web/E27_qr-camara-jsqr.xml`, `evidencias/PR-06/web/E28_iconos.xml` |

## Pruebas unitarias y de componentes (PR-04)

| ID | Corrección | Archivo | Caso | Pasa |
|---|---|---|---|---|
| UT-WEB-01 | WEB-INF-1 · entorno | `tests/hooks/usePermissions.test.tsx` | UT-WEB-01 · usePermissions (WEB-04) admin: el hook devuelve lo mismo que PERMISSIONS para cada recurso y acción | Sí |
| UT-WEB-01 | WEB-INF-1 · entorno | `tests/hooks/usePermissions.test.tsx` | UT-WEB-01 · usePermissions (WEB-04) docente: el hook devuelve lo mismo que PERMISSIONS para cada recurso y acción | Sí |
| UT-WEB-01 | WEB-INF-1 · entorno | `tests/hooks/usePermissions.test.tsx` | UT-WEB-01 · usePermissions (WEB-04) estudiante: el hook devuelve lo mismo que PERMISSIONS para cada recurso y acción | Sí |
| UT-WEB-01 | WEB-INF-1 · entorno | `tests/hooks/usePermissions.test.tsx` | UT-WEB-01 · usePermissions (WEB-04) padre: el hook devuelve lo mismo que PERMISSIONS para cada recurso y acción | Sí |
| UT-WEB-01 | WEB-INF-1 · entorno | `tests/hooks/usePermissions.test.tsx` | UT-WEB-01 · usePermissions (WEB-04) docente no puede borrar asistencia | Sí |
| UT-WEB-01 | WEB-INF-1 · entorno | `tests/hooks/usePermissions.test.tsx` | UT-WEB-01 · usePermissions (WEB-04) docente puede crear asistencia | Sí |
| UT-WEB-01 | WEB-INF-1 · entorno | `tests/hooks/usePermissions.test.tsx` | UT-WEB-01 · usePermissions (WEB-04) padre no puede crear usuarios | Sí |
| UT-WEB-01 | WEB-INF-1 · entorno | `tests/hooks/usePermissions.test.tsx` | UT-WEB-01 · usePermissions (WEB-04) sin rol no puede nada | Sí |
| UT-WEB-02 | WEB-01 · sesión y rutas | `tests/routeGuard.test.ts` | guardia de rutas del panel las rutas públicas pasan sin sesión | Sí |
| UT-WEB-02 | WEB-01 · sesión y rutas | `tests/routeGuard.test.ts` | guardia de rutas del panel sin sesión /admin manda al login | Sí |
| UT-WEB-02 | WEB-01 · sesión y rutas | `tests/routeGuard.test.ts` | guardia de rutas del panel un token ilegible manda al login | Sí |
| UT-WEB-02 | WEB-01 · sesión y rutas | `tests/routeGuard.test.ts` | guardia de rutas del panel el administrador entra a /admin | Sí |
| UT-WEB-02 | WEB-01 · sesión y rutas | `tests/routeGuard.test.ts` | guardia de rutas del panel un docente que intenta /admin vuelve a su panel | Sí |
| UT-WEB-02 | WEB-01 · sesión y rutas | `tests/routeGuard.test.ts` | guardia de rutas del panel cualquier rol con sesión entra a /general | Sí |
| UT-WEB-02 | WEB-01 · sesión y rutas | `tests/routeGuard.test.ts` | guardia de rutas del panel un token vencido y sin refresh manda al login | Sí |
| UT-WEB-02 | WEB-01 · sesión y rutas | `tests/routeGuard.test.ts` | WEB-01 · renovación de la sesión con el acceso vencido y un refresco válido pide /auth/refresh y entrega la cookie eys_access nueva | Sí |
| UT-WEB-02 | WEB-01 · sesión y rutas | `tests/routeGuard.test.ts` | WEB-01 · renovación de la sesión con el refresco inválido (401) redirige a /?login=1 y borra las tres cookies | Sí |
| UT-WEB-02 | WEB-01 · sesión y rutas | `tests/routeGuard.test.ts` | WEB-01 · renovación de la sesión sin cookies redirige a /?login=1 | Sí |
| UT-WEB-02 | WEB-01 · sesión y rutas | `tests/routeGuard.test.ts` | WEB-01 · renovación de la sesión un padre que entra a /usuarios vuelve a /general | Sí |
| UT-WEB-02 | WEB-01 · sesión y rutas | `tests/routeGuard.test.ts` | WEB-01 · renovación de la sesión un docente puede entrar a /qr/escanear | Sí |
| UT-WEB-02 | WEB-01 · sesión y rutas | `tests/routeGuard.test.ts` | WEB-01 · renovación de la sesión un estudiante no entra a /qr/escanear | Sí |
| UT-WEB-02 | WEB-01 · sesión y rutas | `tests/routeGuard.test.ts` | WEB-01 · renovación de la sesión todas las rutas del panel están protegidas, no solo /admin y /general | Sí |
| UT-WEB-02 | WEB-01 · sesión y rutas | `tests/routeGuard.test.ts` | WEB-01 · renovación de la sesión con 31 minutos sin actividad no pide /auth/refresh: redirige y borra las cookies | Sí |
| UT-WEB-02 | WEB-01 · sesión y rutas | `tests/routeGuard.test.ts` | WEB-01 · renovación de la sesión con 10 minutos de actividad y el acceso vencido renueva y actualiza eys_last | Sí |
| UT-WEB-02 | WEB-01 · sesión y rutas | `tests/routeGuard.test.ts` | WEB-01 · renovación de la sesión eys_last es httpOnly para que ningún script pueda estirar la sesión | Sí |
| UT-WEB-02 | WEB-01 · sesión y rutas | `tests/routeGuard.test.ts` | WEB-01 · renovación de la sesión el refresco deja la cookie nueva también en la petición que ve la página | Sí |
| UT-WEB-02 | WEB-01 · sesión y rutas | `tests/routeGuard.test.ts` | WEB-01 · inactividad configurable (CP-SIS-065 a escala) sin variable o con un valor inválido la regla es de 30 minutos | Sí |
| UT-WEB-02 | WEB-01 · sesión y rutas | `tests/routeGuard.test.ts` | WEB-01 · inactividad configurable (CP-SIS-065 a escala) SESSION_IDLE_MINUTES=1 la reduce a 1 minuto | Sí |
| UT-WEB-02 | WEB-01 · sesión y rutas | `tests/routeRoles.test.ts` | mapa único de rutas por rol (WEB-01) /admin, /usuarios y /reportes son solo del administrador | Sí |
| UT-WEB-02 | WEB-01 · sesión y rutas | `tests/routeRoles.test.ts` | mapa único de rutas por rol (WEB-01) notas, asistencia, novedades, horarios, perfil y general admiten a todos los roles | Sí |
| UT-WEB-02 | WEB-01 · sesión y rutas | `tests/routeRoles.test.ts` | mapa único de rutas por rol (WEB-01) /qr/escanear es de administrador y docente | Sí |
| UT-WEB-02 | WEB-01 · sesión y rutas | `tests/routeRoles.test.ts` | mapa único de rutas por rol (WEB-01) docente puede entrar a /qr/escanear | Sí |
| UT-WEB-02 | WEB-01 · sesión y rutas | `tests/routeRoles.test.ts` | mapa único de rutas por rol (WEB-01) docente no puede entrar a /qr (Mi QR) | Sí |
| UT-WEB-02 | WEB-01 · sesión y rutas | `tests/routeRoles.test.ts` | mapa único de rutas por rol (WEB-01) estudiante no puede entrar a /qr/escanear | Sí |
| UT-WEB-02 | WEB-01 · sesión y rutas | `tests/routeRoles.test.ts` | mapa único de rutas por rol (WEB-01) el enlace de escanear aparece en el riel del docente y no en el del estudiante | Sí |
| UT-WEB-02 | WEB-01 · sesión y rutas | `tests/routeRoles.test.ts` | mapa único de rutas por rol (WEB-01) una subruta hereda la regla de su prefijo más largo | Sí |
| UT-WEB-02 | WEB-01 · sesión y rutas | `tests/routeRoles.test.ts` | mapa único de rutas por rol (WEB-01) una ruta fuera del mapa no está protegida | Sí |
| UT-WEB-02 | WEB-01 · sesión y rutas | `tests/routeRoles.test.ts` | mapa único de rutas por rol (WEB-01) ningún enlace del PanelSidebar es visible para un rol que la ruta no permite | Sí |
| UT-WEB-03 | WEB-02 · cookies | `tests/apiClient.test.ts` | toCamel convierte llaves anidadas y en listas, sin tocar los valores | Sí |
| UT-WEB-03 | WEB-02 · cookies | `tests/apiClient.test.ts` | toCamel deja intactos null y primitivos | Sí |
| UT-WEB-03 | WEB-02 · cookies | `tests/apiClient.test.ts` | apiFetch envía el token como Bearer y devuelve la respuesta en camelCase | Sí |
| UT-WEB-03 | WEB-02 · cookies | `tests/apiClient.test.ts` | apiFetch sin token no envía Authorization | Sí |
| UT-WEB-03 | WEB-02 · cookies | `tests/apiClient.test.ts` | apiFetch un 204 devuelve null | Sí |
| UT-WEB-03 | WEB-02 · cookies | `tests/apiClient.test.ts` | apiFetch un error usa el detail de FastAPI | Sí |
| UT-WEB-03 | WEB-02 · cookies | `tests/apiClient.test.ts` | apiFetch un 422 muestra el primer error de validación, no "[object Object]" | Sí |
| UT-WEB-03 | WEB-02 · cookies | `tests/apiClient.test.ts` | errorMessage cae al código HTTP cuando no hay detail utilizable | Sí |
| UT-WEB-03 | WEB-02 · cookies | `tests/apiClient.test.ts` | WEB-02 · sin token en el navegador getClientToken ya no existe | Sí |
| UT-WEB-03 | WEB-02 · cookies | `tests/apiClient.test.ts` | WEB-02 · sin token en el navegador en el navegador apiFetch llama al proxy del servidor y no manda Authorization | Sí |
| UT-WEB-03 | WEB-02 · cookies | `tests/apiClient.test.ts` | WEB-02 · sin token en el navegador el error 409 de la API llega como ApiError con status | Sí |
| UT-WEB-03 | WEB-02 · cookies | `tests/apiClient.test.ts` | WEB-02 · sin token en el navegador src/services/dashboard/dashboardService.ts no lee el token desde el navegador | Sí |
| UT-WEB-03 | WEB-02 · cookies | `tests/apiClient.test.ts` | WEB-02 · sin token en el navegador src/services/notas/notasService.ts no lee el token desde el navegador | Sí |
| UT-WEB-03 | WEB-02 · cookies | `tests/apiClient.test.ts` | WEB-02 · sin token en el navegador src/services/reportes/reportesService.ts no lee el token desde el navegador | Sí |
| UT-WEB-03 | WEB-02 · cookies y proxy | `tests/apiProxy.test.ts` | proxy /api/proxy (WEB-02: el token nunca viaja por JavaScript) agrega el Bearer desde la cookie httpOnly y reenvía la consulta | Sí |
| UT-WEB-03 | WEB-02 · cookies y proxy | `tests/apiProxy.test.ts` | proxy /api/proxy (WEB-02: el token nunca viaja por JavaScript) sin cookie de acceso responde 401 y no llama a la API | Sí |
| UT-WEB-03 | WEB-02 · cookies y proxy | `tests/apiProxy.test.ts` | proxy /api/proxy (WEB-02: el token nunca viaja por JavaScript) reenvía el cuerpo y el tipo de contenido de un POST | Sí |
| UT-WEB-03 | WEB-02 · cookies y proxy | `tests/apiProxy.test.ts` | proxy /api/proxy (WEB-02: el token nunca viaja por JavaScript) conserva el tipo y Content-Disposition de una descarga | Sí |
| UT-WEB-03 | WEB-02 · cookies y proxy | `tests/apiProxy.test.ts` | proxy /api/proxy (WEB-02: el token nunca viaja por JavaScript) un 404 de la API llega con su detail | Sí |
| UT-WEB-03 | WEB-02 · cookies y proxy | `tests/apiProxy.test.ts` | proxy /api/proxy (WEB-02: el token nunca viaja por JavaScript) no permite salir hacia otra ruta con .. | Sí |
| UT-WEB-03 | WEB-02 · cookies y proxy | `tests/apiProxy.test.ts` | proxy /api/proxy (WEB-02: el token nunca viaja por JavaScript) endurecimiento (D-WEB-03) rechaza una ruta que intenta salir de /api/v1 | Sí |
| UT-WEB-03 | WEB-02 · cookies y proxy | `tests/apiProxy.test.ts` | proxy /api/proxy (WEB-02: el token nunca viaja por JavaScript) endurecimiento (D-WEB-03) rechaza %2e%2e y %2f | Sí |
| UT-WEB-03 | WEB-02 · cookies y proxy | `tests/apiProxy.test.ts` | proxy /api/proxy (WEB-02: el token nunca viaja por JavaScript) endurecimiento (D-WEB-03) OPTIONS y TRACE → 405 | Sí |
| UT-WEB-03 | WEB-02 · cookies y proxy | `tests/apiProxy.test.ts` | proxy /api/proxy (WEB-02: el token nunca viaja por JavaScript) endurecimiento (D-WEB-03) cuerpo de 6 MB → 413 | Sí |
| UT-WEB-03 | WEB-02 · cookies y proxy | `tests/apiProxy.test.ts` | proxy /api/proxy (WEB-02: el token nunca viaja por JavaScript) endurecimiento (D-WEB-03) ignora un Authorization, una cookie y un host enviados por el navegador | Sí |
| UT-WEB-03 | WEB-02 · cookies y proxy | `tests/apiProxy.test.ts` | proxy /api/proxy (WEB-02: el token nunca viaja por JavaScript) endurecimiento (D-WEB-03) no devuelve set-cookie de la API | Sí |
| UT-WEB-03 | WEB-02 · cookies y proxy | `tests/apiProxy.test.ts` | proxy /api/proxy (WEB-02: el token nunca viaja por JavaScript) endurecimiento (D-WEB-03) POST con Origin ajeno → 403 | Sí |
| UT-WEB-03 | WEB-02 · cookies y proxy | `tests/apiProxy.test.ts` | proxy /api/proxy (WEB-02: el token nunca viaja por JavaScript) endurecimiento (D-WEB-03) POST con el Origin de la web pasa | Sí |
| UT-WEB-03 | WEB-02 · cookies y proxy | `tests/apiProxy.test.ts` | proxy /api/proxy (WEB-02: el token nunca viaja por JavaScript) endurecimiento (D-WEB-03) sin cookie no llama a fetch | Sí |
| UT-WEB-03 | WEB-02 · cookies y proxy | `tests/apiProxy.test.ts` | proxy /api/proxy (WEB-02: el token nunca viaja por JavaScript) endurecimiento (D-WEB-03) API caída → 502 con detail, sin stack | Sí |
| UT-WEB-03 | WEB-02 · cookies y proxy | `tests/apiProxy.test.ts` | proxy /api/proxy (WEB-02: el token nunca viaja por JavaScript) endurecimiento (D-WEB-03) el destino siempre queda bajo la API configurada | Sí |
| UT-WEB-03 | WEB-02 · cookies | `tests/authCookies.test.ts` | cookies de sesión (WEB-02) eys_access y eys_refresh son httpOnly | Sí |
| UT-WEB-03 | WEB-02 · cookies | `tests/authCookies.test.ts` | cookies de sesión (WEB-02) todas las cookies llevan secure en producción y sameSite lax | Sí |
| UT-WEB-03 | WEB-02 · cookies | `tests/authCookies.test.ts` | cookies de sesión (WEB-02) fuera de producción no exige secure (desarrollo en http://localhost) | Sí |
| UT-WEB-03 | WEB-02 · cookies | `tests/authCookies.test.ts` | cookies de sesión (WEB-02) el inicio de sesión abre la ventana de inactividad con eys_last httpOnly | Sí |
| UT-WEB-03 | WEB-02 · cookies | `tests/authCookies.test.ts` | cookies de sesión (WEB-02) eys_user guarda solo lo necesario para mostrar el nombre, sin token | Sí |
| UT-WEB-03 | WEB-02 · cookies | `tests/decodeRol.test.ts` | decodeRol (WEB-02: el rol sale del token, no de eys_user) un token con rol padre devuelve padre | Sí |
| UT-WEB-03 | WEB-02 · cookies | `tests/decodeRol.test.ts` | decodeRol (WEB-02: el rol sale del token, no de eys_user) entiende nombre_rol e id_rol del backend | Sí |
| UT-WEB-03 | WEB-02 · cookies | `tests/decodeRol.test.ts` | decodeRol (WEB-02: el rol sale del token, no de eys_user) un token ilegible o sin rol devuelve null | Sí |
| UT-WEB-03 | WEB-02 · cookies | `tests/decodeRol.test.ts` | decodeRol (WEB-02: el rol sale del token, no de eys_user) getServerUser toma el rol del token aunque eys_user diga admin | Sí |
| UT-WEB-03 | WEB-02 · cookies | `tests/decodeRol.test.ts` | decodeRol (WEB-02: el rol sale del token, no de eys_user) sin token de acceso no hay usuario aunque exista eys_user | Sí |
| UT-WEB-04 | WEB-03 · varios hijos | `tests/hijoActivo.test.ts` | elegirHijoActivo (WEB-03) con hijos [10, 11] y el id 11 devuelve el 11 | Sí |
| UT-WEB-04 | WEB-03 · varios hijos | `tests/hijoActivo.test.ts` | elegirHijoActivo (WEB-03) con un id ajeno devuelve el primero (10) | Sí |
| UT-WEB-04 | WEB-03 · varios hijos | `tests/hijoActivo.test.ts` | elegirHijoActivo (WEB-03) sin id devuelve el primero (10) | Sí |
| UT-WEB-04 | WEB-03 · varios hijos | `tests/hijoActivo.test.ts` | elegirHijoActivo (WEB-03) con el id como texto de la URL (?hijo=11) también lo encuentra | Sí |
| UT-WEB-04 | WEB-03 · varios hijos | `tests/hijoActivo.test.ts` | elegirHijoActivo (WEB-03) sin hijos devuelve null | Sí |
| UT-WEB-04 | WEB-03 · varios hijos | `tests/hijoActivo.test.ts` | elegirHijoActivo (WEB-03) el mensaje para un padre sin vínculos es 'No hay estudiantes vinculados' | Sí |
| UT-WEB-04 | WEB-03 · horario del estudiante asociado | `tests/components/HorariosViewerClient.test.tsx` | HorariosViewerClient (WEB-03 · horario del estudiante asociado) con error muestra el mensaje y un botón de reintentar, no una pantalla vacía | Sí |
| UT-WEB-04 | WEB-03 · horario del estudiante asociado | `tests/components/HorariosViewerClient.test.tsx` | HorariosViewerClient (WEB-03 · horario del estudiante asociado) reintentar vuelve a pedir los datos al servidor | Sí |
| UT-WEB-04 | WEB-03 · horario del estudiante asociado | `tests/components/HorariosViewerClient.test.tsx` | HorariosViewerClient (WEB-03 · horario del estudiante asociado) sin error y sin curso avisa que el estudiante no tiene curso | Sí |
| UT-WEB-04 | WEB-03 · horario del estudiante asociado | `tests/components/HorariosViewerClient.test.tsx` | HorariosViewerClient (WEB-03 · horario del estudiante asociado) con bloques muestra la grilla del curso | Sí |
| UT-WEB-04 | WEB-03 · varios hijos | `tests/components/SelectorHijo.test.tsx` | SelectorHijo (WEB-03) con un solo hijo no se ve | Sí |
| UT-WEB-04 | WEB-03 · varios hijos | `tests/components/SelectorHijo.test.tsx` | SelectorHijo (WEB-03) con dos hijos se ve y al elegir el segundo cambia ?hijo= | Sí |
| UT-WEB-04 | WEB-03 · varios hijos | `tests/components/SelectorHijo.test.tsx` | SelectorHijo (WEB-03) muestra al hijo activo como seleccionado | Sí |
| UT-WEB-04 | WEB-03 · varios hijos | `tests/components/SelectorHijo.test.tsx` | SelectorHijo (WEB-03) conserva los demás parámetros de la URL | Sí |
| UT-WEB-05 | WEB-04 · permisos | `tests/permissions.test.ts` | WEB-04 · permiso de borrar asistencia can('docente','delete','asistencia') es false: la API se lo niega con 403 | Sí |
| UT-WEB-05 | WEB-04 · permisos | `tests/permissions.test.ts` | WEB-04 · permiso de borrar asistencia can('admin','delete','asistencia') es true | Sí |
| UT-WEB-06 | WEB-05 · restablecer contraseña | `tests/resetPassword.test.ts` | resetPassword (WEB-05) no llama a la API si la contraseña no tiene carácter especial (Colegio2026) | Sí |
| UT-WEB-06 | WEB-05 · restablecer contraseña | `tests/resetPassword.test.ts` | resetPassword (WEB-05) con una contraseña válida y confirmación igual llama POST /auth/reset-password y devuelve success | Sí |
| UT-WEB-06 | WEB-05 · restablecer contraseña | `tests/resetPassword.test.ts` | resetPassword (WEB-05) con confirmación distinta devuelve 'Las contraseñas no coinciden.' | Sí |
| UT-WEB-06 | WEB-05 · restablecer contraseña | `tests/resetPassword.test.ts` | resetPassword (WEB-05) sin token devuelve el error de enlace inválido | Sí |
| UT-WEB-06 | WEB-05 · restablecer contraseña | `tests/resetPassword.test.ts` | resetPassword (WEB-05) si la API responde 401 (enlace ya usado) devuelve el mensaje de la API | Sí |
| UT-WEB-06 | WEB-05 · reglas en vivo | `tests/components/PasswordChecklist.test.tsx` | WEB-05 · PasswordChecklist (reglas en vivo) con Colegio2026 la regla «Un carácter especial» aparece como pendiente | Sí |
| UT-WEB-06 | WEB-05 · reglas en vivo | `tests/components/PasswordChecklist.test.tsx` | WEB-05 · PasswordChecklist (reglas en vivo) con Colegio#2026 las cinco reglas aparecen cumplidas | Sí |
| UT-WEB-06 | WEB-05 · reglas en vivo | `tests/components/PasswordChecklist.test.tsx` | WEB-05 · PasswordChecklist (reglas en vivo) anuncia los cambios con aria-live | Sí |
| UT-WEB-06 | WEB-05 · reglas en vivo | `tests/components/PasswordChecklist.test.tsx` | WEB-05 · PasswordChecklist (reglas en vivo) con ocultarSiVacio no dibuja nada mientras el campo está vacío | Sí |
| UT-WEB-06 | WEB-05 · reglas en vivo | `tests/components/PasswordChecklist.test.tsx` | WEB-05 · página reset-password el botón está deshabilitado con Colegio2026 y habilitado con Colegio#2026 confirmada | Sí |
| UT-WEB-06 | WEB-05 · reglas en vivo | `tests/components/PasswordChecklist.test.tsx` | WEB-05 · página reset-password deshabilitado si las contraseñas no coinciden | Sí |
| UT-WEB-07 | WEB-06 · registro masivo | `tests/registroMasivo.test.ts` | clasificarResultados (WEB-06) 2 éxitos, un 409 y un 500 → 2 guardados, 1 duplicado y 1 fallido | Sí |
| UT-WEB-07 | WEB-06 · registro masivo | `tests/registroMasivo.test.ts` | clasificarResultados (WEB-06) un error sin status (red caída) va a fallidos con un motivo legible | Sí |
| UT-WEB-07 | WEB-06 · registro masivo | `tests/registroMasivo.test.ts` | clasificarResultados (WEB-06) con una lista vacía devuelve tres listas vacías | Sí |
| UT-WEB-07 | WEB-06 · registro masivo | `tests/registroMasivo.test.ts` | reintento (WEB-06) itemsParaReintento deja solo los estudiantes fallidos, con su estado original | Sí |
| UT-WEB-07 | WEB-06 · registro masivo | `tests/registroMasivo.test.ts` | reintento (WEB-06) Reintentar envía a la API solo el fallido | Sí |
| UT-WEB-07 | WEB-06 · registro masivo | `tests/registroMasivo.test.ts` | crearRegistrosMasivoAction (WEB-06) manda un POST /asistencia por estudiante y clasifica 409 y 500 | Sí |
| UT-WEB-07 | WEB-06 · registro masivo | `tests/registroMasivo.test.ts` | crearRegistrosMasivoAction (WEB-06) el segundo envío del mismo curso deja a todos como duplicados (409) | Sí |
| UT-WEB-07 | WEB-06 · registro masivo | `tests/components/RegistroMasivo.test.tsx` | RegistroMasivo (WEB-06) lista a cada fallido por nombre con los botones Reintentar y Descartar | Sí |
| UT-WEB-07 | WEB-06 · registro masivo | `tests/components/RegistroMasivo.test.tsx` | RegistroMasivo (WEB-06) Reintentar reenvía solo al estudiante fallido | Sí |
| UT-WEB-07 | WEB-06 · registro masivo | `tests/components/RegistroMasivo.test.tsx` | RegistroMasivo (WEB-06) Descartar quita al fallido de la lista sin llamar a la API | Sí |
| UT-WEB-07 | WEB-06 · registro masivo | `tests/components/RegistroMasivo.test.tsx` | RegistroMasivo (WEB-06) cuando todos ya estaban registrados dice «ya registrado» y no ofrece reintentar | Sí |
| UT-WEB-08 | WEB-09 · boletín y mensajes | `tests/notasService.test.ts` | notasService · boletín y mensajes (WEB-09) el texto del periodo sin notas es el del criterio de aceptación | Sí |
| UT-WEB-08 | WEB-09 · boletín y mensajes | `tests/notasService.test.ts` | notasService · boletín y mensajes (WEB-09) un 404 sin datos lanza «No hay datos disponibles para generar el boletín.» | Sí |
| UT-WEB-08 | WEB-09 · boletín y mensajes | `tests/notasService.test.ts` | notasService · boletín y mensajes (WEB-09) otro error lanza el detail de la API | Sí |
| UT-WEB-08 | WEB-09 · boletín y mensajes | `tests/notasService.test.ts` | notasService · boletín y mensajes (WEB-09) pide el PDF al proxy del servidor, sin token en el navegador | Sí |
| UT-WEB-08 | WEB-09 · boletín y mensajes | `tests/components/NotasViewerClient.test.tsx` | NotasViewerClient (WEB-09) con rol padre aparece «Descargar boletín» y llama downloadBoletinPdf con el id del hijo | Sí |
| UT-WEB-08 | WEB-09 · boletín y mensajes | `tests/components/NotasViewerClient.test.tsx` | NotasViewerClient (WEB-09) al elegir un periodo sin notas muestra el texto exacto del criterio de aceptación | Sí |
| UT-WEB-08 | WEB-09 · boletín y mensajes | `tests/components/NotasViewerClient.test.tsx` | NotasViewerClient (WEB-09) un periodo con notas no muestra el mensaje de periodo vacío | Sí |
| UT-WEB-08 | WEB-09 · boletín y mensajes | `tests/components/NotasViewerClient.test.tsx` | NotasViewerClient (WEB-09) si el boletín no tiene datos muestra el mensaje de la API con notifyError | Sí |
| UT-WEB-08 | WEB-09 · boletín y mensajes | `tests/components/NotasViewerClient.test.tsx` | NotasViewerClient (WEB-09) sin estudiante asociado no ofrece el boletín | Sí |
| UT-WEB-09 | WEB-08 · fuera Supabase y 0 advertencias | `tests/arquitectura.test.ts` | arquitectura (reglas 1 a 4) WEB-01/08: ya no existe src/services/supabase ni algo que lo importe | Sí |
| UT-WEB-10 | WEB-INF-2 · cobertura | `tests/arquitectura.test.ts` | arquitectura (reglas 1 a 4) WEB-INF-2: la cobertura exige sus umbrales y el CI la corre | Sí |
| UT-WEB-11 | WEB-INF-3 · E2E con Playwright | `tests/arquitectura.test.ts` | arquitectura (reglas 1 a 4) WEB-INF-3: los E2E corren en Chromium y Firefox y cada spec nuevo nombra su CP-SIS | Sí |
| UT-WEB-12 | WEB-INF-4 · un solo despliegue | `tests/arquitectura.test.ts` | arquitectura (reglas 1 a 4) WEB-INF-4: hay un solo despliegue (se eliminó el flujo de Azure) | Sí |

## Pruebas extra (no estaban en la planeación)

| ID | Motivo | Archivo | Caso | Pasa |
|---|---|---|---|---|
| UT-WEB-EXTRA-01 | Base de la API del proxy (arreglos de SonarQube, D-WEB-14) | `tests/apiBase.test.ts` | quitarBarrasFinales (sin regex) "/a/" → "/a" | Sí |
| UT-WEB-EXTRA-02 | Base de la API del proxy (arreglos de SonarQube, D-WEB-14) | `tests/apiBase.test.ts` | quitarBarrasFinales (sin regex) "/a///" → "/a" | Sí |
| UT-WEB-EXTRA-03 | Base de la API del proxy (arreglos de SonarQube, D-WEB-14) | `tests/apiBase.test.ts` | quitarBarrasFinales (sin regex) "/api/v1" → "/api/v1" | Sí |
| UT-WEB-EXTRA-04 | Base de la API del proxy (arreglos de SonarQube, D-WEB-14) | `tests/apiBase.test.ts` | quitarBarrasFinales (sin regex) "/" → "" | Sí |
| UT-WEB-EXTRA-05 | Base de la API del proxy (arreglos de SonarQube, D-WEB-14) | `tests/apiBase.test.ts` | quitarBarrasFinales (sin regex) "" → "" | Sí |
| UT-WEB-EXTRA-06 | Base de la API del proxy (arreglos de SonarQube, D-WEB-14) | `tests/apiBase.test.ts` | quitarBarrasFinales (sin regex) "///" → "" | Sí |
| UT-WEB-EXTRA-07 | Base de la API del proxy (arreglos de SonarQube, D-WEB-14) | `tests/apiBase.test.ts` | quitarBarrasFinales (sin regex) una cadena larga de barras no tarda más que una corta | Sí |
| UT-WEB-EXTRA-08 | Base de la API del proxy (arreglos de SonarQube, D-WEB-14) | `tests/apiBase.test.ts` | apiBase con una URL válida la devuelve | Sí |
| UT-WEB-EXTRA-09 | Base de la API del proxy (arreglos de SonarQube, D-WEB-14) | `tests/apiBase.test.ts` | apiBase recorta los espacios | Sí |
| UT-WEB-EXTRA-10 | Base de la API del proxy (arreglos de SonarQube, D-WEB-14) | `tests/apiBase.test.ts` | apiBase con undefined usa el valor por defecto y no lanza | Sí |
| UT-WEB-EXTRA-11 | Base de la API del proxy (arreglos de SonarQube, D-WEB-14) | `tests/apiBase.test.ts` | apiBase con "" usa el valor por defecto y no lanza | Sí |
| UT-WEB-EXTRA-12 | Base de la API del proxy (arreglos de SonarQube, D-WEB-14) | `tests/apiBase.test.ts` | apiBase con "   " usa el valor por defecto y no lanza | Sí |
| UT-WEB-EXTRA-13 | Base de la API del proxy (arreglos de SonarQube, D-WEB-14) | `tests/apiBase.test.ts` | apiBase con un valor que no es URL avisa nombrando la variable | Sí |
| UT-WEB-EXTRA-14 | Reglas de código testeable leídas del código fuente | `tests/arquitectura.test.ts` | arquitectura (reglas 1 a 4) regla 1: ninguna vista (*Client.tsx ni componente) llama a la API directamente | Sí |
| UT-WEB-EXTRA-15 | Reglas de código testeable leídas del código fuente | `tests/arquitectura.test.ts` | arquitectura (reglas 1 a 4) regla 3: ningún código lee el token de acceso desde el navegador | Sí |
| UT-WEB-EXTRA-16 | Reglas de código testeable leídas del código fuente | `tests/arquitectura.test.ts` | arquitectura (reglas 1 a 4) regla 4: las páginas toman el rol del token, no de la cookie eys_user | Sí |
| UT-WEB-EXTRA-17 | Reglas de código testeable leídas del código fuente | `tests/arquitectura.test.ts` | arquitectura (reglas 1 a 4) WEB-01 / DEF-WEB-04: el proxy está junto a src/app y usa sessionMiddleware | Sí |
| UT-WEB-EXTRA-18 | Reglas de código testeable leídas del código fuente | `tests/arquitectura.test.ts` | arquitectura (reglas 1 a 4) DEF-WEB-04: no hay proxy ni middleware fuera de src (Next los ignoraría) | Sí |
| UT-WEB-EXTRA-19 | Reglas de código testeable leídas del código fuente | `tests/arquitectura.test.ts` | arquitectura (reglas 1 a 4) DEF-WEB-02: cada página queda envuelta por exactamente un <main> | Sí |
| UT-WEB-EXTRA-20 | Reglas de código testeable leídas del código fuente | `tests/arquitectura.test.ts` | arquitectura (reglas 1 a 4) los módulos 'use server' solo exportan funciones async (si no, el build los deja sin exports) | Sí |
| UT-WEB-EXTRA-21 | Notas, novedades y horario del estudiante asociado (WEB-03) | `tests/asociadoViewer.test.ts` | notas del estudiante asociado (WEB-03) resuelve el nombre de la materia y la etiqueta del periodo | Sí |
| UT-WEB-EXTRA-22 | Notas, novedades y horario del estudiante asociado (WEB-03) | `tests/asociadoViewer.test.ts` | novedades del estudiante asociado (WEB-03) resuelve el tipo y la gravedad desde /tipos-novedad | Sí |
| UT-WEB-EXTRA-23 | Notas, novedades y horario del estudiante asociado (WEB-03) | `tests/asociadoViewer.test.ts` | novedades del estudiante asociado (WEB-03) un padre sin hijos no pide novedades | Sí |
| UT-WEB-EXTRA-24 | Notas, novedades y horario del estudiante asociado (WEB-03) | `tests/asociadoViewer.test.ts` | horario del estudiante asociado (WEB-03) ordena por día y hora, nombra la materia y trae el curso | Sí |
| UT-WEB-EXTRA-25 | Notas, novedades y horario del estudiante asociado (WEB-03) | `tests/asociadoViewer.test.ts` | horario del estudiante asociado (WEB-03) si /cursos/{id} falla, el horario se muestra igual sin los datos del curso | Sí |
| UT-WEB-EXTRA-26 | Notas, novedades y horario del estudiante asociado (WEB-03) | `tests/asociadoViewer.test.ts` | estudiante que entra a su propia información (WEB-03) usa /estudiantes/me y no pide hijos | Sí |
| UT-WEB-EXTRA-27 | Notas, novedades y horario del estudiante asociado (WEB-03) | `tests/asociadoViewer.test.ts` | estudiante que entra a su propia información (WEB-03) si /estudiantes/me no trae id, no hay estudiante asociado | Sí |
| UT-WEB-EXTRA-28 | Notas, novedades y horario del estudiante asociado (WEB-03) | `tests/asociadoViewer.test.ts` | otros roles no tienen estudiante asociado un docente recibe info null sin llamar a la API | Sí |
| UT-WEB-EXTRA-29 | Notas, novedades y horario del estudiante asociado (WEB-03) | `tests/asociadoViewer.test.ts` | otros roles no tienen estudiante asociado sin sesión tampoco | Sí |
| UT-WEB-EXTRA-30 | Prueba no planeada | `tests/cabeceras.test.ts` | cabeceras de seguridad (WC-06) en producción van la CSP, el anti-clickjacking, nosniff, Referrer-Policy, Permissions-Policy y HSTS | Sí |
| UT-WEB-EXTRA-31 | Prueba no planeada | `tests/cabeceras.test.ts` | cabeceras de seguridad (WC-06) la CSP no deja incrustar la web ni cargar plugins, y limita formularios y base | Sí |
| UT-WEB-EXTRA-32 | Prueba no planeada | `tests/cabeceras.test.ts` | cabeceras de seguridad (WC-06) el navegador solo habla con la propia web: la foto del QR no sale a terceros (DEF-WEB-16) | Sí |
| UT-WEB-EXTRA-33 | Prueba no planeada | `tests/cabeceras.test.ts` | cabeceras de seguridad (WC-06) en desarrollo no hay CSP (Fast Refresh necesita eval) | Sí |
| UT-WEB-EXTRA-34 | Prueba no planeada | `tests/components/ErrorCarga.test.tsx` | ErrorCarga (DEF-WEB-12) muestra el mensaje como alerta y Reintentar vuelve a pedir los datos | Sí |
| UT-WEB-EXTRA-35 | Fallidos del registro masivo (WEB-06, cobertura D-WEB-13) | `tests/components/FallidosMasivo.test.tsx` | FallidosMasivo (WEB-06) sin fallidos no renderiza nada | Sí |
| UT-WEB-EXTRA-36 | Fallidos del registro masivo (WEB-06, cobertura D-WEB-13) | `tests/components/FallidosMasivo.test.tsx` | FallidosMasivo (WEB-06) lista cada estudiante por nombre con su motivo | Sí |
| UT-WEB-EXTRA-37 | Fallidos del registro masivo (WEB-06, cobertura D-WEB-13) | `tests/components/FallidosMasivo.test.tsx` | FallidosMasivo (WEB-06) con un solo fallido el texto va en singular | Sí |
| UT-WEB-EXTRA-38 | Fallidos del registro masivo (WEB-06, cobertura D-WEB-13) | `tests/components/FallidosMasivo.test.tsx` | FallidosMasivo (WEB-06) Reintentar y Descartar avisan al llamador | Sí |
| UT-WEB-EXTRA-39 | Fallidos del registro masivo (WEB-06, cobertura D-WEB-13) | `tests/components/FallidosMasivo.test.tsx` | FallidosMasivo (WEB-06) mientras se reenvía, los dos botones están deshabilitados | Sí |
| UT-WEB-EXTRA-40 | Prueba no planeada | `tests/components/MinimalDashboard.test.tsx` | MinimalDashboard · error al cargar (DEF-WEB-08) muestra el error como alerta con un botón Reintentar que vuelve a pedir los datos | Sí |
| UT-WEB-EXTRA-41 | Prueba no planeada | `tests/components/MinimalDashboard.test.tsx` | MinimalDashboard · error al cargar (DEF-WEB-08) sin error no muestra alerta ni botón | Sí |
| UT-WEB-EXTRA-42 | Prueba no planeada | `tests/components/SignupModal.test.tsx` | SignupModal · motivo del rechazo (DEF-WEB-05) un 422 del correo se muestra bajo el campo Correo y lo marca inválido | Sí |
| UT-WEB-EXTRA-43 | Prueba no planeada | `tests/components/SignupModal.test.tsx` | SignupModal · motivo del rechazo (DEF-WEB-05) un error sin campo (409) solo muestra el mensaje general | Sí |
| UT-WEB-EXTRA-44 | Gestión de defectos en GitHub Issues (D-WEB-15) | `tests/defectos.test.ts` | Defectos · plantilla del issue tiene un campo por cada título que lee el workflow | Sí |
| UT-WEB-EXTRA-45 | Gestión de defectos en GitHub Issues (D-WEB-15) | `tests/defectos.test.ts` | Defectos · plantilla del issue ofrece exactamente las opciones que el workflow sabe convertir en etiquetas | Sí |
| UT-WEB-EXTRA-46 | Gestión de defectos en GitHub Issues (D-WEB-15) | `tests/defectos.test.ts` | Defectos · plantilla del issue pone la etiqueta «defecto», que es la que activa el ciclo de vida | Sí |
| UT-WEB-EXTRA-47 | Gestión de defectos en GitHub Issues (D-WEB-15) | `tests/defectos.test.ts` | Defectos · plantilla del issue cada etiqueta del formulario existe en la lista que crea el workflow | Sí |
| UT-WEB-EXTRA-48 | Gestión de defectos en GitHub Issues (D-WEB-15) | `tests/defectos.test.ts` | Defectos · lectura del formulario separa cada campo por su título y trata «_No response_» como vacío | Sí |
| UT-WEB-EXTRA-49 | Gestión de defectos en GitHub Issues (D-WEB-15) | `tests/defectos.test.ts` | Defectos · lectura del formulario acepta saltos de línea de Windows y cuerpos vacíos | Sí |
| UT-WEB-EXTRA-50 | Gestión de defectos en GitHub Issues (D-WEB-15) | `tests/defectos.test.ts` | Defectos · lectura del formulario convierte componente, origen, severidad y prioridad en etiquetas | Sí |
| UT-WEB-EXTRA-51 | Gestión de defectos en GitHub Issues (D-WEB-15) | `tests/defectos.test.ts` | Defectos · lectura del formulario sin prioridad, propone la que corresponde a la severidad (Crítica → P1) | Sí |
| UT-WEB-EXTRA-52 | Gestión de defectos en GitHub Issues (D-WEB-15) | `tests/defectos.test.ts` | Defectos · lectura del formulario al editar no toca la prioridad: después de abrir la decide el PO | Sí |
| UT-WEB-EXTRA-53 | Gestión de defectos en GitHub Issues (D-WEB-15) | `tests/defectos.test.ts` | Defectos · lectura del formulario ignora valores que no son opciones de la plantilla | Sí |
| UT-WEB-EXTRA-54 | Gestión de defectos en GitHub Issues (D-WEB-15) | `tests/defectos.test.ts` | Defectos · etiquetas excluyentes cambiar la severidad quita la anterior y no toca los otros grupos | Sí |
| UT-WEB-EXTRA-55 | Gestión de defectos en GitHub Issues (D-WEB-15) | `tests/defectos.test.ts` | Defectos · etiquetas excluyentes no repite etiquetas que el issue ya tiene | Sí |
| UT-WEB-EXTRA-56 | Gestión de defectos en GitHub Issues (D-WEB-15) | `tests/defectos.test.ts` | Defectos · etiquetas excluyentes un solo estado a la vez | Sí |
| UT-WEB-EXTRA-57 | Gestión de defectos en GitHub Issues (D-WEB-15) | `tests/defectos.test.ts` | Defectos · ciclo de vida (planeación §2) al abrirse queda Nuevo y clasificado | Sí |
| UT-WEB-EXTRA-58 | Gestión de defectos en GitHub Issues (D-WEB-15) | `tests/defectos.test.ts` | Defectos · ciclo de vida (planeación §2) un PR abierto lo pasa a En curso, pero no lo saca de En verificación | Sí |
| UT-WEB-EXTRA-59 | Gestión de defectos en GitHub Issues (D-WEB-15) | `tests/defectos.test.ts` | Defectos · ciclo de vida (planeación §2) al fusionarse la corrección pasa a En verificación, no a cerrado | Sí |
| UT-WEB-EXTRA-60 | Gestión de defectos en GitHub Issues (D-WEB-15) | `tests/defectos.test.ts` | Defectos · ciclo de vida (planeación §2) reabrir lo devuelve a En curso y lo cuenta como reabierto | Sí |
| UT-WEB-EXTRA-61 | Gestión de defectos en GitHub Issues (D-WEB-15) | `tests/defectos.test.ts` | Defectos · ciclo de vida (planeación §2) editar un issue sin plantilla no cambia nada | Sí |
| UT-WEB-EXTRA-62 | Gestión de defectos en GitHub Issues (D-WEB-15) | `tests/defectos.test.ts` | Defectos · referencias desde un PR reconoce «Corrige #N» y variantes, sin repetir | Sí |
| UT-WEB-EXTRA-63 | Gestión de defectos en GitHub Issues (D-WEB-15) | `tests/defectos.test.ts` | Defectos · referencias desde un PR reconoce las palabras de cierre de GitHub para poder reabrir el defecto | Sí |
| UT-WEB-EXTRA-64 | Gestión de defectos en GitHub Issues (D-WEB-15) | `tests/defectos.test.ts` | Defectos · referencias desde un PR no confunde menciones sueltas ni el «Corrige #» vacío de la plantilla del PR | Sí |
| UT-WEB-EXTRA-65 | Gestión de defectos en GitHub Issues (D-WEB-15) | `tests/defectos.test.ts` | Defectos · registro para el PR-07 el estado sale del issue: abierto por etiqueta, cerrado según el motivo | Sí |
| UT-WEB-EXTRA-66 | Gestión de defectos en GitHub Issues (D-WEB-15) | `tests/defectos.test.ts` | Defectos · registro para el PR-07 una fila por defecto, con tantas celdas como columnas | Sí |
| UT-WEB-EXTRA-67 | Gestión de defectos en GitHub Issues (D-WEB-15) | `tests/defectos.test.ts` | Defectos · registro para el PR-07 un defecto abierto no tiene fecha de cierre ni días | Sí |
| UT-WEB-EXTRA-68 | Gestión de defectos en GitHub Issues (D-WEB-15) | `tests/defectos.test.ts` | Defectos · registro para el PR-07 escapa comillas y comas en el título | Sí |
| UT-WEB-EXTRA-69 | Gestión de defectos en GitHub Issues (D-WEB-15) | `tests/defectos.test.ts` | Defectos · registro inicial (docs/defectos/registro.json) el cuerpo se lee igual que uno escrito con la plantilla | Sí |
| UT-WEB-EXTRA-70 | Gestión de defectos en GitHub Issues (D-WEB-15) | `tests/defectos.test.ts` | Defectos · registro inicial (docs/defectos/registro.json) un defecto abierto lleva sus etiquetas y el estado, y no se cierra | Sí |
| UT-WEB-EXTRA-71 | Gestión de defectos en GitHub Issues (D-WEB-15) | `tests/defectos.test.ts` | Defectos · registro inicial (docs/defectos/registro.json) un defecto verificado se cierra con causa raíz, commit y verificación | Sí |
| UT-WEB-EXTRA-72 | Gestión de defectos en GitHub Issues (D-WEB-15) | `tests/defectos.test.ts` | Defectos · registro inicial (docs/defectos/registro.json) rechaza registros que crearían un issue sin clasificar o un cierre sin evidencia | Sí |
| UT-WEB-EXTRA-73 | Gestión de defectos en GitHub Issues (D-WEB-15) | `tests/defectos.test.ts` | Defectos · registro inicial (docs/defectos/registro.json) reconoce los ya registrados por su «ID del registro» | Sí |
| UT-WEB-EXTRA-74 | Gestión de defectos en GitHub Issues (D-WEB-15) | `tests/defectos.test.ts` | Defectos · registro inicial (docs/defectos/registro.json) el registro del repositorio es válido completo y no repite IDs | Sí |
| UT-WEB-EXTRA-75 | Prueba no planeada | `tests/errors.test.ts` | getErrorMessage (DEF-WEB-10) el error enmascarado de una Server Action se cambia por el mensaje de la pantalla | Sí |
| UT-WEB-EXTRA-76 | Prueba no planeada | `tests/errors.test.ts` | getErrorMessage (DEF-WEB-10) tampoco pasan los mensajes técnicos de red o de render del servidor | Sí |
| UT-WEB-EXTRA-77 | Prueba no planeada | `tests/errors.test.ts` | getErrorMessage (DEF-WEB-10) un mensaje pensado para el usuario se respeta | Sí |
| UT-WEB-EXTRA-78 | Prueba no planeada | `tests/errors.test.ts` | getErrorMessage (DEF-WEB-10) sin mensaje usa el de la pantalla | Sí |
| UT-WEB-EXTRA-79 | Prueba no planeada | `tests/fecha.test.ts` | hoyColegio (DEF-WEB-11) a las 21:52 del 16/11 en Colombia (02:52 UTC del 17/11) es el 16/11 | Sí |
| UT-WEB-EXTRA-80 | Prueba no planeada | `tests/fecha.test.ts` | hoyColegio (DEF-WEB-11) a mediodía coincide con la fecha UTC | Sí |
| UT-WEB-EXTRA-81 | Prueba no planeada | `tests/fecha.test.ts` | hoyColegio (DEF-WEB-11) justo después de la medianoche de Colombia ya es el día nuevo | Sí |
| UT-WEB-EXTRA-82 | Prueba no planeada | `tests/fecha.test.ts` | hoyColegio (DEF-WEB-11) nadie calcula «hoy» con la fecha UTC | Sí |
| UT-WEB-EXTRA-83 | Carga inicial de los hooks (arreglos de SonarQube, D-WEB-14) | `tests/hooks/cargaInicial.test.tsx` | carga inicial de los hooks de pantalla useReportes sin datos del servidor pide los datos una sola vez y apaga loading | Sí |
| UT-WEB-EXTRA-84 | Carga inicial de los hooks (arreglos de SonarQube, D-WEB-14) | `tests/hooks/cargaInicial.test.tsx` | carga inicial de los hooks de pantalla useReportes con datos del servidor no vuelve a pedirlos | Sí |
| UT-WEB-EXTRA-85 | Carga inicial de los hooks (arreglos de SonarQube, D-WEB-14) | `tests/hooks/cargaInicial.test.tsx` | carga inicial de los hooks de pantalla useReportes si la carga falla, el mensaje queda en error y loading se apaga | Sí |
| UT-WEB-EXTRA-86 | Carga inicial de los hooks (arreglos de SonarQube, D-WEB-14) | `tests/hooks/cargaInicial.test.tsx` | carga inicial de los hooks de pantalla useNotas sin datos del servidor pide los datos una sola vez y apaga loading | Sí |
| UT-WEB-EXTRA-87 | Carga inicial de los hooks (arreglos de SonarQube, D-WEB-14) | `tests/hooks/cargaInicial.test.tsx` | carga inicial de los hooks de pantalla useNotas con datos del servidor no vuelve a pedirlos | Sí |
| UT-WEB-EXTRA-88 | Carga inicial de los hooks (arreglos de SonarQube, D-WEB-14) | `tests/hooks/cargaInicial.test.tsx` | carga inicial de los hooks de pantalla useNotas si la carga falla, el mensaje queda en error y loading se apaga | Sí |
| UT-WEB-EXTRA-89 | Carga inicial de los hooks (arreglos de SonarQube, D-WEB-14) | `tests/hooks/cargaInicial.test.tsx` | carga inicial de los hooks de pantalla useUsuarios sin datos del servidor pide los datos una sola vez y apaga loading | Sí |
| UT-WEB-EXTRA-90 | Carga inicial de los hooks (arreglos de SonarQube, D-WEB-14) | `tests/hooks/cargaInicial.test.tsx` | carga inicial de los hooks de pantalla useUsuarios con datos del servidor no vuelve a pedirlos | Sí |
| UT-WEB-EXTRA-91 | Carga inicial de los hooks (arreglos de SonarQube, D-WEB-14) | `tests/hooks/cargaInicial.test.tsx` | carga inicial de los hooks de pantalla useUsuarios si la carga falla, el mensaje queda en error y loading se apaga | Sí |
| UT-WEB-EXTRA-92 | Carga inicial de los hooks (arreglos de SonarQube, D-WEB-14) | `tests/hooks/cargaInicial.test.tsx` | carga inicial de los hooks de pantalla useAsistencia sin datos del servidor pide los datos una sola vez y apaga loading | Sí |
| UT-WEB-EXTRA-93 | Carga inicial de los hooks (arreglos de SonarQube, D-WEB-14) | `tests/hooks/cargaInicial.test.tsx` | carga inicial de los hooks de pantalla useAsistencia con datos del servidor no vuelve a pedirlos | Sí |
| UT-WEB-EXTRA-94 | Carga inicial de los hooks (arreglos de SonarQube, D-WEB-14) | `tests/hooks/cargaInicial.test.tsx` | carga inicial de los hooks de pantalla useAsistencia si la carga falla, el mensaje queda en error y loading se apaga | Sí |
| UT-WEB-EXTRA-95 | Carga inicial de los hooks (arreglos de SonarQube, D-WEB-14) | `tests/hooks/cargaInicial.test.tsx` | carga inicial de los hooks de pantalla useHorarios sin datos del servidor pide los datos una sola vez y apaga loading | Sí |
| UT-WEB-EXTRA-96 | Carga inicial de los hooks (arreglos de SonarQube, D-WEB-14) | `tests/hooks/cargaInicial.test.tsx` | carga inicial de los hooks de pantalla useHorarios con datos del servidor no vuelve a pedirlos | Sí |
| UT-WEB-EXTRA-97 | Carga inicial de los hooks (arreglos de SonarQube, D-WEB-14) | `tests/hooks/cargaInicial.test.tsx` | carga inicial de los hooks de pantalla useHorarios si la carga falla, el mensaje queda en error y loading se apaga | Sí |
| UT-WEB-EXTRA-98 | Prueba no planeada | `tests/hooks/notasAsistenciaErrores.test.tsx` | useNotas · errores registrar: el motivo de la API (403/409) llega tal cual y no se cierra el modal | Sí |
| UT-WEB-EXTRA-99 | Prueba no planeada | `tests/hooks/notasAsistenciaErrores.test.tsx` | useNotas · errores registrar y editar con la API caída dan un mensaje claro (CP-SIS-046) | Sí |
| UT-WEB-EXTRA-100 | Prueba no planeada | `tests/hooks/notasAsistenciaErrores.test.tsx` | useNotas · errores eliminar avisa si falla y deja la nota | Sí |
| UT-WEB-EXTRA-101 | Prueba no planeada | `tests/hooks/notasAsistenciaErrores.test.tsx` | useNotas · errores tras un error de carga, reintentar vuelve a pedir los datos | Sí |
| UT-WEB-EXTRA-102 | Prueba no planeada | `tests/hooks/notasAsistenciaErrores.test.tsx` | useAsistencia · errores guardar, editar y eliminar avisan si fallan | Sí |
| UT-WEB-EXTRA-103 | Prueba no planeada | `tests/hooks/notasAsistenciaErrores.test.tsx` | useAsistencia · errores el registro por lote resume guardados, duplicados y fallidos | Sí |
| UT-WEB-EXTRA-104 | Prueba no planeada | `tests/hooks/notasAsistenciaErrores.test.tsx` | useAsistencia · errores el lote con la API caída avisa | Sí |
| UT-WEB-EXTRA-105 | Prueba no planeada | `tests/hooks/notasAsistenciaErrores.test.tsx` | useAsistencia · errores si al refrescar falla la lista, se muestra el aviso de carga (DEF-WEB-12) | Sí |
| UT-WEB-EXTRA-106 | Prueba no planeada | `tests/hooks/notasAsistenciaErrores.test.tsx` | useAsistencia · errores tras un error de carga, reintentar vuelve a pedir los datos | Sí |
| UT-WEB-EXTRA-107 | Prueba no planeada | `tests/hooks/useCargaInicio.test.tsx` | useCargaInicio (DEF-WEB-08) con los datos del servidor no vuelve a pedirlos | Sí |
| UT-WEB-EXTRA-108 | Prueba no planeada | `tests/hooks/useCargaInicio.test.tsx` | useCargaInicio (DEF-WEB-08) sin datos del servidor los pide al montar | Sí |
| UT-WEB-EXTRA-109 | Prueba no planeada | `tests/hooks/useCargaInicio.test.tsx` | useCargaInicio (DEF-WEB-08) un fallo deja un mensaje para la persona, sin datos inventados | Sí |
| UT-WEB-EXTRA-110 | Prueba no planeada | `tests/hooks/useCargaInicio.test.tsx` | useCargaInicio (DEF-WEB-08) reintentar limpia el error y vuelve a pedir los datos | Sí |
| UT-WEB-EXTRA-111 | Prueba no planeada | `tests/hooks/useEscanear.test.tsx` | useEscanear una foto sin QR pide intentarlo de nuevo | Sí |
| UT-WEB-EXTRA-112 | Prueba no planeada | `tests/hooks/useEscanear.test.tsx` | useEscanear un QR que no es de un estudiante es «Código QR inválido» y no registra | Sí |
| UT-WEB-EXTRA-113 | Prueba no planeada | `tests/hooks/useEscanear.test.tsx` | useEscanear si la foto no se puede procesar, lo dice sin texto técnico | Sí |
| UT-WEB-EXTRA-114 | Prueba no planeada | `tests/hooks/useEscanear.test.tsx` | useEscanear un QR válido queda pendiente y al confirmar registra la entrada de hoy | Sí |
| UT-WEB-EXTRA-115 | Prueba no planeada | `tests/hooks/useEscanear.test.tsx` | useEscanear si registrar falla, avisa y deja cancelar para volver a escanear | Sí |
| UT-WEB-EXTRA-116 | Prueba no planeada | `tests/hooks/useEscanear.test.tsx` | useEscanear una segunda entrada el mismo día se bloquea (CP-SIS-034) | Sí |
| UT-WEB-EXTRA-117 | Prueba no planeada | `tests/hooks/useQRyPaginacion.test.tsx` | useQR el admin sin datos del servidor carga los del día de hoy (hora de Colombia) | Sí |
| UT-WEB-EXTRA-118 | Prueba no planeada | `tests/hooks/useQRyPaginacion.test.tsx` | useQR si la carga falla, queda el error y no se cuelga la carga | Sí |
| UT-WEB-EXTRA-119 | Prueba no planeada | `tests/hooks/useQRyPaginacion.test.tsx` | useQR refrescar la asistencia con la API caída da un mensaje claro | Sí |
| UT-WEB-EXTRA-120 | Prueba no planeada | `tests/hooks/useQRyPaginacion.test.tsx` | useQR otros roles no cargan la vista de gestión | Sí |
| UT-WEB-EXTRA-121 | Prueba no planeada | `tests/hooks/useQRyPaginacion.test.tsx` | usePagination pagina de 10 en 10 e informa el rango | Sí |
| UT-WEB-EXTRA-122 | Prueba no planeada | `tests/hooks/useQRyPaginacion.test.tsx` | usePagination si la lista se encoge, muestra la última página válida | Sí |
| UT-WEB-EXTRA-123 | Prueba no planeada | `tests/hooks/useQRyPaginacion.test.tsx` | usePagination una lista vacía no rompe el rango | Sí |
| UT-WEB-EXTRA-124 | Prueba no planeada | `tests/hooks/useUsuariosErrores.test.tsx` | useUsuarios · errores (DEF-WEB-10) crear: el motivo de la API llega a la persona y el modal sigue abierto | Sí |
| UT-WEB-EXTRA-125 | Prueba no planeada | `tests/hooks/useUsuariosErrores.test.tsx` | useUsuarios · errores (DEF-WEB-10) crear: un fallo de red da un mensaje claro | Sí |
| UT-WEB-EXTRA-126 | Prueba no planeada | `tests/hooks/useUsuariosErrores.test.tsx` | useUsuarios · errores (DEF-WEB-10) editar: el motivo de la API y el fallo de red | Sí |
| UT-WEB-EXTRA-127 | Prueba no planeada | `tests/hooks/useUsuariosErrores.test.tsx` | useUsuarios · errores (DEF-WEB-10) eliminar con la API caída avisa que no se pudo (CP-SIS-026) | Sí |
| UT-WEB-EXTRA-128 | Prueba no planeada | `tests/hooks/useUsuariosErrores.test.tsx` | useUsuarios · errores (DEF-WEB-10) cambiar estado, aprobar y rechazar avisan si fallan | Sí |
| UT-WEB-EXTRA-129 | Prueba no planeada | `tests/hooks/useUsuariosErrores.test.tsx` | useUsuarios · errores (DEF-WEB-10) tras un error de carga, reintentar vuelve a pedir la lista (CP-SIS-028) | Sí |
| UT-WEB-EXTRA-130 | Prueba no planeada | `tests/horariosBootstrap.test.ts` | getHorariosBootstrapAction (DEF-WEB-14) el docente recibe solo los bloques de sus asignaciones | Sí |
| UT-WEB-EXTRA-131 | Prueba no planeada | `tests/horariosBootstrap.test.ts` | getHorariosBootstrapAction (DEF-WEB-14) un docente sin registro de profesor no recibe ningún bloque | Sí |
| UT-WEB-EXTRA-132 | Prueba no planeada | `tests/horariosBootstrap.test.ts` | getHorariosBootstrapAction (DEF-WEB-14) el admin recibe todos los bloques | Sí |
| UT-WEB-EXTRA-133 | Prueba no planeada | `tests/horariosDocente.test.ts` | horariosDelDocente (DEF-WEB-14) deja solo los bloques de las asignaciones activas del docente | Sí |
| UT-WEB-EXTRA-134 | Prueba no planeada | `tests/horariosDocente.test.ts` | horariosDelDocente (DEF-WEB-14) una asignación inactiva no cuenta | Sí |
| UT-WEB-EXTRA-135 | Prueba no planeada | `tests/horariosDocente.test.ts` | horariosDelDocente (DEF-WEB-14) un docente sin asignaciones (o sin registro de profesor) no ve ningún bloque | Sí |
| UT-WEB-EXTRA-136 | Prueba no planeada | `tests/iconos.test.ts` | iconos de Material Symbols (DEF-WEB-17) todo icono escrito en el código está en la lista que se pide a Google | Sí |
| UT-WEB-EXTRA-137 | Prueba no planeada | `tests/iconos.test.ts` | iconos de Material Symbols (DEF-WEB-17) la lista va en orden alfabético y sin repetidos, como exige icon_names | Sí |
| UT-WEB-EXTRA-138 | Prueba no planeada | `tests/iconos.test.ts` | iconos de Material Symbols (DEF-WEB-17) la fuente se pide con icon_names y los mismos ejes de antes | Sí |
| UT-WEB-EXTRA-139 | Prueba no planeada | `tests/iconos.test.ts` | iconos de Material Symbols (DEF-WEB-17) ninguna página pide la fuente completa | Sí |
| UT-WEB-EXTRA-140 | Prueba no planeada | `tests/loginErrores.test.ts` | login con la API caída (CP-SIS-005) sin conexión con la API: «No se pudo conectar con el servidor» | Sí |
| UT-WEB-EXTRA-141 | Prueba no planeada | `tests/loginErrores.test.ts` | login con la API caída (CP-SIS-005) si la API no responde en los dos intentos: «El servidor no respondió a tiempo» | Sí |
| UT-WEB-EXTRA-142 | Prueba no planeada | `tests/loginErrores.test.ts` | acciones de usuarios ante un 5xx sin JSON (CP-SIS-026) falla sin pasar el HTML al usuario y registra método y ruta | Sí |
| UT-WEB-EXTRA-143 | Prueba no planeada | `tests/loginLimite.test.ts` | fetchConLimite (DEF-WEB-07) si el primer intento no responde a tiempo, hace un segundo y devuelve su respuesta | Sí |
| UT-WEB-EXTRA-144 | Prueba no planeada | `tests/loginLimite.test.ts` | fetchConLimite (DEF-WEB-07) si ningún intento responde, falla con TimeoutError (no espera para siempre) | Sí |
| UT-WEB-EXTRA-145 | Prueba no planeada | `tests/loginLimite.test.ts` | fetchConLimite (DEF-WEB-07) una respuesta de error de la API no se repite: se devuelve tal cual | Sí |
| UT-WEB-EXTRA-146 | Prueba no planeada | `tests/loginLimite.test.ts` | login con la API lenta (DEF-WEB-07) si /auth/login nunca responde, devuelve un mensaje en vez de quedarse esperando | Sí |
| UT-WEB-EXTRA-147 | Prueba no planeada | `tests/loginLimite.test.ts` | login con la API lenta (DEF-WEB-07) si /auth/me no responde, igual guarda la sesión con los datos del token y entra | Sí |
| UT-WEB-EXTRA-148 | Prueba no planeada | `tests/notasActions.test.ts` | createNotaAction (DEF-WEB-10) un 403 devuelve el motivo de la API | Sí |
| UT-WEB-EXTRA-149 | Prueba no planeada | `tests/notasActions.test.ts` | createNotaAction (DEF-WEB-10) si se guarda, no devuelve error | Sí |
| UT-WEB-EXTRA-150 | Prueba no planeada | `tests/notasActions.test.ts` | createNotaAction (DEF-WEB-10) un 5xx se sigue lanzando | Sí |
| UT-WEB-EXTRA-151 | Prueba no planeada | `tests/novedadesOrden.test.ts` | porFechaReciente (DEF-WEB-13) ordena de la más reciente a la más antigua y, en el mismo día, la última registrada primero | Sí |
| UT-WEB-EXTRA-152 | Prueba no planeada | `tests/novedadesOrden.test.ts` | porFechaReciente (DEF-WEB-13) una fecha con hora se compara por su día | Sí |
| UT-WEB-EXTRA-153 | Política de contraseñas (base de WEB-05) | `tests/password.test.ts` | política de contraseñas acepta una contraseña que cumple las cinco reglas | Sí |
| UT-WEB-EXTRA-154 | Política de contraseñas (base de WEB-05) | `tests/password.test.ts` | política de contraseñas rechaza Ab1# por la regla length | Sí |
| UT-WEB-EXTRA-155 | Política de contraseñas (base de WEB-05) | `tests/password.test.ts` | política de contraseñas rechaza colegio#2026 por la regla upper | Sí |
| UT-WEB-EXTRA-156 | Política de contraseñas (base de WEB-05) | `tests/password.test.ts` | política de contraseñas rechaza COLEGIO#2026 por la regla lower | Sí |
| UT-WEB-EXTRA-157 | Política de contraseñas (base de WEB-05) | `tests/password.test.ts` | política de contraseñas rechaza Colegio#ocho por la regla number | Sí |
| UT-WEB-EXTRA-158 | Política de contraseñas (base de WEB-05) | `tests/password.test.ts` | política de contraseñas rechaza Colegio2026 por la regla special | Sí |
| UT-WEB-EXTRA-159 | Prueba no planeada | `tests/permissions.test.ts` | permisos por rol solo el administrador gestiona usuarios | Sí |
| UT-WEB-EXTRA-160 | Prueba no planeada | `tests/permissions.test.ts` | permisos por rol las notas las escribe el docente; el admin solo las lee | Sí |
| UT-WEB-EXTRA-161 | Prueba no planeada | `tests/permissions.test.ts` | permisos por rol estudiante y padre solo leen lo propio | Sí |
| UT-WEB-EXTRA-162 | Prueba no planeada | `tests/permissions.test.ts` | permisos por rol escanear QR es de docentes y administradores | Sí |
| UT-WEB-EXTRA-163 | Prueba no planeada | `tests/permissions.test.ts` | mapRolToKey traduce los nombres de rol del backend | Sí |
| UT-WEB-EXTRA-164 | Prueba no planeada | `tests/permissions.test.ts` | mapRolToKey traduce el id_rol de la base (1 docente, 2 estudiante, 3 admin, 4 padre) | Sí |
| UT-WEB-EXTRA-165 | Prueba no planeada | `tests/permissions.test.ts` | mapRolToKey un rol desconocido no se convierte en ninguno | Sí |
| UT-WEB-EXTRA-166 | Prueba no planeada | `tests/portada.test.ts` | Portada · carga (DEF-WEB-06) ningún vídeo se precarga entero: solo los metadatos | Sí |
| UT-WEB-EXTRA-167 | Prueba no planeada | `tests/portada.test.ts` | Portada · carga (DEF-WEB-06) el reproductor de YouTube no tiene src hasta que se abre su panel | Sí |
| UT-WEB-EXTRA-168 | Prueba no planeada | `tests/portada.test.ts` | Portada · carga (DEF-WEB-06) el inicio de sesión tiene un tope de espera con mensaje | Sí |
| UT-WEB-EXTRA-169 | Prueba no planeada | `tests/portada.test.ts` | Portada · carga (DEF-WEB-06) marca el formulario como listo solo después de conectar el envío | Sí |
| UT-WEB-EXTRA-170 | Prueba no planeada | `tests/qrBuscarCodigo.test.ts` | getCodigoQRByValueAction (DEF-WEB-18) un QR que no es de ningún estudiante no resuelve a nadie | Sí |
| UT-WEB-EXTRA-171 | Prueba no planeada | `tests/qrBuscarCodigo.test.ts` | getCodigoQRByValueAction (DEF-WEB-18) resuelve al estudiante con ese código exacto, no al primero de la lista | Sí |
| UT-WEB-EXTRA-172 | Prueba no planeada | `tests/qrBuscarCodigo.test.ts` | getCodigoQRByValueAction (DEF-WEB-18) busca en todas las páginas | Sí |
| UT-WEB-EXTRA-173 | Prueba no planeada | `tests/qrBuscarCodigo.test.ts` | getCodigoQRByValueAction (DEF-WEB-18) no confunde un código con otro que lo contiene | Sí |
| UT-WEB-EXTRA-174 | Prueba no planeada | `tests/qrBuscarCodigo.test.ts` | getCodigoQRByValueAction (DEF-WEB-18) ignora espacios alrededor del texto leído | Sí |
| UT-WEB-EXTRA-175 | Prueba no planeada | `tests/qrLectura.test.ts` | DEF-WEB-16 · lectura del QR en el navegador decodificarQR lee el código de un QR real | Sí |
| UT-WEB-EXTRA-176 | Prueba no planeada | `tests/qrLectura.test.ts` | DEF-WEB-16 · lectura del QR en el navegador decodificarQR devuelve null si la imagen no tiene un QR | Sí |
| UT-WEB-EXTRA-177 | Prueba no planeada | `tests/qrLectura.test.ts` | DEF-WEB-16 · lectura del QR en el navegador readQRFromImage lee la foto sin enviarla a ningún servicio externo | Sí |
| UT-WEB-EXTRA-178 | Prueba no planeada | `tests/qrLectura.test.ts` | DEF-WEB-16 · lectura del QR en el navegador readQRFromImage devuelve null si la foto no tiene un QR | Sí |
| UT-WEB-EXTRA-179 | Prueba no planeada | `tests/qrLectura.test.ts` | DEF-WEB-16 · lectura del QR en el navegador readQRFromImage avisa con un mensaje claro si la foto no se puede abrir | Sí |
| UT-WEB-EXTRA-180 | Validación por rol de register (WEB-05, cobertura D-WEB-13) | `tests/register.test.ts` | register (WEB-05 · validación antes de llamar a la API) sin correo pide completar los campos y no llama a la API | Sí |
| UT-WEB-EXTRA-181 | Validación por rol de register (WEB-05, cobertura D-WEB-13) | `tests/register.test.ts` | register (WEB-05 · validación antes de llamar a la API) sin contraseña pide completar los campos y no llama a la API | Sí |
| UT-WEB-EXTRA-182 | Validación por rol de register (WEB-05, cobertura D-WEB-13) | `tests/register.test.ts` | register (WEB-05 · validación antes de llamar a la API) sin nombre pide completar los campos y no llama a la API | Sí |
| UT-WEB-EXTRA-183 | Validación por rol de register (WEB-05, cobertura D-WEB-13) | `tests/register.test.ts` | register (WEB-05 · validación antes de llamar a la API) sin apellido pide completar los campos y no llama a la API | Sí |
| UT-WEB-EXTRA-184 | Validación por rol de register (WEB-05, cobertura D-WEB-13) | `tests/register.test.ts` | register (WEB-05 · validación antes de llamar a la API) sin tipo de documento pide completar los campos y no llama a la API | Sí |
| UT-WEB-EXTRA-185 | Validación por rol de register (WEB-05, cobertura D-WEB-13) | `tests/register.test.ts` | register (WEB-05 · validación antes de llamar a la API) sin número de documento pide completar los campos y no llama a la API | Sí |
| UT-WEB-EXTRA-186 | Validación por rol de register (WEB-05, cobertura D-WEB-13) | `tests/register.test.ts` | register (WEB-05 · validación antes de llamar a la API) sin rol pide completar los campos y no llama a la API | Sí |
| UT-WEB-EXTRA-187 | Validación por rol de register (WEB-05, cobertura D-WEB-13) | `tests/register.test.ts` | register (WEB-05 · validación antes de llamar a la API) un rol que no es un número tampoco pasa (Number.isNaN) | Sí |
| UT-WEB-EXTRA-188 | Validación por rol de register (WEB-05, cobertura D-WEB-13) | `tests/register.test.ts` | register (WEB-05 · validación antes de llamar a la API) una contraseña sin carácter especial se rechaza con el motivo | Sí |
| UT-WEB-EXTRA-189 | Validación por rol de register (WEB-05, cobertura D-WEB-13) | `tests/register.test.ts` | register (WEB-05 · validación antes de llamar a la API) un rol desconocido se rechaza | Sí |
| UT-WEB-EXTRA-190 | Validación por rol de register (WEB-05, cobertura D-WEB-13) | `tests/register.test.ts` | register (WEB-05 · validación antes de llamar a la API) estudiante sin curso se rechaza con su motivo | Sí |
| UT-WEB-EXTRA-191 | Validación por rol de register (WEB-05, cobertura D-WEB-13) | `tests/register.test.ts` | register (WEB-05 · validación antes de llamar a la API) padre sin id del estudiante se rechaza con su motivo | Sí |
| UT-WEB-EXTRA-192 | Validación por rol de register (WEB-05, cobertura D-WEB-13) | `tests/register.test.ts` | register (WEB-05 · validación antes de llamar a la API) padre sin parentesco se rechaza con su motivo | Sí |
| UT-WEB-EXTRA-193 | Validación por rol de register (WEB-05, cobertura D-WEB-13) | `tests/register.test.ts` | register (WEB-05 · validación antes de llamar a la API) docente sin especialización se rechaza con su motivo | Sí |
| UT-WEB-EXTRA-194 | Validación por rol de register (WEB-05, cobertura D-WEB-13) | `tests/register.test.ts` | register (WEB-05 · validación antes de llamar a la API) admin sin cargo se rechaza con su motivo | Sí |
| UT-WEB-EXTRA-195 | Validación por rol de register (WEB-05, cobertura D-WEB-13) | `tests/register.test.ts` | register (WEB-05 · validación antes de llamar a la API) estudiante válido manda id_curso_actual como número y el correo en minúsculas | Sí |
| UT-WEB-EXTRA-196 | Validación por rol de register (WEB-05, cobertura D-WEB-13) | `tests/register.test.ts` | register (WEB-05 · validación antes de llamar a la API) padre válido manda id_estudiante_vinculado y parentesco | Sí |
| UT-WEB-EXTRA-197 | Validación por rol de register (WEB-05, cobertura D-WEB-13) | `tests/register.test.ts` | register (WEB-05 · validación antes de llamar a la API) docente válido manda id_especializacion y la institución si viene | Sí |
| UT-WEB-EXTRA-198 | Validación por rol de register (WEB-05, cobertura D-WEB-13) | `tests/register.test.ts` | register (WEB-05 · validación antes de llamar a la API) si la API responde con error, el detail llega al formulario | Sí |
| UT-WEB-EXTRA-199 | Validación por rol de register (WEB-05, cobertura D-WEB-13) | `tests/register.test.ts` | register (WEB-05 · validación antes de llamar a la API) DEF-WEB-05: un 422 de validación muestra el primer mensaje de la API | Sí |
| UT-WEB-EXTRA-200 | Validación por rol de register (WEB-05, cobertura D-WEB-13) | `tests/register.test.ts` | register (WEB-05 · validación antes de llamar a la API) DEF-WEB-05: un 422 en correo señala el campo email del formulario | Sí |
| UT-WEB-EXTRA-201 | Validación por rol de register (WEB-05, cobertura D-WEB-13) | `tests/register.test.ts` | register (WEB-05 · validación antes de llamar a la API) DEF-WEB-05: un 422 en password señala el campo password del formulario | Sí |
| UT-WEB-EXTRA-202 | Validación por rol de register (WEB-05, cobertura D-WEB-13) | `tests/register.test.ts` | register (WEB-05 · validación antes de llamar a la API) DEF-WEB-05: un 422 en numero_documento señala el campo docNumber del formulario | Sí |
| UT-WEB-EXTRA-203 | Validación por rol de register (WEB-05, cobertura D-WEB-13) | `tests/register.test.ts` | register (WEB-05 · validación antes de llamar a la API) DEF-WEB-05: un 422 en id_estudiante_vinculado señala el campo idEstudianteVinculado del formulario | Sí |
| UT-WEB-EXTRA-204 | Validación por rol de register (WEB-05, cobertura D-WEB-13) | `tests/register.test.ts` | register (WEB-05 · validación antes de llamar a la API) DEF-WEB-05: un error sin loc (409 en texto) no señala ningún campo | Sí |
| UT-WEB-EXTRA-205 | Validación por rol de register (WEB-05, cobertura D-WEB-13) | `tests/register.test.ts` | register (WEB-05 · validación antes de llamar a la API) DEF-WEB-05: sin cuerpo legible, indica el código HTTP en vez de un texto vacío | Sí |
| UT-WEB-EXTRA-206 | serverFetch y ApiError (WEB-INF-1) | `tests/serverFetch.test.ts` | serverFetch (WEB-INF-1) con datos: manda el token por parámetro y devuelve el JSON sin tocar | Sí |
| UT-WEB-EXTRA-207 | serverFetch y ApiError (WEB-INF-1) | `tests/serverFetch.test.ts` | serverFetch (WEB-INF-1) con lista vacía devuelve []; con un 204 devuelve null | Sí |
| UT-WEB-EXTRA-208 | serverFetch y ApiError (WEB-INF-1) | `tests/serverFetch.test.ts` | serverFetch (WEB-INF-1) con error lanza ApiError con status, mensaje legible y detail original | Sí |
| UT-WEB-EXTRA-209 | serverFetch y ApiError (WEB-INF-1) | `tests/serverFetch.test.ts` | serverFetch (WEB-INF-1) sin token no manda Authorization | Sí |
| UT-WEB-EXTRA-210 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/actionsNotasNovedadesReportes.test.ts` | Servicios · notasActions getNotasAction manda el Bearer del servidor y mapea la nota a número | Sí |
| UT-WEB-EXTRA-211 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/actionsNotasNovedadesReportes.test.ts` | Servicios · notasActions con lista vacía devuelve [] | Sí |
| UT-WEB-EXTRA-212 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/actionsNotasNovedadesReportes.test.ts` | Servicios · notasActions getEstudiantesAction arma el nombre completo o uno provisional | Sí |
| UT-WEB-EXTRA-213 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/actionsNotasNovedadesReportes.test.ts` | Servicios · notasActions createNotaAction manda el cuerpo en snake_case | Sí |
| UT-WEB-EXTRA-214 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/actionsNotasNovedadesReportes.test.ts` | Servicios · notasActions getNotasBootstrapAction junta las cuatro consultas | Sí |
| UT-WEB-EXTRA-215 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/actionsNotasNovedadesReportes.test.ts` | Servicios · notasActions un rechazo de la API devuelve su detail como error | Sí |
| UT-WEB-EXTRA-216 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/actionsNotasNovedadesReportes.test.ts` | Servicios · notasActions un 500 sin cuerpo lanza HTTP 500 | Sí |
| UT-WEB-EXTRA-217 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/actionsNotasNovedadesReportes.test.ts` | Servicios · novedadesActions getNovedadesAction cruza el estudiante por id y usa uno provisional si falta | Sí |
| UT-WEB-EXTRA-218 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/actionsNotasNovedadesReportes.test.ts` | Servicios · novedadesActions getNovedadesBootstrapAction resuelve nombre y gravedad del tipo | Sí |
| UT-WEB-EXTRA-219 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/actionsNotasNovedadesReportes.test.ts` | Servicios · novedadesActions cursos y estudiantes con lista vacía devuelven [] | Sí |
| UT-WEB-EXTRA-220 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/actionsNotasNovedadesReportes.test.ts` | Servicios · novedadesActions crear manda la fecha de hoy; actualizar solo lo informado; borrar hace DELETE | Sí |
| UT-WEB-EXTRA-221 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/actionsNotasNovedadesReportes.test.ts` | Servicios · novedadesActions un 403 lanza con su detail | Sí |
| UT-WEB-EXTRA-222 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/actionsNotasNovedadesReportes.test.ts` | Servicios · reportesActions getReportesAction mapea y completa parametros vacío | Sí |
| UT-WEB-EXTRA-223 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/actionsNotasNovedadesReportes.test.ts` | Servicios · reportesActions con lista vacía devuelve [] | Sí |
| UT-WEB-EXTRA-224 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/actionsNotasNovedadesReportes.test.ts` | Servicios · reportesActions crear, actualizar estado y borrar | Sí |
| UT-WEB-EXTRA-225 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/actionsNotasNovedadesReportes.test.ts` | Servicios · reportesActions un 404 lanza con su detail | Sí |
| UT-WEB-EXTRA-226 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/dashboardActions.test.ts` | Servicios · dashboardActions (KPI del administrador) calcula totales, promedio, aprobación, asistencia y novedades activas | Sí |
| UT-WEB-EXTRA-227 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/dashboardActions.test.ts` | Servicios · dashboardActions (KPI del administrador) arma las gráficas: estudiantes por curso, usuarios por rol y promedio por materia | Sí |
| UT-WEB-EXTRA-228 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/dashboardActions.test.ts` | Servicios · dashboardActions (KPI del administrador) sin datos devuelve ceros y promedios nulos, no lanza | Sí |
| UT-WEB-EXTRA-229 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/dashboardActions.test.ts` | Servicios · dashboardActions (KPI del administrador) si un endpoint falla (500 o sin red) esa lista cuenta como vacía | Sí |
| UT-WEB-EXTRA-230 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/dashboardActions.test.ts` | Servicios · dashboardActions (KPI del administrador) los atajos devuelven el valor del KPI y 0 si no hay dato | Sí |
| UT-WEB-EXTRA-231 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/dashboardActions.test.ts` | Servicios · dashboardActions (KPI del administrador) las series sin endpoint dedicado devuelven [] | Sí |
| UT-WEB-EXTRA-232 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/dashboardService.test.ts` | Servicios · dashboardService rutaPadre agrega id_estudiante solo cuando hay un hijo activo | Sí |
| UT-WEB-EXTRA-233 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/dashboardService.test.ts` | Servicios · dashboardService docente: mapea los contadores (cliente y servidor) | Sí |
| UT-WEB-EXTRA-234 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/dashboardService.test.ts` | Servicios · dashboardService estudiante: promedios nulos pasan a 0 | Sí |
| UT-WEB-EXTRA-235 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/dashboardService.test.ts` | Servicios · dashboardService padre: arma un hijo con el id pedido | Sí |
| UT-WEB-EXTRA-236 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/dashboardService.test.ts` | Servicios · dashboardService con error de la API o sin red el servidor devuelve null, no ceros | Sí |
| UT-WEB-EXTRA-237 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/dashboardService.test.ts` | Servicios · dashboardService con error de la API o sin red el cliente lanza un mensaje para el usuario | Sí |
| UT-WEB-EXTRA-238 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/dashboardService.test.ts` | Servicios · dashboardService los helpers heredados devuelven valores neutros | Sí |
| UT-WEB-EXTRA-239 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/horariosService.test.ts` | Servicios · horariosService getHorarios mapea a camelCase y ordena por día y hora | Sí |
| UT-WEB-EXTRA-240 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/horariosService.test.ts` | Servicios · horariosService con lista vacía devuelve [] | Sí |
| UT-WEB-EXTRA-241 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/horariosService.test.ts` | Servicios · horariosService cursos y materias activos/todos usan su consulta y mapean los campos | Sí |
| UT-WEB-EXTRA-242 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/horariosService.test.ts` | Servicios · horariosService crear curso, materia y especialización manda el cuerpo en snake_case | Sí |
| UT-WEB-EXTRA-243 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/horariosService.test.ts` | Servicios · horariosService actualizar manda solo los campos informados | Sí |
| UT-WEB-EXTRA-244 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/horariosService.test.ts` | Servicios · horariosService eliminar es una baja lógica (PUT activo=false) | Sí |
| UT-WEB-EXTRA-245 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/horariosService.test.ts` | Servicios · horariosService crear horario devuelve el id y asignar profesor lo vincula | Sí |
| UT-WEB-EXTRA-246 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/horariosService.test.ts` | Servicios · horariosService getProfesores arma el nombre y ordena alfabéticamente | Sí |
| UT-WEB-EXTRA-247 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/horariosService.test.ts` | Servicios · horariosService asignaciones: lista, crea con fecha_finalizacion nula y getAsignacionesProfesores es vacío | Sí |
| UT-WEB-EXTRA-248 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/horariosService.test.ts` | Servicios · horariosService un 422 lanza con el detail de la API | Sí |
| UT-WEB-EXTRA-249 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/horariosService.test.ts` | Servicios · horariosService un 500 lanza HTTP 500 | Sí |
| UT-WEB-EXTRA-250 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/novedadesQrService.test.ts` | Servicios · novedadesService getNovedades mapea y arma código y nombre provisionales del estudiante | Sí |
| UT-WEB-EXTRA-251 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/novedadesQrService.test.ts` | Servicios · novedadesService con lista vacía devuelve [] en novedades, tipos, cursos y estudiantes | Sí |
| UT-WEB-EXTRA-252 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/novedadesQrService.test.ts` | Servicios · novedadesService tipos, cursos y estudiantes se mapean a camelCase | Sí |
| UT-WEB-EXTRA-253 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/novedadesQrService.test.ts` | Servicios · novedadesService crear, actualizar y borrar una novedad | Sí |
| UT-WEB-EXTRA-254 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/novedadesQrService.test.ts` | Servicios · novedadesService un 403 lanza con el detail | Sí |
| UT-WEB-EXTRA-255 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/novedadesQrService.test.ts` | Servicios · qrService getQRImageUrl codifica el código y fija el tamaño | Sí |
| UT-WEB-EXTRA-256 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/reportesService.test.tsx` | Servicios · reportesService fileUrl: vacío, absoluta y relativa | Sí |
| UT-WEB-EXTRA-257 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/reportesService.test.tsx` | Servicios · reportesService validarArchivoReporte rechaza el formato y el tamaño | Sí |
| UT-WEB-EXTRA-258 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/reportesService.test.tsx` | Servicios · reportesService getReportes mapea a camelCase; con lista vacía devuelve [] | Sí |
| UT-WEB-EXTRA-259 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/reportesService.test.tsx` | Servicios · reportesService crear, actualizar y borrar un reporte | Sí |
| UT-WEB-EXTRA-260 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/reportesService.test.tsx` | Servicios · reportesService downloadReporteArchivo lanza con el detail si la API responde error | Sí |
| UT-WEB-EXTRA-261 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/reportesService.test.tsx` | Servicios · reportesService downloadReporteArchivo descarga con el nombre del Content-Disposition | Sí |
| UT-WEB-EXTRA-262 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/reportesService.test.tsx` | Servicios · themeService lee el tema guardado y, sin nada guardado, el preferido del sistema | Sí |
| UT-WEB-EXTRA-263 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/reportesService.test.tsx` | Servicios · themeService applyTheme pone la clase dark y persiste | Sí |
| UT-WEB-EXTRA-264 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/usuarioService.test.ts` | Servicios · usuarioService (perfil) getMiPerfil mapea el perfil y resuelve la foto relativa contra el backend | Sí |
| UT-WEB-EXTRA-265 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/usuarioService.test.ts` | Servicios · usuarioService (perfil) getMiPerfil devuelve null si la API falla | Sí |
| UT-WEB-EXTRA-266 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/usuarioService.test.ts` | Servicios · usuarioService (perfil) updateMiPerfil manda solo los campos informados | Sí |
| UT-WEB-EXTRA-267 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/usuarioService.test.ts` | Servicios · usuarioService (perfil) uploadAvatar acepta un texto o un objeto con la URL | Sí |
| UT-WEB-EXTRA-268 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/usuarioService.test.ts` | Servicios · usuarioService (perfil) getAvatarUrl no inventa una URL | Sí |
| UT-WEB-EXTRA-269 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/usuarioService.test.ts` | Servicios · usuarioService (perfil) getMiPerfilProfesor busca al profesor por idUsuario en la lista y trae sus especializaciones | Sí |
| UT-WEB-EXTRA-270 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/usuarioService.test.ts` | Servicios · usuarioService (perfil) getMiPerfilProfesor devuelve null si no hay fila para ese usuario o falla la API | Sí |
| UT-WEB-EXTRA-271 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/usuarioService.test.ts` | Servicios · usuarioService (perfil) getMiPerfilAdmin busca en la lista; null si no está | Sí |
| UT-WEB-EXTRA-272 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/usuarioService.test.ts` | Servicios · usuarioService (perfil) actualizar profesor y administrador usa snake_case | Sí |
| UT-WEB-EXTRA-273 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/usuarioService.test.ts` | Servicios · usuarioService (perfil) insertAdminPerfil crea el perfil Activo con la fecha de hoy | Sí |
| UT-WEB-EXTRA-274 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/usuarioService.test.ts` | Servicios · usuarioService (perfil) getMiEPS usa /estudiantes/me y luego /ips; [] si no hay estudiante o falla | Sí |
| UT-WEB-EXTRA-275 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/usuarioService.test.ts` | Servicios · usuarioService (perfil) upsertMiEPS manda la afiliación activa con fecha de hoy | Sí |
| UT-WEB-EXTRA-276 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/usuarioService.test.ts` | Servicios · usuarioService (perfil) getMiEstudianteInfo devuelve id y curso; null si la lista viene vacía | Sí |
| UT-WEB-EXTRA-277 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/usuarioService.test.ts` | Servicios · usuarioService (perfil) updateEstudianteCurso y getCursosParaPerfil | Sí |
| UT-WEB-EXTRA-278 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/usuariosService.test.ts` | Servicios · usuariosService getUsuarios pide los activos y agrega el nombre del rol | Sí |
| UT-WEB-EXTRA-279 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/usuariosService.test.ts` | Servicios · usuariosService getPendingUsuarios pide los inactivos y con lista vacía devuelve [] | Sí |
| UT-WEB-EXTRA-280 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/usuariosService.test.ts` | Servicios · usuariosService getUsuarioById devuelve el usuario y null si la API falla | Sí |
| UT-WEB-EXTRA-281 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/usuariosService.test.ts` | Servicios · usuariosService createUsuario manda el cuerpo en snake_case con nulos para lo opcional | Sí |
| UT-WEB-EXTRA-282 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/usuariosService.test.ts` | Servicios · usuariosService updateUsuario manda solo lo que cambió | Sí |
| UT-WEB-EXTRA-283 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/usuariosService.test.ts` | Servicios · usuariosService toggleUsuarioEstado manda el estado como query param | Sí |
| UT-WEB-EXTRA-284 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/usuariosService.test.ts` | Servicios · usuariosService validarUsuario cambia el rol y luego activa | Sí |
| UT-WEB-EXTRA-285 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/usuariosService.test.ts` | Servicios · usuariosService deleteUsuario y rechazarUsuario hacen DELETE | Sí |
| UT-WEB-EXTRA-286 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/usuariosService.test.ts` | Servicios · usuariosService un 409 por correo duplicado lanza con el detail | Sí |
| UT-WEB-EXTRA-287 | Prueba no planeada | `tests/usuariosActions.test.ts` | usuarios · el motivo de la API llega como valor (DEF-WEB-10) crear con un correo repetido devuelve el motivo y no lanza | Sí |
| UT-WEB-EXTRA-288 | Prueba no planeada | `tests/usuariosActions.test.ts` | usuarios · el motivo de la API llega como valor (DEF-WEB-10) crear con datos inválidos (422) devuelve el primer mensaje de validación | Sí |
| UT-WEB-EXTRA-289 | Prueba no planeada | `tests/usuariosActions.test.ts` | usuarios · el motivo de la API llega como valor (DEF-WEB-10) un error del servidor (5xx) se sigue lanzando | Sí |
| UT-WEB-EXTRA-290 | Prueba no planeada | `tests/usuariosActions.test.ts` | usuarios · el motivo de la API llega como valor (DEF-WEB-10) editar con un dato rechazado devuelve el motivo | Sí |
| UT-WEB-EXTRA-291 | Prueba no planeada | `tests/usuariosActions.test.ts` | usuarios · el motivo de la API llega como valor (DEF-WEB-10) cuando todo sale bien no devuelve error | Sí |

## Pruebas de contrato (PR-05)

| ID | Corrección | Archivo | Caso | Pasa |
|---|---|---|---|---|
| IT-WEB-01 | WEB-04 · contrato con la API | `tests/permissions.test.ts` | contrato PERMISSIONS ↔ roles de la API PERMISSIONS no concede nada que la API rechace (0 diferencias) | Sí |
| IT-WEB-02 | WEB-03 · contrato /padres/me/hijos | `tests/asociadoActions.test.ts` | asociadoActions (WEB-03 · IT-WEB-02) si /padres/me/hijos responde 404, usa /padres/me y devuelve un solo hijo | Sí |
| IT-WEB-02 | WEB-03 · contrato /padres/me/hijos | `tests/asociadoActions.test.ts` | asociadoActions (WEB-03 · IT-WEB-02) si /padres/me/hijos responde 500, no usa /padres/me y propaga el error | Sí |
| IT-WEB-02 | WEB-03 · contrato /padres/me/hijos | `tests/asociadoActions.test.ts` | asociadoActions (WEB-03 · IT-WEB-02) con /padres/me/hijos disponible, no llama a /padres/me | Sí |
| IT-WEB-02 | WEB-03 · contrato /padres/me/hijos | `tests/asociadoActions.test.ts` | asociadoActions (WEB-03 · IT-WEB-02) getHijosAction llama GET /padres/me/hijos y devuelve los hijos en camelCase | Sí |
| IT-WEB-02 | WEB-03 · contrato /padres/me/hijos | `tests/asociadoActions.test.ts` | asociadoActions (WEB-03 · IT-WEB-02) DEF-WEB-03: el nombre y el documento salen de nombre_estudiante y documento_estudiante | Sí |
| IT-WEB-02 | WEB-03 · contrato /padres/me/hijos | `tests/asociadoActions.test.ts` | asociadoActions (WEB-03 · IT-WEB-02) DEF-WEB-03: también acepta nombre y documento sin sufijo, y sin nombre usa el respaldo | Sí |
| IT-WEB-02 | WEB-03 · contrato /padres/me/hijos | `tests/asociadoActions.test.ts` | asociadoActions (WEB-03 · IT-WEB-02) con el hijo 11 llama /padres/me/hijos y luego /estudiantes/11/notas | Sí |
| IT-WEB-02 | WEB-03 · contrato /padres/me/hijos | `tests/asociadoActions.test.ts` | asociadoActions (WEB-03 · IT-WEB-02) sin id pedido usa el primer hijo (10) | Sí |
| IT-WEB-02 | WEB-03 · contrato /padres/me/hijos | `tests/asociadoActions.test.ts` | asociadoActions (WEB-03 · IT-WEB-02) un padre sin hijos recibe info null y no pide notas | Sí |
| IT-WEB-02 | WEB-03 · contrato /padres/me/hijos | `tests/asociadoActions.test.ts` | asociadoActions (WEB-03 · IT-WEB-02) horario del padre muestra error si /estudiantes/{id} falla | Sí |
| IT-WEB-02 | WEB-03 · contrato /padres/me/hijos | `tests/asociadoActions.test.ts` | asociadoActions (WEB-03 · IT-WEB-02) horario del padre muestra error si /horarios falla | Sí |
| IT-WEB-02 | WEB-03 · contrato /padres/me/hijos | `tests/asociadoActions.test.ts` | asociadoActions (WEB-03 · IT-WEB-02) horario del padre sin curso asignado no es un error | Sí |
| IT-WEB-02 | WEB-03 · contrato /padres/me/hijos | `tests/asociadoActions.test.ts` | asociadoActions (WEB-03 · IT-WEB-02) si la API falla, el error llega con el detail para mostrarlo | Sí |
| IT-WEB-03 | R-07 · contrato real | `tests/integration/contrato-api.int.test.ts` | IT-WEB-03 · contrato de lectura por rol admin: usuarios, asistencia del día y reportes | Omitida |
| IT-WEB-03 | R-07 · contrato real | `tests/integration/contrato-api.int.test.ts` | IT-WEB-03 · contrato de lectura por rol docente: notas, novedades, horarios y asignaciones | Omitida |
| IT-WEB-03 | R-07 · contrato real | `tests/integration/contrato-api.int.test.ts` | IT-WEB-03 · contrato de lectura por rol estudiante: notas, novedades y horario del estudiante asociado | Omitida |
| IT-WEB-03 | R-07 · contrato real | `tests/integration/contrato-api.int.test.ts` | IT-WEB-03 · contrato de lectura por rol padre: notas, novedades y horario del estudiante asociado | Omitida |
| IT-WEB-03 | R-07 · contrato real | `tests/integration/contrato-api.int.test.ts` | IT-WEB-03 · contrato de lectura por rol padre: los hijos de /padres/me/hijos llegan con su nombre real, no con el respaldo | Omitida |
| IT-WEB-04 | CP-INT-060 desde la web | `tests/integration/contrato-api.int.test.ts` | IT-WEB-04 · inicio del estudiante (BE-03) GET /dashboard/estudiante responde 200 y el inicio carga | Omitida |
| IT-WEB-05 | Errores de la API | `tests/integration/contrato-api.int.test.ts` | IT-WEB-05 · errores reales de la API llegan como mensaje 401: sin token | Omitida |
| IT-WEB-05 | Errores de la API | `tests/integration/contrato-api.int.test.ts` | IT-WEB-05 · errores reales de la API llegan como mensaje 403: un padre pide la lista de usuarios | Omitida |
| IT-WEB-05 | Errores de la API | `tests/integration/contrato-api.int.test.ts` | IT-WEB-05 · errores reales de la API llegan como mensaje 404: un recurso que no existe | Omitida |
| IT-WEB-05 | Errores de la API | `tests/integration/contrato-api.int.test.ts` | IT-WEB-05 · errores reales de la API llegan como mensaje 422: cuerpo inválido, con el primer mensaje de validación | Omitida |

## Casos de sistema E2E (PR-06)

De los JUnit de Playwright `evidencias/PR-06/web/E25_e2e-local.xml`, `evidencias/PR-06/web/E26_usuarios-firefox.xml`, `evidencias/PR-06/web/E27_qr-camara-jsqr.xml`, `evidencias/PR-06/web/E28_iconos.xml` (para el mismo caso y navegador manda la corrida más nueva).

| CP-SIS | Spec | Navegador | Caso | Pasa | Corrida |
|---|---|---|---|---|---|
| CP-SIS-040 | `e2e/asistencia.spec.ts` | chromium | CP-SIS-040 · el registro del día filtra por jornada y curso, y avisa si no hay datos | Sí | E25_e2e-local |
| CP-SIS-040 | `e2e/asistencia.spec.ts` | chromium | CP-SIS-040 · con la API caída el registro del día avisa y deja reintentar | Sí | E25_e2e-local |
| CP-SIS-064 | `e2e/asistencia.spec.ts` | chromium | CP-SIS-064 · el docente no ve la acción de borrar asistencia; el admin sí | Sí | E25_e2e-local |
| CP-SIS-051, 054 | `e2e/boletin-padre.spec.ts` | chromium | boletín del padre (WEB-09) › el padre descarga un PDF | Sí | E25_e2e-local |
| CP-SIS-051, 054 | `e2e/boletin-padre.spec.ts` | chromium | boletín del padre (WEB-09) › un periodo sin notas muestra el texto exacto del criterio de aceptación | Sí | E25_e2e-local |
| CP-SIS-058 | `e2e/horario.spec.ts` | chromium | CP-SIS-058 · el estudiante ve las clases de su curso por día y franja | Sí | E25_e2e-local |
| CP-SIS-058 | `e2e/horario.spec.ts` | chromium | CP-SIS-058 · un estudiante de un curso sin horario ve un aviso | Sí | E25_e2e-local |
| CP-SIS-059 | `e2e/horario.spec.ts` | chromium | CP-SIS-059 · el docente ve solo sus clases | Sí | E25_e2e-local |
| CP-SIS-059 | `e2e/horario.spec.ts` | chromium | CP-SIS-059 · un docente sin asignaciones ve un aviso | Sí | E25_e2e-local |
| CP-SIS-058, CP-SIS-059 | `e2e/horario.spec.ts` | chromium | CP-SIS-058 y 059 · con la API caída el horario avisa y deja reintentar | Sí | E25_e2e-local |
| CP-SIS-002 | `e2e/login-errores.spec.ts` | chromium | CP-SIS-002 · contraseña errada y correo inexistente dan el mismo mensaje genérico | Sí | E25_e2e-local |
| CP-SIS-003 | `e2e/login-errores.spec.ts` | chromium | CP-SIS-003 · con el correo o la contraseña vacíos no se envía y lo indica | Sí | E25_e2e-local |
| CP-SIS-005 | `e2e/login-errores.spec.ts` | chromium | CP-SIS-005 · con la API caída el login avisa y deja reintentar | Sí | E25_e2e-local |
| CP-SIS-007 | `e2e/login-errores.spec.ts` | chromium | CP-SIS-007 · el padre no entra por URL a módulos de otros roles | Sí | E25_e2e-local |
| CP-SIS-008 | `e2e/login-errores.spec.ts` | chromium | CP-SIS-008 · con la API caída el inicio muestra un error y deja reintentar | Sí | E25_e2e-local |
| CP-SIS-010 | `e2e/login-errores.spec.ts` | chromium | CP-SIS-010 · al cerrar sesión, «atrás» no devuelve al panel | Sí | E25_e2e-local |
| CP-SIS-001, 006 | `e2e/login-roles.spec.ts` | chromium | inicio de sesión · admin › el admin llega a su inicio con los datos cargados | Sí | E25_e2e-local |
| CP-SIS-001, 006 | `e2e/login-roles.spec.ts` | chromium | inicio de sesión · admin › el menú del admin solo trae los módulos de su rol | Sí | E25_e2e-local |
| CP-SIS-001, 006 | `e2e/login-roles.spec.ts` | chromium | inicio de sesión · docente › el docente llega a su inicio con los datos cargados | Sí | E25_e2e-local |
| CP-SIS-001, 006 | `e2e/login-roles.spec.ts` | chromium | inicio de sesión · docente › el menú del docente solo trae los módulos de su rol | Sí | E25_e2e-local |
| CP-SIS-001, 006 | `e2e/login-roles.spec.ts` | chromium | inicio de sesión · estudiante › el estudiante llega a su inicio con los datos cargados | Sí | E25_e2e-local |
| CP-SIS-001, 006 | `e2e/login-roles.spec.ts` | chromium | inicio de sesión · estudiante › el menú del estudiante solo trae los módulos de su rol | Sí | E25_e2e-local |
| CP-SIS-001, 006 | `e2e/login-roles.spec.ts` | chromium | inicio de sesión · padre › el padre llega a su inicio con los datos cargados | Sí | E25_e2e-local |
| CP-SIS-001, 006 | `e2e/login-roles.spec.ts` | chromium | inicio de sesión · padre › el menú del padre solo trae los módulos de su rol | Sí | E25_e2e-local |
| CP-SIS-042 | `e2e/notas.spec.ts` | chromium | CP-SIS-042 · el docente registra 4.5 y se guarda por estudiante, materia y periodo | Sí | E25_e2e-local |
| CP-SIS-043 | `e2e/notas.spec.ts` | chromium | CP-SIS-043 · una nota fuera de rango no se guarda | Sí | E25_e2e-local |
| CP-SIS-044 | `e2e/notas.spec.ts` | chromium | CP-SIS-044 · sin materia no se guarda (el periodo siempre trae uno elegido) | Sí | E25_e2e-local |
| CP-SIS-045 | `e2e/notas.spec.ts` | chromium | CP-SIS-045 · el promedio se recalcula al registrar y al editar, sin recargar | Sí | E25_e2e-local |
| CP-SIS-046 | `e2e/notas.spec.ts` | chromium | CP-SIS-046 · con la API caída, guardar avisa y deja reintentar | Sí | E25_e2e-local |
| CP-SIS-050 | `e2e/notas.spec.ts` | chromium | CP-SIS-050 · el estudiante consulta sus notas por periodo y ve un aviso en un periodo sin notas | Sí | E25_e2e-local |
| CP-SIS-047 | `e2e/novedades.spec.ts` | chromium | CP-SIS-047 · el docente registra una novedad y su gravedad corresponde al tipo | Sí | E25_e2e-local |
| CP-SIS-048 | `e2e/novedades.spec.ts` | chromium | CP-SIS-048 · sin descripción no se guarda | Sí | E25_e2e-local |
| CP-SIS-049 | `e2e/novedades.spec.ts` | chromium | CP-SIS-049 · el historial de un estudiante sale solo con sus novedades y ordenado por fecha | Sí | E25_e2e-local |
| CP-SIS-060 | `e2e/padre-dos-hijos.spec.ts` | chromium | el padre de prueba cambia de hijo y cambian notas, asistencia y novedades | Sí | E25_e2e-local |
| CP-SIS-060 | `e2e/padre-dos-hijos.spec.ts` | chromium | un padre con un solo hijo no ve el selector | Sí | E25_e2e-local |
| CP-SIS-052 | `e2e/padre.spec.ts` | chromium | CP-SIS-052 · el padre ve la asistencia de su hijo por fecha y tipo | Sí | E25_e2e-local |
| CP-SIS-052 | `e2e/padre.spec.ts` | chromium | CP-SIS-052 · con la API caída la asistencia del hijo avisa y deja reintentar | Sí | E25_e2e-local |
| CP-SIS-053 | `e2e/padre.spec.ts` | chromium | CP-SIS-053 · el padre ve las novedades de su hijo, o un aviso si no tiene | Sí | E25_e2e-local |
| CP-SIS-061 | `e2e/padre.spec.ts` | chromium | CP-SIS-061 · un padre sin hijos vinculados ve «No hay estudiantes vinculados» | Sí | E25_e2e-local |
| CP-SIS-009 | `e2e/perfil.spec.ts` | chromium | CP-SIS-009 · el perfil del admin muestra sus datos y su rol | Sí | E25_e2e-local |
| CP-SIS-009 | `e2e/perfil.spec.ts` | chromium | CP-SIS-009 · el perfil del docente muestra sus datos y su rol | Sí | E25_e2e-local |
| CP-SIS-009 | `e2e/perfil.spec.ts` | chromium | CP-SIS-009 · el perfil del estudiante muestra sus datos y su rol | Sí | E25_e2e-local |
| CP-SIS-009 | `e2e/perfil.spec.ts` | chromium | CP-SIS-009 · el perfil del padre muestra sus datos y su rol | Sí | E25_e2e-local |
| CP-SIS-033 | `e2e/qr-camara-invalido.spec.ts` | chromium | CP-SIS-033 · un QR inválido muestra un error claro y no registra | Sí | E27_qr-camara-jsqr |
| CP-SIS-032, CP-SIS-034 | `e2e/qr-camara.spec.ts` | chromium | con un QR de estudiante › CP-SIS-032 y 034 · registra la entrada y bloquea una segunda entrada | Sí | E27_qr-camara-jsqr |
| CP-SIS-035, CP-SIS-036 | `e2e/qr-camara.spec.ts` | chromium | con un QR de estudiante › CP-SIS-035 y 036 · registra la salida y bloquea una segunda salida | Sí | E27_qr-camara-jsqr |
| CP-SIS-029 | `e2e/qr.spec.ts` | chromium | CP-SIS-029 · el estudiante ve el QR de su código con su nombre | Sí | E27_qr-camara-jsqr |
| CP-SIS-031 | `e2e/qr.spec.ts` | chromium | CP-SIS-031 · el padre no puede ver el QR de un estudiante | Sí | E27_qr-camara-jsqr |
| CP-SIS-031 | `e2e/qr.spec.ts` | chromium | CP-SIS-031 · el docente no puede ver el QR de un estudiante | Sí | E27_qr-camara-jsqr |
| CP-SIS-015 | `e2e/recuperacion.spec.ts` | chromium | CP-SIS-015 · pedir recuperación con un correo registrado y con uno no registrado da el mismo mensaje | Sí | E25_e2e-local |
| CP-SIS-016 | `e2e/recuperacion.spec.ts` | chromium | CP-SIS-016 · restablecer con el enlace del correo | Omitida | E25_e2e-local |
| CP-SIS-017 | `e2e/recuperacion.spec.ts` | chromium | CP-SIS-017 · una contraseña débil se rechaza antes de enviar y dice qué regla falta | Sí | E25_e2e-local |
| CP-SIS-018 | `e2e/recuperacion.spec.ts` | chromium | CP-SIS-018 · un enlace de recuperación ya usado | Omitida | E25_e2e-local |
| CP-SIS-037, 038, 039, 041 | `e2e/registro-masivo.spec.ts` | chromium | registro masivo (WEB-06) › la segunda vez con el mismo curso, todos salen «ya registrado» | Sí | E25_e2e-local |
| CP-SIS-037, 038, 039, 041 | `e2e/registro-masivo.spec.ts` | chromium | registro masivo (WEB-06) › con la red cortada, los fallidos se listan por nombre con Reintentar y Descartar | Sí | E25_e2e-local |
| CP-SIS-014 | `e2e/registro-padre.spec.ts` | chromium | un correo rechazado por la API muestra el motivo junto al campo (DEF-WEB-05) | Sí | E25_e2e-local |
| CP-SIS-014 | `e2e/registro-padre.spec.ts` | chromium | el padre que se registra ve los datos de su hijo vinculado | Sí | E25_e2e-local |
| CP-SIS-011 | `e2e/registro.spec.ts` | chromium | CP-SIS-011 · un estudiante se registra con todos los datos y puede iniciar sesión | Sí | E25_e2e-local |
| CP-SIS-012 | `e2e/registro.spec.ts` | chromium | CP-SIS-012 · un correo ya registrado, también en mayúsculas, no crea otra cuenta | Sí | E25_e2e-local |
| CP-SIS-013 | `e2e/registro.spec.ts` | chromium | CP-SIS-013 · con un campo obligatorio vacío no se registra e indica el campo | Sí | E25_e2e-local |
| CP-SIS-056 | `e2e/reportes.spec.ts` | chromium | CP-SIS-056 · el admin crea un reporte de asistencia con un PDF y lo descarga | Sí | E25_e2e-local |
| CP-SIS-057 | `e2e/reportes.spec.ts` | chromium | CP-SIS-057 · un filtro sin datos muestra un aviso | Sí | E25_e2e-local |
| CP-SIS-057 | `e2e/reportes.spec.ts` | chromium | CP-SIS-057 · con la API caída los reportes avisan y dejan reintentar | Sí | E25_e2e-local |
| CP-SIS-004, 065 | `e2e/sesion.spec.ts` | chromium | sesión (WEB-01) › con 31 minutos sin actividad se cierra la sesión y vuelve al inicio de sesión | Sí | E25_e2e-local |
| CP-SIS-004, 065 | `e2e/sesion.spec.ts` | chromium | sesión (WEB-01) › con el acceso vencido y un refresco válido la sesión se renueva sola | Sí | E25_e2e-local |
| CP-SIS-004, 065 | `e2e/sesion.spec.ts` | chromium | sesión (WEB-01) › el token de acceso no se puede leer desde JavaScript | Sí | E25_e2e-local |
| CP-SIS-065 | `e2e/sesion.spec.ts` | chromium | sesión (WEB-01) › a escala (QA con SESSION_IDLE_MINUTES=1) › una sesión usada durante 4 minutos con actividad cada 15 s sigue funcionando (CP-SIS-065) | Sí | E25_e2e-local |
| CP-SIS-004, 065 | `e2e/sesion.spec.ts` | chromium | sesión (WEB-01) › a escala (QA con SESSION_IDLE_MINUTES=1) › 70 s sin actividad cierran la sesión (equivale a los 31 min de la regla real) | Sí | E25_e2e-local |
| CP-SIS-004, 065 | `e2e/sesion.spec.ts` | chromium | una ruta del panel sin sesión pide iniciar sesión | Sí | E25_e2e-local |
| CP-SIS-019, 021, 022, 025, 027, 028 | `e2e/usuarios.spec.ts` | chromium | gestión de usuarios (admin) › crear, filtrar, editar y eliminar un docente de prueba | Sí | E25_e2e-local |
| CP-SIS-021 | `e2e/usuarios.spec.ts` | chromium | gestión de usuarios (admin) › crear con un campo vacío no guarda e indica el campo (CP-SIS-021) | Sí | E25_e2e-local |
| CP-SIS-028 | `e2e/usuarios.spec.ts` | chromium | gestión de usuarios (admin) › un filtro sin coincidencias muestra un mensaje informativo (CP-SIS-028) | Sí | E25_e2e-local |
| CP-SIS-020 | `e2e/usuarios.spec.ts` | chromium | gestión de usuarios · errores (WC-05) › CP-SIS-020 · crear con un correo ya registrado no guarda | Sí | E25_e2e-local |
| CP-SIS-023 | `e2e/usuarios.spec.ts` | chromium | gestión de usuarios · errores (WC-05) › CP-SIS-023 · al editar, el correo está bloqueado y no se puede poner el de otro usuario | Sí | E25_e2e-local |
| CP-SIS-024 | `e2e/usuarios.spec.ts` | chromium | gestión de usuarios · errores (WC-05) › CP-SIS-024 · editar dejando el nombre vacío no guarda | Sí | E25_e2e-local |
| CP-SIS-026 | `e2e/usuarios.spec.ts` | chromium | gestión de usuarios · errores (WC-05) › CP-SIS-026 · eliminar con la API caída avisa que no se pudo y no elimina | Sí | E25_e2e-local |
| CP-SIS-027 | `e2e/usuarios.spec.ts` | chromium | gestión de usuarios · errores (WC-05) › CP-SIS-027 · filtrar por rol y por nombre; el estado se ve por secciones | Sí | E25_e2e-local |
| CP-SIS-028 | `e2e/usuarios.spec.ts` | chromium | gestión de usuarios · errores (WC-05) › CP-SIS-028 · con la API caída la lista avisa y deja reintentar | Sí | E25_e2e-local |
| WC-06 | `e2e/wc06-accesibilidad.spec.ts` | chromium | WC-06 axe · login-y-registro sin violaciones serias ni críticas | Sí | E25_e2e-local |
| WC-06 | `e2e/wc06-accesibilidad.spec.ts` | chromium | WC-06 axe · registro-modal sin violaciones serias ni críticas | Sí | E25_e2e-local |
| WC-06 | `e2e/wc06-accesibilidad.spec.ts` | chromium | WC-06 axe · usuarios-y-modal sin violaciones serias ni críticas | Sí | E25_e2e-local |
| WC-06 | `e2e/wc06-accesibilidad.spec.ts` | chromium | WC-06 axe · qr-escanear-docente sin violaciones serias ni críticas | Sí | E25_e2e-local |
| WC-06 | `e2e/wc06-accesibilidad.spec.ts` | chromium | WC-06 axe · notas-padre sin violaciones serias ni críticas | Sí | E25_e2e-local |
| WC-06 | `e2e/wc06-accesibilidad.spec.ts` | chromium | WC-06 axe · reset-password sin violaciones serias ni críticas | Sí | E25_e2e-local |
| WC-06 | `e2e/wc06-manuales.spec.ts` | chromium | WC-06 bloque 5 · con la API caída, descargar el boletín avisa y no baja un archivo dañado | Sí | E27_qr-camara-jsqr |
| WC-06 | `e2e/wc06-manuales.spec.ts` | chromium | cámara sin permiso › WC-06 bloque 4 · si se niega la cámara, el escáner lo dice con claridad | Sí | E27_qr-camara-jsqr |
| WC-06 | `e2e/wc06-responsive.spec.ts` | chromium | WC-06 responsive · portada a 375px sin desborde | Sí | E25_e2e-local |
| WC-06 | `e2e/wc06-responsive.spec.ts` | chromium | WC-06 responsive · portada a 768px sin desborde | Sí | E25_e2e-local |
| WC-06 | `e2e/wc06-responsive.spec.ts` | chromium | WC-06 responsive · portada a 1920px sin desborde | Sí | E25_e2e-local |
| WC-06 | `e2e/wc06-responsive.spec.ts` | chromium | WC-06 responsive · inicio-docente a 375px sin desborde | Sí | E25_e2e-local |
| WC-06 | `e2e/wc06-responsive.spec.ts` | chromium | WC-06 responsive · inicio-docente a 768px sin desborde | Sí | E25_e2e-local |
| WC-06 | `e2e/wc06-responsive.spec.ts` | chromium | WC-06 responsive · inicio-docente a 1920px sin desborde | Sí | E25_e2e-local |
| WC-06 | `e2e/wc06-responsive.spec.ts` | chromium | WC-06 responsive · notas-docente a 375px sin desborde | Sí | E25_e2e-local |
| WC-06 | `e2e/wc06-responsive.spec.ts` | chromium | WC-06 responsive · notas-docente a 768px sin desborde | Sí | E25_e2e-local |
| WC-06 | `e2e/wc06-responsive.spec.ts` | chromium | WC-06 responsive · notas-docente a 1920px sin desborde | Sí | E25_e2e-local |
| WC-06 | `e2e/wc06-responsive.spec.ts` | chromium | WC-06 responsive · usuarios-admin a 375px sin desborde | Sí | E25_e2e-local |
| WC-06 | `e2e/wc06-responsive.spec.ts` | chromium | WC-06 responsive · usuarios-admin a 768px sin desborde | Sí | E25_e2e-local |
| WC-06 | `e2e/wc06-responsive.spec.ts` | chromium | WC-06 responsive · usuarios-admin a 1920px sin desborde | Sí | E25_e2e-local |
| WC-06 | `e2e/wc06-responsive.spec.ts` | chromium | WC-06 responsive · asistencia-padre a 375px sin desborde | Sí | E25_e2e-local |
| WC-06 | `e2e/wc06-responsive.spec.ts` | chromium | WC-06 responsive · asistencia-padre a 768px sin desborde | Sí | E25_e2e-local |
| WC-06 | `e2e/wc06-responsive.spec.ts` | chromium | WC-06 responsive · asistencia-padre a 1920px sin desborde | Sí | E25_e2e-local |
| WC-06 | `e2e/wc06-responsive.spec.ts` | chromium | WC-06 responsive · el aviso de cookies no tapa «CREAR CUENTA» a 375×812 | Sí | E25_e2e-local |
| WC-06 | `e2e/wc06-responsive.spec.ts` | chromium | WC-06 responsive · el aviso de cookies no tapa «CREAR CUENTA» a 1280×720 | Sí | E25_e2e-local |
| WC-06 | `e2e/wc06-responsive.spec.ts` | chromium | WC-06 responsive · el aviso de cookies no tapa «CREAR CUENTA» a 1920×1080 | Sí | E25_e2e-local |
| WC-06 | `e2e/wc06-responsive.spec.ts` | chromium | WC-06 responsive · el aviso de cookies no tapa «ENTRAR» a 375×812 | Sí | E25_e2e-local |
| WC-06 | `e2e/wc06-responsive.spec.ts` | chromium | WC-06 responsive · el aviso de cookies no tapa «ENTRAR» a 1280×720 | Sí | E25_e2e-local |
| CP-NF-013 | `e2e/wc06-seguridad.spec.ts` | chromium | CP-NF-013 · eys_access y eys_refresh son HttpOnly y Secure; eys_user no lleva el token | Sí | E25_e2e-local |
| WC-06 | `e2e/wc06-seguridad.spec.ts` | chromium | WC-06 · las respuestas traen CSP, anti-clickjacking, nosniff, Referrer-Policy, Permissions-Policy y HSTS | Sí | E25_e2e-local |
| CP-SIS-040 | `e2e/asistencia.spec.ts` | firefox | CP-SIS-040 · el registro del día filtra por jornada y curso, y avisa si no hay datos | Sí | E25_e2e-local |
| CP-SIS-040 | `e2e/asistencia.spec.ts` | firefox | CP-SIS-040 · con la API caída el registro del día avisa y deja reintentar | Sí | E25_e2e-local |
| CP-SIS-064 | `e2e/asistencia.spec.ts` | firefox | CP-SIS-064 · el docente no ve la acción de borrar asistencia; el admin sí | Sí | E25_e2e-local |
| CP-SIS-051, 054 | `e2e/boletin-padre.spec.ts` | firefox | boletín del padre (WEB-09) › el padre descarga un PDF | Sí | E25_e2e-local |
| CP-SIS-051, 054 | `e2e/boletin-padre.spec.ts` | firefox | boletín del padre (WEB-09) › un periodo sin notas muestra el texto exacto del criterio de aceptación | Sí | E25_e2e-local |
| CP-SIS-058 | `e2e/horario.spec.ts` | firefox | CP-SIS-058 · el estudiante ve las clases de su curso por día y franja | Sí | E25_e2e-local |
| CP-SIS-058 | `e2e/horario.spec.ts` | firefox | CP-SIS-058 · un estudiante de un curso sin horario ve un aviso | Sí | E25_e2e-local |
| CP-SIS-059 | `e2e/horario.spec.ts` | firefox | CP-SIS-059 · el docente ve solo sus clases | Sí | E25_e2e-local |
| CP-SIS-059 | `e2e/horario.spec.ts` | firefox | CP-SIS-059 · un docente sin asignaciones ve un aviso | Sí | E25_e2e-local |
| CP-SIS-058, CP-SIS-059 | `e2e/horario.spec.ts` | firefox | CP-SIS-058 y 059 · con la API caída el horario avisa y deja reintentar | Sí | E25_e2e-local |
| CP-SIS-002 | `e2e/login-errores.spec.ts` | firefox | CP-SIS-002 · contraseña errada y correo inexistente dan el mismo mensaje genérico | Sí | E25_e2e-local |
| CP-SIS-003 | `e2e/login-errores.spec.ts` | firefox | CP-SIS-003 · con el correo o la contraseña vacíos no se envía y lo indica | Sí | E25_e2e-local |
| CP-SIS-005 | `e2e/login-errores.spec.ts` | firefox | CP-SIS-005 · con la API caída el login avisa y deja reintentar | Sí | E25_e2e-local |
| CP-SIS-007 | `e2e/login-errores.spec.ts` | firefox | CP-SIS-007 · el padre no entra por URL a módulos de otros roles | Sí | E25_e2e-local |
| CP-SIS-008 | `e2e/login-errores.spec.ts` | firefox | CP-SIS-008 · con la API caída el inicio muestra un error y deja reintentar | Sí | E25_e2e-local |
| CP-SIS-010 | `e2e/login-errores.spec.ts` | firefox | CP-SIS-010 · al cerrar sesión, «atrás» no devuelve al panel | Sí | E25_e2e-local |
| CP-SIS-001, 006 | `e2e/login-roles.spec.ts` | firefox | inicio de sesión · admin › el admin llega a su inicio con los datos cargados | Sí | E25_e2e-local |
| CP-SIS-001, 006 | `e2e/login-roles.spec.ts` | firefox | inicio de sesión · admin › el menú del admin solo trae los módulos de su rol | Sí | E25_e2e-local |
| CP-SIS-001, 006 | `e2e/login-roles.spec.ts` | firefox | inicio de sesión · docente › el docente llega a su inicio con los datos cargados | Sí | E25_e2e-local |
| CP-SIS-001, 006 | `e2e/login-roles.spec.ts` | firefox | inicio de sesión · docente › el menú del docente solo trae los módulos de su rol | Sí | E25_e2e-local |
| CP-SIS-001, 006 | `e2e/login-roles.spec.ts` | firefox | inicio de sesión · estudiante › el estudiante llega a su inicio con los datos cargados | Sí | E25_e2e-local |
| CP-SIS-001, 006 | `e2e/login-roles.spec.ts` | firefox | inicio de sesión · estudiante › el menú del estudiante solo trae los módulos de su rol | Sí | E25_e2e-local |
| CP-SIS-001, 006 | `e2e/login-roles.spec.ts` | firefox | inicio de sesión · padre › el padre llega a su inicio con los datos cargados | Sí | E25_e2e-local |
| CP-SIS-001, 006 | `e2e/login-roles.spec.ts` | firefox | inicio de sesión · padre › el menú del padre solo trae los módulos de su rol | Sí | E25_e2e-local |
| CP-SIS-042 | `e2e/notas.spec.ts` | firefox | CP-SIS-042 · el docente registra 4.5 y se guarda por estudiante, materia y periodo | Sí | E25_e2e-local |
| CP-SIS-043 | `e2e/notas.spec.ts` | firefox | CP-SIS-043 · una nota fuera de rango no se guarda | Sí | E25_e2e-local |
| CP-SIS-044 | `e2e/notas.spec.ts` | firefox | CP-SIS-044 · sin materia no se guarda (el periodo siempre trae uno elegido) | Sí | E25_e2e-local |
| CP-SIS-045 | `e2e/notas.spec.ts` | firefox | CP-SIS-045 · el promedio se recalcula al registrar y al editar, sin recargar | Sí | E25_e2e-local |
| CP-SIS-046 | `e2e/notas.spec.ts` | firefox | CP-SIS-046 · con la API caída, guardar avisa y deja reintentar | Sí | E25_e2e-local |
| CP-SIS-050 | `e2e/notas.spec.ts` | firefox | CP-SIS-050 · el estudiante consulta sus notas por periodo y ve un aviso en un periodo sin notas | Sí | E25_e2e-local |
| CP-SIS-047 | `e2e/novedades.spec.ts` | firefox | CP-SIS-047 · el docente registra una novedad y su gravedad corresponde al tipo | Sí | E25_e2e-local |
| CP-SIS-048 | `e2e/novedades.spec.ts` | firefox | CP-SIS-048 · sin descripción no se guarda | Sí | E25_e2e-local |
| CP-SIS-049 | `e2e/novedades.spec.ts` | firefox | CP-SIS-049 · el historial de un estudiante sale solo con sus novedades y ordenado por fecha | Sí | E25_e2e-local |
| CP-SIS-060 | `e2e/padre-dos-hijos.spec.ts` | firefox | el padre de prueba cambia de hijo y cambian notas, asistencia y novedades | Sí | E25_e2e-local |
| CP-SIS-060 | `e2e/padre-dos-hijos.spec.ts` | firefox | un padre con un solo hijo no ve el selector | Sí | E25_e2e-local |
| CP-SIS-052 | `e2e/padre.spec.ts` | firefox | CP-SIS-052 · el padre ve la asistencia de su hijo por fecha y tipo | Sí | E25_e2e-local |
| CP-SIS-052 | `e2e/padre.spec.ts` | firefox | CP-SIS-052 · con la API caída la asistencia del hijo avisa y deja reintentar | Sí | E25_e2e-local |
| CP-SIS-053 | `e2e/padre.spec.ts` | firefox | CP-SIS-053 · el padre ve las novedades de su hijo, o un aviso si no tiene | Sí | E25_e2e-local |
| CP-SIS-061 | `e2e/padre.spec.ts` | firefox | CP-SIS-061 · un padre sin hijos vinculados ve «No hay estudiantes vinculados» | Sí | E25_e2e-local |
| CP-SIS-009 | `e2e/perfil.spec.ts` | firefox | CP-SIS-009 · el perfil del admin muestra sus datos y su rol | Sí | E25_e2e-local |
| CP-SIS-009 | `e2e/perfil.spec.ts` | firefox | CP-SIS-009 · el perfil del docente muestra sus datos y su rol | Sí | E25_e2e-local |
| CP-SIS-009 | `e2e/perfil.spec.ts` | firefox | CP-SIS-009 · el perfil del estudiante muestra sus datos y su rol | Sí | E25_e2e-local |
| CP-SIS-009 | `e2e/perfil.spec.ts` | firefox | CP-SIS-009 · el perfil del padre muestra sus datos y su rol | Sí | E25_e2e-local |
| CP-SIS-033 | `e2e/qr-camara-invalido.spec.ts` | firefox | CP-SIS-033 · un QR inválido muestra un error claro y no registra | Omitida | E25_e2e-local |
| CP-SIS-032, CP-SIS-034 | `e2e/qr-camara.spec.ts` | firefox | con un QR de estudiante › CP-SIS-032 y 034 · registra la entrada y bloquea una segunda entrada | Omitida | E25_e2e-local |
| CP-SIS-035, CP-SIS-036 | `e2e/qr-camara.spec.ts` | firefox | con un QR de estudiante › CP-SIS-035 y 036 · registra la salida y bloquea una segunda salida | Omitida | E25_e2e-local |
| CP-SIS-029 | `e2e/qr.spec.ts` | firefox | CP-SIS-029 · el estudiante ve el QR de su código con su nombre | Sí | E25_e2e-local |
| CP-SIS-031 | `e2e/qr.spec.ts` | firefox | CP-SIS-031 · el padre no puede ver el QR de un estudiante | Sí | E25_e2e-local |
| CP-SIS-031 | `e2e/qr.spec.ts` | firefox | CP-SIS-031 · el docente no puede ver el QR de un estudiante | Sí | E25_e2e-local |
| CP-SIS-015 | `e2e/recuperacion.spec.ts` | firefox | CP-SIS-015 · pedir recuperación con un correo registrado y con uno no registrado da el mismo mensaje | Sí | E25_e2e-local |
| CP-SIS-016 | `e2e/recuperacion.spec.ts` | firefox | CP-SIS-016 · restablecer con el enlace del correo | Omitida | E25_e2e-local |
| CP-SIS-017 | `e2e/recuperacion.spec.ts` | firefox | CP-SIS-017 · una contraseña débil se rechaza antes de enviar y dice qué regla falta | Sí | E25_e2e-local |
| CP-SIS-018 | `e2e/recuperacion.spec.ts` | firefox | CP-SIS-018 · un enlace de recuperación ya usado | Omitida | E25_e2e-local |
| CP-SIS-037, 038, 039, 041 | `e2e/registro-masivo.spec.ts` | firefox | registro masivo (WEB-06) › la segunda vez con el mismo curso, todos salen «ya registrado» | Sí | E25_e2e-local |
| CP-SIS-037, 038, 039, 041 | `e2e/registro-masivo.spec.ts` | firefox | registro masivo (WEB-06) › con la red cortada, los fallidos se listan por nombre con Reintentar y Descartar | Sí | E25_e2e-local |
| CP-SIS-014 | `e2e/registro-padre.spec.ts` | firefox | un correo rechazado por la API muestra el motivo junto al campo (DEF-WEB-05) | Sí | E25_e2e-local |
| CP-SIS-014 | `e2e/registro-padre.spec.ts` | firefox | el padre que se registra ve los datos de su hijo vinculado | Sí | E25_e2e-local |
| CP-SIS-011 | `e2e/registro.spec.ts` | firefox | CP-SIS-011 · un estudiante se registra con todos los datos y puede iniciar sesión | Sí | E25_e2e-local |
| CP-SIS-012 | `e2e/registro.spec.ts` | firefox | CP-SIS-012 · un correo ya registrado, también en mayúsculas, no crea otra cuenta | Sí | E25_e2e-local |
| CP-SIS-013 | `e2e/registro.spec.ts` | firefox | CP-SIS-013 · con un campo obligatorio vacío no se registra e indica el campo | Sí | E25_e2e-local |
| CP-SIS-056 | `e2e/reportes.spec.ts` | firefox | CP-SIS-056 · el admin crea un reporte de asistencia con un PDF y lo descarga | Sí | E25_e2e-local |
| CP-SIS-057 | `e2e/reportes.spec.ts` | firefox | CP-SIS-057 · un filtro sin datos muestra un aviso | Sí | E25_e2e-local |
| CP-SIS-057 | `e2e/reportes.spec.ts` | firefox | CP-SIS-057 · con la API caída los reportes avisan y dejan reintentar | Sí | E25_e2e-local |
| CP-SIS-004, 065 | `e2e/sesion.spec.ts` | firefox | sesión (WEB-01) › con 31 minutos sin actividad se cierra la sesión y vuelve al inicio de sesión | Sí | E25_e2e-local |
| CP-SIS-004, 065 | `e2e/sesion.spec.ts` | firefox | sesión (WEB-01) › con el acceso vencido y un refresco válido la sesión se renueva sola | Sí | E25_e2e-local |
| CP-SIS-004, 065 | `e2e/sesion.spec.ts` | firefox | sesión (WEB-01) › el token de acceso no se puede leer desde JavaScript | Sí | E25_e2e-local |
| CP-SIS-065 | `e2e/sesion.spec.ts` | firefox | sesión (WEB-01) › a escala (QA con SESSION_IDLE_MINUTES=1) › una sesión usada durante 4 minutos con actividad cada 15 s sigue funcionando (CP-SIS-065) | Sí | E25_e2e-local |
| CP-SIS-004, 065 | `e2e/sesion.spec.ts` | firefox | sesión (WEB-01) › a escala (QA con SESSION_IDLE_MINUTES=1) › 70 s sin actividad cierran la sesión (equivale a los 31 min de la regla real) | Sí | E25_e2e-local |
| CP-SIS-004, 065 | `e2e/sesion.spec.ts` | firefox | una ruta del panel sin sesión pide iniciar sesión | Sí | E25_e2e-local |
| CP-SIS-019, 021, 022, 025, 027, 028 | `e2e/usuarios.spec.ts` | firefox | gestión de usuarios (admin) › crear, filtrar, editar y eliminar un docente de prueba | Sí | E26_usuarios-firefox |
| CP-SIS-021 | `e2e/usuarios.spec.ts` | firefox | gestión de usuarios (admin) › crear con un campo vacío no guarda e indica el campo (CP-SIS-021) | Sí | E26_usuarios-firefox |
| CP-SIS-028 | `e2e/usuarios.spec.ts` | firefox | gestión de usuarios (admin) › un filtro sin coincidencias muestra un mensaje informativo (CP-SIS-028) | Sí | E26_usuarios-firefox |
| CP-SIS-020 | `e2e/usuarios.spec.ts` | firefox | gestión de usuarios · errores (WC-05) › CP-SIS-020 · crear con un correo ya registrado no guarda | Sí | E26_usuarios-firefox |
| CP-SIS-023 | `e2e/usuarios.spec.ts` | firefox | gestión de usuarios · errores (WC-05) › CP-SIS-023 · al editar, el correo está bloqueado y no se puede poner el de otro usuario | Sí | E26_usuarios-firefox |
| CP-SIS-024 | `e2e/usuarios.spec.ts` | firefox | gestión de usuarios · errores (WC-05) › CP-SIS-024 · editar dejando el nombre vacío no guarda | Sí | E26_usuarios-firefox |
| CP-SIS-026 | `e2e/usuarios.spec.ts` | firefox | gestión de usuarios · errores (WC-05) › CP-SIS-026 · eliminar con la API caída avisa que no se pudo y no elimina | Sí | E26_usuarios-firefox |
| CP-SIS-027 | `e2e/usuarios.spec.ts` | firefox | gestión de usuarios · errores (WC-05) › CP-SIS-027 · filtrar por rol y por nombre; el estado se ve por secciones | Sí | E26_usuarios-firefox |
| CP-SIS-028 | `e2e/usuarios.spec.ts` | firefox | gestión de usuarios · errores (WC-05) › CP-SIS-028 · con la API caída la lista avisa y deja reintentar | Sí | E26_usuarios-firefox |
| WC-06 | `e2e/wc06-accesibilidad.spec.ts` | firefox | WC-06 axe · login-y-registro sin violaciones serias ni críticas | Omitida | E25_e2e-local |
| WC-06 | `e2e/wc06-accesibilidad.spec.ts` | firefox | WC-06 axe · registro-modal sin violaciones serias ni críticas | Omitida | E25_e2e-local |
| WC-06 | `e2e/wc06-accesibilidad.spec.ts` | firefox | WC-06 axe · usuarios-y-modal sin violaciones serias ni críticas | Omitida | E25_e2e-local |
| WC-06 | `e2e/wc06-accesibilidad.spec.ts` | firefox | WC-06 axe · qr-escanear-docente sin violaciones serias ni críticas | Omitida | E25_e2e-local |
| WC-06 | `e2e/wc06-accesibilidad.spec.ts` | firefox | WC-06 axe · notas-padre sin violaciones serias ni críticas | Omitida | E25_e2e-local |
| WC-06 | `e2e/wc06-accesibilidad.spec.ts` | firefox | WC-06 axe · reset-password sin violaciones serias ni críticas | Omitida | E25_e2e-local |
| WC-06 | `e2e/wc06-manuales.spec.ts` | firefox | WC-06 bloque 5 · con la API caída, descargar el boletín avisa y no baja un archivo dañado | Sí | E25_e2e-local |
| WC-06 | `e2e/wc06-manuales.spec.ts` | firefox | cámara sin permiso › WC-06 bloque 4 · si se niega la cámara, el escáner lo dice con claridad | Omitida | E25_e2e-local |
| WC-06 | `e2e/wc06-responsive.spec.ts` | firefox | WC-06 responsive · portada a 375px sin desborde | Omitida | E25_e2e-local |
| WC-06 | `e2e/wc06-responsive.spec.ts` | firefox | WC-06 responsive · portada a 768px sin desborde | Omitida | E25_e2e-local |
| WC-06 | `e2e/wc06-responsive.spec.ts` | firefox | WC-06 responsive · portada a 1920px sin desborde | Omitida | E25_e2e-local |
| WC-06 | `e2e/wc06-responsive.spec.ts` | firefox | WC-06 responsive · inicio-docente a 375px sin desborde | Omitida | E25_e2e-local |
| WC-06 | `e2e/wc06-responsive.spec.ts` | firefox | WC-06 responsive · inicio-docente a 768px sin desborde | Omitida | E25_e2e-local |
| WC-06 | `e2e/wc06-responsive.spec.ts` | firefox | WC-06 responsive · inicio-docente a 1920px sin desborde | Omitida | E25_e2e-local |
| WC-06 | `e2e/wc06-responsive.spec.ts` | firefox | WC-06 responsive · notas-docente a 375px sin desborde | Omitida | E25_e2e-local |
| WC-06 | `e2e/wc06-responsive.spec.ts` | firefox | WC-06 responsive · notas-docente a 768px sin desborde | Omitida | E25_e2e-local |
| WC-06 | `e2e/wc06-responsive.spec.ts` | firefox | WC-06 responsive · notas-docente a 1920px sin desborde | Omitida | E25_e2e-local |
| WC-06 | `e2e/wc06-responsive.spec.ts` | firefox | WC-06 responsive · usuarios-admin a 375px sin desborde | Omitida | E25_e2e-local |
| WC-06 | `e2e/wc06-responsive.spec.ts` | firefox | WC-06 responsive · usuarios-admin a 768px sin desborde | Omitida | E25_e2e-local |
| WC-06 | `e2e/wc06-responsive.spec.ts` | firefox | WC-06 responsive · usuarios-admin a 1920px sin desborde | Omitida | E25_e2e-local |
| WC-06 | `e2e/wc06-responsive.spec.ts` | firefox | WC-06 responsive · asistencia-padre a 375px sin desborde | Omitida | E25_e2e-local |
| WC-06 | `e2e/wc06-responsive.spec.ts` | firefox | WC-06 responsive · asistencia-padre a 768px sin desborde | Omitida | E25_e2e-local |
| WC-06 | `e2e/wc06-responsive.spec.ts` | firefox | WC-06 responsive · asistencia-padre a 1920px sin desborde | Omitida | E25_e2e-local |
| WC-06 | `e2e/wc06-responsive.spec.ts` | firefox | WC-06 responsive · el aviso de cookies no tapa «CREAR CUENTA» a 375×812 | Omitida | E25_e2e-local |
| WC-06 | `e2e/wc06-responsive.spec.ts` | firefox | WC-06 responsive · el aviso de cookies no tapa «CREAR CUENTA» a 1280×720 | Omitida | E25_e2e-local |
| WC-06 | `e2e/wc06-responsive.spec.ts` | firefox | WC-06 responsive · el aviso de cookies no tapa «CREAR CUENTA» a 1920×1080 | Omitida | E25_e2e-local |
| WC-06 | `e2e/wc06-responsive.spec.ts` | firefox | WC-06 responsive · el aviso de cookies no tapa «ENTRAR» a 375×812 | Omitida | E25_e2e-local |
| WC-06 | `e2e/wc06-responsive.spec.ts` | firefox | WC-06 responsive · el aviso de cookies no tapa «ENTRAR» a 1280×720 | Omitida | E25_e2e-local |
| CP-NF-013 | `e2e/wc06-seguridad.spec.ts` | firefox | CP-NF-013 · eys_access y eys_refresh son HttpOnly y Secure; eys_user no lleva el token | Sí | E25_e2e-local |
| WC-06 | `e2e/wc06-seguridad.spec.ts` | firefox | WC-06 · las respuestas traen CSP, anti-clickjacking, nosniff, Referrer-Policy, Permissions-Policy y HSTS | Sí | E25_e2e-local |
| DEF-WEB-17 | `e2e/iconos.spec.ts` | chromium | DEF-WEB-17 · iconos con la fuente reducida › página pública / | Sí | E28_iconos |
| DEF-WEB-17 | `e2e/iconos.spec.ts` | chromium | DEF-WEB-17 · iconos con la fuente reducida › página pública /home/beneficios | Sí | E28_iconos |
| DEF-WEB-17 | `e2e/iconos.spec.ts` | chromium | DEF-WEB-17 · iconos con la fuente reducida › página pública /home/nosotros | Sí | E28_iconos |
| DEF-WEB-17 | `e2e/iconos.spec.ts` | chromium | DEF-WEB-17 · iconos con la fuente reducida › página pública /home/support | Sí | E28_iconos |
| DEF-WEB-17 | `e2e/iconos.spec.ts` | chromium | DEF-WEB-17 · iconos con la fuente reducida › página pública /forgot-password | Sí | E28_iconos |
| DEF-WEB-17 | `e2e/iconos.spec.ts` | chromium | DEF-WEB-17 · iconos con la fuente reducida › página pública /reset-password?token=e2e | Sí | E28_iconos |
| DEF-WEB-17 | `e2e/iconos.spec.ts` | chromium | DEF-WEB-17 · iconos con la fuente reducida › panel del admin | Sí | E28_iconos |
| DEF-WEB-17 | `e2e/iconos.spec.ts` | chromium | DEF-WEB-17 · iconos con la fuente reducida › panel del docente | Sí | E28_iconos |
| DEF-WEB-17 | `e2e/iconos.spec.ts` | chromium | DEF-WEB-17 · iconos con la fuente reducida › panel del estudiante | Sí | E28_iconos |
| DEF-WEB-17 | `e2e/iconos.spec.ts` | chromium | DEF-WEB-17 · iconos con la fuente reducida › panel del padre | Sí | E28_iconos |
| DEF-WEB-17 | `e2e/iconos.spec.ts` | firefox | DEF-WEB-17 · iconos con la fuente reducida › página pública / | Sí | E28_iconos |
| DEF-WEB-17 | `e2e/iconos.spec.ts` | firefox | DEF-WEB-17 · iconos con la fuente reducida › página pública /home/beneficios | Sí | E28_iconos |
| DEF-WEB-17 | `e2e/iconos.spec.ts` | firefox | DEF-WEB-17 · iconos con la fuente reducida › página pública /home/nosotros | Sí | E28_iconos |
| DEF-WEB-17 | `e2e/iconos.spec.ts` | firefox | DEF-WEB-17 · iconos con la fuente reducida › página pública /home/support | Sí | E28_iconos |
| DEF-WEB-17 | `e2e/iconos.spec.ts` | firefox | DEF-WEB-17 · iconos con la fuente reducida › página pública /forgot-password | Sí | E28_iconos |
| DEF-WEB-17 | `e2e/iconos.spec.ts` | firefox | DEF-WEB-17 · iconos con la fuente reducida › página pública /reset-password?token=e2e | Sí | E28_iconos |
| DEF-WEB-17 | `e2e/iconos.spec.ts` | firefox | DEF-WEB-17 · iconos con la fuente reducida › panel del admin | Sí | E28_iconos |
| DEF-WEB-17 | `e2e/iconos.spec.ts` | firefox | DEF-WEB-17 · iconos con la fuente reducida › panel del docente | Sí | E28_iconos |
| DEF-WEB-17 | `e2e/iconos.spec.ts` | firefox | DEF-WEB-17 · iconos con la fuente reducida › panel del estudiante | Sí | E28_iconos |
| DEF-WEB-17 | `e2e/iconos.spec.ts` | firefox | DEF-WEB-17 · iconos con la fuente reducida › panel del padre | Sí | E28_iconos |
