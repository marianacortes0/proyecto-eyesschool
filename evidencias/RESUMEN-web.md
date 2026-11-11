# Resumen de pruebas · Frontend web Eyes School

| | |
|---|---|
| Rama | `feat/web-calidad-pruebas` (PR #34) |
| Commit | `c3e491f` para los niveles locales; detalle por corrida en `evidencias/commit.txt` |
| Fechas | 10 y 11/11/2026 |
| CI del PR #34 (`6b378e3`) | **verde**: «Lint, tipos, pruebas y build» y «SonarCloud Code Analysis» |
| Quality Gate | **Passed**: cobertura nueva 86,2 %, Reliability, Security y Maintainability A, 0 issues nuevos |
| Web de QA | `https://deploy-preview-34--qaeyesschool.netlify.app` (deploy preview del PR #34) |
| API de QA | `apieyeschool-q-g4hfgrgvepbecacc.chilecentral-01.azurewebsites.net/api/v1`. **Con base de datos desde el 10/11** |

Todas las cifras salen de las salidas guardadas en `evidencias/`. Ninguna evidencia contiene contraseñas, tokens ni cookies: cada archivo nuevo se revisó contra el valor de `QA_PASSWORD` y contra patrones de JWT antes de versionarlo, y gitleaks no encontró nada en las carpetas versionadas. El informe completo, caso por caso, está en `INFORME-WEB-para-QA.md`.

## Por nivel

| # | Nivel | Total | Pasan | Fallan | Bloqueadas | Otras | Evidencia |
|---|---|---|---|---|---|---|---|
| 1 | Tipos | — | **0 errores** | 0 | — | — | `PR-04/web/U5_tsc.txt` |
| 2 | Lint (`--max-warnings=0`) | 198 archivos | **0 errores, 0 advertencias** | 0 | — | — | `PR-04/web/U5_eslint.json` |
| 3 | Unitarias y de componentes | **327** en 35 archivos | **327** | 0 | 0 | 0 | `PR-04/web/U5_unitarias.xml` |
| 4 | Cobertura | ver abajo | cumple | — | — | — | `PR-04/web/U5_cobertura.txt` |
| 5 | Trazabilidad | 336 mapeadas | 126 UT · 189 extra · 21 IT | — | — | — | `docs/trazabilidad-ut-web.md` |
| 6 | Integración / contrato contra QA | **9** | **9** | 0 | 0 | 0 | `PR-05/web/I3_integracion.xml` |
| 6b | Contrato de rutas web ↔ `openapi.json` | 44 rutas | **44** | 0 | — | — | `PR-05/web/I3_contrato_rutas.json` |
| 7 | E2E (Chromium + Firefox) | **48** | **22** | **14** | **6** | **6 inestables** | `PR-06/web/E4_e2e.xml` (+ E5, E6) |
| 8 | Build de producción | — | **compila** | — | — | — | `PR-04/web/U5_build.txt` |
| 9 | Dependencias (`npm audit --omit=dev`) | — | **0 vulnerabilidades** | — | — | — | `PR-03/web/npm-audit.txt` |
| 10 | Secretos (gitleaks, 87 commits) | 4 hallazgos históricos | 0 nuevos | — | — | — | `PR-03/web/gitleaks.json` |
| 11 | Pruebas manuales | 24 casos | — | — | — | **pendientes** | `docs/pruebas-manuales-pr06-web.md` |

**Inestable** = falló por tiempo agotado en el deploy preview (carga de la portada, login o navegación), no por una comprobación. No cuenta como aprobado.

## Las 14 fallas E2E salen de 3 defectos de la web

| Defecto | Severidad | Ejecuciones que rompe | Qué pasa |
|---|---|---|---|
| **DEF-WEB-04** | **Alta** | 2 (CP-SIS-004) | `proxy.ts` está en la raíz y la app en `src/app`: **Next no lo carga**. El cierre por inactividad, la renovación proactiva y el guardia por rol de WEB-01 no corren en ningún despliegue. Las unitarias pasan porque llaman la función directamente |
| **DEF-WEB-03** | Media | 4 (CP-SIS-060 y CP-SIS-014) | BE-07 ya está en QA y devuelve `nombre_estudiante`; la web lee `nombre` y muestra «Estudiante #1» |
| **DEF-WEB-02** | Baja | 8 (CP-SIS-001, 4 roles × 2) | Hay dos `<main>` anidados en cada página |

Además: **DEF-WEB-05** (Baja), el registro esconde el motivo cuando la API responde 422. **DEF-WEB-01** (backend) quedó **cerrado** el 10/11.

Los 6 bloqueados: los 2 casos de BE-08 (falla esperada, que falló como se esperaba) y los 4 de CP-SIS-065 a escala (falta `E2E_SESSION_IDLE_MINUTES=1` y, de todos modos, DEF-WEB-04).

Lo que **sí se verificó en QA** con los E2E: el boletín del padre (WEB-09), el registro masivo con fallidos y reintento (WEB-06), las cookies httpOnly (WEB-02), los menús por rol, la gestión de usuarios y el guardia de rutas sin sesión.

## Cobertura (umbrales de `vitest.config.mts`, sin tocar)

| Área | Líneas | Umbral |
|---|---|---|
| `src/lib` | **87,8 %** (122/139) | 80 % ✔ |
| `src/services` | **73,9 %** (654/885) | 60 % ✔ |
| `src/hooks` | **32,6 %** (298/915) | sin umbral (D-WEB-05) |
| Lógica (las tres juntas) | **55,4 %** (1074/1939) | — |
| Todo `src` | 28,1 % (1385/4922) | — |

Idéntica al 05/11: `src/` no cambió. Las 25 pruebas nuevas (`tests/defectos.test.ts`) cubren `scripts/defectos/`, fuera de `src`.

## Cambios de esta jornada

- **Gestión de defectos en GitHub Issues + Actions** (D-WEB-15), en lugar de Azure Boards: plantilla «Defecto», plantilla de PR con `Corrige #N`, workflow **Defectos** y planeaciones actualizadas. Empieza a funcionar al fusionar el PR #34.
- **Pruebas E2E corregidas, no la app** (D-WEB-16 y D-WEB-17):
  - tiempos para un login de 14–17 s;
  - el oráculo del menú del admin;
  - el correo `.test` y el oráculo del registro;
  - las esperas de las Server Actions.

  Las pruebas que fallan por defectos reales no se tocaron.
- Datos de QA: las cuentas que dejaron las pruebas interrumpidas se borraron (quedan 110 usuarios, sin ninguna de E2E).

## Para cerrar

1. Decidir cuándo se corrigen DEF-WEB-02 a 05; **DEF-WEB-04 es Alta** y afecta al criterio de salida (acción externa 18).
2. Fusionar el PR #34, registrar DEF-020 a 028 y DEF-WEB-01 a 05 como issues (acciones 11, 14 y 15).
3. Revisar por qué falla la vista previa de Vercel desde el 05/11 (acción 19) y arreglar el `.env` local (acción 17).
4. BE-08 y `SESSION_IDLE_MINUTES=1` para desbloquear los 6 casos bloqueados.
5. Nivel 11: pruebas manuales. Captura del Quality Gate.
