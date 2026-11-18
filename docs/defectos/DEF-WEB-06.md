# DEF-WEB-06 · La portada precarga los vídeos y carga el reproductor de YouTube de un panel cerrado

| Campo | Valor |
|---|---|
| Componente | **Web** (`src/components/home/eyeschoolMarkup.ts`, `src/components/home/EyeSchoolLanding.tsx`) |
| Severidad | **Baja** · prioridad propuesta P4 (rendimiento) |
| Estado | **Corregido** (11/11/2026, commits `6d56838` y el de esta ficha) · **Verificado** en local con el build de producción |
| Detectado el | 11/11/2026, al analizar los casos INESTABLE de las corridas E2E (E3 a E8) |
| Caso relacionado | CP-NF-005 (rendimiento de la página de inicio de sesión). Afecta a todos los E2E: el inicio de sesión es un modal sobre la portada |
| Origen | Pruebas de sistema |
| Evidencia | Mediciones del 11/11/2026 con Chromium (protocolo de depuración: bytes transferidos de verdad) contra `next start` local, antes y después, más la prueba funcional de «VER VIDEO» en Chromium y Firefox |
| Issue en GitHub | NO DISPONIBLE (se registra con `docs/defectos/registro.json`) |

## Pasos para reproducir

1. Abrir `/?login=1` con la caché vacía.
2. Mirar en la pestaña Red las descargas de `galaxy.mp4`, `loopi.mp4` y `youtube.com/embed`.

## Resultado esperado

La página de inicio de sesión no precarga vídeos que no se ven ni abre un reproductor que nadie pidió.

## Resultado obtenido (antes)

Los dos `<video>` tenían `preload="auto"` y el iframe de YouTube del panel «VER VIDEO» se cargaba con la portada aunque el panel estuviera cerrado. Bytes transferidos en 10 s (Chromium, `next start` local, build de `1697c7c`):

| Medición | Vídeo | YouTube | Peticiones al embed |
|---|---|---|---|
| Antes #1 | 3,09 MB | 1,31 MB | 1 |
| Antes #2 | 3,69 MB | 1,31 MB | 1 |

> Una primera medición contra el deploy preview sumó el `content-length` de cada respuesta parcial de vídeo y dio 34–41 MB. **Esa cifra no es válida**: cada petición parcial informa el resto del archivo y se cuenta varias veces. Se reemplazó por los bytes reales de arriba.

## Corrección

1. `6d56838`: los dos `<video>` pasan a `preload="metadata"` (`EyeSchoolLanding` ya los reproduce solo cuando su sección se ve) y el iframe lleva `loading="lazy"`.
2. Con solo `loading="lazy"` Chromium seguía cargando el reproductor, porque el panel entra deslizándose desde el borde y el navegador lo considera cercano. Por eso el iframe pasa a llevar `data-src`, y el botón «VER VIDEO» le asigna el `src` al abrir el panel.
3. `tests/portada.test.ts` exige las dos cosas. Fallaba antes y pasa ahora.

## Verificación (después)

| Medición | Vídeo | YouTube | Peticiones al embed |
|---|---|---|---|
| Después #1 | 0,02 MB | 0,09 MB | **0** |
| Después #2 | 1,20 MB | 0,09 MB | **0** |

Prueba funcional: al activar «VER VIDEO», el iframe recibe `https://www.youtube.com/embed/Ow75gjvJDvE` y el reproductor se carga, en Chromium (1 petición) y en Firefox (2). Antes de activarlo, 0 peticiones en los dos.

**Observación aparte:** Playwright no pudo pulsar «VER VIDEO» con un clic normal en 10 s, porque la sección está animada y el botón se mueve o queda cubierto. Se verificó con `dispatchEvent`. Es el mismo tipo de interferencia que en una corrida tapó el botón ENTRAR en Firefox. Queda para la prueba manual de la portada.
