# SonarQube Cloud · PR #34 · Quality Gate **Passed**

| | |
|---|---|
| Proyecto | `marianacortes0_proyecto-eyesschool` (organización `marianacortes0`) |
| Pull request | #34 · `feat/web-calidad-pruebas` → `develop` |
| Commit | `8ce9da3` |
| Fecha | 03/11/2026 |
| Panel | https://sonarcloud.io/dashboard?id=marianacortes0_proyecto-eyesschool&pullRequest=34 |

## Resultado sobre el código nuevo

| Medida | Valor | Condición del gate |
|---|---|---|
| **Cobertura del código nuevo** | **86,2 %** (368 líneas por cubrir, 32 sin cubrir) | ≥ 80 % ✔ |
| Issues nuevos | **0** | 0 ✔ |
| Issues aceptados | 0 | — |
| Bugs nuevos | 0 | — |
| Vulnerabilidades nuevas | 0 | — |
| *Security hotspots* nuevos | 0 | 0 revisados pendientes ✔ |
| Duplicación en código nuevo | **0,0 %** | ≤ 3 % ✔ |
| Reliability | **A** | A ✔ |
| Security | **A** | A ✔ |
| Maintainability | **A** | A ✔ |
| Líneas nuevas analizadas | 4 786 | — |

## Cómo se llegó aquí

| Análisis | Cobertura nueva | Reliability | Gate |
|---|---|---|---|
| Antes de esta jornada | 60,6 % | **C** | Falla |
| Commit `8abe760` (arreglos de Reliability) | 64,4 % | **A** | Falla (solo cobertura) |
| Commit `8ce9da3` (lcov corregido + pruebas nuevas) | **86,2 %** | A | **Passed** |

1. **Reliability C → A:** los 9 issues corregidos en D-WEB-14 (`Number.NaN` y familia, la regex con backtracking del proxy, la cadena vacía en `NEXT_PUBLIC_API_URL` y las 7 promesas sin esperar), cada uno con su prueba.
2. **Cobertura:** la causa principal era que `coverage.include` de Vitest dejaba fuera del `lcov` archivos que sí tienen pruebas (el proxy, `PasswordChecklist`, `SelectorHijo`, `RegistroMasivo`, `FallidosMasivo`, los dos `*ViewerClient`), y Sonar los contaba con 0 %. Se midió todo `src` y se agregaron `tests/register.test.ts` (19 casos) y `tests/asociadoViewer.test.ts` (9) para los dos archivos con más líneas nuevas descubiertas. Detalle en D-WEB-13.
3. **Exclusiones de cobertura:** solo las vistas que D-WEB-05 asigna a los E2E, archivo por archivo en los componentes. Siguen dentro `src/hooks`, `src/lib`, `src/services`, `src/app/api/**` y los componentes con prueba propia. `sonar.exclusions` no creció.

Ningún umbral de Vitest bajó y **ningún issue se marcó como falso positivo ni como «no se va a corregir»**.

## Pendiente

La captura del Quality Gate (`sonar-quality-gate.png`) la toma Mariana desde el panel: no se puede generar desde el repositorio. Las cifras de arriba salen de la API de SonarQube Cloud (`/api/measures/component`) y del check «SonarCloud Code Analysis» del commit `8ce9da3`.
