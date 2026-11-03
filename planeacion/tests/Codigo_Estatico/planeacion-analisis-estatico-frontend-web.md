# Planeación del análisis estático — Frontend web (Next.js) · Eyes School

> **Tipo de documento:** planeación de QA para el PR-03 (Informe de análisis estático de código). Describe qué se va a analizar, con qué herramientas y comandos, contra qué umbrales y dónde queda cada resultado. No contiene resultados: se llenan al ejecutar.
> **Pensado para:** cualquier integrante del equipo o una IA que no conoce el proyecto. La configuración, los scripts de `package.json` y el CI se verificaron contra el repositorio el 02/11/2026.
> **Elaboró:** Mariana Cortés (QA) · **Revisa:** Samuel Sierra (líder de pruebas) · **Aprueba:** Sergio Gómez (PO)
> **Plazo:** preparación en S7 (hasta el 6 nov 2026) y ejecución en S8 (7 – 14 nov 2026), según el cronograma del PR-01.

---

## 1. Objetivo y alcance

El análisis estático revisa el código **sin ejecutarlo**: reglas de ESLint, tipos con TypeScript, complejidad, duplicación, secretos, dependencias vulnerables y calidad general en SonarQube Cloud. Sus resultados alimentan el PR-03 y se comparan con los umbrales del MC-01.

| Entra | No entra |
|---|---|
| `src/` y `middleware.ts` (código de la aplicación) | `.next/`, `out/`, `build/`, `node_modules/` |
| Scripts de la raíz (`create-first-admin.js`, `sync-auth-users.js`, `test-auth.js`, etc.): solo para secretos, porque ESLint los ignora a propósito | Páginas informativas `src/app/home/**` y `src/components/home/**` en SonarQube (exclusión acordada en WEB-INF-4); sí entran en ESLint y tsc |
| `package.json` y `package-lock.json` (dependencias) | Accesibilidad y rendimiento con Lighthouse/axe y escaneo dinámico con OWASP ZAP: van en el PR-06 |
| Historial completo de git (secretos) | Pruebas con Vitest y Playwright: PR-04 y PR-06 |

## 2. Contexto técnico

| Dato | Valor |
|---|---|
| Repositorio | `github.com/AndresFelipeAceroLopez/proyecto-eyesschool` (público) |
| Rama y commit a analizar | `chore/calidad-seguridad` · `e5f9bde` (25/10/2026). Si para el 7 nov ya existe `develop` actualizada con las correcciones de S7, se analiza `develop` y se anota el commit exacto en el PR-03 |
| Stack | Next.js `^16.4.3`, React 19, TypeScript `^5`, ESLint `^9`, Vitest `^4.1.12` |
| Reglas de ESLint | `eslint.config.mjs`: `eslint-config-next/core-web-vitals` + `eslint-config-next/typescript`; `react-hooks/set-state-in-effect` como advertencia; ignora los scripts CommonJS de la raíz |
| Scripts | `npm run lint` (`eslint`), `npm run typecheck` (`tsc --noEmit`), `npm test` (`vitest run`), `npm run build` |
| CI actual | `.github/workflows/ci.yml`, job «Lint, tipos, pruebas y build»: `npm ci` → lint → typecheck → tests → build → `npm audit --omit=dev --audit-level=high`. Node 24 |
| Línea base (MC-01, 25/10/2026) | ESLint: 0 errores y 28 advertencias · tsc: 0 errores · npm audit: 0 vulnerabilidades · 20,7 KLOC · cobertura no medida |

## 3. Qué se mide

| # | Métrica | Herramienta | Umbral | Dónde va en el PR-03 |
|---|---|---|---|---|
| W1 | Errores y advertencias de ESLint | `npm run lint` | 0 errores (MC-01); advertencias informativas (WEB-08 las lleva a 0) | Tablas 1 y 2 |
| W2 | Errores de tipos | `npm run typecheck` | 0 (MC-01) | Tablas 1 y 2 |
| W3 | Calificaciones, bugs, vulnerabilidades, hotspots, code smells, complejidad cognitiva, deuda técnica | SonarQube Cloud | Métrica adicional del MC-01 (Quality Gate «Sonar way» como referencia) | Tablas 1, 2 y 3; captura en la sección 3 |
| W4 | Complejidad ciclomática por función | `lizard 1.25.0` (TypeScript y TSX) | Informativa: funciones con CCN > 15 | Tabla 2 |
| W5 | Duplicación | `jscpd 4.3.0` | ≤ 3 % (MC-01) | Tablas 1 y 2 |
| W6 | Líneas de código | `pygount` y líneas físicas de jscpd | — | Tablas 2 y 3 |
| W7 | Secretos en el código y en el historial | `gitleaks 8.24.2` | 0 secretos sin revocar y documentar | Tablas 1 y 4 |
| W8 | Dependencias vulnerables | `npm audit` (producción y completo) | 0 críticas o altas en producción (MC-01 y CI) | Tabla 1 |
| W9 | Cobertura (dato de entrada para SonarQube) | `vitest run --coverage` (WEB-INF-2) | Sin umbral en el MC-01: se registra la línea base | Tabla 2 |

