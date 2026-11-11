# DEF-WEB-01 · la API de QA no puede consultar su base de datos (500)

| Campo | Valor |
|---|---|
| Componente | **Backend** (API `apieyeschool-q`), no el frontend |
| Severidad | **Alta** — bloquea las pruebas de integración (PR-05) y los E2E (PR-06) |
| Estado | **Cerrado el 10/11/2026** · resuelto en el entorno (causa raíz: **Entorno**). Ya no bloquea los niveles 6 y 7 |
| Detectado el | 03/11/2026, en el preflight del entorno de QA |
| Vuelto a comprobar | **05/11/2026: sigue igual.** La Web App volvió a estar encendida (`/docs` 200) pero `/cursos` y el login del admin siguen en 500 (a veces 502), y un cuerpo inválido sigue respondiendo 422 (`evidencias/PR-05/web/I1_preflight-qa.txt`) |
| Caso relacionado | Preflight de la sección 2.3; indirectamente CP-INT y CP-SIS que entran a horarios, usuarios y asistencia |
| Evidencia | `evidencias/PR-05/web/I1_preflight-qa.txt` (abierto) · `evidencias/PR-05/web/I3_preflight-qa.txt` (cerrado) |
| Issue en GitHub | NO DISPONIBLE: se registra con la plantilla **Defecto** al fusionar el PR #34 (acción externa 11, D-WEB-15) |

## Pasos para reproducir

1. Abrir `https://apieyeschool-q-g4hfgrgvepbecacc.chilecentral-01.azurewebsites.net/api/v1/cursos` sin token.
2. Igual con `…/api/v1/cursos/1`.

## Resultado esperado

`200` con los 10 cursos del seed (es una ruta pública: `/cursos` no exige autenticación).

## Resultado obtenido

`500 Internal Server Error`, cuerpo `Internal Server Error` (sin detalle). `…/cursos/` con barra final redirige con 307 a `…/cursos` y termina igual en 500.

## Lo que sí funciona

| Ruta | Sin token | Lectura |
|---|---|---|
| `/docs`, `/openapi.json` | 200 | La aplicación FastAPI arranca y publica 59 rutas |
| `/api/v1/auth/me` | 401 | La autenticación ya responde (antes del 03/11 todo daba 500) |
| `/api/v1/usuarios`, `/api/v1/materias`, `/api/v1/horarios`, `/api/v1/tipos-novedad` | 401 | Rechazan antes de consultar la base, así que no dicen nada del estado de la base |

`/cursos` es la **única** ruta sin autenticación, y es la única que se puede comprobar sin `QA_PASSWORD`.

## Causa, ya acotada con credenciales

Con `QA_PASSWORD` se pudo separar la validación de la consulta a la base:

| Petición | Código | Qué prueba |
|---|---|---|
| `POST /api/v1/auth/login` sin el campo `password` | **422** | FastAPI valida el cuerpo: la ruta y el esquema funcionan |
| `POST /api/v1/auth/login` con un correo inexistente y contraseña cualquiera | **500** | Debería ser **401**. El 500 aparece al buscar el usuario |
| `POST /api/v1/auth/login` con la cuenta de admin del seed y su clave real | **500** | Igual |
| `GET /api/v1/cursos`, `/cursos/1` | **500** | Única ruta pública; también consulta la base |
| `GET /api/v1/auth/me`, `/usuarios`, `/materias` sin token | **401** | Rechazan antes de tocar la base: no dicen nada de su estado |

**Conclusión: la aplicación está sana y la base de datos no responde para la API.** Un 500 en un login con un usuario que no existe solo puede venir de la consulta. Es configuración de Azure (`DATABASE_URL`, red o credenciales de Postgres), no del frontend ni de las pruebas.

## Impacto en el frontend

El frontend llama `/cursos` en horarios, usuarios, asistencia y notas (contrato de rutas: `evidencias/PR-05/web/I1_contrato_rutas.json`). Mientras devuelva 500, esas pantallas mostrarán su mensaje de error. **No se arregla desde el front**: los casos que dependen de cursos quedan *bloqueados*, no *fallidos*.

## Comprobación del 05/11/2026

| Petición | 03/11 | 05/11 |
|---|---|---|
| `GET /docs` | 200 | **200** (el 03/11 por la noche daba 403 «web app is stopped»; ya se reanudó) |
| `GET /api/v1/cursos` sin token | 500 | **500** |
| `POST /auth/login` admin del seed | 500 | **500**, y en un intento **502** |
| `POST /auth/login` sin `password` | 422 | **422** |
| `GET /api/v1/auth/me` sin token | 401 | **401** |

El 502 aislado apunta a que el proceso de la API se cae al intentar la conexión. Diagnóstico sin cambios: **la aplicación responde y la base no.**

## Siguiente paso

Backend: abrir el *Log stream* de `apieyeschool-q` en Azure y leer la excepción del login; revisar `DATABASE_URL` (host, puerto, base, usuario, `sslmode`) y que la base de Render acepte conexiones desde la IP de salida de la Web App. Si la contraseña de Postgres se rotó (acción externa 3), hay que actualizar `DATABASE_URL` y reiniciar.

En cuanto el login devuelva 200, no falta nada más del lado del frontend: `.env.test.local` ya está completo (salvo `E2E_ESTUDIANTE_VINCULADO_ID`, que lo imprime `npm run qa:datos`) y los navegadores de Playwright están instalados, así que los niveles 6 y 7 se corren de una pasada.

## Comprobación del 10/11/2026 · cerrado

Según Mariana (10/11), la base de QA está en pie y las cuentas del seed ya tienen `QA_PASSWORD`. Se repitió el preflight (`evidencias/PR-05/web/I3_preflight-qa.txt`, 23:36 UTC):

| Petición | 05/11 | 10/11 |
|---|---|---|
| `GET /api/v1/cursos` sin token | 500 | **200**, con los 10 cursos del seed |
| `POST /auth/login` correo inexistente | 500 | **401** (lo esperado) |
| `POST /auth/login` cuerpo inválido | 422 | **422** |
| `POST /auth/login` admin, docente, estudiante, padre de 1 hijo y padre de 2 hijos | 500 | **200** los cinco |
| `GET /api/v1/auth/me` sin token | 401 | **401** |

Verificación con el caso que lo detectó y su regresión: el contrato de rutas encuentra **44 de 44** rutas en el `openapi.json` (`I3_contrato_rutas.json`) y la integración pasa **9 de 9** (`evidencias/PR-05/web/I3_integracion.xml`).

**Causa raíz:** Entorno. La API no podía consultar su base de datos de QA. El frontend no cambió para cerrarlo.
