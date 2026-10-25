# EyeSchool — Panel web

Panel web de EyeSchool en Next.js 16 (App Router), React 19, Tailwind CSS v4 y TypeScript. Lo usan administradores, docentes, estudiantes y acudientes. Consume la API de EyeSchool (FastAPI) y se despliega en Azure App Service.

## Cómo correrlo

```bash
npm ci
npm run dev        # http://localhost:3000
```

| Variable | Para qué |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL de la API, por ejemplo `https://<api>.azurewebsites.net/api/v1`. Se fija **al compilar**: el build de producción debe tenerla definida o la web apunta a `http://localhost:8000/api/v1`. |
| `RESEND_API_KEY` | Envío de correos desde `/api/send-email`. |

## Calidad: lint, tipos, pruebas y auditoría

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm audit --omit=dev --audit-level=high
```

| Prueba | Qué verifica |
|---|---|
| `tests/permissions.test.ts` | Qué puede ver y hacer cada rol (`can`, `canRead`, `canWrite`, `canDelete`) y la traducción de roles del backend. |
| `tests/routeGuard.test.ts` | El guardia de rutas: sin sesión o con token vencido se va al login, y un docente no entra a `/admin`. |
| `tests/apiClient.test.ts` | `apiFetch`: token Bearer, conversión a camelCase, 204 y mensajes de error de FastAPI (incluido el 422). |
| `tests/password.test.ts` | La política de contraseñas del registro. |

El workflow [`ci.yml`](.github/workflows/ci.yml) corre todo esto en cada pull request. Es el punto de control QG3 del modelo de calidad (MC-01). El despliegue está en `main_eyesschool.yml`.

## Arquitectura

Ver [`CLAUDE.md`](CLAUDE.md): autenticación con JWT propio en cookies, permisos por rol en `src/lib/utils/permissions.ts`, el cliente `apiFetch` y el patrón `page.tsx` (servidor), `*Client.tsx`, `use*` y `services/`.

La autenticación ya no usa Supabase. Quedan nombres heredados (`src/services/supabase/middleware.ts`) y scripts sueltos (`create-first-admin.js`, `sync-auth-users.js`, `test-auth.js`) que dependen de `@supabase/supabase-js`, que ya no está en las dependencias.
