# DEF-WEB-17 · Rendimiento bajo en Lighthouse: la fuente de iconos pesa 1–3,9 MB y retrasa el primer pintado

| Campo | Valor |
|---|---|
| Componente | **Web** (`src/app/layout.tsx`: `<link>` de Material Symbols Outlined) |
| Severidad | **Media** · prioridad propuesta P3 (CP-NF-005 no se cumple) |
| Estado | **En curso** · la causa de la fuente está corregida (17/11/2026); el rendimiento todavía no llega a 90 por otras dos causas (abajo) |
| Detectado el | 17/11/2026, en WC-06 bloque 1 (Lighthouse en 7 páginas, escritorio y móvil) |
| Caso que lo detectó | CP-NF-005 (rendimiento ≥ 90) |
| Origen | Pruebas de sistema (no funcionales, PR-06) |
| Evidencia | `evidencias/PR-06/web/manuales/lighthouse/` (14 informes HTML y JSON y `resumen.json`) |
| Issue en GitHub | NO DISPONIBLE (se registra con `docs/defectos/registro.json`) |

## Resultado esperado

Rendimiento ≥ 90 en las 7 páginas (CP-NF-005), en escritorio y móvil.

## Resultado obtenido

Rendimiento entre **33 y 96**: solo `/home/beneficios` (96) y `/notas` del padre (90) en escritorio llegan a 90. En móvil, las páginas del panel tienen el primer pintado (FCP) en ~22,5 s y el LCP en ~23,5 s. Accesibilidad 93–100, buenas prácticas 96–100 y SEO 100 sí cumplen.

**Contexto de la medición:** build de producción local (`next start`) con la API de QA, porque Netlify estaba pausado, y en un equipo con un emulador de Android consumiendo CPU. Las cifras absolutas pueden ser peores que en QA; hay que repetirlas allí. Lo que sigue no depende del equipo:

## Causa (comprobada en el informe de red de Lighthouse)

El recurso más pesado de cada página es la fuente de iconos: **3.934 KiB** (`materialsymbolsoutlined/...woff`) en la emulación móvil, contra 71 KiB del script más grande. Se pide con todos sus ejes variables (`opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200`), aunque la app solo usa `FILL 0/1`, `wght 200/400`, `GRAD 0` y `opsz 24` (`src/app/globals.css`). Restringir los ejes en la URL no reduce el archivo (~1 MB en woff2 igual).

## Corrección aplicada (17/11/2026): fuente con solo los iconos usados

- `src/lib/iconos.ts` lista los iconos y arma la URL de Google Fonts con `icon_names=`. Los ejes no cambian. La fuente baja de **3.934 KB a 173 KB** (−96 %).
- Cómo se armó la lista: se cruzaron todas las palabras de `src` con los nombres oficiales de Material Symbols. Sobran algunas, lo que solo suma pocos KB; faltar una rompería un icono.
- **Guardas** contra iconos rotos, que reemplazan la revisión visual:
  - `tests/iconos.test.ts`: todo icono escrito en el código está en la lista; la lista va ordenada y ninguna página pide la fuente completa.
  - `e2e/iconos.spec.ts`: recorre todas las páginas de cada rol en Chromium y Firefox. Exige que cada icono pintado esté en la lista y que mida ≈1 em, porque un icono sin glifo se ve como texto. **8/8 en los paneles** de los 4 roles.
  - Se comprobó que la guarda detecta el fallo: quitando `grid_view` de la petición, ese icono mide 216 px frente a 20 px de uno normal.

## Medición después (Lighthouse 12.8.2, build local, `evidencias/PR-06/web/manuales/lighthouse-def17/`)

| Página | Rol | Rendimiento escritorio | Rendimiento móvil | LCP móvil |
|---|---|---|---|---|
| `/` | sin sesión | 67 → 69 | 33 → 43 | 21,1 → 20,3 s |
| `/home/beneficios` | sin sesión | 96 → 98 | 68 → 78 | 3,8 → 3,1 s |
| `/admin` | admin | 58 → 88 | 55 → 70 | 24,3 → **5,2 s** |
| `/general` | docente | 44 → 82 | 55 → 41 | 23,6 → **4,3 s** |
| `/general` | estudiante | 58 → 83 | 55 → 69 | 23,5 → **4,6 s** |
| `/general` | padre | 88 → 85 | 55 → 67 | 23,6 → **4,6 s** |
| `/notas` | padre | 90 → 92 | 67 → 80 | 3,9 → 3,4 s |

El LCP del panel en móvil pasa de ~23,5 s a 4,3–5,2 s. **CP-NF-005 sigue sin cumplirse:** solo 4 de 14 mediciones llegan a 90. La medición se hizo en un equipo con poca memoria libre (1,4 GB), lo que infla el tiempo de CPU («Unattributable» 0,9–5,2 s); el docente móvil bajó por eso (TBT 2,3 s). Hay que repetirla en QA.

## Lo que falta (otras causas, no la fuente)

1. **Respuesta del servidor de 3,2 s en el panel:** cada página consulta la API de QA antes de pintar (`server-response-time`). Depende de la latencia de la API y del alojamiento; se vería en QA o con caché o *streaming* de los datos.
2. **Portada:** `public/eyeschool/assets/galaxy.mp4` pesa **3,9 MB**, y `nos/head1..3.png`, ~330 KB cada uno. Lighthouse estima 4,6 MB de ahorro con formatos modernos. Comprimir o diferir el video es una decisión de diseño: hay que acordarla antes de aplicarla.
