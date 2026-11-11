# DEF-WEB-06 · La portada descarga 34–41 MB de vídeo y abre el reproductor de YouTube en cada visita

| Campo | Valor |
|---|---|
| Componente | **Web** (`src/components/home/eyeschoolMarkup.ts`) |
| Severidad | **Baja** · prioridad propuesta P4 (rendimiento) |
| Estado | **Corregido** (11/11/2026) · en verificación |
| Detectado el | 11/11/2026, al analizar los casos INESTABLE de las corridas E2E (E3 a E8) |
| Caso relacionado | CP-NF-005 (rendimiento de la página de inicio de sesión). Afecta a todos los E2E: el inicio de sesión es un modal sobre la portada |
| Origen | Pruebas de sistema |
| Evidencia | Medición con Chromium y Firefox contra el deploy preview del PR #34 (11/11/2026, 2 visitas por navegador, sección «Resultado obtenido») |
| Issue en GitHub | NO DISPONIBLE (acción externa 11) |

## Pasos para reproducir

1. Abrir `https://deploy-preview-34--qaeyesschool.netlify.app/?login=1` con la caché vacía.
2. Mirar en la pestaña Red las descargas de `galaxy.mp4`, `loopi.mp4` y de `youtube.com`.

## Resultado esperado

La página de inicio de sesión no descarga vídeos que no se ven ni abre un reproductor oculto.

## Resultado obtenido

| Navegador | `domcontentloaded` | `load` | Vídeo descargado (suma de `content-length`) | Peticiones a YouTube |
|---|---|---|---|---|
| Chromium #1 | 1,3 s | 3,9 s | 40,8 MB | 5 |
| Chromium #2 | 0,7 s | 3,1 s | 40,7 MB | 1 |
| Firefox #1 | 1,5 s | 3,5 s | 34,2 MB | 1 |
| Firefox #2 | 1,4 s | 3,9 s | 33,8 MB | 1 |

Los dos vídeos (`galaxy.mp4` 10,7 MB y `loopi.mp4` 8,3 MB) tienen `preload="auto"`, y el iframe de YouTube del panel «VER VIDEO» se carga aunque esté cerrado. El 10/11 la misma página tardó ~20 s en disparar `load` (D-WEB-16): con una red lenta este peso es lo que más pesa, y es el origen de casi todos los casos INESTABLE de Firefox.

## Corrección

- Los dos `<video>` pasan a `preload="metadata"`. `EyeSchoolLanding` ya los reproduce solo cuando su sección está a la vista, y al reproducirse el navegador descarga lo necesario.
- El iframe de YouTube lleva `loading="lazy"`: se carga cuando se abre su panel.
- `tests/portada.test.ts` exige las dos cosas. Fallaba antes y pasa ahora.
