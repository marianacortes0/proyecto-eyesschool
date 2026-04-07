# 📋 Planeación del Proyecto — Eyes School

> **Stack:** Next.js 14 (App Router) · Supabase (PostgreSQL + Auth + Storage + Realtime) · Azure (App Service) · Arquitectura en Capas: Services → Hooks → Components → Pages

---

## 1. Resumen Ejecutivo

**Eyes School** es un sistema de información escolar que gestiona asistencia mediante códigos QR, notas, novedades y administración de usuarios, con cuatro roles: Administrador, Docente, Estudiante y Padre/Acudiente. Las páginas son **compartidas entre roles**; el control de acceso se aplica mediante permisos dentro de cada capa (RLS en Supabase + hooks de permisos + guards en componentes), no separando rutas por dashboard.

---

## 2. Módulos del Sistema

| # | Módulo | Actores |
|---|--------|---------|
| 1 | Autenticación | Todos |
| 2 | Usuarios | Admin |
| 3 | Asistencia + QR | Admin, Docente, Estudiante, Padre |
| 4 | Notas | Docente, Estudiante, Padre |
| 5 | Novedades | Docente, Admin, Estudiante, Padre |
| 6 | Reportes | Admin |
| 7 | Dashboard / KPIs | Admin, Docente |

---

## 3. Arquitectura en Capas

```
┌──────────────────────────────────────────────────────────────┐
│                        PAGES (app/)                          │
│   Server Components que componen la página, buscan datos     │
│   con Server Actions y renderizan la UI según el rol         │
│   Una sola ruta por módulo — sin /admin/ ni /docente/        │
└───────────────────────────┬──────────────────────────────────┘
                            │ props / context
┌───────────────────────────▼──────────────────────────────────┐
│                      COMPONENTS                              │
│   Client Components puros de UI — reciben datos por props    │
│   Usan RoleGuard / can() para mostrar/ocultar secciones      │
│   Nunca llaman a Supabase directamente                       │
└───────────────────────────┬──────────────────────────────────┘
                            │ llamadas desde Client Components
┌───────────────────────────▼──────────────────────────────────┐
│                        HOOKS                                 │
│   Custom hooks (use…) — encapsulan estado, efectos,          │
│   mutaciones y suscripciones Realtime                        │
│   Llaman a los servicios; nunca a Supabase directamente      │
└───────────────────────────┬──────────────────────────────────┘
                            │ funciones async puras
┌───────────────────────────▼──────────────────────────────────┐
│                       SERVICES                               │
│   Funciones puras TypeScript — toda la lógica de negocio     │
│   y acceso a datos. Usan createClient() de Supabase.         │
│   Agnósticos de React. Testables de forma aislada.           │
└───────────────────────────┬──────────────────────────────────┘
                            │
┌───────────────────────────▼──────────────────────────────────┐
│                   SUPABASE (datos)                           │
│   PostgreSQL · Auth · Storage · Realtime                     │
│   RLS activo — cada query retorna solo lo que el rol         │
│   del usuario autenticado puede ver                          │
└──────────────────────────────────────────────────────────────┘
```

### Flujo de datos completo (ejemplo: cargar asistencia)

```
page.tsx (Server Component)
  └─ llama attendanceService.getAttendance(filtros)   ← SERVER ACTION
       └─ Supabase RLS filtra por rol automáticamente
            └─ retorna datos → props al Client Component

<AttendanceView /> (Client Component)
  └─ usa useAttendance(initialData)    ← HOOK
       └─ gestiona estado local, filtros, re-fetch
            └─ llama attendanceService.* para mutaciones
                 └─ Supabase RLS valida permisos de escritura
```

---

## 4. Estructura del Proyecto

