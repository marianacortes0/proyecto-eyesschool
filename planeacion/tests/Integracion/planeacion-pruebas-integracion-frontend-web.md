# Planeación de pruebas de integración — Frontend web (Next.js) · Eyes School

> **Tipo de documento:** planeación de QA para el PR-05 (Informe de pruebas de integración). Describe cómo se prueba la interfaz **web ↔ API**: qué casos, con qué herramientas, datos y comandos, y dónde queda cada resultado. No contiene resultados: se llenan al ejecutar.
> **Pensado para:** cualquier integrante del equipo o una IA que no conoce el proyecto. Los casos parten del PR-02 v0.2 (CP-INT-040 y CP-INT-076, riesgo R-07 del PR-01).
> **Elaboró:** Mariana Cortés (QA) · **Revisa:** Samuel Sierra (líder de pruebas) · **Aprueba:** Sergio Gómez (PO)
> **Plazo:** montaje en S7 (hasta el 6 nov 2026) y ejecución en S8 (7 – 14 nov 2026), según el PR-01.

---

## 1. Objetivo y alcance

Verificar que la web y la API hablan el mismo idioma: que los permisos que muestra la web son los que la API acepta y que los servicios de la web leen bien las respuestas reales de la API (nombres de campos, tipos y códigos de error). Así se detecta el riesgo R-07 del PR-01 (contrato roto: pantallas sin datos).

| Entra | No entra |
|---|---|
| Permisos de la web contra los roles de la API (CP-INT-076, con el endpoint de CP-INT-040) | Lógica pura con dobles: PR-04 |
| Server Actions y servicios llamando a la API real de QA | Flujos completos en el navegador con Playwright: PR-06 |
| Secuencia de llamadas del padre con varios hijos (WEB-03) | |

## 2. Contexto técnico

| Dato | Valor |
|---|---|
| Repositorio y commit | `proyecto-eyesschool` · `chore/calidad-seguridad` · `e5f9bde`, o `develop` si ya tiene las correcciones (se anota el commit) |
| Cliente de API | `src/services/api/` (`apiFetch`, `toCamel`): convierte las respuestas de la API (snake_case) a camelCase y usa el `detail` de FastAPI en los errores |
| Servicios por módulo | `src/services/<módulo>/` y Server Actions (`*Actions.ts`), que hoy leen el token de las cookies; WEB-INF-1 agrega `serverFetch(path, { token })` para poder pasar el token como parámetro |
| Framework | Vitest (el mismo del PR-04), con una configuración aparte para las pruebas que llaman a la API real |
| Entorno de la API | QA (URL pendiente de definir en el PR-01); mientras no exista, la API local con la base de Docker de la planeación del backend |

## 3. Casos

| ID | Caso del PR-02 | Qué se verifica | Archivo | Hoy |
|---|---|---|---|---|
| IT-WEB-01 | CP-INT-076 (y CP-INT-040) | `PERMISSIONS` de `src/lib/utils/permissions.ts` contra la tabla `tests/fixtures/apiRoles.ts`, armada con los `require_roles(...)` de `app/api/v1/*.py` del backend: 0 diferencias | `tests/permissions.test.ts` (caso nuevo de WEB-04) | Falla esperada (WEB-04: el docente puede borrar asistencia en la web y la API se lo niega) |
| IT-WEB-02 | CP-INT-062 desde la web | Con `fetch` simulado que responde con el JSON real de `/padres/me/hijos`, `getHijosAction` y `resolveAsociado` llaman `/padres/me/hijos` y luego `/estudiantes/11/notas` | `tests/asociadoActions.test.ts` (WEB-03) | Falla esperada (WEB-03 y BE-07) |
| IT-WEB-03 | R-07 · contrato real | Iniciar sesión con cada rol en la API de QA y llamar con `serverFetch` a los servicios de usuarios, asistencia del día, notas (estudiante y padre), novedades, horarios, asignaciones y reportes. Cada respuesta se pasa por el mismo mapeo de la web y se comprueba que los campos obligatorios del tipo TypeScript existen y no son `undefined` | `tests/integration/contrato-api.int.test.ts` | Sin ejecutar |
| IT-WEB-04 | CP-INT-060 desde la web | Inicio del estudiante: `dashboardService` contra `/dashboard/estudiante` | Mismo archivo | Falla esperada (BE-03: 500) |
| IT-WEB-05 | Errores de la API | Un 401, un 403, un 404 y un 422 reales llegan a la vista como el mensaje del `detail` (no «[object Object]») | Mismo archivo | Sin ejecutar |

