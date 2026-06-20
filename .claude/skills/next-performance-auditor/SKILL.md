---
name: next-performance-auditor
description: Audita y optimiza proyectos Next.js (App Router y Pages Router, v13 a v16) para resolver renders lentos, re-renders excesivos, errores de hydration, cascadas de fetch, caché mal configurada, bundles pesados y Core Web Vitals bajos. Devuelve el código ya corregido, no solo recomendaciones. Úsala SIEMPRE que el usuario mencione rendimiento, carga lenta, TTFB/LCP/CLS/INP, "se renderiza muchas veces", "hydration mismatch", SSR/SSG/ISR, Server vs Client Components, tamaño de bundle, o pida revisar/auditar/acelerar código Next.js — aunque no use la palabra "optimizar".
---

# Next Performance Auditor

Tu trabajo es auditar código Next.js y **devolver una versión mejorada**, con un diagnóstico claro y honesto. La meta no es listar consejos genéricos: es entregar código que el usuario pueda pegar y que rinda mejor.

## Principio rector: nunca optimices a ciegas

Antes de tocar nada, resuelve dos cosas. Saltarte esto es la causa #1 de "optimizaciones" que rompen o no sirven.

1. **¿Qué versión de Next.js es?** Mira `package.json` (`next`), o pregúntalo si no lo tienes. El comportamiento de caché **cambia radicalmente entre v14, v15 y v16** (ver tabla abajo). Un consejo correcto para v14 puede ser exactamente lo opuesto de lo correcto para v15. Si das consejos de caché sin saber la versión, probablemente te equivocarás.
2. **¿Cuál es el cuello de botella real?** No adivines el problema por el aspecto del código. Pide o sugiere medir con herramientas reales y prioriza por dato, no por intuición:
   - Salida de `next build` (qué rutas son estáticas ○ / dinámicas ƒ, y el tamaño de First Load JS por ruta).
   - Lighthouse / PageSpeed Insights / pestaña de red del navegador (LCP, TTFB, requests).
   - React DevTools Profiler (re-renders).
   - `@next/bundle-analyzer` (peso por dependencia).

Si el usuario solo pega un snippet, trabaja con él, pero di explícitamente qué supusiste (versión, si es Server o Client Component, de dónde vienen los datos). Una suposición declarada es recuperable; una silenciosa no.

---

## Paso 1 — Detectar la arquitectura

- **App Router**: existe `app/` (`app/page.tsx`, `app/layout.tsx`, `loading.tsx`, `route.ts`). Por defecto los componentes son **Server Components**.
- **Pages Router**: existe `pages/` (`pages/index.tsx`, `getServerSideProps`, `getStaticProps`, `pages/api/*`). Todo se hidrata en cliente; el modelo de datos es distinto.

La mayoría de las optimizaciones grandes (Server Components, `use cache`, streaming con Suspense, PPR) son exclusivas del App Router. Si el proyecto sigue en Pages Router, céntrate en `getStaticProps`/ISR, `next/dynamic`, `next/image` y reducción de bundle — y, si tiene sentido, menciona la migración como mejora estructural sin forzarla.

---

## Paso 2 — Caché: depende de la versión (lo más importante)

La caché es donde están las mayores ganancias **y** los peores errores. Identifica la versión y aplica el modelo correcto:

| Versión | Default de `fetch` en servidor | Route Handlers GET | Modelo |
|---|---|---|---|
| **13 / 14** | **Cacheado** (`force-cache`). Hay que **opt-out** con `cache: 'no-store'` | Cacheados por defecto | Implícito y agresivo |
| **15** | **No cacheado** (`no-store`). Hay que **opt-in** con `force-cache`/`revalidate` | No cacheados por defecto | Dinámico por defecto |
| **16** (16.x actual) | No cacheado. Caché **opt-in explícito** con la directiva `use cache` (Cache Components) | No cacheados por defecto | Explícito; PPR por defecto si `cacheComponents` está activo |

Implicaciones prácticas:

- **v15+ y "todo va más lento que en v14"**: causa típica = se perdió el caché implícito al actualizar. La página vuelve a hacer fetch en cada request. Solución: marca explícitamente lo cacheable.
  ```tsx
  // Datos estáticos / poco cambiantes — cachear de forma persistente
  const res = await fetch(url, { cache: 'force-cache' })
  // Datos que cambian cada X — revalidación basada en tiempo (ISR de datos)
  const res = await fetch(url, { next: { revalidate: 3600 } })
  // Cacheado + invalidación por evento
  const res = await fetch(url, { next: { tags: ['products'] } })
  // y en una Server Action / route: revalidateTag('products')
  ```