```
eyes-school/
├── .env.local
├── next.config.js
├── middleware.ts                          ← Sesión activa + redirect /login
│
├── app/
│   ├── layout.tsx
│   ├── page.tsx                           ← Redirect a /dashboard
│   │
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx                  ← Login unificado todos los roles
│   │   └── forgot-password/
│   │       └── page.tsx
│   │
│   └── (app)/
│       ├── layout.tsx                     ← Shell: Sidebar + Header (rol-aware)
│       │
│       ├── dashboard/
│       │   └── page.tsx                   ← KPIs según rol (mismo componente,
│       │                                     datos filtrados por RLS + can())
│       ├── usuarios/
│       │   ├── page.tsx                   ← Lista (guard servidor: solo admin)
│       │   ├── nuevo/
│       │   │   └── page.tsx
│       │   └── [id]/
│       │       └── page.tsx               ← Ver / Editar / Eliminar
│       │
│       ├── qr/
│       │   ├── page.tsx                   ← Admin: gestionar QRs
│       │   │                                Estudiante: ver su QR
│       │   ├── escanear/
│       │   │   └── page.tsx               ← Admin: entrada/salida
│       │   │                                Docente: clase
│       │   └── [estudianteId]/
│       │       └── page.tsx               ← Detalle QR
│       │
│       ├── asistencia/
│       │   └── page.tsx                   ← Admin/Docente: todos
│       │                                    Estudiante: la propia
│       │                                    Padre: la de sus hijos
│       │
│       ├── notas/
│       │   ├── page.tsx                   ← Docente: gestionar
│       │   │                                Estudiante/Padre: consultar
│       │   └── informe/
│       │       └── page.tsx               ← Informe descargable PDF
│       │
│       ├── novedades/
│       │   ├── page.tsx                   ← Historial (todos los roles)
│       │   └── nueva/
│       │       └── page.tsx               ← Guard servidor: solo Docente
│       │
│       └── reportes/
│           ├── page.tsx                   ← Guard servidor: solo Admin
│           └── [id]/
│               └── page.tsx
│
├── components/
│   ├── ui/                                ← shadcn/ui — Button, Input, Dialog…
│   │
│   ├── layout/
│   │   ├── AppShell.tsx                   ← Sidebar + Header contenedor
│   │   ├── Sidebar.tsx                    ← Navegación filtrada por can()
│   │   ├── Header.tsx                     ← Avatar, notificaciones, logout
│   │   └── RoleGuard.tsx                  ← <RoleGuard roles={['admin']}>
│   │
│   ├── auth/
│   │   └── LoginForm.tsx
│   │
│   ├── dashboard/
│   │   ├── KPICard.tsx
│   │   ├── AttendanceChart.tsx
│   │   ├── GradesChart.tsx
│   │   └── TopStudentsTable.tsx
│   │
│   ├── usuarios/
│   │   ├── UserTable.tsx
│   │   ├── UserForm.tsx
│   │   └── UserFilterBar.tsx
│   │
│   ├── qr/
│   │   ├── QRGenerator.tsx                ← qrcode.react
│   │   ├── QRScanner.tsx                  ← html5-qrcode, acceso cámara
│   │   ├── QRCard.tsx                     ← Vista del QR del estudiante
│   │   └── QRDownloadButton.tsx           ← Descarga PDF desde Storage
│   │
│   ├── asistencia/
│   │   ├── AttendanceView.tsx             ← Unifica todas las vistas por rol
│   │   ├── AttendanceTable.tsx
│   │   ├── AttendanceFilterBar.tsx
│   │   └── AttendanceBadge.tsx
│   │
│   ├── notas/
│   │   ├── NotesView.tsx                  ← Unifica todas las vistas por rol
│   │   ├── NotesTable.tsx
│   │   ├── NoteForm.tsx
│   │   ├── NotesFilterBar.tsx
│   │   └── GradeReportButton.tsx
│   │
│   ├── novedades/
│   │   ├── NoveltyList.tsx
│   │   ├── NoveltyCard.tsx
│   │   ├── NoveltyForm.tsx
│   │   └── NoveltyRealtimeListener.tsx    ← Supabase Realtime push
│   │
│   ├── reportes/
│   │   ├── ReportTable.tsx
│   │   ├── ReportForm.tsx
│   │   └── ReportDownloadButton.tsx
│   │
│   └── shared/
│       ├── ConfirmDialog.tsx
│       ├── EmptyState.tsx
│       ├── ErrorMessage.tsx
│       └── FilterBar.tsx
│
├── hooks/
│   ├── useAuth.ts                         ← sesión, usuario, rol, can()
│   ├── usePermissions.ts                  ← can(action, resource)
│   ├── useAttendance.ts
│   ├── useQR.ts
│   ├── useNotes.ts
│   ├── useNovelties.ts
│   ├── useUsers.ts
│   ├── useReports.ts
│   └── useKPIs.ts
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                      ← createBrowserClient
│   │   ├── server.ts                      ← createServerClient (cookies)
│   │   ├── admin.ts                       ← service_role (solo servidor)
│   │   └── types.ts                       ← supabase gen types typescript
│   │
│   ├── services/
│   │   ├── authService.ts
│   │   ├── userService.ts
│   │   ├── attendanceService.ts
│   │   ├── qrService.ts
│   │   ├── notesService.ts
│   │   ├── noveltiesService.ts
│   │   ├── reportService.ts
│   │   └── kpiService.ts
│   │
│   ├── validations/
│   │   ├── userSchema.ts
│   │   ├── attendanceSchema.ts
│   │   ├── noteSchema.ts
│   │   └── noveltySchema.ts
│   │
│   └── utils/
│       ├── permissions.ts                 ← Mapa de permisos por rol
│       ├── pdf.ts
│       └── dates.ts
│
└── middleware.ts
```

