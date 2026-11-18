# DEF-WEB-12 · Con la API caída, las pantallas del panel no dejan reintentar y afirman «0 registros», o la página se rompe

| Campo | Valor |
|---|---|
| Componente | Web, transversal (asistencia, notas, novedades, reportes, horarios; páginas del panel sin límite de error) |
| Severidad | **Media** · prioridad propuesta P3 |
| Estado | **Corregido** el 17/11/2026 · verificado contra el build de producción local (Netlify pausado); falta verlo en QA |
| Detectado el | 17/11/2026, al automatizar los casos de sistema (WC-05) |
| Caso que lo detectó | CP-SIS-040, 046, 052, 057, 058, 059 |
| Origen | Pruebas de sistema |
| Issue en GitHub | NO DISPONIBLE (se registra con `docs/defectos/registro.json`) |

## Pasos para reproducir

1. Iniciar sesión.
2. Dejar la API sin responder.
3. Abrir /asistencia, /notas, /novedades, /reportes o /horarios.

## Resultado esperado

Mensaje de error y opción de reintentar (CP-SIS-040, 052, 057, 058, 059); al guardar, mensaje con pasos para solucionarlo (CP-SIS-046).

## Resultado obtenido

El mensaje de error salía sin «Reintentar» y junto a «0 registros encontrados» o «No hay registros…». El horario del estudiante mostraba la página genérica de Next «This page couldn’t load». Al guardar una nota: «Error al guardar la nota», sin pasos.

## Causa

Cada pantalla tenía su bloque de error sin acción, y seguía pintando la tabla vacía y el contador. Las páginas del panel que llaman a la API al renderizarse (horario del estudiante, por ejemplo) no tenían un límite de error.

## Corrección (17/11/2026)

Componente común `ErrorCarga` (alerta con «Reintentar»); los cinco hooks exponen `reintentar`; con error, las pantallas ocultan la tabla y el contador dice «—». `src/app/(dashboard)/error.tsx` atrapa cualquier página del panel que falle al renderizar y ofrece «Reintentar» (`retry` de Next 16). Mensajes de carga y guardado con «Revisa tu conexión e intenta de nuevo».

## Pruebas

`tests/components/ErrorCarga.test.tsx`; E2E de CP-SIS-040, 046, 052, 057, 058/059 con el proxy de fallas (`scripts/api-fallas.mjs`).
