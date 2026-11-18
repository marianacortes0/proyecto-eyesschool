import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

// DEF-WEB-05 / WC-03 · cuando la API rechaza el registro con un 422, el motivo se
// muestra junto al campo que lo causó (y el campo queda marcado como inválido),
// no solo como un mensaje general al final del formulario.

const register = vi.fn()
vi.mock('@/auth/actions', () => ({
  register: (...args: unknown[]) => register(...args),
  getCursos: vi.fn(async () => []),
  getEspecializaciones: vi.fn(async () => []),
}))

import SignupModal from '@/components/home/SignupModal'

function enviar() {
  const form = screen.getByRole('dialog', { name: 'Crear cuenta' }).querySelector('form')!
  // Sin validación nativa: lo que se prueba es la respuesta de la acción.
  form.noValidate = true
  form.requestSubmit()
}

describe('SignupModal · motivo del rechazo (DEF-WEB-05)', () => {
  it('un 422 del correo se muestra bajo el campo Correo y lo marca inválido', async () => {
    const motivo = 'The part after the @-sign is a special-use or reserved name'
    register.mockResolvedValue({ error: `Error al registrar el usuario: ${motivo}`, campo: 'email', motivo })
    render(<SignupModal open onClose={vi.fn()} onSwitchToLogin={vi.fn()} />)

    enviar()

    const correo = screen.getByLabelText('Correo')
    await waitFor(() => expect(correo.getAttribute('aria-invalid')).toBe('true'))
    const ayuda = document.getElementById(correo.getAttribute('aria-describedby')!)
    expect(ayuda?.textContent).toBe(motivo)
    // El mensaje general se mantiene (el campo puede quedar fuera de la vista).
    expect(screen.getByText(`Error al registrar el usuario: ${motivo}`)).toBeTruthy()
    expect(screen.getByLabelText('Contraseña').getAttribute('aria-invalid')).toBeNull()
  })

  it('un error sin campo (409) solo muestra el mensaje general', async () => {
    register.mockResolvedValue({ error: 'Error al registrar el usuario: El correo ya está registrado' })
    render(<SignupModal open onClose={vi.fn()} onSwitchToLogin={vi.fn()} />)

    enviar()

    await screen.findByText('Error al registrar el usuario: El correo ya está registrado')
    expect(screen.getByLabelText('Correo').getAttribute('aria-invalid')).toBeNull()
  })
})