---

## 5. Capa de Permisos — `permissions.ts` + `usePermissions`

### 5.1 Mapa de permisos centralizado

```typescript
// lib/utils/permissions.ts
export type Role     = 'admin' | 'docente' | 'estudiante' | 'padre'
export type Action   = 'create' | 'read' | 'update' | 'delete' | 'download'
export type Resource =
  | 'usuarios'
  | 'qr' | 'qr:escanear'
  | 'asistencia' | 'asistencia:propia' | 'asistencia:hijos'
  | 'notas' | 'notas:propias'
  | 'novedades'
  | 'reportes'
  | 'kpis'

type PermissionMap = Record<Role, Partial<Record<Resource, Action[]>>>

export const PERMISSIONS: PermissionMap = {
  admin: {
    usuarios:           ['create', 'read', 'update', 'delete'],
    qr:                 ['create', 'read', 'download'],
    'qr:escanear':      ['create'],
    asistencia:         ['read'],
    notas:              ['read'],
    novedades:          ['create', 'read', 'update', 'delete'],
    reportes:           ['create', 'read', 'update', 'delete', 'download'],
    kpis:               ['read'],
  },
  docente: {
    'qr:escanear':      ['create'],
    asistencia:         ['read'],
    notas:              ['create', 'read', 'update', 'delete'],
    novedades:          ['create', 'read', 'update', 'delete'],
    kpis:               ['read'],
  },
  estudiante: {
    qr:                 ['read', 'download'],
    'asistencia:propia':['read'],
    'notas:propias':    ['read', 'download'],
    novedades:          ['read'],
  },
  padre: {
    'asistencia:hijos': ['read'],
    'notas:propias':    ['read', 'download'],
    novedades:          ['read'],
  },
}

export function can(role: Role, action: Action, resource: Resource): boolean {
  return PERMISSIONS[role]?.[resource]?.includes(action) ?? false
}
```

### 5.2 Hook `usePermissions`

```typescript
// hooks/usePermissions.ts
import { useAuth } from './useAuth'
import { can, type Action, type Resource } from '@/lib/utils/permissions'

export function usePermissions() {
  const { role } = useAuth()
  return {
    can: (action: Action, resource: Resource) =>
      role ? can(role, action, resource) : false,
  }
}
```

### 5.3 `RoleGuard` component

```tsx
// components/layout/RoleGuard.tsx
'use client'
import { useAuth } from '@/hooks/useAuth'
import type { Role } from '@/lib/utils/permissions'

export function RoleGuard({
  roles,
  children,
  fallback = null,
}: {
  roles: Role[]
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const { role } = useAuth()
  if (!role || !roles.includes(role)) return <>{fallback}</>
  return <>{children}</>
}
```

### 5.4 Sidebar filtrado por permisos

```tsx
// components/layout/Sidebar.tsx
'use client'
import { usePermissions } from '@/hooks/usePermissions'

export function Sidebar() {
  const { can } = usePermissions()

  return (
    <nav>
      <SidebarItem href="/dashboard"   label="Dashboard" />
      {can('read',   'usuarios')   && <SidebarItem href="/usuarios"   label="Usuarios" />}
      {can('read',   'qr')         && <SidebarItem href="/qr"         label="Códigos QR" />}
      {can('create', 'qr:escanear')&& <SidebarItem href="/qr/escanear" label="Escanear QR" />}
      <SidebarItem href="/asistencia"  label="Asistencia" />
      <SidebarItem href="/notas"       label="Notas" />
      <SidebarItem href="/novedades"   label="Novedades" />
      {can('read',   'reportes')   && <SidebarItem href="/reportes"   label="Reportes" />}
    </nav>
  )
}
```

---

## 6. Capa de Services

### 6.1 `attendanceService.ts`

```typescript
// lib/services/attendanceService.ts
import { createClient } from '@/lib/supabase/server'

export interface AttendanceFilter {
  studentId?: string
  month?:     number
  year?:      number
}

export async function getAttendance(filter: AttendanceFilter) {
  const supabase = createClient()
  // RLS devuelve automáticamente solo lo que el rol del usuario puede ver
  let query = supabase
    .from('Asistencia')
    .select(`
      idAsistencia, fechaEntrada, fechaSalida, estado,
      estudiantes (
        idEstudiante, codigoEstudiante,
        usuario ( nombre, apellido )
      )
    `)
    .order('fechaEntrada', { ascending: false })

  if (filter.studentId) query = query.eq('idEstudiante', filter.studentId)
  if (filter.month && filter.year) {
    const start = new Date(filter.year, filter.month - 1, 1).toISOString()
    const end   = new Date(filter.year, filter.month, 0, 23, 59, 59).toISOString()
    query = query.gte('fechaEntrada', start).lte('fechaEntrada', end)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data
}

export async function registerQRScan(
  studentCode: string,
  type: 'entrada' | 'salida' | 'clase',
  metadata?: { materiaId?: string; puntual?: boolean }
) {
  const supabase = createClient()
  const { data: student, error: sErr } = await supabase
    .from('estudiantes')
    .select('idEstudiante')
    .eq('codigoEstudiante', studentCode)
    .single()

  if (sErr || !student) throw new Error('Inexistencia de contenido')

  const payload: Record<string, unknown> = {
    idEstudiante: student.idEstudiante,
    estado: 'Presente',
  }
  if (type === 'entrada') payload.fechaEntrada = new Date().toISOString()
  if (type === 'salida')  payload.fechaSalida  = new Date().toISOString()
  if (type === 'clase' && metadata?.materiaId)
    payload.idMateria = metadata.materiaId

  const { data, error } = await supabase
    .from('Asistencia')
    .upsert(payload)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}
```

