import { passwordChecks, PASSWORD_RULE_LABELS } from '@/lib/utils/password'

type Props = {
  password: string
  /** Oculta la lista mientras el campo esté vacío (registro). Por defecto siempre visible. */
  ocultarSiVacio?: boolean
  colorCumplida?: string
  colorPendiente?: string
  fontSize?: number
}

/**
 * Reglas de la política de contraseñas, en vivo. Cada regla dice «cumplida» o
 * «pendiente» en texto (no solo por color) y la lista se anuncia con aria-live.
 */
export default function PasswordChecklist({
  password,
  ocultarSiVacio = false,
  colorCumplida = '#16a34a',
  colorPendiente = '#64748b',
  fontSize = 10,
}: Props) {
  if (ocultarSiVacio && password.length === 0) return null
  const checks = passwordChecks(password)

  return (
    <ul
      aria-live="polite"
      aria-label="Reglas de la contraseña"
      style={{ listStyle: 'none', margin: '8px 0 0', padding: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 10px' }}
    >
      {PASSWORD_RULE_LABELS.map(({ key, label }) => {
        const ok = checks[key]
        return (
          <li key={key} style={{ fontSize, color: ok ? colorCumplida : colorPendiente, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span aria-hidden="true">{ok ? '✓' : '○'}</span>
            {label}
            <span className="sr-only">{ok ? ' — cumplida' : ' — pendiente'}</span>
          </li>
        )
      })}
    </ul>
  )
}
