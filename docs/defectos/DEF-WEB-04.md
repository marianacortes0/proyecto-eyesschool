# DEF-WEB-04 · `proxy.ts` está fuera de `src/` y Next no lo ejecuta: la sesión no se cierra por inactividad

| Campo | Valor |
|---|---|
| Componente | **Web** (`proxy.ts`, raíz del repositorio) |
| Severidad | **Alta** · prioridad propuesta P2 |
| Estado | **Corregido** en `138db97` (11/11/2026) · **Verificado en QA** el 11/11 (E7 a E9): falta cerrarlo como issue, lo cierra QA (planeación del PR-07, §6) |
| Detectado el | 10/11/2026, corrida E2E E3 contra el deploy preview del PR #34 |
| Caso que lo detectó | CP-SIS-004 · `e2e/sesion.spec.ts` «con 31 minutos sin actividad se cierra la sesión y vuelve al inicio de sesión» (Chromium y Firefox) |
| Corrección relacionada | WEB-01 (DEF-020) y WEB-02 (DEF-021): su lógica está en `src/lib/auth/sessionMiddleware.ts`, que solo llama `proxy.ts` |
| Origen | Pruebas de sistema |
| Evidencia | `evidencias/PR-06/web/E3_e2e-consola.txt` (fallos 9 y 22), `evidencias/PR-06/web/E4_*` y las comprobaciones de abajo |
| Issue en GitHub | NO DISPONIBLE: se registra con la plantilla **Defecto** al fusionar el PR #34 (acción externa 11, D-WEB-15) |

## Pasos para reproducir

1. Iniciar sesión como docente en `https://deploy-preview-34--qaeyesschool.netlify.app`.
2. Poner la cookie `eys_last` con una marca de hace 31 minutos.
3. Abrir `/notas`.

## Resultado esperado

Redirección a `/?login=1` y sin cookie `eys_access` (WEB-01: cierre tras 30 minutos sin actividad).

## Resultado obtenido

Se queda en `/notas` y `eys_access` sigue presente. Se esperó **63 s** (la prueba espera 5 s), medido con Chromium el 10/11.

## Causa

Next.js 16 solo carga el proxy si está **al mismo nivel que `app`**:

> «Create a `proxy.ts` (or `.js`) file in the project root, **or inside `src` if applicable**, so that it is located at the same level as `pages` or `app`.»
> — `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md`, línea 35 (Next 16.4.3)

La app está en `src/app`, así que el proxy debe estar en `src/proxy.ts`. El de la raíz se ignora. Comprobaciones:

| Comprobación | Resultado |
|---|---|
| Build local del 05/11: `.next/server/middleware-manifest.json` y `functions-config-manifest.json` | Sin ningún proxy registrado (`"middleware": {}`, `"functions": {}`) |
| `next start` local de ese build, `/usuarios`, `/notas` y `/reportes` sin sesión | **200** (con el proxy activo sería 307) |
| Deploy preview, las mismas rutas sin sesión | **200**; solo `/admin` y `/general` dan **307** |
| Tabla de rutas de `next build` (`evidencias/PR-04/web/U4_build.txt`) | No aparece la línea del proxy |

`/admin` y `/general` dan 307 porque su `page.tsx` redirige sin sesión y no tienen `loading.tsx`. Las demás páginas también redirigen desde su `page.tsx`, pero con *streaming*, y por eso la redirección llega por el cliente. **Eso es lo que hace pasar el E2E del guardia de rutas**, no el proxy.

## Impacto

Todo lo que solo hace el proxy no corre en ningún despliegue:

- Cierre por inactividad de 30 minutos (WEB-01, CP-SIS-004 y CP-SIS-065).
- Renovación proactiva del token de acceso antes de que venza.
- Guardia de rutas por rol (`rolesDeRuta`) en el borde. Cada `page.tsx` valida el rol por su cuenta, así que no se encontró una ruta abierta a un rol indebido, pero la defensa en profundidad de WEB-01 no existe.
- Reescritura de la marca `eys_last` en cada petición.

**Las pruebas unitarias no lo detectan**: prueban `updateSession` llamándola directamente (`tests/routeGuard.test.ts`), no que Next la ejecute.

## Corrección propuesta (aplicada el 11/11/2026, ver abajo)

1. `git mv proxy.ts src/proxy.ts`.
2. Actualizar las referencias a `proxy.ts`: `sonar.sources` y `sonar.coverage.exclusions` de `sonar-project.properties`, y `CLAUDE.md`.
3. Añadir a `tests/arquitectura.test.ts` una regla que exija el proxy junto a `app` (`src/proxy.ts`) y prohíba `proxy.ts` y `middleware.ts` en la raíz, para que no vuelva a pasar.
4. Verificar: `next build` debe listar el proxy, `/usuarios` sin sesión debe dar 307, y CP-SIS-004 debe pasar en los dos navegadores.

## Corrección y verificación (11/11/2026)

**Commit `138db97`**: `git mv proxy.ts src/proxy.ts`, sin cambios de lógica. Se actualizaron `sonar-project.properties`, `src/app/api/auth/refresh/route.ts` y `CLAUDE.md`.

| Comprobación | Antes | Después |
|---|---|---|
| `tests/arquitectura.test.ts`: proxy junto a `src/app` y nada fuera de `src` | Falla (2 casos) | Pasa |
| `next build` | Sin línea de proxy; manifiestos vacíos | **`ƒ Proxy (Middleware)`**; `functions-config-manifest.json` registra `/_middleware` (runtime nodejs) |
| `next start` local, 7 rutas del panel sin sesión | 200 | **307** a `/?login=1` |
| Deploy preview: petición con `eys_last` vieja | La sesión seguía | **Set-Cookie** que borra `eys_access`, `eys_refresh`, `eys_user` y `eys_last`, y la página manda a `/?login=1` |
| CP-SIS-004 «31 minutos sin actividad» (E2E) | FALLA en los dos navegadores (E3, E4) | **APROBADO en los dos navegadores** (Chromium en E7, E8 y E9; Firefox en E9). En Firefox, E7 falló por tiempo al iniciar sesión y E8 porque la prueba esperaba 5 s una redirección de cliente; con 20 s, como el guardia de rutas, pasa (D-WEB-17) |

**Observación de la plataforma, no del producto:** en Netlify el proxy sí se ejecuta (el borde invoca `___netlify-edge-handler-node-middleware` y sus cookies se aplican), pero el **307** de `NextResponse.redirect` no llega al navegador: responde 200 y la redirección la hace el `page.tsx`, que ya no encuentra sesión. Con `next start`, que es como corre Vercel, el 307 sí sale. Es el adaptador de Next para Netlify con un proxy de Node (Next 16 no deja cambiar el runtime del proxy).