### 6.2 `notesService.ts`

```typescript
// lib/services/notesService.ts
import { createClient } from '@/lib/supabase/server'

export async function getNotes(cursoId?: string, periodo?: string) {
  const supabase = createClient()
  let query = supabase
    .from('notas')
    .select(`
      idNota, nota, descripcion,
      estudiantes ( idEstudiante, usuario ( nombre, apellido ) ),
      materias ( idMateria, nombreMateria )
    `)
    .order('idNota', { ascending: false })

  if (cursoId) query = query.eq('idCurso', cursoId)
  if (periodo) query = query.eq('periodo', periodo)

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data
}

export async function createNote(payload: {
  idEstudiante: string
  idMateria:    string
  nota:         number
  descripcion?: string
}) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('notas').insert(payload).select().single()
  if (error) throw new Error(error.message)
  return data
}

export async function updateNote(id: string, nota: number, descripcion?: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('notas').update({ nota, descripcion }).eq('idNota', id).select().single()
  if (error) throw new Error(error.message)
  return data
}

export async function deleteNote(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from('notas').delete().eq('idNota', id)
  if (error) throw new Error(error.message)
}
```

### 6.3 `kpiService.ts`

```typescript
// lib/services/kpiService.ts
import { createClient } from '@/lib/supabase/server'

export async function getKPIs() {
  const supabase = createClient()

  const [avgResult, topStudents, bySubject, attendance] = await Promise.all([
    supabase.from('notas').select('nota'),
    supabase.from('notas')
      .select('idEstudiante, nota, estudiantes(usuario(nombre, apellido))')
      .order('nota', { ascending: false }).limit(10),
    supabase.from('notas')
      .select('idMateria, nota, materias(nombreMateria)'),
    supabase.from('Asistencia').select('estado'),
  ])

  const totalNotas = avgResult.data ?? []
  const promedio   = totalNotas.length
    ? totalNotas.reduce((s, r) => s + r.nota, 0) / totalNotas.length
    : 0

  const attendanceStats = (attendance.data ?? []).reduce(
    (acc: Record<string, number>, r) => {
      acc[r.estado] = (acc[r.estado] || 0) + 1
      return acc
    }, {}
  )

  return {
    averageGrade:  promedio,
    topStudents:   topStudents.data ?? [],
    bySubject:     bySubject.data ?? [],
    attendanceStats,
  }
}
```

### 6.4 `qrService.ts`

```typescript
// lib/services/qrService.ts
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function uploadQRPDF(studentId: string, pdfBuffer: Buffer) {
  const path = `qr-codes/${studentId}.pdf`
  const { error } = await supabaseAdmin.storage
    .from('qr-pdfs')
    .upload(path, pdfBuffer, { contentType: 'application/pdf', upsert: true })
  if (error) throw new Error(error.message)
  return supabaseAdmin.storage.from('qr-pdfs').getPublicUrl(path).data.publicUrl
}

export async function getSignedQRUrl(studentId: string) {
  const { data, error } = await supabaseAdmin.storage
    .from('qr-pdfs')
    .createSignedUrl(`qr-codes/${studentId}.pdf`, 60)
  if (error) throw new Error(error.message)
  return data.signedUrl
}
```

---

## 7. Capa de Hooks

### 7.1 `useAuth.ts`

