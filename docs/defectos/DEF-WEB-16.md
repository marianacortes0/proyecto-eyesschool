# DEF-WEB-16 · El escaneo de QR de la web no funciona: el servicio externo de lectura rechaza las imágenes

| Campo | Valor |
|---|---|
| Componente | **Web** (`src/services/qr/qrService.ts` › `readQRFromImage`, usada por `useEscanear`) · dependencia externa `api.qrserver.com` |
| Severidad | **Alta** · prioridad propuesta P1 (la entrada y salida por QR desde la web no funciona) |
| Estado | **Nuevo** · corrección propuesta lista; **necesita autorizar una dependencia** (`jsqr`) |
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

## Corrección propuesta (no aplicada)

Decodificar el QR **en el navegador** con [`jsqr`](https://www.npmjs.com/package/jsqr) 1.4.0 (MIT, sin dependencias):

1. `npm install jsqr` (dependencia de producción) y `npm install -D qrcode @types/qrcode` (solo para generar QR en la prueba unitaria).
2. `readQRFromImage(blob)`: `createImageBitmap` → canvas → `jsQR(imageData, ancho, alto)?.data ?? null`. Se elimina la llamada a `api.qrserver.com/v1/read-qr-code/` y su permiso en la CSP (`connect-src`).
3. Prueba unitaria: generar con `qrcode` la matriz de «EST002», pasarla a RGBA y comprobar que `jsQR` devuelve «EST002»; y que una imagen sin QR devuelve `null`.
4. Repetir los E2E de cámara (CP-SIS-032 a 036).

**Por qué no se aplicó:** el 17/11 la instalación de `jsqr` quedó bloqueada por la política de permisos del entorno de trabajo; agregar una dependencia de producción lo decide el equipo.

## Lo relacionado que no es este defecto

Las imágenes de los QR (vista del estudiante, tabla del admin) también salen de `api.qrserver.com` (`create-qr-code`, por `GET`, que sí funciona). La web ya tiene `qrcode.react` (`QRCard` lo usa): generarlas localmente quitaría la otra dependencia externa y el envío del código del estudiante a un tercero. Queda como observación.