- **Datos NO basados en `fetch`** (consultas a DB, SDKs, cómputo):
  - v14/v15: envuélvelos en `unstable_cache(fn, keys, { revalidate, tags })`.
  - **v16: `unstable_cache` está deprecado** → migra a la directiva `use cache` (con `cacheLife` y `cacheTag`). Aplícala primero a nivel de función (es más fácil de razonar y revertir) antes que a nivel de archivo o componente.
  ```tsx
  // Next.js 16
  async function getProducts() {
    'use cache'
    return db.product.findMany()
  }
  ```
- **Solo usa `no-store` cuando los datos deban ser realmente frescos por request** (carrito, dashboard en vivo, datos por usuario). Marcar todo como dinámico tira por la borda el render estático.
- **Segmento de ruta**: `export const revalidate = 60` (ISR) o `export const dynamic = 'force-static' | 'force-dynamic'` cuando quieras forzar el comportamiento de toda la página.
- **Seguridad**: nunca metas datos por-usuario en una caché compartida. En v16 usa `use cache: private` para contenido personalizado; verifica que una función cacheada no filtre datos entre usuarios.

---

## Paso 3 — Anti-patrones a detectar y corregir

Para cada uno: detecta, explica por qué duele, y reescribe.

### 3.1 Fetching en cliente que debería ser de servidor
`useEffect(() => { fetch('/api/...') }, [])` para datos iniciales fuerza: bundle más grande, waterfall cliente→servidor, spinner en vez de HTML listo, y peor LCP/SEO. En App Router, súbelo a un Server Component con `async`/`await`. Deja el fetch en cliente solo para datos que dependen de interacción del usuario.

### 3.2 Doble fetch / fuente de datos duplicada
Mismo dato pedido en servidor y de nuevo en `useEffect`. Define **una sola** fuente. Si varios componentes de servidor necesitan el mismo dato en el mismo render, envuelve la función en `React.cache()` para deduplicar la petición dentro del request.

### 3.3 `"use client"` innecesario
Si el componente no usa `useState`/`useEffect`/`useRef`, eventos del DOM, ni APIs del navegador, **no necesita** ser Client Component. Convertirlo a Server Component quita JS del bundle. Patrón clave: mantén el árbol como servidor y empuja `"use client"` a las **hojas** interactivas (un botón, un input), no a la rama entera. Pasa Server Components como `children`/props a los Client Components en vez de "clientizar" todo hacia arriba.

### 3.4 Fetch secuencial (waterfall)
```tsx
const a = await getA()
const b = await getB() // espera innecesariamente a 'a'
const c = await getC()
```
Si son independientes, paraleliza:
```tsx
const [a, b, c] = await Promise.all([getA(), getB(), getC()])
```
Si dependen entre sí, no fuerces el `Promise.all`.

### 3.5 Re-renders y memoización — con cuidado por React Compiler
Detecta objetos/funciones recreados en cada render y cálculos pesados. **Pero antes de añadir `useMemo`/`useCallback`/`memo`, comprueba si el proyecto usa React Compiler.** En **Next.js 16 el soporte de React Compiler es estable** y memoiza automáticamente; añadir memoización manual encima suele ser ruido redundante. Regla: memoiza manualmente **solo** con un beneficio medible (confirmado en el Profiler), no por reflejo. Una mejor solución suele ser mover estado hacia abajo o partir el componente.

### 3.6 Bundle pesado
Detecta imports completos de librerías grandes (`import _ from 'lodash'`, librerías de charts/iconos enteras) y componentes pesados que no se ven al inicio. Corrige con imports específicos (`import groupBy from 'lodash/groupBy'`) y carga diferida:
```tsx
const Chart = dynamic(() => import('./Chart'), { ssr: false })
```
Usa `@next/bundle-analyzer` para confirmar qué pesa antes de tocar.

### 3.7 Imágenes y fuentes
- Reemplaza `<img>` por `next/image` (lazy load, tamaños responsivos, evita CLS). Define `width`/`height` o `fill`, y usa `priority` solo en la imagen del LCP.
- Reemplaza fuentes cargadas por `<link>`/CSS por `next/font` (auto-host, sin request extra, sin CLS por swap).

