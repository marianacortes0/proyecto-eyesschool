# Planeación de pruebas unitarias y cobertura — Frontend web (Next.js) · Eyes School

> **Tipo de documento:** planeación de QA para el PR-04 (Informe de pruebas unitarias y cobertura). Describe qué pruebas unitarias existen, cuáles se escriben, cómo se ejecutan, cómo se mide la cobertura y dónde queda cada resultado. No contiene resultados: se llenan al ejecutar.
> **Pensado para:** cualquier integrante del equipo o una IA que no conoce el proyecto. El inventario se contó leyendo el código del commit `e5f9bde` el 02/11/2026.
> **Elaboró:** Mariana Cortés (QA) · **Revisa:** Samuel Sierra (líder de pruebas) · **Aprueba:** Sergio Gómez (PO)
> **Plazo:** las pruebas nuevas se escriben con cada corrección (S7 y S8); la ejecución que se reporta en el PR-04 es en S8 (7 – 14 nov 2026), según el PR-01.

---

## 1. Objetivo y alcance

Verificar funciones puras, servicios, Server Actions, hooks y componentes de la web con dobles (`fetch` simulado, `next/headers` y `next/navigation` falsos) y medir por primera vez la cobertura de `src/lib`, `src/services` y `src/hooks`.

| Es prueba unitaria o de componente (PR-04) | No entra en el PR-04 |
|---|---|
| `tests/**/*.test.ts` y `tests/**/*.test.tsx` con Vitest | Contrato contra la API de QA (`tests/integration/`): **PR-05** · E2E con Playwright (`e2e/`): **PR-06** |

## 2. Contexto técnico

| Dato | Valor |
|---|---|
| Repositorio y commit | `proyecto-eyesschool` · `chore/calidad-seguridad` · `e5f9bde` (25/10/2026). Si para el 7 nov ya existe `develop` con las correcciones, se ejecuta sobre `develop` y se anota el commit |
| Framework | Vitest `^4.1.12` (`npm test` = `vitest run`). Hoy solo hay entorno de Node: no se pueden probar hooks ni componentes hasta WEB-INF-1 |
| Cobertura | No existe todavía. WEB-INF-2 agrega `@vitest/coverage-v8` y el script `test:cov` |
| CI | `ci.yml`: `npm test` (sin cobertura) |
| Línea base (MC-01, 25/10/2026) | 28 de 28 pruebas aprobadas · cobertura no medida |

## 3. Inventario actual (contado en el código)

| Archivo | Casos | Qué prueba |
|---|---|---|
| `tests/apiClient.test.ts` | 8 | `toCamel`, `apiFetch` (Bearer, 204, `detail` de FastAPI, primer error de un 422) y `errorMessage` |
| `tests/password.test.ts` | 6 (uno con `it.each` de 5 contraseñas) | Las cinco reglas de la política de contraseñas |
| `tests/permissions.test.ts` | 7 | Permisos por rol y traducción de nombres e ids de rol |
| `tests/routeGuard.test.ts` | 7 | Guardia de rutas del middleware actual (versión que WEB-01 reemplaza) |
| **Total** | **28 (cuadra con la línea base)** | |

## 4. Preparación (S7): WEB-INF-1 y WEB-INF-2

1. Dependencias de desarrollo: `jsdom`, `@testing-library/react`, `@testing-library/dom` y `@vitest/coverage-v8` (misma versión que `vitest`).
2. `vitest.config.mts`:
   - `include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx']` (deja fuera `tests/integration/` si sus archivos usan el sufijo `.int.test.ts`; ver la planeación del PR-05);
   - entorno `jsdom` para `*.test.tsx`;
   - `setupFiles: ['tests/setup/nextMocks.ts']` con dobles de `next/headers` y `next/navigation`;
   - `coverage: { provider: 'v8', reporter: ['text', 'json-summary', 'lcov', 'html'], include: ['src/lib/**', 'src/services/**', 'src/hooks/**'] }`.
3. Scripts: `"test:cov": "vitest run --coverage"`; el CI pasa de `npm test` a `npm run test:cov`.
4. Prueba de humo del entorno: `tests/hooks/usePermissions.test.tsx` con `renderHook`.

## 5. Pruebas unitarias nuevas (salen de la planeación de correcciones de la web)

Cada una se escribe **antes** del cambio y debe fallar contra el código actual.

