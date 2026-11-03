# DEF-WEB-01 · `GET /api/v1/cursos` responde 500 en QA

| Campo | Valor |
|---|---|
| Componente | **Backend** (API `apieyeschool-q`), no el frontend |
| Severidad | **Alta** — bloquea las pruebas de integración (PR-05) y los E2E (PR-06) |
| Estado | Abierto · **bloquea** los niveles 6 y 7 de la planeación de cierre |
| Detectado el | 03/11/2026, en el preflight del entorno de QA |
| Caso relacionado | Preflight de la sección 2.3; indirectamente CP-INT y CP-SIS que entran a horarios, usuarios y asistencia |
| Evidencia | `evidencias/PR-05/web/I1_preflight-qa.txt` |

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

## Dos hipótesis (no se pueden separar sin credenciales)

1. **La base de QA no responde** para el motor de la API (`DATABASE_URL`, red o credenciales de Postgres). Entonces todas las rutas con datos fallarán igual en cuanto se pase la autenticación, y la integración y los E2E seguirán bloqueados.
2. **Defecto solo del endpoint de cursos** (consulta, modelo de respuesta o datos del seed). El resto del sistema funcionaría.

Para distinguirlas basta un `POST /api/v1/auth/login` con una cuenta del seed y, con ese token, un `GET /api/v1/materias`: si devuelve 200, es la hipótesis 2.

## Impacto en el frontend

El frontend llama `/cursos` en horarios, usuarios, asistencia y notas (contrato de rutas: `evidencias/PR-05/web/I1_contrato_rutas.json`). Mientras devuelva 500, esas pantallas mostrarán su mensaje de error. **No se arregla desde el front**: los casos que dependen de cursos quedan *bloqueados*, no *fallidos*.

## Siguiente paso

Backend: revisar el log de la aplicación en Azure (*Log stream* de `apieyeschool-q`) para ver la excepción del endpoint, y entregar `QA_PASSWORD` por canal privado (acción externa 7) para poder correr el resto del preflight.
