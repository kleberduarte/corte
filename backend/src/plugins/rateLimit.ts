import rateLimit from '@fastify/rate-limit'
import { FastifyInstance } from 'fastify'

export async function rateLimitPlugin(app: FastifyInstance) {
  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
    // Rotas de auth têm limite mais restritivo (configurado na própria rota)
    errorResponseBuilder: () => ({
      statusCode: 429,
      error: 'Too Many Requests',
      message: 'Limite de requisições atingido. Tente novamente em breve.',
    }),
  })
}
