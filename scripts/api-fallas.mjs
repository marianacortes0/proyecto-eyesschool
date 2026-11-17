// Proxy de fallas para los E2E de «API caída» (WC-05: CP-SIS-005, 008, 026, 028,
// 040, 046, 052, 057, 058 y 059).
//
// Las llamadas a la API salen del servidor de Next (Server Actions, páginas y
// /api/proxy), así que `page.route` del navegador no las ve. Para simular la API
// caída, la web se construye con NEXT_PUBLIC_API_URL apuntando a este proxy, que
// reenvía todo a la API de QA y, cuando una prueba lo pide, corta las conexiones
// como haría una API detenida.
//
// Uso:
//   node scripts/api-fallas.mjs            # escucha en API_FALLAS_PUERTO (3999)
//   GET  /__fallas                          # { modo }
//   POST /__fallas?modo=caida | normal      # cambia el modo
//
// Lee QA_API_URL de .env.test.local. Solo para pruebas locales: nunca se despliega.
import http from 'node:http'
import https from 'node:https'
import { existsSync } from 'node:fs'

if (existsSync('.env.test.local')) process.loadEnvFile('.env.test.local')

const destino = new URL(process.env.QA_API_URL ?? '')
if (!/^https?:$/.test(destino.protocol)) {
  console.error('Falta QA_API_URL (https://…/api/v1) en .env.test.local')
  process.exit(1)
}
const PUERTO = Number(process.env.API_FALLAS_PUERTO ?? 3999)
const cliente = destino.protocol === 'https:' ? https : http

let modo = 'normal'
const MODOS = new Set(['normal', 'caida'])

const servidor = http.createServer((req, res) => {
  const url = new URL(req.url ?? '/', `http://localhost:${PUERTO}`)

  if (url.pathname === '/__fallas') {
    if (req.method === 'POST') {
      const nuevo = url.searchParams.get('modo') ?? ''
      if (!MODOS.has(nuevo)) {
        res.writeHead(400, { 'content-type': 'application/json' })
        res.end(JSON.stringify({ error: `modo desconocido: ${nuevo}` }))
        return
      }
      modo = nuevo
      console.log(new Date().toISOString(), 'modo →', modo)
    }
    res.writeHead(200, { 'content-type': 'application/json' })
    res.end(JSON.stringify({ modo }))
    return
  }

  // API caída: se cierra la conexión sin responder, como un servicio detenido.
  if (modo === 'caida') {
    req.socket.destroy()
    return
  }

  const salida = cliente.request(
    {
      protocol: destino.protocol,
      hostname: destino.hostname,
      port: destino.port || undefined,
      method: req.method,
      path: url.pathname + url.search,
      headers: { ...req.headers, host: destino.host },
    },
    (respuesta) => {
      res.writeHead(respuesta.statusCode ?? 502, respuesta.headers)
      respuesta.pipe(res)
    }
  )
  salida.on('error', () => {
    if (!res.headersSent) res.writeHead(502)
    res.end()
  })
  req.pipe(salida)
})

servidor.listen(PUERTO, () => console.log(`api-fallas en http://localhost:${PUERTO} → ${destino.origin}`))