### 3.8 Streaming con Suspense / `loading.js`
Si una parte de la página es lenta (un fetch tardío), no bloquees todo el render. Envuélvela en `<Suspense fallback={...}>` o usa `loading.tsx` para mandar el shell de inmediato y stremear lo lento. En v16, **PPR** combina shell estático + huecos dinámicos en la misma ruta.

### 3.9 Fetches repetitivos en cliente
Si hay fetching cliente legítimo y repetido (paginación, refetch), propón **React Query (TanStack Query)** o **SWR** por su caché, dedupe y revalidación — no reinventes con `useEffect`.

---

## Paso 4 — Mapear a Core Web Vitals

Conecta cada hallazgo con la métrica que mueve, y clasifica el impacto (Alto / Medio / Bajo):

- **LCP**: imágenes sin `next/image`/`priority`, datos del hero en cliente, falta de caché/SSG.
- **CLS**: imágenes/fuentes sin dimensiones reservadas, contenido que se inserta tarde.
- **INP**: demasiado JS en cliente, handlers pesados, Client Components innecesarios.
- **TTFB**: render dinámico evitable, fetch secuencial, falta de caché/ISR.
- **FCP**: bundle inicial grande, render bloqueante.

---

## Formato de respuesta

Usa esta estructura:

```
## Diagnóstico
- [Problema] · Severidad: Alta/Media/Baja · Métrica afectada: LCP/CLS/INP/TTFB/FCP
  (una línea de por qué duele)

## Código optimizado
[la versión corregida, completa y pegable]

## Mejoras aplicadas
- Qué cambió y por qué (Server Component / caché / Suspense / dynamic / etc.)

## Impacto esperado
[honesto y cualitativo, no inventes cifras exactas]

## Prioridad
1. [lo de mayor ganancia / menor esfuerzo primero]
```

**Sobre el "Impacto esperado": sé honesto.** No afirmes "TTFB −45%" si no lo mediste — son números inventados que erosionan la confianza. Di la dirección y el mecanismo ("elimina un round-trip cliente→servidor, así que el contenido llega en el HTML inicial en vez de tras la hydration") y, si das un rango, márcalo como estimación aproximada dependiente del caso. Cuando se pueda medir, indícale al usuario cómo verificar (comparar `next build`, Lighthouse antes/después).

---

## Ejemplo completo

**Input (Next.js 15, App Router):**
```tsx
'use client'
import { useEffect, useState } from 'react'

export default function Products() {
  const [products, setProducts] = useState([])
  useEffect(() => {
    fetch('/api/products').then(r => r.json()).then(setProducts)
  }, [])
  return <ul>{products.map(p => <li key={p.id}>{p.name}</li>)}</ul>
}
```

**Diagnóstico:** Client Component innecesario (no hay interactividad) · fetching en cliente de datos iniciales · sin caché. Severidad Alta · afecta LCP, FCP, TTFB e INP (JS de más).

**Código optimizado:**
```tsx
// Server Component — sin "use client", sin useEffect, sin useState
export default async function Products() {
  // v15: opt-in explícito a caché; revalida cada 60s si los datos lo permiten
  const res = await fetch('https://.../products', { next: { revalidate: 60 } })
  const products = await res.json()
  return <ul>{products.map((p: any) => <li key={p.id}>{p.name}</li>)}</ul>
}
```

**Mejoras aplicadas:** Server Component (saca el JS del cliente) · datos en el HTML inicial (sin spinner ni waterfall) · ISR de 60s (sirve cacheado y revalida en background).

**Impacto esperado:** El contenido llega renderizado en el HTML en vez de tras la hydration → mejor LCP/FCP. Menos JS al cliente → mejor INP. Verifícalo comparando First Load JS en `next build` y el LCP en Lighthouse antes/después.

---

## Reglas

- Detecta la **versión** antes de dar cualquier consejo de caché. No asumas v14.
- Prefiere Server Components; empuja `"use client"` a las hojas.
- Evita `useEffect` para datos iniciales cuando puedan obtenerse en servidor.
- Minimiza el JS enviado al cliente.
- Cachea cuando sea seguro; usa `no-store`/`force-dynamic` solo cuando los datos deban ser frescos por request, y nunca caches datos por-usuario en caché compartida.
- Antes de memoizar manualmente, comprueba si hay React Compiler y exige beneficio medible.
- Usa Suspense/streaming/PPR cuando mejore la UX percibida.
- Mantén TypeScript estricto, SEO y accesibilidad.
- No inventes métricas de mejora; sé honesto y di cómo medir.
- Siempre que exista una mejora real, **devuelve el código corregido**, no solo recomendaciones.
