# DEF-WEB-07 · El inicio de sesión falla o se queda en «ENTRANDO…» de forma intermitente en QA

| Campo | Valor |
|---|---|
| Componente | **Web** (`src/auth/actions.ts`, `login`) sobre el despliegue de QA en Netlify; puede intervenir la API de QA |
| Severidad | **Media** · prioridad propuesta P3 (intermitente, pero bloquea la entrada) |
| Estado | **En curso**: corrección aplicada el 17/11/2026 (ver abajo), en verificación con la corrida E19 · causa de fondo sin confirmar |
| Detectado el | 17/11/2026, en la corrida E2E completa E17 (`48d3b1c`) |
| Caso que lo detectó | CP-SIS-001 / 006 · `e2e/login-roles.spec.ts` (docente y estudiante, Chromium) |
| Origen | Pruebas de sistema |
| Evidencia | `evidencias/PR-06/web/E17_e2e.xml`, `E17_e2e-consola.txt`; mediciones del 17/11 en la sección «Mediciones» |
| Issue en GitHub | NO DISPONIBLE (se registra con `docs/defectos/registro.json`) |

## Pasos para reproducir

1. Abrir `/?login=1` en el deploy preview de QA.
2. Iniciar sesión con una cuenta válida (pasa con cualquier rol).
3. Repetirlo varias veces: es intermitente (2 de unos 50 inicios de sesión en E17).

## Resultado esperado

Se entra al inicio del rol (`/general` o `/admin`). Si la API falla, un mensaje claro en un tiempo razonable.

## Resultado obtenido

Dos formas en E17, en Chromium:

- **Estudiante:** el formulario mostró «No se pudo iniciar sesión. Intenta de nuevo.». Es la rama `catch` de la portada: la llamada a la Server Action `login` lanzó un error, no fue un 401 de credenciales.
- **Docente:** a los 45 s el botón seguía en «ENTRANDO…» sin respuesta ni mensaje.

En los dos casos la prueba ya había esperado a que el formulario estuviera conectado (marca `data-listo`): no es el clic antes de hidratar que se corrigió en `a9383e1`.

## Mediciones (17/11/2026)

| Qué | Resultado |
|---|---|
| `POST /auth/login` directo a la API de QA, 9 veces (3 roles × 3) | 200 en **2,0 a 5,0 s** |
| Server Action `login` desde el navegador (Chromium, 6 veces) | 200 en **5,6 a 11,3 s** |

La Server Action tarda el doble o más que la API: además de `/auth/login`, `setAuthCookies` pide el perfil, y el `redirect('/general')` hace que Next renderice el inicio dentro de la misma respuesta, con sus llamadas a la API. Una respuesta tan larga queda cerca del límite de tiempo de las funciones de Netlify y de los picos de la API de QA.

## Causa

**Sin confirmar.** Hipótesis, en orden: 1) la función de Netlify que atiende la Server Action se corta o devuelve un error cuando la respuesta (login + perfil + render del inicio) se alarga; 2) picos de latencia de la API de QA. Para confirmarlo hace falta el log de funciones de Netlify del deploy preview a las horas de E17 (03:56–04:27 UTC del 17/11).

## Corrección propuesta

1. Mirar el log de funciones de Netlify (acceso del equipo) y anotar el estado y la duración de esas dos peticiones.
2. Acortar la respuesta del login: que la Server Action solo guarde las cookies y devuelva el destino, y que el navegador navegue después (el inicio se renderiza en otra petición).
3. En la portada, un tiempo máximo para la espera del login con un mensaje, para que no quede en «ENTRANDO…» indefinidamente.

Las pruebas no se tocan: subir sus tiempos de espera escondería el problema (planeación de cierre, §0).

## Corrección aplicada (17/11/2026)

Se aplicó el punto 3 y, en vez del 2 (que cambia el flujo del login), un tiempo máximo en cada llamada del servidor a la API que interviene en la entrada:

- **`src/services/api/conLimite.ts`** (nuevo): `fetchConLimite` corta cada intento a los **10 s** (la API responde en 1–5 s) y repite **una vez** si se agotó el tiempo o falló la red. Una respuesta de error de la API no se repite.
- **`login`**: `/auth/login` usa `fetchConLimite`. Si tampoco responde al segundo intento, devuelve «El servidor no respondió a tiempo. Intenta de nuevo.».
- **`setAuthCookies`**: `/auth/me` usa `fetchConLimite`. Si no responde, la sesión se guarda con los datos del token (el perfil solo sirve para mostrar el nombre).
- **Panel de inicio** (`dashboardService.apiFetchServer`): con `fetchConLimite`. Si no responde, el panel sale vacío en vez de colgar la entrada.
- **Portada**: tope de **60 s** para la espera del login, con el mensaje «El inicio de sesión está tardando demasiado. Intenta de nuevo.».

Pruebas que fallaban antes y pasan después: `tests/loginLimite.test.ts` (5 casos: reintento, fin con `TimeoutError`, sin reintento ante un 401, login con `/auth/login` colgado y con `/auth/me` colgado) y un caso nuevo en `tests/portada.test.ts`.

**Lo que no resuelve:** si la causa es la propia función de Netlify (y no la API), el usuario ya no espera indefinidamente, pero ve el mensaje y tiene que reintentar. Por eso el defecto queda **En curso** hasta ver el log de Netlify o varias corridas completas sin el fallo.

