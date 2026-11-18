# DEF-WEB-18 · Cualquier QR registra la asistencia del mismo estudiante (EST002)

| Campo | Valor |
|---|---|
| Componente | **Web** (`src/services/qr/qrActions.ts` › `getCodigoQRByValueAction`, usada por `useEscanear`) |
| Severidad | **Crítica** · prioridad propuesta P1 (se registra la asistencia de un estudiante equivocado y un QR inválido se acepta) |
| Estado | **Corregido** el 17/11/2026 · verificado contra el build de producción local (Netlify pausado); falta verlo en QA |
| Detectado el | 17/11/2026, en la corrida E27, apenas DEF-WEB-16 dejó leer el QR |
| Caso que lo detectó | CP-SIS-033 · `e2e/qr-camara-invalido.spec.ts` |
| Origen | Pruebas de sistema |
| Issue en GitHub | NO DISPONIBLE (se registra con `docs/defectos/registro.json`) |

## Pasos para reproducir

1. Como docente, abrir `/qr/escanear` y activar la cámara.
2. Escanear un QR con un texto que no sea el código de ningún estudiante (por ejemplo `NO-ES-UN-ESTUDIANTE-E2E`), o el QR de otro estudiante.

## Resultado esperado

Un QR que no es de un estudiante da «Código QR inválido» y no registra nada (CP-SIS-033). El QR de un estudiante muestra a **ese** estudiante (CP-SIS-032).

## Resultado obtenido

Siempre aparece la confirmación de **EST002** («Registrar Entrada»), sea cual sea el QR.

## Causa

La web buscaba al estudiante con `GET /estudiantes?codigo_estudiante=<texto>&estado=Activo&limit=1` y se quedaba con el primero. Ese parámetro **no existe** en el contrato de la API (`GET /estudiantes` solo admite `skip`, `limit`, `id_curso` y `estado`, según el `openapi.json` de QA), así que la API lo ignora y devuelve la lista completa; el primero de la lista es EST002:

```
GET /estudiantes?codigo_estudiante=NO-ES-UN-ESTUDIANTE-E2E&estado=Activo&limit=3 → 2:EST002, 3:EST003, 4:SYN0101
GET /estudiantes?codigo_estudiante=SYN0101&estado=Activo&limit=3                → 2:EST002, 3:EST003, 4:SYN0101
```

No se había visto porque, hasta corregir DEF-WEB-16, ningún QR llegaba a leerse.

## Corrección

`getCodigoQRByValueAction` recorre `GET /estudiantes?estado=Activo` por páginas de 500 y exige el **código exacto** (sin espacios alrededor); si no lo encuentra, devuelve `null` y la pantalla dice «Código QR inválido». La confirmación muestra además el nombre del estudiante en vez de «—».

Pruebas que fallaban antes y pasan después: `tests/qrBuscarCodigo.test.ts` (5 casos, con una API simulada que ignora el filtro como la real) y los E2E CP-SIS-032 a 036 en la corrida E27 (`evidencias/PR-06/web/E27_qr-camara-jsqr.xml`, 8/8).

## Para el backend (observación)

Si se quiere buscar por código sin traer la lista, haría falta un filtro documentado (`codigo_estudiante`) o una ruta `GET /estudiantes/codigo/{codigo}`. Mientras no exista, la web no debe enviar parámetros que el contrato no tiene: `scripts/contrato-rutas.mjs` compara rutas, no parámetros de consulta.
