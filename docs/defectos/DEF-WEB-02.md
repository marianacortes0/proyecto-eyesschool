# DEF-WEB-02 · Hay dos elementos `<main>` anidados en todas las páginas

| Campo | Valor |
|---|---|
| Componente | **Web** (`src/app/layout.tsx:64` y `src/app/(dashboard)/layout.tsx:18`; también `src/app/home/*/page.tsx`) |
| Severidad | **Baja** · prioridad propuesta P4 (accesibilidad) |
| Estado | **Abierto** |
| Detectado el | 10/11/2026, corrida E2E E3 |
| Caso que lo detectó | CP-SIS-001 · `e2e/login-roles.spec.ts` «el <rol> llega a su inicio con los datos cargados»: `locator('main')` encuentra **2** elementos (modo estricto). Toca también a CP-NF-005 (axe) |
| Origen | Pruebas de sistema |
| Evidencia | `evidencias/PR-06/web/E3_e2e-consola.txt` (fallos 1, 3, 4, 5, 12, 14 y 15), `evidencias/PR-06/web/E4_*` |
| Issue en GitHub | NO DISPONIBLE (acción externa 11) |

## Pasos para reproducir

1. Iniciar sesión con cualquier rol.
2. En el inspector, buscar `main`.

## Resultado esperado

Un solo `<main>` visible, y nunca uno dentro de otro (HTML: un único `main` visible y jerárquicamente correcto; axe: `landmark-no-duplicate-main`, `landmark-main-is-top-level`).

## Resultado obtenido

`<main class="flex-1">` (layout raíz) contiene `<main class="ml-20 min-h-screen overflow-x-hidden">` (layout del panel). Las páginas `home/beneficios`, `home/nosotros` y `home/support` también abren su propio `<main>` dentro del raíz.

## Impacto

- Un lector de pantalla anuncia dos regiones principales, y el atajo «ir al contenido principal» puede caer en la exterior.
- La prueba CP-SIS-001 queda en FALLA en los cuatro roles: el inicio **sí** carga, pero la comprobación «la página no queda en blanco» se hace sobre `main`, que es ambiguo.

## Corrección propuesta (no aplicada)

Cambiar el `<main>` del layout raíz por un `<div>` y dejar un solo `<main>` por página (el del panel, o el de cada página de `home`). La prueba no se cambia: con un solo `main` vuelve a pasar.
