import { FastifyInstance } from 'fastify'
import { loginSchema } from '../schemas/auth.schema'
import { loginOperator } from '../services/auth.service'
import { env } from '../config/env'

const COOKIE_NAME = 'corte_token'
const COOKIE_OPTS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  // Em produção frontend (Vercel) e backend (Railway) estão em domínios distintos,
  // então o cookie precisa de sameSite: 'none' + secure para ser enviado cross-site.
  // Em dev ambos rodam em localhost, então 'lax' é suficiente e mais seguro.
  sameSite: (env.NODE_ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax',
  path: '/',
  maxAge: 60 * 60 * 8, // 8h em segundos
}

export async function authRoutes(app: FastifyInstance) {
  app.post('/login', {
    config: { rateLimit: { max: 10, timeWindow: '1 minute' } },
  }, async (req, reply) => {
    const input = loginSchema.parse(req.body)
    const result = await loginOperator(app, input)
    reply.setCookie(COOKIE_NAME, result.token, COOKIE_OPTS)
    return reply.status(200).send({ operator: result.operator })
  })

  app.post('/logout', async (_req, reply) => {
    reply.clearCookie(COOKIE_NAME, { path: '/' })
    return reply.status(204).send()
  })
}
