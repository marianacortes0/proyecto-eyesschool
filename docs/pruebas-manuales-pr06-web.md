# Pruebas manuales del PR-06 — Frontend web

> Solo preparación (02/11/2026). Se ejecutan contra la web de QA (`https://qaeyesschool.netlify.app`) cuando la API de QA esté desplegada. Las columnas **Fecha**, **Ejecutó**, **Resultado** y **Evidencia** se dejan vacías hasta la corrida. Ninguna evidencia debe incluir contraseñas, tokens ni cookies.

## 1. Lighthouse

Meta: **≥ 90** en rendimiento, accesibilidad, buenas prácticas y SEO.

| Página | Rol | Rendimiento | Accesibilidad | Buenas prácticas | SEO | Fecha | Ejecutó | Resultado | Evidencia |
|---|---|---|---|---|---|---|---|---|---|
| `/` (inicio y modal de login) | Sin sesión | | | | | | | | |
| `/home/beneficios` | Sin sesión | | | | | | | | |
| `/admin` | Administrador | | | | | | | | |
| `/general` | Docente | | | | | | | | |
| `/general` | Estudiante | | | | | | | | |
| `/general` | Padre | | | | | | | | |
| `/notas` | Padre | | | | | | | | |

Cómo: Chrome → DevTools → Lighthouse, modo «Navegación», dispositivo Escritorio y luego Móvil. Guardar el informe en HTML.

## 2. axe DevTools

Meta: **0 violaciones serias o críticas**.

| Página | Rol | Serias | Críticas | Fecha | Ejecutó | Resultado | Evidencia |
|---|---|---|---|---|---|---|---|
| Modal de login y de registro | Sin sesión | | | | | | |
| `/usuarios` y su modal | Administrador | | | | | | |
| `/qr/escanear` | Docente | | | | | | |
| `/notas` (selector de hijo) | Padre | | | | | | |
| `/reset-password` (reglas en vivo) | Sin sesión | | | | | | |

## 3. ZAP baseline

Meta: **0 alertas altas** contra la web de QA (no contra producción).

| Objetivo | Alertas altas | Medias | Fecha | Ejecutó | Resultado | Evidencia |
|---|---|---|---|---|---|---|
| `https://qaeyesschool.netlify.app` (baseline) | | | | | | |

Comando sugerido: `docker run -t ghcr.io/zaproxy/zaproxy:stable zap-baseline.py -t https://qaeyesschool.netlify.app -r zap-baseline.html`

## 4. Cámara QR en Chrome móvil

| Paso | Resultado esperado | Fecha | Ejecutó | Resultado | Evidencia |
|---|---|---|---|---|---|
| Docente abre `/qr/escanear` en Chrome móvil y concede la cámara | Se ve la vista de la cámara | | | | |
| Apunta al QR de un estudiante | Se registra la asistencia con su nombre | | | | |
| Niega el permiso de cámara | Mensaje claro, sin pantalla en blanco | | | | |

## 5. API caída

Con la API de QA detenida (`apieyeschool-q`):

| Paso | Resultado esperado | Fecha | Ejecutó | Resultado | Evidencia |
|---|---|---|---|---|---|
| Iniciar sesión | Error claro («No se pudo contactar el servidor»), no pantalla en blanco | | | | |
| Con sesión abierta, abrir `/notas` | Mensaje de error en la página; el resto de la navegación sigue | | | | |
| Descargar el boletín | Mensaje de error, no un archivo dañado | | | | |

## 6. Brave (escudos activados)

| Paso | Resultado esperado | Fecha | Ejecutó | Resultado | Evidencia |
|---|---|---|---|---|---|
| Iniciar sesión con los escudos en «Agresivo» | Entra al panel | | | | |
| Recargar el panel | La sesión se mantiene (cookies de sesión) | | | | |
| Descargar el boletín como padre | El PDF se descarga | | | | |

## 7. Sesión de 40 minutos (CP-SIS-065) — alternativa C

Solo si no se puede desplegar QA con `SESSION_IDLE_MINUTES=1` (ver `docs/decisiones-qa.md`, D-WEB-07).

| Paso | Resultado esperado | Fecha | Ejecutó | Resultado | Evidencia |
|---|---|---|---|---|---|
| Usar el panel 40 min reales, cambiando de página cada ~10 min | Sigue en el panel; las llamadas funcionan | | | | |
| Dejar la sesión 31 min sin actividad y navegar | Vuelve al inicio de sesión | | | | |
