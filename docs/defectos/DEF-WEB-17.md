# DEF-WEB-17 · Rendimiento bajo en Lighthouse: la fuente de iconos pesa 1–3,9 MB y retrasa el primer pintado

| Campo | Valor |
|---|---|
| Componente | **Web** (`src/app/layout.tsx`: `<link>` de Material Symbols Outlined) |
| Severidad | **Media** · prioridad propuesta P3 (CP-NF-005 no se cumple) |
| Estado | **Nuevo** · corrección propuesta, no aplicada |
| Detectado el | 17/11/2026, en WC-06 bloque 1 (Lighthouse en 7 páginas, escritorio y móvil) |
| Caso que lo detectó | CP-NF-005 (rendimiento ≥ 90) |
| Origen | Pruebas no funcionales |
| Evidencia | `evidencias/PR-06/web/manuales/lighthouse/` (14 informes HTML y JSON y `resumen.json`) |
| Issue en GitHub | NO DISPONIBLE (se registra con `docs/defectos/registro.json`) |

## Resultado esperado

Rendimiento ≥ 90 en las 7 páginas (CP-NF-005), en escritorio y móvil.

## Resultado obtenido

Rendimiento entre **33 y 96**: solo `/home/beneficios` (96) y `/notas` del padre (90) en escritorio llegan a 90. En móvil, las páginas del panel tienen el primer pintado (FCP) en ~22,5 s y el LCP en ~23,5 s. Accesibilidad 93–100, buenas prácticas 96–100 y SEO 100 sí cumplen.

**Contexto de la medición:** build de producción local (`next start`) con la API de QA, porque Netlify estaba pausado, y en un equipo con un emulador de Android consumiendo CPU. Las cifras absolutas pueden ser peores que en QA; hay que repetirlas allí. Lo que sigue no depende del equipo:

## Causa (comprobada en el informe de red de Lighthouse)

El recurso más pesado de cada página es la fuente de iconos: **3.934 KiB** (`materialsymbolsoutlined/...woff`) en la emulación móvil, contra 71 KiB del script más grande. Se pide con todos sus ejes variables (`opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200`), aunque la app solo usa `FILL 0/1`, `wght 200/400`, `GRAD 0` y `opsz 24` (`src/app/globals.css`). Restringir los ejes en la URL no reduce el archivo (~1 MB en woff2 igual).

## Corrección propuesta

1. Pedir solo los iconos que usa la web con el parámetro `icon_names=` de Google Fonts (el archivo baja a decenas de KB), o alojar ese subconjunto en el proyecto.
2. Para eso hay que reunir **todos** los nombres de icono, también los que llegan en props (`icon: 'fact_check'`) y los de `eyeschoolMarkup.ts`, y revisar visualmente cada pantalla: un icono que falte se ve como su nombre en texto.
3. Medir de nuevo con `node scripts/lighthouse.mjs` contra QA.

No se aplicó el 17/11 porque el riesgo de dejar iconos rotos exige esa revisión visual pantalla por pantalla.
