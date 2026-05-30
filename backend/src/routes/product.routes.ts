import { FastifyInstance } from 'fastify'
import { authenticate, requireManager } from '../middlewares/auth.middleware'
import {
  listProductsHandler,
  syncPricesHandler,
  upsertProductPriceHandler,
} from '../controllers/product.controller'

export async function productRoutes(app: FastifyInstance) {
  app.addHook('onRequest', authenticate)

  app.get('/', listProductsHandler)                                              // GET  /products
  app.put('/:productId/price', upsertProductPriceHandler)                       // PUT  /products/:productId/price  (manager)
  app.post('/sync-prices', { onRequest: [authenticate, requireManager] }, syncPricesHandler)  // POST /products/sync-prices (manager)
}
