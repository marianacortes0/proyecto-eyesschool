# DEF-WEB-03 · El selector de hijos muestra «Estudiante #1» en vez del nombre: la web no lee los campos de BE-07

| Campo | Valor |
|---|---|
| Componente | **Web** (`src/services/asociado/asociadoActions.ts`, `aHijo`) |
| Severidad | **Media** · prioridad propuesta P3 |
| Estado | **Abierto** |
| Detectado el | 10/11/2026, corrida E2E E3, el primer día con BE-07 desplegado en QA |
| Caso que lo detectó | CP-SIS-060 · `e2e/padre-dos-hijos.spec.ts` «el padre de prueba cambia de hijo…» (Chromium y Firefox). También rompe **CP-SIS-014** (`e2e/registro-padre.spec.ts`): el padre recién registrado ve «Estudiante #4» en vez de «María Rodríguez» (corrida E6) |
| Corrección relacionada | WEB-03 (DEF-022), que depende de BE-07 |
| Origen | Pruebas de sistema (riesgo R-07, contrato web ↔ API) |
| Evidencia | `evidencias/PR-06/web/E3_e2e-consola.txt` (fallos 6 y 19), `E4_e2e.xml`, `E5_reintento.xml`, `E6_registro-padre.xml` |
| Issue en GitHub | NO DISPONIBLE (acción externa 11) |

## Pasos para reproducir

1. Iniciar sesión con el padre de dos hijos del seed.
2. Abrir `/notas`.
3. Mirar las opciones del selector «Estudiante».

## Resultado esperado

`Sofía Rodríguez` y `Santiago López`.

## Resultado obtenido

`Estudiante #1` y `Estudiante #3`. El documento de cada hijo también queda vacío.

## Causa

Las dos planeaciones definen BE-07 con nombres de campo distintos:

| Fuente | Campos del hijo |
|---|---|
| Planeación del backend (`planeacion-backend-api`, BE-07) y la API desplegada (`HijoOut`) | `id_estudiante`, **`nombre_estudiante`**, **`documento_estudiante`**, `parentesco`, `id_curso_actual` |
| Planeación del frontend (WEB-03, línea 151), `aHijo()` y el fixture `HIJOS_API` de `tests/asociadoActions.test.ts` | `idEstudiante`, **`nombre`**, **`documento`**, `parentesco`, `idCursoActual` |

Respuesta real de `GET /padres/me/hijos` en QA el 10/11 (datos sintéticos del seed): `[{"id_estudiante":1,"nombre_estudiante":"Sofía Rodríguez","documento_estudiante":"20000001","parentesco":"Madre","id_curso_actual":1}, …]`.

`aHijo()` busca `nombre`, no lo encuentra y cae al texto de respaldo `Estudiante #<id>`. El respaldo de D-WEB-02 (`/padres/me`) sí lee `nombreEstudiante`, por eso con un solo hijo no se notaba.

**Por qué no lo vio ninguna prueba anterior:**
- La unitaria simula la forma equivocada.
- La integración (IT-WEB-03, padre) solo exige que los campos no lleguen `undefined`, y el respaldo hace que `nombre` siempre tenga valor.

## Corrección propuesta (no aplicada)

- En `aHijo()`, leer `nombreEstudiante` y `documentoEstudiante`, con `nombre` y `documento` como alternativa.
- Corregir el fixture `HIJOS_API` a la forma real de `HijoOut`.
- Corregir la línea 151 de la planeación del frontend.
- Hacer que IT-WEB-03 (padre) compruebe que el nombre del hijo no es el texto de respaldo.