## 4. Preparación (S7, hasta el 6 nov)

### WEB-SA-1 · SonarQube Cloud (es parte de WEB-INF-4 de la planeación de correcciones)

1. Importar `proyecto-eyesschool` en la misma organización de SonarQube Cloud. Clave sugerida: `AndresFelipeAceroLopez_proyecto-eyesschool`.
2. Desactivar «Automatic Analysis»; crear el secreto `SONAR_TOKEN` en GitHub.
3. `sonar-project.properties`:
   - `sonar.sources=src,middleware.ts`
   - `sonar.tests=tests`
   - `sonar.javascript.lcov.reportPaths=coverage/lcov.info`
   - `sonar.exclusions=src/app/home/**,src/components/home/**`
4. En `ci.yml`: el paso de pruebas pasa a `npm run test:cov` (WEB-INF-2) y después va `SonarSource/sonarqube-scan-action` con `env: SONAR_TOKEN`.

### WEB-SA-2 · Cobertura (WEB-INF-2)

- Agregar `@vitest/coverage-v8` en la misma versión de `vitest` y el script `"test:cov": "vitest run --coverage"` con `reporter: ['text', 'lcov']` e `include: ['src/lib/**', 'src/services/**', 'src/hooks/**']`.

### WEB-SA-3 · gitleaks en el CI

- Job con `gitleaks/gitleaks-action` y `fetch-depth: 0`.
- **Hallazgo ya identificado que el escaneo debe confirmar:** el commit `b7e20f5` (13/04/2026) agregó `check-profs.js`, `diagnose-docente.js` y `setup-samuel.js` con una clave `service_role` de Supabase (salta los permisos de la base). El commit `7f94613` los borró, pero siguen en el historial.
  - **Acción inmediata, antes de la E1:** confirmar si ese proyecto de Supabase sigue existiendo. Si existe, revocar o rotar la clave `service_role` o dar de baja el proyecto. Registrar la acción en el PR-07.
  - Después de revocarla, la huella del hallazgo va a `.gitleaksignore` con la fecha de revocación, para que el CI quede en verde sin ocultar hallazgos nuevos.
- El mismo commit agregó `diag.json`, `explore.json` y archivos `*_output.txt` con datos de usuarios. Revisarlos durante la E1 para decidir si contienen datos personales que obliguen a limpiar el historial.

### WEB-SA-4 · Herramientas locales de quien ejecuta

- Node.js 24 y `npm ci` en el repositorio. VS Code con las extensiones ESLint, Vitest y SonarQube for IDE.
- `pip install lizard==1.25.0 pygount` · `npx jscpd@4.3.0` · binario `gitleaks` 8.24.2 desde GitHub Releases.
- Carpeta de evidencias: `evidencias/PR-03/web/` (unidad compartida del equipo, no en el repositorio).

## 5. Ejecución (S8)

| Corrida | Fecha | Qué mide |
|---|---|---|
| E1 · línea base del PR-03 | 7 nov 2026 | El estado al empezar S8 (commit anotado) |
| E2 · después de correcciones | 13 nov 2026 | Con las correcciones WEB de S7 y S8 fusionadas; alimenta la sección 8 (evolución) del PR-03 |

Pasos de cada corrida, desde la raíz del repositorio:

```bash
# 0. Commit, versiones y dependencias limpias
git rev-parse --short HEAD               > evidencias/PR-03/web/E1_commit.txt
node --version; npm --version            > evidencias/PR-03/web/E1_versiones.txt
npm ci

# 1. ESLint y tipos (W1, W2)
npx eslint . -f json -o evidencias/PR-03/web/E1_eslint.json
npm run lint                             > evidencias/PR-03/web/E1_eslint.txt
npm run typecheck                        > evidencias/PR-03/web/E1_tsc.txt

# 2. Complejidad y tamaño (W4, W6)
lizard src middleware.ts -l typescript -l tsx --csv > evidencias/PR-03/web/E1_lizard.csv
lizard src middleware.ts -l typescript -l tsx -C 15 -w > evidencias/PR-03/web/E1_lizard_ccn15.txt
pygount --format=summary src middleware.ts > evidencias/PR-03/web/E1_loc.txt

# 3. Duplicación (W5)
npx jscpd@4.3.0 src --min-lines 5 --min-tokens 50 --reporters json,console --output evidencias/PR-03/web/E1_jscpd

# 4. Secretos en todo el historial (W7); --redact evita mostrar valores
gitleaks git . --redact --report-format json --report-path evidencias/PR-03/web/E1_gitleaks.json

# 5. Dependencias (W8): producción (lo que exige el CI) y completo (incluye desarrollo)
npm audit --omit=dev --json              > evidencias/PR-03/web/E1_npm_audit_prod.json
npm audit --json                         > evidencias/PR-03/web/E1_npm_audit_todo.json

# 6. Cobertura (W9), cuando WEB-SA-2 esté fusionado
npm run test:cov                         > evidencias/PR-03/web/E1_cobertura.txt
```

