# DEF-WEB-14 · El docente ve en /horarios los bloques de todos los profesores, no solo sus clases

| Campo | Valor |
|---|---|
| Componente | Web (`getHorariosBootstrapAction`, `HorariosClient`) |
| Severidad | **Media** · prioridad propuesta P3 |
| Estado | **Corregido** el 17/11/2026 · verificado contra el build de producción local (Netlify pausado); falta verlo en QA |
| Detectado el | 17/11/2026, al automatizar los casos de sistema (WC-05) |
| Caso que lo detectó | CP-SIS-059 |
| Origen | Pruebas de sistema |
| Issue en GitHub | NO DISPONIBLE (se registra con `docs/defectos/registro.json`) |

## Pasos para reproducir

1. Iniciar sesión como docente.
2. Abrir /horarios.

## Resultado esperado

Solo sus cursos y materias; si no tiene asignaciones, un mensaje (CP-SIS-059).

## Resultado obtenido

«10 bloques registrados»: la misma vista del admin, con los horarios de todos los profesores. Sin asignaciones, no había mensaje.

## Causa

La página entregaba a admin y docente la misma carga de datos, sin filtrar por rol. El docente solo tiene permiso de lectura, así que no podía modificar nada ajeno.

## Corrección (17/11/2026)

`horariosDelDocente` filtra los bloques por las asignaciones activas del docente; el filtro se aplica en el servidor (`getHorariosBootstrapAction`), así que los horarios de los demás no le llegan. Sin asignaciones: «No tienes clases asignadas.».

## Pruebas

`tests/horariosDocente.test.ts` (3 casos); E2E CP-SIS-059 (sus clases contra la API y docente sin asignaciones).
