# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # start dev server
npm run build    # production build
npm run lint     # ESLint
```

No test suite is configured.

## Architecture

Eyes School is a Next.js 16 (App Router) school management platform with React 19, Tailwind CSS v4, and TypeScript. The frontend calls a separate FastAPI backend at `NEXT_PUBLIC_API_URL` (default `http://localhost:8000/api/v1`).

### Auth

Authentication is **custom JWT** — not Supabase Auth. Three cookies drive sessions:

| Cookie | Contents | HttpOnly |
|---|---|---|
| `eys_access` | short-lived JWT (30 min) | no |
| `eys_refresh` | long-lived refresh token (7 days) | yes |
| `eys_user` | JSON-serialized user profile | no |

- **Server Actions** (`src/auth/actions.ts`): `login`, `logout`, `register`, `forgotPassword`, `resetPassword` — hit backend directly and set cookies via `next/headers`.
- **Middleware** (`src/services/supabase/middleware.ts`): guards `/admin` and `/general` routes, decodes JWT, redirects on expiry or insufficient role. `src/lib/auth/sessionMiddleware.ts` is an alternative version that also handles proactive access token refresh.
- **Server Components**: use `getServerUser()` / `getServerToken()` from `src/lib/auth/server.ts`.
- **Client Components**: use `useAuth()` hook from `src/hooks/useAuth.ts` — reads the `eys_user` cookie directly.

### Roles and Permissions

Roles: `admin` | `docente` | `estudiante` | `padre`  
DB id mapping (id_rol): `1=docente`, `2=estudiante`, `3=admin`, `4=padre`

All permission logic lives in `src/lib/utils/permissions.ts`. Use `can(role, action, resource)`, `canRead()`, `canWrite()`, `canDelete()` rather than role-checking inline. `mapRolToKey()` converts backend strings/numbers to the internal `Role` type.

### API Client

`apiFetch<T>(path, options?, token?)` in `src/services/api/client.ts` is the single fetch wrapper for all backend calls:
- Auto-attaches `Authorization: Bearer` from the `eys_access` cookie (client-side) or an explicit token (server-side).
- Recursively converts snake_case → camelCase on all responses via `toCamel()`.
- Throws with `detail` from the backend error body.

### Route Structure

```
src/app/
  (auth)/          # login modal is on /, register/forgot/reset have own pages
  (dashboard)/     # protected — all pages use export const dynamic = 'force-dynamic'
    admin/         # admin-only KPI dashboard
    general/       # role-specific dashboard for docente/estudiante/padre
    asistencia/ horarios/ notas/ novedades/ perfil/ qr/ reportes/ usuarios/
  home/            # public marketing pages (beneficios, nosotros, support)
  api/             # Next.js API routes (auth/refresh, send-email)
```

### Dashboard Page Pattern

Every dashboard page follows the same server → client split:

1. **`page.tsx`** (Server Component): validates `getServerUser()`, checks role, redirects if unauthorized, then renders a `*Client.tsx`.
2. **`*Client.tsx`** (Client Component): imports the corresponding `use*` hook for data fetching and UI state.
3. **`src/hooks/use*.ts`**: one hook per feature (useAsistencia, useNotas, useHorarios, useNovedades, useQR, useReportes, useUsuarios, etc.).
4. **`src/services/<feature>/`**: service layer that wraps `apiFetch` calls; `*Actions.ts` files are Next.js Server Actions.

### Notable Libraries

- **Recharts** — charts in dashboard and reportes.
- **qrcode.react** — QR code generation (estudiante card + admin management).
- **framer-motion** — page transitions via `PageTransition` wrapper.
- **Resend** — email sending via the `/api/send-email` route.
- **React Compiler** (`babel-plugin-react-compiler`) — enabled in `next.config.ts`.
