# DEF-WEB-05 · El registro esconde el motivo cuando la API rechaza los datos (422)

| Campo | Valor |
|---|---|
| Componente | **Web** (`src/auth/actions.ts`, `register`, líneas 244-248) |
| Severidad | **Baja** · prioridad propuesta P4 |
| Estado | **Abierto** |
| Detectado el | 10/11/2026, al diagnosticar el fallo de CP-SIS-014 en la corrida E3 |
| Caso que lo detectó | CP-SIS-014 · `e2e/registro-padre.spec.ts`. La prueba fallaba por un dato inválido suyo (D-WEB-17); el mensaje de la web no dejaba ver la causa |
| Origen | Pruebas de sistema |
| Evidencia | Diagnóstico del 10/11 con Chromium a 1920×1080 contra el deploy preview, y `POST /auth/register` directo a la API de QA (sección «Resultado obtenido») |
| Issue en GitHub | NO DISPONIBLE (acción externa 11) |

## Pasos para reproducir

1. Abrir el registro (`/?login=1` → «Regístrate»).
2. Llenar el formulario de padre con un correo de dominio reservado, por ejemplo `alguien@colegio.test`.
3. Pulsar «CREAR CUENTA».

## Resultado esperado

Un mensaje que diga qué campo falló, como ya hace `apiFetch` desde el commit `5a5dea6` (IT-WEB-05, «422 con el primer mensaje de validación»).

## Resultado obtenido

«Error al registrar el usuario: No se pudo completar el registro.» La API respondió **422** con `detail` como **lista** (`loc: ["body","correo"]`, «The part after the @-sign is a special-use or reserved name…»). `register` hace su propio `fetch`, solo usa `detail` si es texto y en cualquier otro caso muestra el genérico.

## Corrección propuesta (no aplicada)

En `register`, tomar el primer `detail[i].msg` cuando `detail` sea una lista, con la misma regla que `apiFetch`, o llamar a la API a través de `serverFetch`. Agregar el caso a `tests/register.test.ts`.

## Observación aparte, no es este defecto

Con una ventana de 1280×720, el aviso de cookies (barra fija abajo, botón «Rechazar») **tapa el botón «CREAR CUENTA»** del modal de registro: Playwright no pudo hacer clic durante 30 s. A 1920×1080 no pasa. Queda para la revisión de *responsive* de las pruebas manuales (acción pendiente en `docs/pruebas-manuales-pr06-web.md`).
