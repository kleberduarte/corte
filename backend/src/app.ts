import Fastify from 'fastify'
import helmet from '@fastify/helmet'
import { corsPlugin } from './plugins/cors'
import { jwtPlugin } from './plugins/jwt'
import { rateLimitPlugin } from './plugins/rateLimit'
import { errorHandler } from './middlewares/error.middleware'
import { registerRoutes } from './routes/index'
import { env } from './config/env'

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === 'production' ? 'warn' : 'info',
      transport:
        env.NODE_ENV === 'development'
          ? { target: 'pino-pretty', options: { colorize: true } }
          : undefined,
    },
  })

  // Segurança
  await app.register(helmet)
  await corsPlugin(app)
  await rateLimitPlugin(app)

  // Autenticação
  await jwtPlugin(app)

  // Rotas
  await registerRoutes(app)

  // Handler global de erros — deve ser registrado por último
  app.setErrorHandler(errorHandler)

  return app
}
