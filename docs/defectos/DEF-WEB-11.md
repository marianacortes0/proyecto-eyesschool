# DEF-WEB-11 · Después de las 19:00, la asistencia y otras fechas quedan con el día siguiente

| Campo | Valor |
|---|---|
| Componente | **Web**, transversal (24 sitios: asistencia, registro masivo, escaneo QR, novedades, reportes, perfil, usuarios, horarios) |
| Severidad | **Alta** · prioridad propuesta P2 (guarda datos con una fecha equivocada) |
| Estado | **Corregido** el 17/11/2026 · verificación en QA pendiente (ver «Verificación») |
| Detectado el | 17/11/2026, al preparar CP-SIS-040 (registro del día) |
| Caso que lo detectó | CP-SIS-040; afecta también a CP-SIS-032 a 037 y CP-SIS-047 |
| Origen | Pruebas de sistema |
| Evidencia | En la API de QA, los 10 registros del registro masivo de E14/E15 tienen `fecha: 2026-11-17` y `fecha_registro: 2026-11-17T02:52:49Z`, que en Colombia son las **21:52 del 16/11** |
| Issue en GitHub | NO DISPONIBLE (se registra con `docs/defectos/registro.json`) |

## Pasos para reproducir

1. Después de las 19:00 (hora de Colombia), registrar asistencia por QR, de forma manual o masiva.
2. Consultar el registro: la fecha es la del día siguiente.

## Resultado esperado

La fecha del registro es la del día en el colegio.

## Resultado obtenido

`new Date().toISOString()` da la fecha **UTC**. Colombia está en UTC−5, así que de 19:00 a 23:59 la fecha calculada ya es la de mañana. El servidor corre en UTC, por eso el problema aparece aunque el navegador esté en hora de Colombia.

## Corrección (17/11/2026)

`src/lib/utils/fecha.ts`: `hoyColegio()` calcula la fecha en la zona del colegio (`America/Bogota`) con `Intl.DateTimeFormat`, igual en el servidor y en el navegador. Los 24 sitios que usaban `toISOString().split('T')[0]` o `.slice(0, 10)` lo usan ahora.

## Pruebas

`tests/fecha.test.ts`: las 21:52 del 16/11 en Colombia dan el 16/11; mediodía y medianoche; y una regla que falla si algún archivo de `src/` vuelve a calcular «hoy» con la fecha UTC (fallaba con 24 sitios, pasa con 0).

## Verificación

La regla y las unitarias pasan. Falta verlo en QA con un registro hecho después de las 19:00 (hora de Colombia), o con el reloj del navegador y del servidor adelantado.

## Datos en QA

Los 10 registros del 17/11 de «Séptimo A» que dejó el registro masivo de las pruebas se hicieron el 16/11 a las 21:52. Son datos de prueba (la prueba no los borra a propósito, porque comprueba los duplicados del día), así que no se corrigieron.
