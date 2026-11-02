# Registro de decisiones de QA — Frontend web

Cada decisión toma la opción por defecto (A) del documento de cierre del frontend, salvo donde se indica.

## D-WEB-01 · Acceso a /qr/escanear
- Fecha: 02/11/2026
- Opción aplicada: A (rutas separadas: `/qr` admin+estudiante; `/qr/escanear` admin+docente). La separación ya existía en `src/lib/auth/routeRoles.ts`; faltaban las pruebas que la vigilen.
- Por qué: los casos CP-SIS-096 y CP-SIS-098 y US005/US006 piden al docente escanear en la web.
- Pruebas que la vigilan: `tests/routeRoles.test.ts` («docente puede entrar a /qr/escanear», «docente no puede entrar a /qr (Mi QR)», «estudiante no puede entrar a /qr/escanear», «el enlace de escanear aparece en el riel del docente…») y el contrato `PERMISSIONS ↔ apiRoles` de `tests/permissions.test.ts` (sin diferencias).

## D-WEB-02 · Respaldo de hijos mientras no exista BE-07
- Fecha: 02/11/2026
- Opción aplicada: A. `getHijosAction` llama a `/padres/me/hijos`; si responde 404 o 405 arma un solo hijo con `GET /padres/me` (más `/estudiantes/{id}` para el curso, tolerando que falle). Otro error (401, 403, 500, red) se propaga.
- Por qué: así la web se puede fusionar antes que BE-07 sin romper notas, novedades, horarios ni asistencia del padre.
- Pruebas: `tests/asociadoActions.test.ts` (404 → un hijo, 500 → propaga y no usa `/padres/me`, disponible → no llama a `/padres/me`).
- Pendiente: quitar el respaldo cuando BE-07 esté en producción (`docs/acciones-externas.md`, fila 8).

## D-WEB-03 · Reglas del proxy /api/proxy
- Fecha: 02/11/2026
- Opción aplicada: A, con la regla de origen por cabecera `Origin` (sin token CSRF).
- Reglas: destino siempre bajo `${API}/…` con `new URL()`; segmentos vacíos, `.`, `..`, `://`, `\` o codificados (`%2e%2e`, `%2f`) → 400; solo GET/POST/PUT/PATCH/DELETE (otro → 405); cuerpo > 5 MB → 413; solo pasan `content-type`, `accept` y `accept-language`; `Authorization` sale solo de la cookie `eys_access`; de vuelta solo `content-type`, `content-disposition` y `content-length`; `Origin` ajeno en métodos con cuerpo → 403; sin cookie → 401 sin llamar a la API; API caída → 502 con `{"detail":"No se pudo contactar el servidor."}`.
- Por qué: el proxy es lo único que toca el token (WEB-02); no debe ser un reenviador abierto.
- Pruebas: `tests/apiProxy.test.ts` (bloque «endurecimiento»).
- Nota: se exporta `OPTIONS` y `HEAD` solo para responder 405 de forma explícita; TRACE y CONNECT no llegan al handler de Next.

## D-WEB-04 · Checklist de contraseña
- Fecha: 02/11/2026
- Opción aplicada: A. El registro tenía el bloque dentro de `SignupModal`; se extrajo a `src/components/auth/PasswordChecklist.tsx` (lista con `aria-live="polite"` y texto «cumplida/pendiente» para lector de pantalla) y se usa en el registro y en `reset-password`. El botón «Actualizar» queda deshabilitado si la contraseña no cumple o no coincide con la confirmación.
- Pruebas: `tests/components/PasswordChecklist.test.tsx`.
- Los criterios de aceptación de WEB-05 (reglas en vivo) quedan cubiertos.

## D-WEB-05 · Alcance de la cobertura
- Fecha: 02/11/2026
- Opción aplicada: A. La cobertura del frontend se mide sobre `src/lib` y `src/services`; los hooks y componentes de pantalla se cubren con Playwright (PR-06).
- Umbrales (`vitest.config.mts`): `src/lib/**` 80 % de líneas (85,3 % al 02/11) y `src/services/**` 60 % (68,2 % al 02/11, antes 11,9 %). `src/hooks` no lleva umbral (0,4 %); solo se prueban los hooks con lógica propia (`usePermissions`, `usePagination`, `useAsistencia`).
- Pruebas: `tests/services/*`.

## D-WEB-06 · eslint-disable
- Fecha: 02/11/2026
- Opción aplicada: la alternativa de la sección 6.4 («dejar las excepciones, documentadas una por una»). Las 25 excepciones están en `docs/eslint-excepciones.md`, cada una con su motivo en la línea.
- Por qué: pasar las lecturas del navegador al montar a `useSyncExternalStore` o a `useState(() => …)` puede causar errores de hidratación y no se puede validar sin la corrida E2E contra QA; las imágenes QR vienen de un origen variable (servicio externo o avatar de la API) y el link de Material Symbols no se puede pasar a `next/font`.
- `sonar-project.properties` no excluye nada de las excepciones.
- Seguimiento: evaluar `useSyncExternalStore` después del PR-06.

## D-WEB-07 · CP-SIS-065 (sesión de 40 min)
- Fecha: 02/11/2026
- Opción aplicada: B, no la A. El reloj simulado de Playwright (`page.clock`) solo mueve el reloj del navegador, pero el proxy mide la inactividad con el reloj del servidor, así que no habría cerrado la sesión.
- Cómo: `SESSION_IDLE_MINUTES` (por defecto 30) la lee `inactividadMs()` en `src/lib/auth/cookies.ts`. `e2e/sesion.spec.ts` corre dos escenarios a escala contra una web de QA con `SESSION_IDLE_MINUTES=1` (4 min con actividad cada 15 s siguen en sesión; 70 s sin actividad la cierran). Se activan con `E2E_SESSION_IDLE_MINUTES`; sin ese dato se omiten como «Pendiente».
- La regla real (30 min) la prueban las unitarias de `updateSession` (`ahora` por parámetro) y `inactividadMs`.
- Alternativa C (40 min reales con video) queda en `docs/pruebas-manuales-pr06-web.md`.

## D-WEB-08 · main_eyesschool.yml
- Fecha: 02/11/2026
- Opción aplicada: se borra el flujo de despliegue a la Web App de Azure `EyesSchool`; producción está en Vercel (https://proyecto-eyesschool.vercel.app).
- Condición: si en la acción externa 4 (`docs/acciones-externas.md`) la Web App recibe tráfico real, se restaura con `git restore .github/workflows/main_eyesschool.yml` y se anota aquí.
- Prueba que lo vigila: `tests/arquitectura.test.ts` («hay un solo despliegue»; habría que quitarla si se restaura).

## Otras decisiones menores (02/11/2026)
- **Mapeo de trazabilidad:** se usó `tests/trazabilidad.json` (alternativa de 6.1) en vez de prefijar cada `describe`, para no renombrar los archivos de prueba. El script `npm run trazabilidad` regenera `docs/trazabilidad-ut-web.md`.
- **Specs que dependen del backend:** `padre-dos-hijos` (BE-07) y la segunda corrida de `registro-masivo` (BE-08) corren con `test.fail()` hasta que `E2E_BE07` / `E2E_BE08` valgan `true`.
- **Evidencia antes del arreglo (TDD):** los commits `test(...)` del historial. No se reconstruyó una corrida U0 separada.
