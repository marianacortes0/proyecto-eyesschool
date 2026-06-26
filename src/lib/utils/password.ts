// Política de contraseñas: mínimo 8 caracteres, mayúscula, minúscula,
// número y carácter especial. Compartida entre el formulario (validación en
// tiempo real) y la Server Action de registro.

export type PasswordChecks = {
  length: boolean
  upper: boolean
  lower: boolean
  number: boolean
  special: boolean
}

export function passwordChecks(pwd: string): PasswordChecks {
  return {
    length: pwd.length >= 8,
    upper: /[A-Z]/.test(pwd),
    lower: /[a-z]/.test(pwd),
    number: /[0-9]/.test(pwd),
    special: /[^A-Za-z0-9]/.test(pwd),
  }
}

export function isPasswordValid(pwd: string): boolean {
  return Object.values(passwordChecks(pwd)).every(Boolean)
}

export const PASSWORD_RULE_LABELS: { key: keyof PasswordChecks; label: string }[] = [
  { key: 'length', label: 'Mínimo 8 caracteres' },
  { key: 'upper', label: 'Una mayúscula' },
  { key: 'lower', label: 'Una minúscula' },
  { key: 'number', label: 'Un número' },
  { key: 'special', label: 'Un carácter especial' },
]
