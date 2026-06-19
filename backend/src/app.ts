import Fastify from 'fastify'
import helmet from '@fastify/helmet'
import cookie from '@fastify/cookie'
import { corsPlugin } from './plugins/cors'
import { jwtPlugin } from './plugins/jwt'
import { rateLimitPlugin } from './plugins/rateLimit'
import { requestIdPlugin } from './plugins/requestId'
import { errorHandler } from './middlewares/error.middleware'
import { registerRoutes } from './routes/index'
import { env } from './config/env'

export async function buildApp() {
  const app = Fastify({
    trustProxy: true,
    // genReqId faz o pino usar o X-Request-Id do plugin (ou gera um novo)
    // sem isso o Fastify gera IDs numéricos sequenciais que não funcionam em multi-instância
    genReqId: (req) => (req.headers['x-request-id'] as string) ?? undefined,
    logger: {
      level: env.LOG_LEVEL,
      transport:
        env.NODE_ENV === 'development'
          ? { target: 'pino-pretty', options: { colorize: true } }
          : undefined,
    },
  })

  // Correlation ID — deve ser o primeiro plugin
  await requestIdPlugin(app)

  // Segurança
  await app.register(helmet)
  await corsPlugin(app)
  await rateLimitPlugin(app)
  await app.register(cookie)

  // Autenticação
  await jwtPlugin(app)

  // Rotas
  await registerRoutes(app)

  // Handler global de erros — deve ser registrado por último
  app.setErrorHandler(errorHandler)

  return app
}
