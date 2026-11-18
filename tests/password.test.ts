import { describe, expect, it } from 'vitest'

import { isPasswordValid, passwordChecks } from '@/lib/utils/password'

describe('política de contraseñas', () => {
  it('acepta una contraseña que cumple las cinco reglas', () => {
    expect(isPasswordValid('Colegio#2026')).toBe(true)
  })

  it.each([
    ['Ab1#', 'length'],
    ['colegio#2026', 'upper'],
    ['COLEGIO#2026', 'lower'],
    ['Colegio#ocho', 'number'],
    ['Colegio2026', 'special'],
  ] as const)('rechaza %s por la regla %s', (pwd, rule) => {
    expect(passwordChecks(pwd)[rule]).toBe(false)
    expect(isPasswordValid(pwd)).toBe(false)
  })
})