```typescript
// hooks/useAuth.ts
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Role } from '@/lib/utils/permissions'

interface AuthUser {
  id:       string
  nombre:   string
  apellido: string
  role:     Role
  idRef:    string   // idEstudiante | idDocente | idPadre | idAdmin
}

export function useAuth() {
  const [user, setUser]       = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user: authUser } }) => {
      if (!authUser) { setLoading(false); return }

      const { data: profile } = await supabase
        .from('usuario')
        .select('nombre, apellido, rol, idEstudiante, idAdmin, idDocente, idPadre')
        .eq('id', authUser.id)
        .single()

      if (profile) {
        const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
        setUser({
          id:       authUser.id,
          nombre:   profile.nombre,
          apellido: profile.apellido,
          role:     profile.rol as Role,
          idRef:    profile[`id${capitalize(profile.rol)}`],
        })
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_, session) => { if (!session) setUser(null) }
    )
    return () => subscription.unsubscribe()
  }, [])

  return { user, role: user?.role ?? null, loading }
}
```

### 7.2 `useAttendance.ts`

```typescript
// hooks/useAttendance.ts
'use client'
import { useState, useCallback } from 'react'
import * as svc from '@/lib/services/attendanceService'

export function useAttendance(
  initialData: Awaited<ReturnType<typeof svc.getAttendance>>
) {
  const [data, setData]       = useState(initialData)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const refetch = useCallback(async (filter: Parameters<typeof svc.getAttendance>[0]) => {
    setLoading(true); setError(null)
    try   { setData(await svc.getAttendance(filter)) }
    catch (e) { setError((e as Error).message) }
    finally   { setLoading(false) }
  }, [])

  const scanQR = useCallback(async (
    code: string,
    type: 'entrada' | 'salida' | 'clase',
    meta?: { materiaId?: string }
  ) => {
    setLoading(true); setError(null)
    try {
      const record = await svc.registerQRScan(code, type, meta)
      setData(prev => [record as typeof prev[0], ...prev])
      return record
    } catch (e) {
      setError((e as Error).message); throw e
    } finally { setLoading(false) }
  }, [])

  return { data, loading, error, refetch, scanQR }
}
```

### 7.3 `useNovelties.ts` (con Realtime)

```typescript
// hooks/useNovelties.ts
'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import * as svc from '@/lib/services/noveltiesService'

export function useNovelties(
  initialData: Awaited<ReturnType<typeof svc.getNovelties>>
) {
  const [data, setData]       = useState(initialData)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const supabase = createClient()

  // Suscripción Realtime — notificación push al acudiente
  useEffect(() => {
    const channel = supabase
      .channel('novedades-realtime')
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'novedades'
      }, (payload) => {
        setData(prev => [payload.new as typeof prev[0], ...prev])
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const create = useCallback(async (
    payload: Parameters<typeof svc.createNovelty>[0]
  ) => {
    setLoading(true)
    try {
      const created = await svc.createNovelty(payload)
      setData(prev => [created, ...prev])
      return created
    } catch (e) {
      setError((e as Error).message); throw e
    } finally { setLoading(false) }
  }, [])

  const remove = useCallback(async (id: string) => {
    await svc.deleteNovelty(id)
    setData(prev => prev.filter(n => (n as { idNovedad: string }).idNovedad !== id))
  }, [])

  return { data, loading, error, create, remove }
}
```

### 7.4 Resumen de hooks

| Hook | Estado que gestiona | Mutaciones expuestas |
|------|--------------------|--------------------|
| `useAuth` | usuario, rol, sesión | `logout` |
| `usePermissions` | — | `can(action, resource)` |
| `useUsers` | lista de usuarios | `create`, `update`, `delete` |
| `useQR` | QRs generados, estado activo/inactivo | `generate`, `toggle`, `download` |
| `useAttendance` | registros de asistencia | `scanQR`, `refetch` |
| `useNotes` | notas por curso/periodo | `create`, `update`, `delete` |
| `useNovelties` | novedades + Realtime | `create`, `update`, `remove` |
| `useReports` | reportes admin | `create`, `update`, `delete`, `download` |
| `useKPIs` | métricas del dashboard | — (solo lectura) |

---

## 8. Capa de Components (ejemplos clave)

### 8.1 `AttendanceView` — componente unificado para todos los roles

```tsx
// components/asistencia/AttendanceView.tsx
'use client'
import { useAttendance }  from '@/hooks/useAttendance'
import { RoleGuard }      from '@/components/layout/RoleGuard'
import { AttendanceTable }     from './AttendanceTable'
import { AttendanceFilterBar } from './AttendanceFilterBar'
import { QRScanner }      from '@/components/qr/QRScanner'
import { ErrorMessage }   from '@/components/shared/ErrorMessage'

export function AttendanceView({ initialData }: { initialData: AttendanceRecord[] }) {
  const { data, loading, error, refetch, scanQR } = useAttendance(initialData)

  return (
    <div className="space-y-6">

      {/* Admin: escanear entrada y salida */}
      <RoleGuard roles={['admin']}>
        <div className="flex gap-4">
          <QRScanner mode="entrada" onScan={(code) => scanQR(code, 'entrada')} />
          <QRScanner mode="salida"  onScan={(code) => scanQR(code, 'salida')} />
        </div>
      </RoleGuard>

      {/* Docente: escanear asistencia de clase */}
      <RoleGuard roles={['docente']}>
        <QRScanner
          mode="clase"
          onScan={(code, meta) => scanQR(code, 'clase', meta)}
        />
      </RoleGuard>

      {/* Filtros: admin y docente pueden filtrar por cualquier estudiante */}
      <AttendanceFilterBar onFilter={refetch} />

      {error && <ErrorMessage message={error} />}

      {/* Tabla — RLS ya filtró los datos en servidor */}
      <AttendanceTable data={data} loading={loading} />
    </div>
  )
}
```

