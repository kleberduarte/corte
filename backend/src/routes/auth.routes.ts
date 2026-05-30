import { FastifyInstance } from 'fastify'
import { loginHandler } from '../controllers/auth.controller'

export async function authRoutes(app: FastifyInstance) {
  // Rate limit mais restritivo para evitar brute-force
  app.post('/login', {
    config: { rateLimit: { max: 10, timeWindow: '1 minute' } },
    handler: loginHandler,
  })
}
