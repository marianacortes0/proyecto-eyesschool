'use client'

import { toast, type ToastOptions } from 'react-toastify'

// Notificaciones uniformes para toda la app (Eyes School).
// Colores por tipo (ToastContainer usa theme="colored"):
//   éxito = verde · error = rojo · advertencia = amarillo · info = azul.
// Todos los módulos deben usar SOLO estos helpers para garantizar consistencia.

const BASE: ToastOptions = {
  position: 'top-right',
  autoClose: 4000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
}

/** Antepone el icono canónico si el mensaje aún no empieza por uno. */
function withIcon(msg: string, icon: string): string {
  const trimmed = msg.trimStart()
  return /^(✅|❌|⚠️|📧)/.test(trimmed) ? msg : `${icon} ${msg}`
}

export function notifySuccess(msg: string, options?: ToastOptions) {
  return toast.success(withIcon(msg, '✅'), { ...BASE, ...options })
}

export function notifyError(msg: string, options?: ToastOptions) {
  return toast.error(withIcon(msg, '❌'), { ...BASE, ...options })
}

export function notifyWarning(msg: string, options?: ToastOptions) {
  return toast.warning(withIcon(msg, '⚠️'), { ...BASE, ...options })
}

export function notifyInfo(msg: string, options?: ToastOptions) {
  return toast.info(withIcon(msg, '📧'), { ...BASE, ...options })
}