### 8.2 `NotesView` — acciones condicionales por rol

```tsx
// components/notas/NotesView.tsx
'use client'
import { useNotes }      from '@/hooks/useNotes'
import { RoleGuard }     from '@/components/layout/RoleGuard'
import { NotesTable }    from './NotesTable'
import { NoteForm }      from './NoteForm'
import { GradeReportButton } from './GradeReportButton'

export function NotesView({ initialData }: { initialData: Note[] }) {
  const { data, loading, create, update, remove } = useNotes(initialData)

  return (
    <div className="space-y-6">

      {/* Solo docente crea notas */}
      <RoleGuard roles={['docente']}>
        <NoteForm onSubmit={create} />
      </RoleGuard>

      {/* Tabla: docente ve botones editar/eliminar; resto solo lectura */}
      <NotesTable
        data={data}
        loading={loading}
        onEdit={update}
        onDelete={remove}
      />

      {/* Descarga disponible para todos */}
      <GradeReportButton data={data} />
    </div>
  )
}
```

---

## 9. Capa de Pages (Server Components)

### 9.1 Página compartida — asistencia

```tsx
// app/(app)/asistencia/page.tsx
import { getAttendance }   from '@/lib/services/attendanceService'
import { AttendanceView }  from '@/components/asistencia/AttendanceView'
import { createClient }    from '@/lib/supabase/server'
import { redirect }        from 'next/navigation'

export default async function AsistenciaPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // RLS filtra automáticamente: admin/docente ven todo,
  // estudiante ve la propia, padre ve la de sus hijos
  const initialData = await getAttendance({})

  return <AttendanceView initialData={initialData} />
}
```

### 9.2 Página con guard de servidor — usuarios (solo admin)

```tsx
// app/(app)/usuarios/page.tsx
import { getUsers }     from '@/lib/services/userService'
import { UserTable }    from '@/components/usuarios/UserTable'
import { createClient } from '@/lib/supabase/server'
import { redirect }     from 'next/navigation'

export default async function UsuariosPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('usuario').select('rol').eq('id', user.id).single()

  // Guard de servidor: solo admin llega a esta página
  if (profile?.rol !== 'admin') redirect('/dashboard')

  const users = await getUsers()
  return <UserTable initialData={users} />
}
```

### 9.3 Página QR — contenido diferente según rol

```tsx
// app/(app)/qr/page.tsx
import { createClient }     from '@/lib/supabase/server'
import { getQRsByAdmin }    from '@/lib/services/qrService'
import { getStudentQR }     from '@/lib/services/qrService'
import { QRAdminView }      from '@/components/qr/QRAdminView'
import { QRStudentView }    from '@/components/qr/QRStudentView'
import { redirect }         from 'next/navigation'

export default async function QRPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('usuario').select('rol, idEstudiante').eq('id', user.id).single()

  if (profile?.rol === 'admin') {
    const qrList = await getQRsByAdmin()
    return <QRAdminView initialData={qrList} />
  }

  if (profile?.rol === 'estudiante') {
    const qr = await getStudentQR(profile.idEstudiante)
    return <QRStudentView qr={qr} />
  }

  // Docente y padre no tienen acceso a esta página
  redirect('/dashboard')
}
```

---

## 10. Comunicación con Supabase

### 10.1 Clientes

```typescript
// lib/supabase/server.ts — Server Components y Server Actions
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (c) => c.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options))
      }
    }
  )
}

// lib/supabase/client.ts — Client Components (hooks)
import { createBrowserClient } from '@supabase/ssr'
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// lib/supabase/admin.ts — Operaciones privilegiadas SOLO en servidor
import { createClient } from '@supabase/supabase-js'
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
```

