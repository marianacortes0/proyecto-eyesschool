# DEF-WEB-13 · El historial de novedades no está ordenado por fecha

| Campo | Valor |
|---|---|
| Componente | Web (`useNovedades`, `NovedadesViewerClient`) |
| Severidad | **Baja** · prioridad propuesta P4 |
| Estado | **Corregido** el 17/11/2026 · verificado contra el build de producción local (Netlify pausado); falta verlo en QA |
| Detectado el | 17/11/2026, al automatizar los casos de sistema (WC-05) |
| Caso que lo detectó | CP-SIS-049 |
| Origen | Pruebas de sistema |
| Issue en GitHub | NO DISPONIBLE (se registra con `docs/defectos/registro.json`) |

## Pasos para reproducir

1. Como docente, abrir /novedades.
2. Buscar un estudiante con varias novedades.

## Resultado esperado

Historial del estudiante ordenado por fecha (CP-SIS-049).

## Resultado obtenido

Las novedades salían en el orden de la API: 14/6, 16/6, 12/6…

## Causa

Ninguna de las dos vistas ordenaba la lista.

## Corrección (17/11/2026)

`porFechaReciente` (`src/services/novedades/novedadesService.ts`): de la más reciente a la más antigua y, en el mismo día, la última registrada primero. La usan la vista del docente y la del estudiante/padre.

## Pruebas

`tests/novedadesOrden.test.ts` (2 casos); E2E CP-SIS-049.
