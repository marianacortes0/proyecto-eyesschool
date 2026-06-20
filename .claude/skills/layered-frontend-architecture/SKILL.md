---
name: layered-frontend-architecture
description: >
  Guía para implementar arquitectura por capas en proyectos frontend (React, Vue, Angular)
  con separación estricta en tres capas: Pages, Hooks y Services. Úsala cuando el usuario
  quiera estructurar o refactorizar un proyecto frontend, cuando mencione "arquitectura por
  capas", "feature-sliced", "service layer", "separar lógica de UI", "custom hooks", o cuando
  cree componentes que mezclen llamadas a API, estado y renderizado en el mismo archivo.
  También aplica cuando el usuario pida generar un módulo, feature o pantalla completa
  siguiendo buenas prácticas de organización de código frontend. Si el usuario menciona
  React, Vue o Angular y quiere estructura, orden o escalabilidad: usa esta skill.
---

# Layered Frontend Architecture — Pages · Hooks · Services

## Principio central

Cada capa tiene una única responsabilidad. Ninguna capa puede saltarse la que tiene abajo.

```
┌─────────────────────────────────┐
│           PAGES                 │  ← Composición visual, rutas, entrada del usuario
├─────────────────────────────────┤
│           HOOKS                 │  ← Estado, efectos, orquestación de lógica
├─────────────────────────────────┤
│          SERVICES               │  ← Comunicación externa (APIs, storage, etc.)
└─────────────────────────────────┘
```

**Regla de dependencia:** Pages → Hooks → Services. Nunca al revés.

---

## Estructura de directorios

```
src/
├── pages/              # Componentes de ruta / vistas completas
│   └── Users/
│       └── UsersPage.tsx
│
├── hooks/              # Custom hooks por dominio o feature
│   └── useUsers.ts
│
├── services/           # Lógica de acceso a datos
│   └── usersService.ts
│
├── components/         # Componentes reutilizables (UI pura, sin lógica de negocio)
├── types/              # Interfaces y tipos compartidos
└── utils/              # Funciones utilitarias puras
```

Para proyectos grandes usar organización **por feature**:

```
src/features/
└── users/
    ├── pages/UsersPage.tsx
    ├── hooks/useUsers.ts
    ├── services/usersService.ts
    └── types.ts
```

---

## Capa 1: Services

**Responsabilidad exclusiva:** Comunicación con el mundo exterior.

- Llamadas HTTP (fetch, axios, etc.)
- localStorage / sessionStorage / cookies
- WebSockets
- GraphQL queries/mutations
- Cualquier efecto secundario con I/O

**Reglas:**
- Son funciones puras (sin estado, sin hooks de React)
- Reciben parámetros, devuelven datos o lanzan errores
- No conocen React, Vue ni Angular
- Manejan transformación básica de respuesta (mapear DTO → dominio)

```typescript
// services/usersService.ts
const BASE_URL = '/api/users';

export async function getUsers(): Promise<User[]> {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.json();
}

export async function createUser(data: CreateUserDTO): Promise<User> {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.json();
}

export async function deleteUser(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`Error ${res.status}`);
}
```

---

## Capa 2: Hooks

**Responsabilidad exclusiva:** Estado reactivo, efectos y orquestación.

- `useState`, `useEffect`, `useReducer`, `useCallback`, `useMemo`
- Llamar a Services y manejar loading/error/data
- Exponer acciones y estado limpio a las Pages
- Lógica de negocio (filtros, validaciones, derivaciones de estado)

**Reglas:**
- Solo llaman a Services, nunca hacen fetch directamente
- No renderizan JSX/templates
- Un hook por dominio o feature (no uno gigante para todo)
- Nombrar con prefijo `use`

```typescript
// hooks/useUsers.ts
import { useState, useEffect, useCallback } from 'react';
import { getUsers, createUser, deleteUser } from '../services/usersService';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      setError('No se pudieron cargar los usuarios');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const addUser = useCallback(async (data: CreateUserDTO) => {
    setLoading(true);
    try {
      const newUser = await createUser(data);
      setUsers(prev => [...prev, newUser]);
    } catch {
      setError('No se pudo crear el usuario');
    } finally {
      setLoading(false);
    }
  }, []);

  const removeUser = useCallback(async (id: string) => {
    try {
      await deleteUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch {
      setError('No se pudo eliminar el usuario');
    }
  }, []);

  return { users, loading, error, addUser, removeUser, refresh: fetchUsers };
}
```

