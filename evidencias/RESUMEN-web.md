# Resumen de pruebas · Frontend web Eyes School

| | |
|---|---|
| Rama | `feat/web-calidad-pruebas` (PR #34) |
| Commit | `7d927df` para los niveles locales y la integración; detalle por corrida en `evidencias/commit.txt` |
| Fechas | 10 y 11/11/2026 |
| CI del PR #34 (`b557b25`) | **todo en verde**: lint, tipos, pruebas y build; SonarCloud; Netlify y **Vercel** (vuelve a compilar) |
| Quality Gate | **Passed**: cobertura nueva 86,6 %, Reliability, Security y Maintainability A, 0 issues nuevos |
| Web de QA | `https://deploy-preview-34--qaeyesschool.netlify.app` (deploy preview del PR #34) |
| API de QA | `apieyeschool-q-g4hfgrgvepbecacc.chilecentral-01.azurewebsites.net/api/v1`, con base de datos desde el 10/11 |

Todas las cifras salen de las salidas guardadas en `evidencias/`. Ninguna evidencia contiene contraseñas, tokens ni cookies: cada archivo nuevo se revisó contra el valor de `QA_PASSWORD` y contra patrones de JWT antes de versionarlo, y gitleaks no encontró nada en las carpetas versionadas. El informe completo, caso por caso, está en `INFORME-WEB-para-QA.md`.

## Por nivel

| # | Nivel | Total | Pasan | Fallan | Bloqueadas | Otras | Evidencia |
|---|---|---|---|---|---|---|---|
| 1 | Tipos | — | **0 errores** | 0 | — | — | `PR-04/web/U6_tsc.txt` |
| 2 | Lint (`--max-warnings=0`) | 199 archivos | **0 errores, 0 advertencias** | 0 | — | — | `PR-04/web/U6_eslint.json` |
| 3 | Unitarias y de componentes | **331** en 35 archivos | **331** | 0 | 0 | 0 | `PR-04/web/U6_unitarias.xml` |
| 4 | Cobertura | ver abajo | cumple | — | — | — | `PR-04/web/U6_cobertura.txt` |
| 5 | Trazabilidad | 341 mapeadas | 126 UT · 191 extra · 24 IT | — | — | — | `docs/trazabilidad-ut-web.md` |
| 6 | Integración / contrato contra QA | **10** | **10** | 0 | 0 | 0 | `PR-05/web/I4_integracion.xml` |
| 6b | Contrato de rutas web ↔ `openapi.json` | 44 rutas | **44** | 0 | — | — | `PR-05/web/I3_contrato_rutas.json` |
| 7 | E2E (Chromium + Firefox) | **48** | **35** | **0** | **6** | **7 inestables** (Firefox) | `PR-06/web/E7_e2e.xml` (+ E8, E9) |
| 8 | Build de producción | — | **compila**, con el proxy | — | — | — | `PR-04/web/U6_build.txt` |
| 9 | Dependencias (`npm audit --omit=dev`) | — | **0 vulnerabilidades** | — | — | — | `PR-03/web/npm-audit.txt` |
| 10 | Secretos (gitleaks, 97 commits) | 4 hallazgos históricos | 0 nuevos | — | — | — | `PR-03/web/gitleaks.json` |
| 11 | Pruebas manuales | 24 casos | — | — | — | **pendientes** | `docs/pruebas-manuales-pr06-web.md` |

**Inestable** = en la corrida completa se le agotó el tiempo en el deploy preview (carga de la portada o login de Firefox) y al repetirlo pasó. No cuenta como aprobado.

## Los 14 fallos E2E se corrigieron

| Defecto | Severidad | Fallos E2E | Corrección | Verificación en QA |
|---|---|---|---|---|
| **DEF-WEB-04** | Alta | 2 (CP-SIS-004) | `138db97`: `proxy.ts` → `src/proxy.ts`. Next 16 solo carga el proxy junto a `src/app`; en la raíz se ignoraba, así que el cierre por inactividad y el guardia de WEB-01 no corrían | El build lista el proxy; en local las rutas del panel dan 307; en QA borra la sesión inactiva; **CP-SIS-004 aprobado en los dos navegadores** |
| **DEF-WEB-03** | Media | 4 (CP-SIS-060, 014) | `4067c18`: el hijo se lee de `nombre_estudiante`, como lo envía BE-07 | Nuevo caso de integración contra QA; **el padre ve y cambia a sus hijos por nombre** en los dos navegadores |
| **DEF-WEB-02** | Baja | 8 (CP-SIS-001) | `e886144`: un solo `<main>` por página | **Los 4 roles aprobados** en los dos navegadores |

Antes de corregir (E4): 22 aprobados y **14 fallos**. Después (E7 a E9): 35 aprobados y **0 fallos**. Cada corrección tiene una prueba que fallaba antes y pasa después.

Sigue abierto **DEF-WEB-05** (Baja): el registro esconde el motivo cuando la API responde 422. No causaba ningún fallo E2E. **DEF-WEB-01** (backend) quedó cerrado el 10/11.

Los 6 bloqueados: 2 de BE-08 (falla esperada, que falló como se esperaba) y 4 de CP-SIS-065 a escala (falta `E2E_SESSION_IDLE_MINUTES=1`).

**Observación de la plataforma:** en Netlify el proxy se ejecuta, pero su 307 no llega al navegador: redirige la página, con el mismo resultado para el usuario. En `next start` el 307 sí llega.

## Cobertura (umbrales de `vitest.config.mts`, sin tocar)

| Área | Líneas | Umbral |
|---|---|---|
| `src/lib` | **87,8 %** (122/139) | 80 % ✔ |
| `src/services` | **73,9 %** (654/885) | 60 % ✔ |
| `src/hooks` | **32,6 %** (298/915) | sin umbral (D-WEB-05) |
| Lógica (las tres juntas) | **55,4 %** (1074/1939) | — |
| Todo `src` | 28,1 % (1385/4925) | — |

## Cambios de esta jornada

- **Corrección de DEF-WEB-02, 03 y 04** (D-WEB-18), con pruebas que vigilan que no vuelvan.
- **Gestión de defectos en GitHub Issues + Actions** (D-WEB-15) en lugar de Azure Boards. Empieza a funcionar al fusionar el PR #34.
- **Pruebas E2E corregidas** (D-WEB-16 y D-WEB-17), solo en oráculos, datos y tiempos con causa comprobada. Nunca para esconder un defecto.
- Datos de QA: las pruebas borraron lo que crearon. Hay 112 usuarios: los 110 originales más 2 cuentas ajenas a estas pruebas (ids 135 y 136).

## Para cerrar

1. Fusionar el PR #34 y registrar como issues DEF-020 a 028 y DEF-WEB-01 a 05 (acciones 11, 14 y 15). QA cierra DEF-WEB-01 a 04, que ya están verificados.
2. Confirmar `NEXT_PUBLIC_API_URL` en Vercel *Production* antes de fusionar a `main` (acción 19).
3. Decidir cuándo se corrige DEF-WEB-05.
4. BE-08 y `SESSION_IDLE_MINUTES=1` para los 6 bloqueados.
5. Nivel 11: pruebas manuales. Captura del Quality Gate.
