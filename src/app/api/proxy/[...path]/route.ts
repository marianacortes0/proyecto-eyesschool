import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'

/**
 * Proxy hacia la API de Eyes School (WEB-02). El navegador ya no puede leer el
 * token de acceso (cookie httpOnly), así que sus llamadas pasan por aquí: este
 * handler lee la cookie en el servidor y agrega `Authorization: Bearer`.
 * La autorización por rol sigue siendo de la API; esto solo transporta.
 *
 * Endurecimiento (D-WEB-03): solo llega a la API propia bajo /api/v1, métodos y
 * tamaño acotados, cabeceras en lista blanca y verificación de origen (CSRF).
 */

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'
const API_ORIGIN = new URL(API).origin
const API_PATH = new URL(API).pathname.replace(/\/+$/, '')

const METODOS = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])
const MAX_CUERPO = 5 * 1024 * 1024
const CABECERAS_ENTRADA = ['content-type', 'accept', 'accept-language']
const CABECERAS_SALIDA = ['content-type', 'content-disposition', 'content-length']

type Contexto = { params: Promise<{ path: string[] }> }

function segmentoInvalido(s: string): boolean {
  if (s === '' || s === '.' || s === '..') return true
  if (s.includes('://') || s.includes('/') || s.includes('\\')) return true
  let decodificado: string
  try {
    decodificado = decodeURIComponent(s)
  } catch {
    return true
  }
  return decodificado === '.' || decodificado === '..' || decodificado.includes('/') || decodificado.includes('\\')
}

const respuesta = (detail: string, status: number) => NextResponse.json({ detail }, { status })

async function reenviar(request: NextRequest, { params }: Contexto) {
  if (!METODOS.has(request.method)) return respuesta('Método no permitido', 405)

  const { path } = await params
  if (path.length === 0 || path.some(segmentoInvalido)) return respuesta('Ruta no válida', 400)

  const tieneCuerpo = request.method !== 'GET'
  if (tieneCuerpo) {
    const origen = request.headers.get('origin')
    if (origen && origen !== request.nextUrl.origin) return respuesta('Origen no permitido', 403)
  }

  const destino = new URL(`${API_ORIGIN}${API_PATH}/${path.map(encodeURIComponent).join('/')}`)
  destino.search = request.nextUrl.search
  if (destino.origin !== API_ORIGIN || !destino.pathname.startsWith(`${API_PATH}/`)) {
    return respuesta('Ruta no válida', 400)
  }

  const token = (await cookies()).get('eys_access')?.value
  if (!token) return respuesta('No autenticado', 401)

  let cuerpo: ArrayBuffer | undefined
  if (tieneCuerpo) {
    const declarado = Number(request.headers.get('content-length') ?? 0)
    if (declarado > MAX_CUERPO) return respuesta('El contenido es demasiado grande', 413)
    cuerpo = await request.arrayBuffer()
    if (cuerpo.byteLength > MAX_CUERPO) return respuesta('El contenido es demasiado grande', 413)
  }

  const headers: Record<string, string> = {}
  for (const nombre of CABECERAS_ENTRADA) {
    const valor = request.headers.get(nombre)
    if (valor) headers[nombre === 'content-type' ? 'Content-Type' : nombre] = valor
  }
  headers.Authorization = `Bearer ${token}`

  let upstream: Response
  try {
    upstream = await fetch(destino.toString(), { method: request.method, headers, body: cuerpo, cache: 'no-store' })
  } catch {
    return respuesta('No se pudo contactar el servidor.', 502)
  }

  const salida = new Headers()
  for (const nombre of CABECERAS_SALIDA) {
    const valor = upstream.headers.get(nombre)
    if (valor) salida.set(nombre, valor)
  }
  const sinCuerpo = upstream.status === 204 || upstream.status === 205
  return new NextResponse(sinCuerpo ? null : await upstream.arrayBuffer(), { status: upstream.status, headers: salida })
}

export const GET = reenviar
export const POST = reenviar
export const PUT = reenviar
export const PATCH = reenviar
export const DELETE = reenviar
// OPTIONS y HEAD se exportan solo para responder 405 de forma explícita.
export const OPTIONS = reenviar
export const HEAD = reenviar