### 10.2 Middleware (sesión únicamente, sin separación de rutas por rol)

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (c) => c.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options))
    }}
  )

  const { data: { user } } = await supabase.auth.getUser()
  const path      = request.nextUrl.pathname
  const isPublic  = ['/login', '/forgot-password'].some(p => path.startsWith(p))

  if (!user && !isPublic)
    return NextResponse.redirect(new URL('/login', request.url))
  if (user && isPublic)
    return NextResponse.redirect(new URL('/dashboard', request.url))

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/public).*)']
}
```

### 10.3 RLS — Políticas clave

```sql
-- Estudiante: solo su propia asistencia
CREATE POLICY "estudiante_own_attendance" ON "Asistencia"
  FOR SELECT USING (
    "idEstudiante" = (
      SELECT e."idEstudiante" FROM estudiantes e
      JOIN usuario u ON u."idEstudiante" = e."idEstudiante"
      WHERE u.id = auth.uid()
    )
  );

-- Padre: asistencia de sus hijos
CREATE POLICY "padre_children_attendance" ON "Asistencia"
  FOR SELECT USING (
    "idEstudiante" IN (
      SELECT ep."idEstudiante" FROM estudianteips ep
      JOIN padres p      ON p."idPadre"  = ep."idPadre"
      JOIN usuario u     ON u."idPadre"  = p."idPadre"
      WHERE u.id = auth.uid()
    )
  );

-- Admin y Docente: acceso completo de lectura
CREATE POLICY "staff_full_read_attendance" ON "Asistencia"
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM usuario WHERE rol IN ('admin', 'docente'))
  );

-- Solo Docente puede insertar notas
CREATE POLICY "docente_write_notes" ON notas
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT id FROM usuario WHERE rol = 'docente')
  );

-- Solo Admin gestiona usuarios
CREATE POLICY "admin_manage_users" ON usuario
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM usuario WHERE rol = 'admin')
  );
```

---

## 11. Roles y Control de Acceso (resumen)

| Página / Ruta | Admin | Docente | Estudiante | Padre | Capa de control |
|---------------|:-----:|:-------:|:----------:|:-----:|----------------|
| `/dashboard` | KPIs completos | KPIs parciales | — | — | `can()` en componente |
| `/usuarios` | ✅ CRUD | redirect | redirect | redirect | Guard en `page.tsx` |
| `/qr` | Generar + escanear | Escanear clase | Ver + descargar propio | redirect | Guard en `page.tsx` + `RoleGuard` |
| `/asistencia` | Todos los registros | Todos | Solo propia | Solo hijos | RLS en Supabase |
| `/notas` | Solo lectura | CRUD | Solo propias | Hijos | RLS + `RoleGuard` |
| `/novedades` | CRUD | CRUD | Lectura | Lectura | RLS + `RoleGuard` |
| `/reportes` | ✅ CRUD | redirect | redirect | redirect | Guard en `page.tsx` |

> **Regla de oro:** La RLS es la fuente de verdad sobre los datos. Los guards de página y `RoleGuard` son UX — impiden que el usuario vea rutas que no le corresponden, pero aunque llegara, Supabase no devolvería datos no autorizados.

---

## 12. Variables de Entorno

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...        # Solo servidor, nunca expuesta al cliente

NEXT_PUBLIC_APP_URL=https://eyes-school.azurewebsites.net
AZURE_WEBAPP_NAME=eyes-school
AZURE_RESOURCE_GROUP=eyes-school-rg
```

---

## 13. Dependencias Principales

```json
{
  "dependencies": {
    "next": "^14.2.0",
    "@supabase/supabase-js": "^2.43.0",
    "@supabase/ssr": "^0.4.0",
    "qrcode.react": "^3.1.0",
    "html5-qrcode": "^2.3.8",
    "jspdf": "^2.5.1",
    "zod": "^3.23.0",
    "react-hook-form": "^7.51.0",
    "@hookform/resolvers": "^3.3.4",
    "tailwindcss": "^3.4.0",
    "date-fns": "^3.6.0",
    "recharts": "^2.12.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "supabase": "^1.170.0"
  }
}
```

---

## 14. Despliegue en Azure

### Arquitectura

```
Internet → Azure Front Door (CDN + WAF)
              ↓
         Azure App Service (Linux, Node 20)
              ↓
         Supabase Cloud (DB + Auth + Storage + Realtime)
              ↑
         Azure Key Vault ← variables sensibles
```

### GitHub Actions — CI/CD

```yaml
# .github/workflows/azure-deploy.yml
name: Deploy to Azure
on:
  push:
    branches: [main]
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
      - uses: azure/webapps-deploy@v3
        with:
          app-name: ${{ secrets.AZURE_WEBAPP_NAME }}
          publish-profile: ${{ secrets.AZURE_PUBLISH_PROFILE }}
          package: .
```

---

## 15. Plan de Sprints

### Sprint 0 — Setup (1 semana)
- [ ] Repositorio GitHub + estructura de carpetas del proyecto
- [ ] Next.js 14 + TypeScript + Tailwind + shadcn/ui
- [ ] Supabase: ejecutar `eyesschool_postgres.sql` + `eyesschool_data_postgres.sql`
- [ ] `supabase gen types typescript` → `lib/supabase/types.ts`
- [ ] RLS habilitado en todas las tablas + políticas base
- [ ] Azure App Service + Key Vault + GitHub Actions básico

