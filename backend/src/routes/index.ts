import { FastifyInstance } from 'fastify'
import { authRoutes } from './auth.routes'
import { orderRoutes } from './order.routes'
import { productRoutes } from './product.routes'
import { totemRoutes } from './totem.routes'

// Ponto central de registro de rotas.
// Para adicionar um novo domínio: criar o arquivo de rotas e registrá-lo aqui.
export async function registerRoutes(app: FastifyInstance) {
  // Rotas públicas (totem — sem JWT)
  app.register(totemRoutes, { prefix: '/totem' })

  // Rotas autenticadas (operadores)
  app.register(authRoutes, { prefix: '/auth' })
  app.register(orderRoutes, { prefix: '/orders' })
  app.register(productRoutes, { prefix: '/products' })

  // Health check — usado pelo Railway para verificar se o serviço está vivo
  app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }))
}
