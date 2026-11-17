# DEF-WEB-05 · El registro esconde el motivo cuando la API rechaza los datos (422)

| Campo | Valor |
|---|---|
| Componente | **Web** (`src/auth/actions.ts`, `register`, líneas 244-248) |
| Severidad | **Baja** · prioridad propuesta P4 |
| Estado | **Corregido** en `1697c7c` (11/11/2026: el motivo) y `52e6470` (16/11/2026: junto al campo, WC-03) · **verificado en QA** el 17/11 (E17): falta cerrarlo como issue, lo cierra QA |
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

## Corrección propuesta (aplicada, ver abajo)

En `register`, tomar el primer `detail[i].msg` cuando `detail` sea una lista, con la misma regla que `apiFetch`, o llamar a la API a través de `serverFetch`. Agregar el caso a `tests/register.test.ts`.

## Observación aparte, no es este defecto

Con una ventana de 1280×720, el aviso de cookies (barra fija abajo, botón «Rechazar») **tapa el botón «CREAR CUENTA»** del modal de registro: Playwright no pudo hacer clic durante 30 s. A 1920×1080 no pasa. Queda para la revisión de *responsive* de las pruebas manuales (acción pendiente en `docs/pruebas-manuales-pr06-web.md`).

## Corrección y verificación

**Commit `1697c7c` (11/11/2026).** `register` usa `errorMessage`, la misma regla que `apiFetch`: el primer `msg` de la lista del 422, o «HTTP <código>» si el cuerpo no se puede leer. Dos unitarias nuevas en `tests/register.test.ts`.

**Commit `52e6470` (16/11/2026, WC-03).** La planeación de cierre pide además que el motivo salga **junto al campo** que lo causó. `register` devuelve `campo` (el último elemento de `loc`, traducido al `name` del formulario: `correo` → `email`, `numero_documento` → `docNumber`, etc.) y `motivo`. `SignupModal` marca ese campo con `aria-invalid="true"` y `aria-describedby`, y pone el motivo debajo. El mensaje general se mantiene, porque el campo puede quedar fuera de la vista en el modal con desplazamiento. Un error sin `loc` (por ejemplo, el 409 de correo repetido) solo muestra el mensaje general.

| Prueba | Antes de `52e6470` | Después |
|---|---|---|
| `tests/register.test.ts`: un 422 en `correo`, `password`, `numero_documento` e `id_estudiante_vinculado` señala su campo (4 casos) | Falla | Pasa |
| `tests/register.test.ts`: un 409 en texto no señala ningún campo | Pasa | Pasa |
| `tests/components/SignupModal.test.tsx`: el motivo sale bajo «Correo» y el campo queda inválido | Falla | Pasa |
| `tests/components/SignupModal.test.tsx`: un 409 solo muestra el mensaje general | Pasa | Pasa |
| E2E `registro-padre.spec.ts` › «un correo rechazado por la API muestra el motivo junto al campo (DEF-WEB-05)», contra QA | — | **Aprobado en Chromium y Firefox** en E17 (deploy de QA de `48d3b1c`, que incluye `52e6470`; `evidencias/PR-06/web/E17_e2e.xml`) |

