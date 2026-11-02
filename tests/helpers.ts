// Utilidades compartidas por las pruebas.

/** JWT con el formato del backend; solo se decodifica, la firma no se verifica. */
export function jwt(payload: Record<string, unknown>) {
  const b64 = (o: unknown) => Buffer.from(JSON.stringify(o)).toString('base64url')
  return `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64(payload)}.firma`
}

export const enUnaHora = () => Math.floor(Date.now() / 1000) + 3600

export function json(status: number, body: unknown) {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
