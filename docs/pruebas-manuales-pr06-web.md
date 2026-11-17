# Pruebas manuales del PR-06 — Frontend web

> **Ejecutadas el 17/11/2026 (WC-06)** de forma automatizada por QA, contra el build de producción local con la API de QA (el sitio de QA en Netlify estaba pausado). Hay que repetirlas en QA. Comandos y evidencias en cada bloque. Preparación original del 02/11/2026: Se ejecutan contra la web de QA (`https://qaeyesschool.netlify.app`) cuando la API de QA esté desplegada. Las columnas **Fecha**, **Ejecutó**, **Resultado** y **Evidencia** se dejan vacías hasta la corrida. Ninguna evidencia debe incluir contraseñas, tokens ni cookies.

## 1. Lighthouse

Meta: **≥ 90** en rendimiento, accesibilidad, buenas prácticas y SEO.

| Página | Rol | Rendimiento | Accesibilidad | Buenas prácticas | SEO | Fecha | Ejecutó | Resultado | Evidencia |
|---|---|---|---|---|---|---|---|---|---|
| `/` (inicio y modal de login) | Sin sesión | 67 / 33 | 98 / 98 | 100 / 96 | 100 / 100 | 17/11/2026 | QA (automatizado) | **No cumple** (rendimiento, DEF-WEB-17) | `manuales/lighthouse/` |
| `/home/beneficios` | Sin sesión | 96 / 68 | 98 / 98 | 96 / 96 | 100 / 100 | 17/11/2026 | QA (automatizado) | **No cumple** (rendimiento, DEF-WEB-17) | `manuales/lighthouse/` |
| `/admin` | Administrador | 58 / 55 | 93 / 93 | 96 / 96 | 100 / 100 | 17/11/2026 | QA (automatizado) | **No cumple** (rendimiento, DEF-WEB-17) | `manuales/lighthouse/` |
| `/general` | Docente | 44 / 55 | 95 / 95 | 96 / 96 | 100 / 100 | 17/11/2026 | QA (automatizado) | **No cumple** (rendimiento, DEF-WEB-17) | `manuales/lighthouse/` |
| `/general` | Estudiante | 58 / 55 | 100 / 100 | 100 / 100 | 100 / 100 | 17/11/2026 | QA (automatizado) | **No cumple** (rendimiento, DEF-WEB-17) | `manuales/lighthouse/` |
| `/general` | Padre | 88 / 55 | 95 / 95 | 96 / 96 | 100 / 100 | 17/11/2026 | QA (automatizado) | **No cumple** (rendimiento, DEF-WEB-17) | `manuales/lighthouse/` |
| `/notas` | Padre | 90 / 67 | 95 / 95 | 100 / 100 | 100 / 100 | 17/11/2026 | QA (automatizado) | **No cumple** (rendimiento, DEF-WEB-17) | `manuales/lighthouse/` |

Valores «escritorio / móvil». Ejecutado con `node scripts/lighthouse.mjs <base> evidencias/PR-06/web/manuales/lighthouse` (Lighthouse 12.8.2). Cómo, a mano: Chrome → DevTools → Lighthouse, modo «Navegación», dispositivo Escritorio y luego Móvil. Guardar el informe en HTML.

## 2. axe DevTools

Meta: **0 violaciones serias o críticas**.

| Página | Rol | Serias | Críticas | Fecha | Ejecutó | Resultado | Evidencia |
|---|---|---|---|---|---|---|---|
| Modal de login y de registro | Sin sesión | 0 | 0 | 17/11/2026 | QA (automatizado) | Cumple (tras corregir nombres y contrastes) | `manuales/axe-login-y-registro.json` |
| `/usuarios` y su modal | Administrador | 0 | 0 | 17/11/2026 | QA (automatizado) | Cumple (tras corregir nombres y contrastes) | `manuales/axe-usuarios-y-modal.json` |
| `/qr/escanear` | Docente | 0 | 0 | 17/11/2026 | QA (automatizado) | Cumple (tras corregir nombres y contrastes) | `manuales/axe-qr-escanear-docente.json` |
| `/notas` (selector de hijo) | Padre | 0 | 0 | 17/11/2026 | QA (automatizado) | Cumple (tras corregir nombres y contrastes) | `manuales/axe-notas-padre.json` |
| `/reset-password` (reglas en vivo) | Sin sesión | 0 | 0 | 17/11/2026 | QA (automatizado) | Cumple (tras corregir nombres y contrastes) | `manuales/axe-reset-password.json` |

Ejecutado con `e2e/wc06-accesibilidad.spec.ts` (axe-core, WCAG 2.1 A y AA).

## 3. ZAP baseline

Meta: **0 alertas altas** contra la web de QA (no contra producción).

| Objetivo | Alertas altas | Medias | Fecha | Ejecutó | Resultado | Evidencia |
|---|---|---|---|---|---|---|
| `https://qaeyesschool.netlify.app` (baseline) | — | — | — | — | NO EJECUTADO en QA: sitio pausado | — |
| `http://localhost:3100` (build de producción local) | **0** | 4 (`unsafe-inline` ×2, SRI de Google Fonts, anti-CSRF; documentadas) | 17/11/2026 | QA (automatizado) | Cumple | `manuales/zap-baseline.html` |

Ejecutado sin Docker con ZAP 2.17.0 en modo daemon y `node scripts/zap-baseline.mjs` (araña + reglas pasivas; la araña no envía formularios). Cabeceras y cookies: `e2e/wc06-seguridad.spec.ts`. Comando con Docker:  `docker run -t ghcr.io/zaproxy/zaproxy:stable zap-baseline.py -t https://qaeyesschool.netlify.app -r zap-baseline.html`

