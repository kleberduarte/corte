import { FastifyInstance } from 'fastify'
import { randomUUID } from 'crypto'

// Garante que cada request tenha um ID único rastreável nos logs e na resposta.
// Sem isso é impossível correlacionar um erro nos logs com um request específico.
export async function requestIdPlugin(app: FastifyInstance) {
  app.addHook('onRequest', (req, reply, done) => {
    const id = (req.headers['x-request-id'] as string) ?? randomUUID()
    req.id = id
    reply.header('X-Request-Id', id)
    done()
  })
}
