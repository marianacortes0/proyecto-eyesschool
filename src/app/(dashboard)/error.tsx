'use client' // Los límites de error son componentes de cliente

import { useEffect } from 'react'
import ErrorCarga from '@/components/ui/ErrorCarga'

// DEF-WEB-12 · Si una página del panel falla al renderizarse en el servidor (por
// ejemplo, la API no responde), en lugar de la página genérica de Next («This
// page couldn't load») se muestra un aviso con «Reintentar», que vuelve a pedir
// y renderizar la página (`retry`, Next 16).
export default function ErrorDelPanel({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="p-6">
      <ErrorCarga mensaje="No se pudo cargar esta página. Revisa tu conexión e intenta de nuevo." onReintentar={retry} />
    </div>
  )
}
