# DEF-WEB-08 · Con la API caída, el inicio muestra ceros en vez de un error

| Campo | Valor |
|---|---|
| Componente | **Web** (`src/services/dashboard/dashboardService.ts`, hooks del inicio, `MinimalDashboard`) |
| Severidad | **Media** · prioridad propuesta P3 (muestra datos falsos sin avisar) |
| Estado | **Corregido** el 17/11/2026 · verificado con el E2E de CP-SIS-008 contra el build local con el proxy de fallas |
| Detectado el | 17/11/2026, al automatizar CP-SIS-008 (WC-05) |
| Caso que lo detectó | CP-SIS-008 · `e2e/login-errores.spec.ts` |
| Origen | Pruebas de sistema |
| Evidencia | Corrida E23 (sección 0 del informe); captura de la página en el primer intento: «Estudiantes a tu cargo 0 · Cursos asignados 0 · Notas registradas hoy 0 · Asistencias hoy 0», sin aviso |
| Issue en GitHub | NO DISPONIBLE (se registra con `docs/defectos/registro.json`) |

## Pasos para reproducir

1. Iniciar sesión como docente.
2. Dejar la API sin responder (en las pruebas: `scripts/api-fallas.mjs` en modo `caida`).
3. Abrir `/general`.

## Resultado esperado

CP-SIS-008: «Mensaje de error y opción de reintentar».

## Resultado obtenido

El inicio se veía normal pero con todas las cifras en **0**, sin mensaje ni reintento. Un docente leía «0 estudiantes a tu cargo» como un dato real.

## Causa

`getDashboard*Server` y `getDashboard*` convertían cualquier fallo de la API (error HTTP o de red) en un estado vacío con ceros, y una unitaria fijaba ese comportamiento («con error de la API devuelve el estado vacío, no lanza»). El inicio ya sabía mostrar un error, pero nunca le llegaba uno.

## Corrección (17/11/2026)

- **Servidor:** las funciones `getDashboard*Server` devuelven `null` ante un fallo; la página deja que el navegador lo vuelva a pedir.
- **Cliente:** `getDashboard*` lanza `MSG_INICIO_ERROR` («No se pudo cargar tu inicio. Revisa tu conexión e intenta de nuevo.»).
- **Hooks:** `useCargaInicio` (nuevo) concentra carga, error y `reintentar`; los tres hooks del inicio lo usan.
- **Pantalla:** `MinimalDashboard` muestra el error con `role="alert"` y un botón **Reintentar**; sin datos, las cifras salen «—», no 0.

## Pruebas

| Prueba | Antes | Después |
|---|---|---|
| `tests/services/dashboardService.test.ts`: con error, el servidor devuelve null y el cliente lanza (2 casos; reemplazan al que fijaba los ceros, que contradecía CP-SIS-008) | Falla | Pasa |
| `tests/components/MinimalDashboard.test.tsx`: alerta con «Reintentar» que vuelve a pedir; sin error, nada (2 casos) | Falla | Pasa |
| E2E CP-SIS-008: con la API caída, aviso y ningún 0; al reintentar con la API de vuelta, llegan los datos | Falla | Pasa |
