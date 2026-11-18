import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import ResetPasswordPage from '@/app/(auth)/reset-password/page'
import PasswordChecklist from '@/components/auth/PasswordChecklist'

vi.mock('@/auth/actions', () => ({ resetPassword: vi.fn() }))

const regla = (texto: string) => screen.getByText(texto).closest('li') as HTMLElement

describe('WEB-05 · PasswordChecklist (reglas en vivo)', () => {
  it('con Colegio2026 la regla «Un carácter especial» aparece como pendiente', () => {
    render(<PasswordChecklist password="Colegio2026" />)

    expect(within(regla('Un carácter especial')).getByText(/pendiente/)).toBeTruthy()
    expect(within(regla('Una mayúscula')).getByText(/cumplida/)).toBeTruthy()
  })

  it('con Colegio#2026 las cinco reglas aparecen cumplidas', () => {
    render(<PasswordChecklist password="Colegio#2026" />)

    expect(screen.getAllByText(/— cumplida/)).toHaveLength(5)
    expect(screen.queryAllByText(/— pendiente/)).toHaveLength(0)
  })

  it('anuncia los cambios con aria-live', () => {
    render(<PasswordChecklist password="" />)

    expect(screen.getByRole('list', { name: /reglas de la contraseña/i }).getAttribute('aria-live')).toBe('polite')
  })

  it('con ocultarSiVacio no dibuja nada mientras el campo está vacío', () => {
    const { container } = render(<PasswordChecklist password="" ocultarSiVacio />)

    expect(container.firstChild).toBeNull()
  })
})

describe('WEB-05 · página reset-password', () => {
  it('el botón está deshabilitado con Colegio2026 y habilitado con Colegio#2026 confirmada', async () => {
    const user = userEvent.setup()
    render(<ResetPasswordPage />)
    const boton = screen.getByRole('button', { name: 'Actualizar' }) as HTMLButtonElement
    const nueva = screen.getByLabelText('Nueva Contraseña')
    const confirmar = screen.getByLabelText('Confirmar')

    await user.type(nueva, 'Colegio2026')
    await user.type(confirmar, 'Colegio2026')
    expect(boton.disabled).toBe(true)

    await user.clear(nueva)
    await user.clear(confirmar)
    await user.type(nueva, 'Colegio#2026')
    await user.type(confirmar, 'Colegio#2026')
    expect(boton.disabled).toBe(false)
  })

  it('deshabilitado si las contraseñas no coinciden', async () => {
    const user = userEvent.setup()
    render(<ResetPasswordPage />)

    await user.type(screen.getByLabelText('Nueva Contraseña'), 'Colegio#2026')
    await user.type(screen.getByLabelText('Confirmar'), 'Colegio#2027')

    expect((screen.getByRole('button', { name: 'Actualizar' }) as HTMLButtonElement).disabled).toBe(true)
    expect(screen.getByRole('alert').textContent).toMatch(/no coinciden/)
  })
})
