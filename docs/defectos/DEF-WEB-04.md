# DEF-WEB-04 · `proxy.ts` está fuera de `src/` y Next no lo ejecuta: la sesión no se cierra por inactividad

| Campo | Valor |
|---|---|
| Componente | **Web** (`proxy.ts`, raíz del repositorio) |
| Severidad | **Alta** · prioridad propuesta P2 |
| Estado | **Abierto** |
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

## Corrección propuesta (no aplicada)

1. `git mv proxy.ts src/proxy.ts`.
2. Actualizar las referencias a `proxy.ts`: `sonar.sources` y `sonar.coverage.exclusions` de `sonar-project.properties`, y `CLAUDE.md`.
3. Añadir a `tests/arquitectura.test.ts` una regla que exija el proxy junto a `app` (`src/proxy.ts`) y prohíba `proxy.ts` y `middleware.ts` en la raíz, para que no vuelva a pasar.
4. Verificar: `next build` debe listar el proxy, `/usuarios` sin sesión debe dar 307, y CP-SIS-004 debe pasar en los dos navegadores.
