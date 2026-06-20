import { FastifyInstance } from 'fastify'
import { env } from '../config/env'

// Em produção os cookies são sameSite:'none' (cross-site Vercel + Railway).
// Isso permite CSRF: um site malicioso pode fazer requisições autenticadas em nome do usuário.
// Mitigação: rejeitar mutações cuja origem não esteja na lista CORS_ORIGINS.
// Requisições sem Origin (ex.: Postman, curl, mobile apps) são permitidas — a proteção
// visa ataques browser-driven, não clientes server-side legítimos.
const MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

export async function csrfPlugin(app: FastifyInstance) {
  if (env.NODE_ENV !== 'production') return

  const allowedOrigins = new Set(env.CORS_ORIGINS.split(',').map((o) => o.trim()))

  app.addHook('onRequest', (req, reply, done) => {
    if (!MUTATION_METHODS.has(req.method)) return done()

    const origin = req.headers.origin
    if (!origin) return done() // requisição sem origin (curl, Postman, app nativo)

    if (!allowedOrigins.has(origin)) {
      return reply.status(403).send({
        error: 'FORBIDDEN',
        message: 'Origin não autorizada',
      })
    }
    done()
  })
}