## 4. Cámara QR en Chrome móvil

| Paso | Resultado esperado | Fecha | Ejecutó | Resultado | Evidencia |
|---|---|---|---|---|---|
| Docente abre `/qr/escanear` en Chrome móvil y concede la cámara | Se ve la vista de la cámara | 17/11/2026 | QA (cámara falsa de Chromium, no un teléfono) | Cumple | `e2e/qr-camara.spec.ts` |
| Apunta al QR de un estudiante | Se registra la asistencia con su nombre | 17/11/2026 | QA (cámara falsa) | **FALLA** · DEF-WEB-16: el servicio externo de lectura rechaza las imágenes | `e2e/qr-camara.spec.ts` |
| Niega el permiso de cámara | Mensaje claro, sin pantalla en blanco | 17/11/2026 | QA (automatizado) | Cumple: «No se pudo acceder a la cámara. Verifica los permisos del navegador.» | `e2e/wc06-manuales.spec.ts` |

## 5. API caída

Con la API «caída» simulada por `scripts/api-fallas.mjs` (la web local apunta a ese proxy; la API real no se detuvo):

| Paso | Resultado esperado | Fecha | Ejecutó | Resultado | Evidencia |
|---|---|---|---|---|---|
| Iniciar sesión | Error claro («No se pudo contactar el servidor»), no pantalla en blanco | 17/11/2026 | QA (automatizado) | Cumple: «No se pudo conectar con el servidor. Intenta de nuevo.» y el botón vuelve a quedar activo | `e2e/login-errores.spec.ts` (CP-SIS-005) |
| Con sesión abierta, abrir `/notas` | Mensaje de error en la página; el resto de la navegación sigue | 17/11/2026 | QA (automatizado) | Cumple tras DEF-WEB-12: aviso con «Reintentar» (antes, «0 registros» sin reintento) | specs de cada módulo |
| Descargar el boletín | Mensaje de error, no un archivo dañado | 17/11/2026 | QA (automatizado) | Cumple: aviso y ningún archivo descargado | `e2e/wc06-manuales.spec.ts` |

## 6. Brave (escudos activados)

| Paso | Resultado esperado | Fecha | Ejecutó | Resultado | Evidencia |
|---|---|---|---|---|---|
| Iniciar sesión con los escudos en «Agresivo» | Entra al panel | 17/11/2026 | QA (Brave 157, Playwright) | Cumple, con escudos **por defecto** («Agresivo» no se fija por línea de comandos) | `manuales/brave.json` |
| Recargar el panel | La sesión se mantiene (cookies de sesión) | 17/11/2026 | QA (Brave 157, Playwright) | Cumple, con escudos **por defecto** («Agresivo» no se fija por línea de comandos) | `manuales/brave.json` |
| Descargar el boletín como padre | El PDF se descarga | 17/11/2026 | QA (Brave 157, Playwright) | Cumple, con escudos **por defecto** («Agresivo» no se fija por línea de comandos) | `manuales/brave.json` |

## 7. Sesión de 40 minutos (CP-SIS-065) — alternativa C

Solo si no se puede desplegar QA con `SESSION_IDLE_MINUTES=1` (ver `docs/decisiones-qa.md`, D-WEB-07).

| Paso | Resultado esperado | Fecha | Ejecutó | Resultado | Evidencia |
|---|---|---|---|---|---|
| Usar el panel 40 min reales, cambiando de página cada ~10 min | Sigue en el panel; las llamadas funcionan | — | — | No aplica: CP-SIS-065 corre a escala con `SESSION_IDLE_MINUTES=1` (D-WEB-07) | `e2e/sesion.spec.ts` |
| Dejar la sesión 31 min sin actividad y navegar | Vuelve al inicio de sesión | — | — | No aplica: ídem | `e2e/sesion.spec.ts` |

## 8. Responsive (nuevo, planeación de cierre WC-06)

Meta: sin desbordes ni elementos tapados (incluido el aviso de cookies).

| Pantalla | 375 px | 768 px | 1920 px | Fecha | Ejecutó | Resultado | Evidencia |
|---|---|---|---|---|---|---|---|
| Portada | Sin desborde | Sin desborde | Sin desborde | 17/11/2026 | QA (automatizado) | Cumple | `manuales/responsive-portada-*.png` |
| Inicio del docente | Sin desborde | Sin desborde | Sin desborde | 17/11/2026 | QA (automatizado) | Cumple | `manuales/responsive-inicio-docente-*.png` |
| Notas del docente | Sin desborde | Sin desborde | Sin desborde | 17/11/2026 | QA (automatizado) | Cumple | `manuales/responsive-notas-docente-*.png` |
| Usuarios (admin) | Sin desborde | Sin desborde | Sin desborde | 17/11/2026 | QA (automatizado) | Cumple | `manuales/responsive-usuarios-admin-*.png` |
| Asistencia del padre | Sin desborde | Sin desborde | Sin desborde | 17/11/2026 | QA (automatizado) | Cumple | `manuales/responsive-asistencia-padre-*.png` |
| «CREAR CUENTA» y «ENTRAR» con el aviso de cookies (375×812, 1280×720, 1920×1080) | — | — | — | 17/11/2026 | QA (automatizado) | Cumple tras bajar el aviso a `z-40` y poner el registro en un portal (antes el aviso lo tapaba) | `e2e/wc06-responsive.spec.ts` |
