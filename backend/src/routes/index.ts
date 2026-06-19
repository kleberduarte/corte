import { FastifyInstance } from 'fastify'
import { authRoutes } from './auth.routes'
import { adminRoutes } from './admin.routes'
import { orderRoutes } from './order.routes'
import { productRoutes } from './product.routes'
import { totemRoutes } from './totem.routes'
import { healthRoutes } from './health.routes'

// Ponto central de registro de rotas.
// Para adicionar um novo domínio: criar o arquivo de rotas e registrá-lo aqui.
export async function registerRoutes(app: FastifyInstance) {
  // Health/Readiness — sem autenticação, sem rate limit, sem logging
  await app.register(healthRoutes)

  // Rotas públicas (totem — sem JWT)
  app.register(totemRoutes, { prefix: '/totem' })

  // Rotas autenticadas (operadores)
  app.register(authRoutes, { prefix: '/auth' })

  // Rotas admin (gestão da plataforma)
  app.register(adminRoutes, { prefix: '/admin' })
  app.register(orderRoutes, { prefix: '/orders' })
  app.register(productRoutes, { prefix: '/products' })
}
