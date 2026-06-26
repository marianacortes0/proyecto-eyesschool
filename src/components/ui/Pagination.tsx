'use client'

interface PaginationProps {
  page: number
  totalPages: number
  total: number
  from: number
  to: number
  onPageChange: (page: number) => void
  /** Etiqueta plural del recurso, p. ej. "usuarios", "novedades". */
  itemLabel?: string
}

/**
 * Genera la secuencia de páginas a mostrar con elipsis cuando hay muchas.
 * Ej. con page=5,totalPages=10 → [1, '…', 4, 5, 6, '…', 10]
 */
function buildPages(page: number, totalPages: number): (number | '…')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }
  const pages: (number | '…')[] = [1]
  const start = Math.max(2, page - 1)
  const end = Math.min(totalPages - 1, page + 1)
  if (start > 2) pages.push('…')
  for (let i = start; i <= end; i++) pages.push(i)
  if (end < totalPages - 1) pages.push('…')
  pages.push(totalPages)
  return pages
}

export default function Pagination({
  page,
  totalPages,
  total,
  from,
  to,
  onPageChange,
  itemLabel = 'registros',
}: PaginationProps) {
  if (total === 0) return null

  const pages = buildPages(page, totalPages)
  const navBtn =
    'min-w-9 h-9 px-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed'

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 pt-3">
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Mostrando <span className="font-semibold text-slate-700 dark:text-slate-200">{from}</span>
        {' – '}
        <span className="font-semibold text-slate-700 dark:text-slate-200">{to}</span>
        {' de '}
        <span className="font-semibold text-slate-700 dark:text-slate-200">{total}</span> {itemLabel}
      </p>

      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            aria-label="Página anterior"
            className={`${navBtn} text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10`}
          >
            <span className="material-symbols-outlined !text-lg align-middle">chevron_left</span>
          </button>

          {pages.map((p, i) =>
            p === '…' ? (
              <span key={`gap-${i}`} className="min-w-9 h-9 grid place-items-center text-slate-400 text-sm">
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                aria-current={p === page ? 'page' : undefined}
                className={`${navBtn} ${
                  p === page
                    ? 'bg-primary text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
                }`}
              >
                {p}
              </button>
            )
          )}

          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            aria-label="Página siguiente"
            className={`${navBtn} text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10`}
          >
            <span className="material-symbols-outlined !text-lg align-middle">chevron_right</span>
          </button>
        </div>
      )}
    </div>
  )
}