| ID | Corrección | Archivo | Casos | Resultado esperado hoy |
|---|---|---|---|---|
| UT-WEB-01 | WEB-INF-1 · entorno | `tests/hooks/usePermissions.test.tsx` | 1 (el hook devuelve los permisos del rol) | Falla: no hay entorno `jsdom` |
| UT-WEB-02 | WEB-01 · sesión y rutas | `tests/routeGuard.test.ts` (contra el módulo nuevo) | 8 (refresco válido, refresco inválido, sin cookies, padre en `/usuarios`, docente en `/qr/escanear`, mapa único, inactividad de 30 min, actividad reciente) | Falla: el middleware usado no renueva ni mide inactividad |
| UT-WEB-03 | WEB-02 · cookies | `tests/authCookies.test.ts`, `tests/decodeRol.test.ts`, `tests/apiClient.test.ts` (casos nuevos) | 3 | Falla: cookies con `httpOnly: false`; rol leído de `eys_user` |
| UT-WEB-04 | WEB-03 · varios hijos | `tests/hijoActivo.test.ts`, `tests/components/SelectorHijo.test.tsx` | 5 (elige el pedido; id ajeno o sin id; sin hijos; selector oculto con 1 hijo; cambia `?hijo=` con 2) | Falla: no existen |
| UT-WEB-05 | WEB-04 · permisos | `tests/permissions.test.ts` (casos nuevos) | 2 (`can('docente','delete','asistencia')` es `false`; el admin sí) | Falla: hoy el docente puede borrar |
| UT-WEB-06 | WEB-05 · restablecer contraseña | `tests/resetPassword.test.ts` | 5 | Falla: solo exige 8 caracteres |
| UT-WEB-07 | WEB-06 · registro masivo | `tests/registroMasivo.test.ts`, `tests/components/RegistroMasivo.test.tsx` | 3 (clasificación, reintento solo del fallido, vista con nombre y botones) | Falla: no clasifica ni reintenta |
| UT-WEB-08 | WEB-09 · boletín y mensajes del padre | `tests/components/NotasViewerClient.test.tsx`, `tests/notasService.test.ts` | 3 (botón visible, texto exacto sin notas, error de boletín sin datos) | Falla: no hay botón y los textos no coinciden |

La prueba de WEB-03 que llama a la API con `fetch` simulado (`tests/asociadoActions.test.ts`) y la que compara `PERMISSIONS` con la tabla de roles de la API (`apiRoles`) son de contrato y van en la planeación del PR-05.

## 6. Herramientas en VS Code

- Extensión **Vitest**: pestaña Testing, ejecución por caso y depuración.
- Extensión **Coverage Gutters** (opcional) con `coverage/lcov.info`.
- Node.js 24 y `npm ci` en el repositorio.

## 7. Ejecución (S8)

| Corrida | Fecha | Qué mide |
|---|---|---|
| U1 | 7 nov 2026 | Estado al empezar S8; primera medición de cobertura de la web |
| U2 | 13 nov 2026 | Con las correcciones de S7 y S8 fusionadas; es el resultado oficial del PR-04 |

```bash
git rev-parse --short HEAD           > evidencias/PR-04/web/U1_commit.txt
npm ci

# 1. Inventario
npx vitest list                      > evidencias/PR-04/web/U1_inventario.txt

# 2. Ejecución con cobertura y reporte JUnit para contar resultados
npx vitest run --coverage --reporter=default --reporter=junit \
    --outputFile.junit=evidencias/PR-04/web/U1_junit.xml > evidencias/PR-04/web/U1_vitest.txt
cp coverage/coverage-summary.json evidencias/PR-04/web/U1_coverage_summary.json
cp -r coverage evidencias/PR-04/web/U1_coverage_html
```

- La cobertura por carpeta (`src/lib`, `src/services`, `src/hooks`) sale del reporte HTML o de `coverage-summary.json`.
- Si en la U1 todavía no está fusionado WEB-INF-2, la ejecución se hace con `npm test` y la cobertura queda «No medida» en el PR-04.

## 8. Criterios

| Indicador | Meta | Origen |
|---|---|---|
| Pruebas ejecutadas | 100 % de las planificadas | PR-01 |
| Pruebas aprobadas | ≥ 95 %; en la U2, 100 % de las de correcciones ya fusionadas | PR-01 / MC-01 |
| Cobertura de `src/lib`, `src/services` y `src/hooks` | Sin meta en el MC-01: la U1 es la línea base y ninguna corrección la puede bajar (WEB-INF-2) | MC-01, sección de instrumentos |

## 9. Exclusiones de la medición

| Excluido | Motivo |
|---|---|
| `src/app/**` y `src/components/**` (vistas `*Client.tsx` y páginas) | Se cubren con E2E (PR-06); solo se miden las capas de lógica |
| `src/app/home/**` y `src/components/home/**` | Páginas informativas |
| Scripts de la raíz (`create-first-admin.js`, etc.) | Utilidades de administración, fuera de la aplicación |

## 10. Registro en el PR-04 y defectos

| Resultado | Dónde va |
|---|---|
| Totales de `U2_junit.xml` y tiempo | Tabla 1 |
| `U2_inventario.txt` | Tabla 2 |
| Cobertura por carpeta | Tabla 3 y sección 4.2 |
| Prueba fallida sin corrección planeada | Bug en Azure Boards (etiqueta `pruebas-unitarias`) y Tabla 4 |
| Prueba nueva que falla porque su corrección no se ha fusionado | Tabla 4 con estado «Falla esperada» y la referencia WEB-xx |

## 11. Responsables y calendario

| Actividad | Fecha | Responsable |
|---|---|---|
| WEB-INF-1 y WEB-INF-2 | S7 (primero) | Mariana Cortés |
| UT-WEB-01, 02, 05 y 06 | S7 | Mariana Cortés |
| UT-WEB-03, 04, 07 y 08 | S8 | Mariana Cortés |
| U1 | 7 nov | Mariana Cortés |
| U2 y columna Web del PR-04 | 13 – 14 nov | Mariana Cortés · revisa Samuel Sierra |

## 12. Definición de terminado

- [ ] `npm run test:cov` en el CI con `@vitest/coverage-v8`.
- [ ] Las 8 pruebas nuevas existen, fallaron antes de su corrección y pasan después.
- [ ] U1 y U2 ejecutadas, con evidencias en `evidencias/PR-04/web/`.
- [ ] Columna Web del PR-04 diligenciada y revisada por el líder de pruebas.