### Sprint 1 — Auth + Permisos + Shell (2 semanas)
- [ ] Login unificado con Supabase Auth
- [ ] Middleware de sesión (sin separación de rutas por rol)
- [ ] `PERMISSIONS` map + `can()` + `usePermissions` + `useAuth`
- [ ] `AppShell` + `Sidebar` filtrado por `can()`
- [ ] `RoleGuard` component
- [ ] Recuperación de contraseña por correo

### Sprint 2 — QR + Asistencia (2 semanas)
- [ ] `qrService` — generate, upload PDF a Supabase Storage
- [ ] `QRGenerator` + `QRScanner` (html5-qrcode)
- [ ] `QRCard` para estudiante + `QRDownloadButton`
- [ ] `attendanceService` — registro entrada/salida/clase
- [ ] `useAttendance` + `AttendanceView` con `RoleGuard`
- [ ] Filtros mes/año/documento

### Sprint 3 — Notas (1.5 semanas)
- [ ] `notesService` CRUD + `useNotes`
- [ ] `NotesView` unificada (docente edita; estudiante/padre solo lee)
- [ ] Informe de notas descargable en PDF
- [ ] RLS notas por rol

### Sprint 4 — Novedades (1.5 semanas)
- [ ] `noveltiesService` CRUD + `useNovelties`
- [ ] Suscripción Realtime en hook → toast push al acudiente
- [ ] `NoveltyView` unificada (docente crea; padre/estudiante lee)

### Sprint 5 — Usuarios + Reportes + KPIs (2 semanas)
- [ ] `userService` CRUD + guard servidor en `/usuarios`
- [ ] `reportService` + guard servidor en `/reportes`
- [ ] `kpiService` + dashboard con recharts
- [ ] `ConfirmDialog` en todos los DELETE

### Sprint 6 — QA + Deploy final (1 semana)
- [ ] Pruebas de integración por módulo
- [ ] Validación WCAG AA
- [ ] Compatibilidad Chrome / Firefox / Edge / Safari / iOS / Android
- [ ] Rendimiento < 3 s (índices PostgreSQL + SSR + CDN)
- [ ] Despliegue final Azure + smoke tests en producción

---

## 16. Requisitos No Funcionales → Implementación

| Requisito | Implementación |
|-----------|---------------|
| Contraseñas cifradas | Supabase Auth (bcrypt) |
| Permisos por rol | RLS (datos) + `can()` + `RoleGuard` (UI) + guards en `page.tsx` |
| Cierre de sesión por inactividad | `onAuthStateChange` + timer en `useAuth` |
| Respuesta < 3 s | SSR + índices PostgreSQL + Azure CDN |
| Múltiples usuarios simultáneos | PgBouncer (Supabase pooling) |
| Interfaz accesible | shadcn/ui (ARIA) + contraste WCAG AA |
| Sin duplicados de correo | UNIQUE constraint en `auth.users` + `usuario.correo` |
| Backups automáticos | Supabase PITR |
| Confirmación acciones críticas | `ConfirmDialog` antes de DELETE |
| Exportar PDF | jsPDF en cliente |
| QR Android + iOS | html5-qrcode (WebRTC) |
| Código documentado | JSDoc en servicios + README por módulo |

---

## 17. Componentes de IA (KPIs)

Operan sobre los datos de Supabase mediante `kpiService`, directamente alineados con `Consultas_KPI_postgres.sql`:

| KPI | Query base | Hook | Componente visual |
|-----|-----------|------|------------------|
| Promedio general de notas | `AVG(nota)` | `useKPIs` | `KPICard` |
| Ranking de estudiantes | `AVG(nota) GROUP BY estudiante ORDER DESC` | `useKPIs` | `TopStudentsTable` |
| Mejor promedio por materia | `AVG(nota) GROUP BY materia ORDER DESC` | `useKPIs` | `GradesChart` |
| % Asistencia por estado | `COUNT(*) GROUP BY estado` | `useKPIs` | `AttendanceChart` |

---

## 18. Convenciones

- **Idioma del código:** Inglés · **UI:** Español
- **Manejo de errores:** servicios lanzan `Error` tipado → hooks capturan en estado `error` → UI muestra `<ErrorMessage />`
- **Commits:** Conventional Commits — `feat:` `fix:` `chore:` `docs:`
- **Ramas:** `main` → producción · `develop` → integración · `feature/nombre`
- **Fechas:** `dd/MM/yyyy` en UI · ISO 8601 en base de datos

---

*Documento de planeación — Eyes School · Trimestre II*