7. **SonarQube Cloud (W3):** con el CI ya corrido sobre la rama analizada, guardar la captura del Overview, la lista de Issues Blocker y Critical, los Security Hotspots y los valores de Technical Debt y Debt Ratio (Measures → Maintainability).

En E2 se repiten los pasos con el prefijo `E2_`.

## 6. Criterio de aprobación (Quality Gate de la web)

| Condición | Umbral | Origen |
|---|---|---|
| Errores de ESLint | 0 | MC-01 / QG3 |
| Errores de tipos | 0 | MC-01 / QG3 |
| Vulnerabilidades críticas o altas en código y dependencias de producción (incluye secretos sin revocar) | 0 | MC-01 |
| Duplicación | ≤ 3 % | MC-01 |
| Quality Gate de SonarQube Cloud | Aprobado (métrica adicional) | MC-01, sección de instrumentos |

Las advertencias de ESLint, las vulnerabilidades moderadas o bajas, las de dependencias solo de desarrollo y las funciones con CCN > 15 no bloquean: entran al plan de remediación del PR-03.

## 7. Revisión dirigida (hallazgos ya conocidos que el análisis debe confirmar)

| Ref. | Qué revisar | Dónde | Herramienta que debería detectarlo |
|---|---|---|---|
| WEB-SA-3 | Clave `service_role` de Supabase en el historial | Commit `b7e20f5`: `check-profs.js`, `diagnose-docente.js`, `setup-samuel.js` | gitleaks (regla `jwt`) |
| WEB-02 | Cookies `eys_access` y `eys_user` con `httpOnly: false` y sin `secure`; rol leído de una cookie sin firma | `src/auth/actions.ts` (`setAuthCookies`), `src/lib/auth/server.ts` | SonarQube Cloud (hotspot de cookies) o revisión manual |
| WEB-01 | Middleware sin renovación de token; `src/lib/auth/sessionMiddleware.ts` sin uso | `middleware.ts`, `src/services/supabase/middleware.ts` | SonarQube Cloud (código sin uso) o revisión manual |
| WEB-08 | 28 advertencias de ESLint y código heredado de Supabase | `src/services/supabase/` | ESLint y SonarQube Cloud |
| WEB-04 | Permiso de borrar asistencia para el docente que la API niega | `src/lib/utils/permissions.ts`, línea 30 | Revisión manual (es una regla de negocio) |

## 8. Registro de hallazgos

- Todo secreto, toda vulnerabilidad alta o crítica y todo issue Blocker o Critical de SonarQube se registra como **Bug en Azure Boards** con la etiqueta `analisis-estatico`, y va en la Tabla 4 del PR-03 y luego en el PR-07.
- Si ya tiene corrección en la planeación (WEB-xx), el bug se enlaza a ella; no se duplica.
- Advertencias, duplicación y complejidad entran al plan de remediación del PR-03 (sección 7).
- Los falsos positivos se marcan en SonarQube o con `// eslint-disable-next-line <regla> -- motivo`, siempre con el motivo escrito.

## 9. Responsables y calendario

| Actividad | Fecha | Responsable |
|---|---|---|
| Revocación de la clave de Supabase (WEB-SA-3) | 3 nov | Mariana Cortés (autora del commit) con el dueño del proyecto de Supabase |
| WEB-SA-1 a WEB-SA-3 (preparación) | 3 – 6 nov | Samuel Sierra (SonarQube, gitleaks) · Mariana Cortés (cobertura) |
| E1 | 7 nov | Mariana Cortés |
| Registro de bugs y plan de remediación | 7 – 8 nov | Mariana Cortés |
| E2 | 13 nov | Mariana Cortés |
| Llenar la columna Web del PR-03 | 13 – 14 nov | Mariana Cortés · revisa Samuel Sierra |

## 10. Definición de terminado

- [ ] Clave de Supabase revocada (o proyecto dado de baja) y registrada en el PR-07.
- [ ] SonarQube Cloud muestra el proyecto con la cobertura de `coverage/lcov.info`.
- [ ] E1 y E2 ejecutadas, con evidencias en `evidencias/PR-03/web/` y sin ningún valor secreto copiado.
- [ ] Bugs registrados en Azure Boards y enlazados a su corrección WEB-xx cuando existe.
- [ ] Columna Web del PR-03 diligenciada y revisada por el líder de pruebas.
