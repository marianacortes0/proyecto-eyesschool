'use client'

import { useMemo, useState } from 'react'

export const DEFAULT_PAGE_SIZE = 10

/**
 * Paginación client-side genérica. Recibe la lista YA filtrada y devuelve solo
 * la página visible. Si la lista se encoge (p. ej. al filtrar), la página actual
 * se ajusta al rango válido en vez de quedar en blanco.
 */
export function usePagination<T>(items: T[], pageSize: number = DEFAULT_PAGE_SIZE) {
  const [pedida, setPage] = useState(1)

  const total = items.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  // Si el total se reduce por debajo de la página pedida, se muestra la última
  // válida (se deriva al renderizar; no hace falta un efecto que ajuste el estado).
  const page = Math.min(pedida, totalPages)

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize
    return items.slice(start, start + pageSize)
  }, [items, page, pageSize])

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  return { page, setPage, totalPages, pageItems, total, from, to, pageSize }
}