---

## Capa 3: Pages

**Responsabilidad exclusiva:** Composición visual y manejo de entrada del usuario.

- Importar y usar hooks
- Renderizar componentes UI
- Manejar eventos del usuario (clicks, formularios) pasándolos a los hooks
- Definir layout de la vista
- Routing (si aplica)

**Reglas:**
- No llaman Services directamente — jamás
- No contienen lógica de negocio
- No hacen fetch, no manipulan estado complejo
- Son fáciles de leer: solo JSX + llamadas al hook

```tsx
// pages/Users/UsersPage.tsx
import { useUsers } from '../../hooks/useUsers';
import { UserCard } from '../../components/UserCard';
import { CreateUserForm } from '../../components/CreateUserForm';

export function UsersPage() {
  const { users, loading, error, addUser, removeUser } = useUsers();

  return (
    <div className="users-page">
      <h1>Usuarios</h1>

      <CreateUserForm onSubmit={addUser} />

      {loading && <p>Cargando...</p>}
      {error && <p className="error">{error}</p>}

      <ul>
        {users.map(user => (
          <UserCard
            key={user.id}
            user={user}
            onDelete={() => removeUser(user.id)}
          />
        ))}
      </ul>
    </div>
  );
}
```

---

## Adaptaciones por framework

### Vue 3 (Composition API)

```
services/ → funciones async normales (idéntico a React)
hooks/    → composables: useUsers.ts con ref(), reactive(), watch()
pages/    → <script setup> que importa el composable
```

```typescript
// hooks/useUsers.ts (Vue composable)
import { ref, onMounted } from 'vue';
import { getUsers } from '../services/usersService';

export function useUsers() {
  const users = ref<User[]>([]);
  const loading = ref(false);

  onMounted(async () => {
    loading.value = true;
    users.value = await getUsers();
    loading.value = false;
  });

  return { users, loading };
}
```

### Angular

```
services/   → @Injectable() con HttpClient
hooks/      → no existen; la lógica va en el propio service o en un store (NgRx/Signal)
pages/      → @Component() con ChangeDetectionStrategy.OnPush
```

En Angular la capa de "hooks" es reemplazada por Services con estado o por stores reactivos.

---

## Anti-patrones a evitar

| ❌ Anti-patrón | ✅ Corrección |
|---|---|
| `fetch()` directo en un componente Page | Moverlo a un Service |
| Lógica de estado dentro de la Page | Extraer a un Hook |
| Un Hook que importa otro Hook de diferente dominio | Crear un Hook orquestador o unificar servicios |
| Service que usa `useState` | Los Services son funciones puras, sin hooks |
| Page que llama al Service directamente | Page → Hook → Service, siempre |
| Un archivo de 500 líneas con todo mezclado | Separar en sus tres capas correspondientes |

---

## Checklist al generar o revisar código

- [ ] ¿Los Services son funciones puras sin hooks ni estado?
- [ ] ¿Los Hooks solo llaman a Services, no a `fetch` directamente?
- [ ] ¿Las Pages no tienen `useState` para lógica de negocio?
- [ ] ¿Las Pages no importan Services directamente?
- [ ] ¿El hook devuelve una interfaz limpia (datos + acciones)?
- [ ] ¿Los errores y loading se manejan en el Hook, no en la Page?
- [ ] ¿Hay un archivo por responsabilidad (no todo en un mismo fichero)?

---

## Flujo de datos

```
Usuario interactúa con la Page
  → Page llama acción del Hook (ej: addUser(data))
    → Hook llama Service (ej: createUser(data))
      → Service hace fetch a la API
    ← Service devuelve User creado
  ← Hook actualiza estado (setUsers)
← Page re-renderiza con el nuevo estado
```

---

## Referencias adicionales

Para proyectos muy grandes, ver:
- **Feature-Sliced Design**: https://feature-sliced.design/
- **Bulletproof React**: https://github.com/alan2207/bulletproof-react
- Patrón Repository aplicado a frontend para aislar aún más los Services
