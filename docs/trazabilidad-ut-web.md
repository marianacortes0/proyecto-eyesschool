# Trazabilidad de pruebas — Frontend web

> Generado con `node scripts/trazabilidad.mjs` (no editar a mano). Mapeo en `tests/trazabilidad.json`.
> Fecha de generación: 2026-11-03

## Resumen

| Grupo | Resultado |
|---|---|
| UT-WEB-01 a 08 (planeadas, PR-04) | 126 de 126 pasan |
| UT-WEB-EXTRA (no planeadas) | 136 de 136 pasan |
| IT-WEB-01 a 05 (contrato, PR-05) | 12 de 21 pasan · «Omitida» = necesita `QA_API_URL` |

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
| UT-WEB-EXTRA-17 | Reglas de código testeable leídas del código fuente | `tests/arquitectura.test.ts` | arquitectura (reglas 1 a 4) WEB-01/08: ya no existe src/services/supabase ni algo que lo importe | Sí |
| UT-WEB-EXTRA-18 | Reglas de código testeable leídas del código fuente | `tests/arquitectura.test.ts` | arquitectura (reglas 1 a 4) WEB-01: el guardia de rutas es proxy.ts y usa sessionMiddleware | Sí |
| UT-WEB-EXTRA-19 | Reglas de código testeable leídas del código fuente | `tests/arquitectura.test.ts` | arquitectura (reglas 1 a 4) WEB-INF-4: hay un solo despliegue (se eliminó el flujo de Azure) | Sí |
| UT-WEB-EXTRA-20 | Reglas de código testeable leídas del código fuente | `tests/arquitectura.test.ts` | arquitectura (reglas 1 a 4) los módulos 'use server' solo exportan funciones async (si no, el build los deja sin exports) | Sí |
| UT-WEB-EXTRA-21 | Fallidos del registro masivo (WEB-06, cobertura D-WEB-13) | `tests/components/FallidosMasivo.test.tsx` | FallidosMasivo (WEB-06) sin fallidos no renderiza nada | Sí |
| UT-WEB-EXTRA-22 | Fallidos del registro masivo (WEB-06, cobertura D-WEB-13) | `tests/components/FallidosMasivo.test.tsx` | FallidosMasivo (WEB-06) lista cada estudiante por nombre con su motivo | Sí |
| UT-WEB-EXTRA-23 | Fallidos del registro masivo (WEB-06, cobertura D-WEB-13) | `tests/components/FallidosMasivo.test.tsx` | FallidosMasivo (WEB-06) con un solo fallido el texto va en singular | Sí |
| UT-WEB-EXTRA-24 | Fallidos del registro masivo (WEB-06, cobertura D-WEB-13) | `tests/components/FallidosMasivo.test.tsx` | FallidosMasivo (WEB-06) Reintentar y Descartar avisan al llamador | Sí |
| UT-WEB-EXTRA-25 | Fallidos del registro masivo (WEB-06, cobertura D-WEB-13) | `tests/components/FallidosMasivo.test.tsx` | FallidosMasivo (WEB-06) mientras se reenvía, los dos botones están deshabilitados | Sí |
| UT-WEB-EXTRA-26 | Carga inicial de los hooks (arreglos de SonarQube, D-WEB-14) | `tests/hooks/cargaInicial.test.tsx` | carga inicial de los hooks de pantalla useReportes sin datos del servidor pide los datos una sola vez y apaga loading | Sí |
| UT-WEB-EXTRA-27 | Carga inicial de los hooks (arreglos de SonarQube, D-WEB-14) | `tests/hooks/cargaInicial.test.tsx` | carga inicial de los hooks de pantalla useReportes con datos del servidor no vuelve a pedirlos | Sí |
| UT-WEB-EXTRA-28 | Carga inicial de los hooks (arreglos de SonarQube, D-WEB-14) | `tests/hooks/cargaInicial.test.tsx` | carga inicial de los hooks de pantalla useReportes si la carga falla, el mensaje queda en error y loading se apaga | Sí |
| UT-WEB-EXTRA-29 | Carga inicial de los hooks (arreglos de SonarQube, D-WEB-14) | `tests/hooks/cargaInicial.test.tsx` | carga inicial de los hooks de pantalla useNotas sin datos del servidor pide los datos una sola vez y apaga loading | Sí |
| UT-WEB-EXTRA-30 | Carga inicial de los hooks (arreglos de SonarQube, D-WEB-14) | `tests/hooks/cargaInicial.test.tsx` | carga inicial de los hooks de pantalla useNotas con datos del servidor no vuelve a pedirlos | Sí |
| UT-WEB-EXTRA-31 | Carga inicial de los hooks (arreglos de SonarQube, D-WEB-14) | `tests/hooks/cargaInicial.test.tsx` | carga inicial de los hooks de pantalla useNotas si la carga falla, el mensaje queda en error y loading se apaga | Sí |
| UT-WEB-EXTRA-32 | Carga inicial de los hooks (arreglos de SonarQube, D-WEB-14) | `tests/hooks/cargaInicial.test.tsx` | carga inicial de los hooks de pantalla useUsuarios sin datos del servidor pide los datos una sola vez y apaga loading | Sí |
| UT-WEB-EXTRA-33 | Carga inicial de los hooks (arreglos de SonarQube, D-WEB-14) | `tests/hooks/cargaInicial.test.tsx` | carga inicial de los hooks de pantalla useUsuarios con datos del servidor no vuelve a pedirlos | Sí |
| UT-WEB-EXTRA-34 | Carga inicial de los hooks (arreglos de SonarQube, D-WEB-14) | `tests/hooks/cargaInicial.test.tsx` | carga inicial de los hooks de pantalla useUsuarios si la carga falla, el mensaje queda en error y loading se apaga | Sí |
| UT-WEB-EXTRA-35 | Carga inicial de los hooks (arreglos de SonarQube, D-WEB-14) | `tests/hooks/cargaInicial.test.tsx` | carga inicial de los hooks de pantalla useAsistencia sin datos del servidor pide los datos una sola vez y apaga loading | Sí |
| UT-WEB-EXTRA-36 | Carga inicial de los hooks (arreglos de SonarQube, D-WEB-14) | `tests/hooks/cargaInicial.test.tsx` | carga inicial de los hooks de pantalla useAsistencia con datos del servidor no vuelve a pedirlos | Sí |
| UT-WEB-EXTRA-37 | Carga inicial de los hooks (arreglos de SonarQube, D-WEB-14) | `tests/hooks/cargaInicial.test.tsx` | carga inicial de los hooks de pantalla useAsistencia si la carga falla, el mensaje queda en error y loading se apaga | Sí |
| UT-WEB-EXTRA-38 | Carga inicial de los hooks (arreglos de SonarQube, D-WEB-14) | `tests/hooks/cargaInicial.test.tsx` | carga inicial de los hooks de pantalla useHorarios sin datos del servidor pide los datos una sola vez y apaga loading | Sí |
| UT-WEB-EXTRA-39 | Carga inicial de los hooks (arreglos de SonarQube, D-WEB-14) | `tests/hooks/cargaInicial.test.tsx` | carga inicial de los hooks de pantalla useHorarios con datos del servidor no vuelve a pedirlos | Sí |
| UT-WEB-EXTRA-40 | Carga inicial de los hooks (arreglos de SonarQube, D-WEB-14) | `tests/hooks/cargaInicial.test.tsx` | carga inicial de los hooks de pantalla useHorarios si la carga falla, el mensaje queda en error y loading se apaga | Sí |
| UT-WEB-EXTRA-41 | Política de contraseñas (base de WEB-05) | `tests/password.test.ts` | política de contraseñas acepta una contraseña que cumple las cinco reglas | Sí |
| UT-WEB-EXTRA-42 | Política de contraseñas (base de WEB-05) | `tests/password.test.ts` | política de contraseñas rechaza Ab1# por la regla length | Sí |
| UT-WEB-EXTRA-43 | Política de contraseñas (base de WEB-05) | `tests/password.test.ts` | política de contraseñas rechaza colegio#2026 por la regla upper | Sí |
| UT-WEB-EXTRA-44 | Política de contraseñas (base de WEB-05) | `tests/password.test.ts` | política de contraseñas rechaza COLEGIO#2026 por la regla lower | Sí |
| UT-WEB-EXTRA-45 | Política de contraseñas (base de WEB-05) | `tests/password.test.ts` | política de contraseñas rechaza Colegio#ocho por la regla number | Sí |
| UT-WEB-EXTRA-46 | Política de contraseñas (base de WEB-05) | `tests/password.test.ts` | política de contraseñas rechaza Colegio2026 por la regla special | Sí |
| UT-WEB-EXTRA-47 | Prueba no planeada | `tests/permissions.test.ts` | permisos por rol solo el administrador gestiona usuarios | Sí |
| UT-WEB-EXTRA-48 | Prueba no planeada | `tests/permissions.test.ts` | permisos por rol las notas las escribe el docente; el admin solo las lee | Sí |
| UT-WEB-EXTRA-49 | Prueba no planeada | `tests/permissions.test.ts` | permisos por rol estudiante y padre solo leen lo propio | Sí |
| UT-WEB-EXTRA-50 | Prueba no planeada | `tests/permissions.test.ts` | permisos por rol escanear QR es de docentes y administradores | Sí |
| UT-WEB-EXTRA-51 | Prueba no planeada | `tests/permissions.test.ts` | mapRolToKey traduce los nombres de rol del backend | Sí |
| UT-WEB-EXTRA-52 | Prueba no planeada | `tests/permissions.test.ts` | mapRolToKey traduce el id_rol de la base (1 docente, 2 estudiante, 3 admin, 4 padre) | Sí |
| UT-WEB-EXTRA-53 | Prueba no planeada | `tests/permissions.test.ts` | mapRolToKey un rol desconocido no se convierte en ninguno | Sí |
| UT-WEB-EXTRA-54 | serverFetch y ApiError (WEB-INF-1) | `tests/serverFetch.test.ts` | serverFetch (WEB-INF-1) con datos: manda el token por parámetro y devuelve el JSON sin tocar | Sí |
| UT-WEB-EXTRA-55 | serverFetch y ApiError (WEB-INF-1) | `tests/serverFetch.test.ts` | serverFetch (WEB-INF-1) con lista vacía devuelve []; con un 204 devuelve null | Sí |
| UT-WEB-EXTRA-56 | serverFetch y ApiError (WEB-INF-1) | `tests/serverFetch.test.ts` | serverFetch (WEB-INF-1) con error lanza ApiError con status, mensaje legible y detail original | Sí |
| UT-WEB-EXTRA-57 | serverFetch y ApiError (WEB-INF-1) | `tests/serverFetch.test.ts` | serverFetch (WEB-INF-1) sin token no manda Authorization | Sí |
| UT-WEB-EXTRA-58 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/actionsNotasNovedadesReportes.test.ts` | Servicios · notasActions getNotasAction manda el Bearer del servidor y mapea la nota a número | Sí |
| UT-WEB-EXTRA-59 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/actionsNotasNovedadesReportes.test.ts` | Servicios · notasActions con lista vacía devuelve [] | Sí |
| UT-WEB-EXTRA-60 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/actionsNotasNovedadesReportes.test.ts` | Servicios · notasActions getEstudiantesAction arma el nombre completo o uno provisional | Sí |
| UT-WEB-EXTRA-61 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/actionsNotasNovedadesReportes.test.ts` | Servicios · notasActions createNotaAction manda el cuerpo en snake_case | Sí |
| UT-WEB-EXTRA-62 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/actionsNotasNovedadesReportes.test.ts` | Servicios · notasActions getNotasBootstrapAction junta las cuatro consultas | Sí |
| UT-WEB-EXTRA-63 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/actionsNotasNovedadesReportes.test.ts` | Servicios · notasActions un error de la API lanza con su detail | Sí |
| UT-WEB-EXTRA-64 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/actionsNotasNovedadesReportes.test.ts` | Servicios · notasActions un 500 sin cuerpo lanza HTTP 500 | Sí |
| UT-WEB-EXTRA-65 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/actionsNotasNovedadesReportes.test.ts` | Servicios · novedadesActions getNovedadesAction cruza el estudiante por id y usa uno provisional si falta | Sí |
| UT-WEB-EXTRA-66 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/actionsNotasNovedadesReportes.test.ts` | Servicios · novedadesActions getNovedadesBootstrapAction resuelve nombre y gravedad del tipo | Sí |
| UT-WEB-EXTRA-67 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/actionsNotasNovedadesReportes.test.ts` | Servicios · novedadesActions cursos y estudiantes con lista vacía devuelven [] | Sí |
| UT-WEB-EXTRA-68 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/actionsNotasNovedadesReportes.test.ts` | Servicios · novedadesActions crear manda la fecha de hoy; actualizar solo lo informado; borrar hace DELETE | Sí |
| UT-WEB-EXTRA-69 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/actionsNotasNovedadesReportes.test.ts` | Servicios · novedadesActions un 403 lanza con su detail | Sí |
| UT-WEB-EXTRA-70 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/actionsNotasNovedadesReportes.test.ts` | Servicios · reportesActions getReportesAction mapea y completa parametros vacío | Sí |
| UT-WEB-EXTRA-71 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/actionsNotasNovedadesReportes.test.ts` | Servicios · reportesActions con lista vacía devuelve [] | Sí |
| UT-WEB-EXTRA-72 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/actionsNotasNovedadesReportes.test.ts` | Servicios · reportesActions crear, actualizar estado y borrar | Sí |
| UT-WEB-EXTRA-73 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/actionsNotasNovedadesReportes.test.ts` | Servicios · reportesActions un 404 lanza con su detail | Sí |
| UT-WEB-EXTRA-74 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/dashboardActions.test.ts` | Servicios · dashboardActions (KPI del administrador) calcula totales, promedio, aprobación, asistencia y novedades activas | Sí |
| UT-WEB-EXTRA-75 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/dashboardActions.test.ts` | Servicios · dashboardActions (KPI del administrador) arma las gráficas: estudiantes por curso, usuarios por rol y promedio por materia | Sí |
| UT-WEB-EXTRA-76 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/dashboardActions.test.ts` | Servicios · dashboardActions (KPI del administrador) sin datos devuelve ceros y promedios nulos, no lanza | Sí |
| UT-WEB-EXTRA-77 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/dashboardActions.test.ts` | Servicios · dashboardActions (KPI del administrador) si un endpoint falla (500 o sin red) esa lista cuenta como vacía | Sí |
| UT-WEB-EXTRA-78 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/dashboardActions.test.ts` | Servicios · dashboardActions (KPI del administrador) los atajos devuelven el valor del KPI y 0 si no hay dato | Sí |
| UT-WEB-EXTRA-79 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/dashboardActions.test.ts` | Servicios · dashboardActions (KPI del administrador) las series sin endpoint dedicado devuelven [] | Sí |
| UT-WEB-EXTRA-80 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/dashboardService.test.ts` | Servicios · dashboardService rutaPadre agrega id_estudiante solo cuando hay un hijo activo | Sí |
| UT-WEB-EXTRA-81 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/dashboardService.test.ts` | Servicios · dashboardService docente: mapea los contadores (cliente y servidor) | Sí |
| UT-WEB-EXTRA-82 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/dashboardService.test.ts` | Servicios · dashboardService estudiante: promedios nulos pasan a 0 | Sí |
| UT-WEB-EXTRA-83 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/dashboardService.test.ts` | Servicios · dashboardService padre: arma un hijo con el id pedido | Sí |
| UT-WEB-EXTRA-84 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/dashboardService.test.ts` | Servicios · dashboardService con error de la API o sin red devuelve el estado vacío, no lanza | Sí |
| UT-WEB-EXTRA-85 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/dashboardService.test.ts` | Servicios · dashboardService los helpers heredados devuelven valores neutros | Sí |
| UT-WEB-EXTRA-86 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/horariosService.test.ts` | Servicios · horariosService getHorarios mapea a camelCase y ordena por día y hora | Sí |
| UT-WEB-EXTRA-87 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/horariosService.test.ts` | Servicios · horariosService con lista vacía devuelve [] | Sí |
| UT-WEB-EXTRA-88 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/horariosService.test.ts` | Servicios · horariosService cursos y materias activos/todos usan su consulta y mapean los campos | Sí |
| UT-WEB-EXTRA-89 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/horariosService.test.ts` | Servicios · horariosService crear curso, materia y especialización manda el cuerpo en snake_case | Sí |
| UT-WEB-EXTRA-90 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/horariosService.test.ts` | Servicios · horariosService actualizar manda solo los campos informados | Sí |
| UT-WEB-EXTRA-91 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/horariosService.test.ts` | Servicios · horariosService eliminar es una baja lógica (PUT activo=false) | Sí |
| UT-WEB-EXTRA-92 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/horariosService.test.ts` | Servicios · horariosService crear horario devuelve el id y asignar profesor lo vincula | Sí |
| UT-WEB-EXTRA-93 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/horariosService.test.ts` | Servicios · horariosService getProfesores arma el nombre y ordena alfabéticamente | Sí |
| UT-WEB-EXTRA-94 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/horariosService.test.ts` | Servicios · horariosService asignaciones: lista, crea con fecha_finalizacion nula y getAsignacionesProfesores es vacío | Sí |
| UT-WEB-EXTRA-95 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/horariosService.test.ts` | Servicios · horariosService un 422 lanza con el detail de la API | Sí |
| UT-WEB-EXTRA-96 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/horariosService.test.ts` | Servicios · horariosService un 500 lanza HTTP 500 | Sí |
| UT-WEB-EXTRA-97 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/novedadesQrService.test.ts` | Servicios · novedadesService getNovedades mapea y arma código y nombre provisionales del estudiante | Sí |
| UT-WEB-EXTRA-98 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/novedadesQrService.test.ts` | Servicios · novedadesService con lista vacía devuelve [] en novedades, tipos, cursos y estudiantes | Sí |
| UT-WEB-EXTRA-99 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/novedadesQrService.test.ts` | Servicios · novedadesService tipos, cursos y estudiantes se mapean a camelCase | Sí |
| UT-WEB-EXTRA-100 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/novedadesQrService.test.ts` | Servicios · novedadesService crear, actualizar y borrar una novedad | Sí |
| UT-WEB-EXTRA-101 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/novedadesQrService.test.ts` | Servicios · novedadesService un 403 lanza con el detail | Sí |
| UT-WEB-EXTRA-102 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/novedadesQrService.test.ts` | Servicios · qrService getQRImageUrl codifica el código y fija el tamaño | Sí |
| UT-WEB-EXTRA-103 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/novedadesQrService.test.ts` | Servicios · qrService readQRFromImage devuelve el contenido leído | Sí |
| UT-WEB-EXTRA-104 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/novedadesQrService.test.ts` | Servicios · qrService readQRFromImage devuelve null si no hay símbolo o trae error | Sí |
| UT-WEB-EXTRA-105 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/novedadesQrService.test.ts` | Servicios · qrService readQRFromImage lanza si el servicio externo falla | Sí |
| UT-WEB-EXTRA-106 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/reportesService.test.tsx` | Servicios · reportesService fileUrl: vacío, absoluta y relativa | Sí |
| UT-WEB-EXTRA-107 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/reportesService.test.tsx` | Servicios · reportesService validarArchivoReporte rechaza el formato y el tamaño | Sí |
| UT-WEB-EXTRA-108 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/reportesService.test.tsx` | Servicios · reportesService getReportes mapea a camelCase; con lista vacía devuelve [] | Sí |
| UT-WEB-EXTRA-109 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/reportesService.test.tsx` | Servicios · reportesService crear, actualizar y borrar un reporte | Sí |
| UT-WEB-EXTRA-110 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/reportesService.test.tsx` | Servicios · reportesService downloadReporteArchivo lanza con el detail si la API responde error | Sí |
| UT-WEB-EXTRA-111 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/reportesService.test.tsx` | Servicios · reportesService downloadReporteArchivo descarga con el nombre del Content-Disposition | Sí |
| UT-WEB-EXTRA-112 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/reportesService.test.tsx` | Servicios · themeService lee el tema guardado y, sin nada guardado, el preferido del sistema | Sí |
| UT-WEB-EXTRA-113 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/reportesService.test.tsx` | Servicios · themeService applyTheme pone la clase dark y persiste | Sí |
| UT-WEB-EXTRA-114 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/usuarioService.test.ts` | Servicios · usuarioService (perfil) getMiPerfil mapea el perfil y resuelve la foto relativa contra el backend | Sí |
| UT-WEB-EXTRA-115 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/usuarioService.test.ts` | Servicios · usuarioService (perfil) getMiPerfil devuelve null si la API falla | Sí |
| UT-WEB-EXTRA-116 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/usuarioService.test.ts` | Servicios · usuarioService (perfil) updateMiPerfil manda solo los campos informados | Sí |
| UT-WEB-EXTRA-117 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/usuarioService.test.ts` | Servicios · usuarioService (perfil) uploadAvatar acepta un texto o un objeto con la URL | Sí |
| UT-WEB-EXTRA-118 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/usuarioService.test.ts` | Servicios · usuarioService (perfil) getAvatarUrl no inventa una URL | Sí |
| UT-WEB-EXTRA-119 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/usuarioService.test.ts` | Servicios · usuarioService (perfil) getMiPerfilProfesor busca al profesor por idUsuario en la lista y trae sus especializaciones | Sí |
| UT-WEB-EXTRA-120 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/usuarioService.test.ts` | Servicios · usuarioService (perfil) getMiPerfilProfesor devuelve null si no hay fila para ese usuario o falla la API | Sí |
| UT-WEB-EXTRA-121 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/usuarioService.test.ts` | Servicios · usuarioService (perfil) getMiPerfilAdmin busca en la lista; null si no está | Sí |
| UT-WEB-EXTRA-122 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/usuarioService.test.ts` | Servicios · usuarioService (perfil) actualizar profesor y administrador usa snake_case | Sí |
| UT-WEB-EXTRA-123 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/usuarioService.test.ts` | Servicios · usuarioService (perfil) insertAdminPerfil crea el perfil Activo con la fecha de hoy | Sí |
| UT-WEB-EXTRA-124 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/usuarioService.test.ts` | Servicios · usuarioService (perfil) getMiEPS usa /estudiantes/me y luego /ips; [] si no hay estudiante o falla | Sí |
| UT-WEB-EXTRA-125 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/usuarioService.test.ts` | Servicios · usuarioService (perfil) upsertMiEPS manda la afiliación activa con fecha de hoy | Sí |
| UT-WEB-EXTRA-126 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/usuarioService.test.ts` | Servicios · usuarioService (perfil) getMiEstudianteInfo devuelve id y curso; null si la lista viene vacía | Sí |
| UT-WEB-EXTRA-127 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/usuarioService.test.ts` | Servicios · usuarioService (perfil) updateEstudianteCurso y getCursosParaPerfil | Sí |
| UT-WEB-EXTRA-128 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/usuariosService.test.ts` | Servicios · usuariosService getUsuarios pide los activos y agrega el nombre del rol | Sí |
| UT-WEB-EXTRA-129 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/usuariosService.test.ts` | Servicios · usuariosService getPendingUsuarios pide los inactivos y con lista vacía devuelve [] | Sí |
| UT-WEB-EXTRA-130 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/usuariosService.test.ts` | Servicios · usuariosService getUsuarioById devuelve el usuario y null si la API falla | Sí |
| UT-WEB-EXTRA-131 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/usuariosService.test.ts` | Servicios · usuariosService createUsuario manda el cuerpo en snake_case con nulos para lo opcional | Sí |
| UT-WEB-EXTRA-132 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/usuariosService.test.ts` | Servicios · usuariosService updateUsuario manda solo lo que cambió | Sí |
| UT-WEB-EXTRA-133 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/usuariosService.test.ts` | Servicios · usuariosService toggleUsuarioEstado manda el estado como query param | Sí |
| UT-WEB-EXTRA-134 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/usuariosService.test.ts` | Servicios · usuariosService validarUsuario cambia el rol y luego activa | Sí |
| UT-WEB-EXTRA-135 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/usuariosService.test.ts` | Servicios · usuariosService deleteUsuario y rechazarUsuario hacen DELETE | Sí |
| UT-WEB-EXTRA-136 | Cobertura de servicios (umbral 60 %, D-WEB-05) | `tests/services/usuariosService.test.ts` | Servicios · usuariosService un 409 por correo duplicado lanza con el detail | Sí |

