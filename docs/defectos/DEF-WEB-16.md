# DEF-WEB-16 · El escaneo de QR de la web no funciona: el servicio externo de lectura rechaza las imágenes

| Campo | Valor |
|---|---|
| Componente | **Web** (`src/services/qr/qrService.ts` › `readQRFromImage`, usada por `useEscanear`) · dependencia externa `api.qrserver.com` |
| Severidad | **Alta** · prioridad propuesta P1 (la entrada y salida por QR desde la web no funciona) |
| Estado | **Corregido** el 17/11/2026 (Mariana autorizó `jsqr`) · verificado contra el build de producción local (Netlify pausado); falta verlo en QA |
| Detectado el | 17/11/2026, al automatizar CP-SIS-032 a 036 con la cámara falsa de Chromium (WC-05) |
| Caso que lo detectó | CP-SIS-032, 033, 034, 035, 036 · `e2e/qr-camara.spec.ts`, `e2e/qr-camara-invalido.spec.ts` |
| Origen | Pruebas de sistema |
| Issue en GitHub | NO DISPONIBLE (se registra con `docs/defectos/registro.json`) |

## Pasos para reproducir

1. Como docente, abrir `/qr/escanear`, «Activar cámara» y apuntar a un QR de estudiante.
2. Pulsar «Escanear».

## Resultado esperado

Se reconoce al estudiante y se puede registrar la entrada (CP-SIS-032); un QR que no es de un estudiante da «Código QR inválido» (CP-SIS-033).

## Resultado obtenido

Siempre: «Error al contactar la API de lectura QR». Ningún QR se lee.

## Causa

La web no decodifica el QR: envía la foto de la cámara a `https://api.qrserver.com/v1/read-qr-code/` (`POST` con el archivo). El 17/11/2026 ese servicio responde **400 «malformed 'read-qr-code' API request»** a cualquier imagen subida, incluso a un JPEG válido de 480×480 que el mismo servicio generó:

```
POST /v1/read-qr-code/  (file=@qr.jpg, JPEG 480x480)        → 400 malformed request
GET  /v1/read-qr-code/?fileurl=<url del mismo QR>           → 200 [{"symbol":[{"data":"EST002"}]}]
```

La lectura por URL funciona, pero la web no puede usarla: la foto de la cámara no tiene una URL pública. Además, mandar las fotos de la cámara a un tercero es un problema de privacidad (observación del informe).

## Corrección

El QR se decodifica **en el navegador** con [`jsqr`](https://www.npmjs.com/package/jsqr) 1.4.0 (MIT, sin dependencias), autorizado por Mariana el 17/11:

1. `readQRFromImage(blob)`: `createImageBitmap` → `OffscreenCanvas` (o `<canvas>`) → `decodificarQR(píxeles)` con `jsQR`. Si la foto no se puede abrir: «No se pudo procesar la imagen de la cámara. Intente nuevamente.».
2. Ya no se llama a `api.qrserver.com/v1/read-qr-code/`: la CSP queda con `connect-src 'self'` y ninguna foto sale a un tercero.
3. Pruebas: `tests/qrLectura.test.ts` (5 casos con QR reales generados con `qrcode`, dependencia solo de desarrollo; fallaban antes) y una regla en `tests/cabeceras.test.ts` que exige `connect-src 'self'`.
4. E2E de cámara repetidos en **E27**: CP-SIS-032 a 036 **8/8** junto con el resto de QR (`evidencias/PR-06/web/E27_qr-camara-jsqr.xml`).

Al poder leer el QR apareció **DEF-WEB-18** (cualquier QR resolvía a EST002), corregido en la misma corrida.

## Lo relacionado que no es este defecto

Las imágenes de los QR (vista del estudiante, tabla del admin) también salen de `api.qrserver.com` (`create-qr-code`, por `GET`, que sí funciona). La web ya tiene `qrcode.react` (`QRCard` lo usa): generarlas localmente quitaría la otra dependencia externa y el envío del código del estudiante a un tercero. Queda como observación.