## 4. Preparación (S7)

1. **Tabla de roles de la API:** `tests/fixtures/apiRoles.ts` con, por recurso y acción, los roles que la API permite. Se arma leyendo `require_roles(...)` de cada archivo de `app/api/v1/` del backend y se actualiza cuando el backend cambie un permiso (lo revisa el autor del PR del backend).
2. **Configuración aparte:** `vitest.integration.config.mts` que incluye solo `tests/integration/**/*.int.test.ts`, entorno Node y `testTimeout` de 20 s. Así `npm test` no llama a la API real.
3. **Variables:** `QA_API_URL` y los correos de DS-01 y DS-03 en `.env.test.local` (fuera del repositorio); `QA_PASSWORD` como secreto.
4. **Script:** `"test:int": "vitest run --config vitest.integration.config.mts"`.
5. **VS Code:** extensión Vitest (permite elegir la configuración de integración) y la extensión Postman o Thunder Client para revisar a mano una respuesta cuando un caso falle.

## 5. Ejecución (S8)

| Corrida | Fecha | Qué mide |
|---|---|---|
| I1 | 7 nov 2026 | Estado al empezar S8 |
| I2 | 13 nov 2026 | Con las correcciones de S7 y S8 en QA; resultado oficial del PR-05 |

```bash
git rev-parse --short HEAD > evidencias/PR-05/web/I1_commit.txt
npm ci

# 1. Permisos y secuencia de llamadas (sin red)
npx vitest run tests/permissions.test.ts tests/asociadoActions.test.ts \
    --reporter=default --reporter=junit --outputFile.junit=evidencias/PR-05/web/I1_contrato_local.xml

# 2. Contrato contra la API de QA (variables en .env.test.local; la contraseña es un secreto)
npm run test:int -- --reporter=default --reporter=junit \
    --outputFile.junit=evidencias/PR-05/web/I1_contrato_qa.xml > evidencias/PR-05/web/I1_contrato_qa.txt
```

- Antes de la corrida en QA, el backend ejecuta `scripts/qa_reset_passwords.py` (BE-INF-2).
- Si un caso falla, se guarda la respuesta real de la API (sin el token) junto a la evidencia para el bug.

## 6. Criterios

| Indicador | Meta |
|---|---|
| Casos ejecutados | 100 % (IT-WEB-01 a 05) |
| Casos aprobados en la I2 | 100 % de los que no dependen de una corrección pendiente; ≥ 95 % en total (PR-01) |
| Diferencias de permisos web ↔ API | 0 |

## 7. Registro en el PR-05 y defectos

| Resultado | Dónde va |
|---|---|
| Totales de los dos reportes JUnit | Tabla 1 (sumados con la API y la app) |
| IT-WEB-01 a 05 | Tabla 2, fila «Web ↔ API» |
| Detalle de CP-INT-076 y del contrato | Tabla 3 |
| Servicio que no lee bien una respuesta | Issue de defecto en GitHub (plantilla «Defecto», origen «Pruebas de integración») con el endpoint y el campo |

## 8. Responsables y calendario

| Actividad | Fecha | Responsable |
|---|---|---|
| Tabla `apiRoles` y configuración de integración | 3 – 6 nov | Mariana Cortés (con Andrés Acero para los roles del backend) |
| IT-WEB-03 a 05 | 3 – 6 nov | Mariana Cortés |
| IT-WEB-02 (con WEB-03) | S8 | Mariana Cortés |
| I1 | 7 nov | Mariana Cortés |
| I2 y fila Web del PR-05 | 13 – 14 nov | Mariana Cortés · revisa Samuel Sierra |

## 9. Definición de terminado

- [ ] `npm test` no llama a la API real; `npm run test:int` sí.
- [ ] `apiRoles` refleja los `require_roles` actuales del backend y `PERMISSIONS` no tiene diferencias.
- [ ] I1 e I2 ejecutadas, con evidencias en `evidencias/PR-05/web/` sin tokens ni contraseñas.
- [ ] Fila Web ↔ API del PR-05 diligenciada y revisada por el líder de pruebas.