## Pruebas de contrato (PR-05)

| ID | Corrección | Archivo | Caso | Pasa |
|---|---|---|---|---|
| IT-WEB-01 | WEB-04 · contrato con la API | `tests/permissions.test.ts` | contrato PERMISSIONS ↔ roles de la API PERMISSIONS no concede nada que la API rechace (0 diferencias) | Sí |
| IT-WEB-02 | WEB-03 · contrato /padres/me/hijos | `tests/asociadoActions.test.ts` | asociadoActions (WEB-03 · IT-WEB-02) si /padres/me/hijos responde 404, usa /padres/me y devuelve un solo hijo | Sí |
| IT-WEB-02 | WEB-03 · contrato /padres/me/hijos | `tests/asociadoActions.test.ts` | asociadoActions (WEB-03 · IT-WEB-02) si /padres/me/hijos responde 500, no usa /padres/me y propaga el error | Sí |
| IT-WEB-02 | WEB-03 · contrato /padres/me/hijos | `tests/asociadoActions.test.ts` | asociadoActions (WEB-03 · IT-WEB-02) con /padres/me/hijos disponible, no llama a /padres/me | Sí |
| IT-WEB-02 | WEB-03 · contrato /padres/me/hijos | `tests/asociadoActions.test.ts` | asociadoActions (WEB-03 · IT-WEB-02) getHijosAction llama GET /padres/me/hijos y devuelve los hijos en camelCase | Sí |
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
| IT-WEB-04 | CP-INT-060 desde la web | `tests/integration/contrato-api.int.test.ts` | IT-WEB-04 · inicio del estudiante (BE-03) GET /dashboard/estudiante responde 200 y el inicio carga | Omitida |
| IT-WEB-05 | Errores de la API | `tests/integration/contrato-api.int.test.ts` | IT-WEB-05 · errores reales de la API llegan como mensaje 401: sin token | Omitida |
| IT-WEB-05 | Errores de la API | `tests/integration/contrato-api.int.test.ts` | IT-WEB-05 · errores reales de la API llegan como mensaje 403: un padre pide la lista de usuarios | Omitida |
| IT-WEB-05 | Errores de la API | `tests/integration/contrato-api.int.test.ts` | IT-WEB-05 · errores reales de la API llegan como mensaje 404: un recurso que no existe | Omitida |
| IT-WEB-05 | Errores de la API | `tests/integration/contrato-api.int.test.ts` | IT-WEB-05 · errores reales de la API llegan como mensaje 422: cuerpo inválido, con el primer mensaje de validación | Omitida |
