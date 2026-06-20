import { FastifyInstance } from 'fastify'
import { randomUUID } from 'crypto'

// Garante que cada request tenha um ID único rastreável nos logs e na resposta.
// O header do cliente é aceito apenas se seguir o formato seguro (alfanumérico + hífens, max 64 chars)
// para evitar log injection via X-Request-Id malicioso.
const SAFE_REQUEST_ID = /^[\w\-]{1,64}$/

export async function requestIdPlugin(app: FastifyInstance) {
  app.addHook('onRequest', (req, reply, done) => {
    const incoming = req.headers['x-request-id'] as string | undefined
    const id = (incoming && SAFE_REQUEST_ID.test(incoming)) ? incoming : randomUUID()
    req.id = id
    reply.header('X-Request-Id', id)
    done()
  })
}
