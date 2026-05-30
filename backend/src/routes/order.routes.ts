import { FastifyInstance } from 'fastify'
import { authenticate } from '../middlewares/auth.middleware'
import {
  createOrderHandler,
  getOrderHandler,
  listOrdersHandler,
  updateOrderStatusHandler,
} from '../controllers/order.controller'

export async function orderRoutes(app: FastifyInstance) {
  // Todas as rotas de pedido exigem token JWT válido
  app.addHook('onRequest', authenticate)

  app.get('/', listOrdersHandler)                              // GET  /orders
  app.post('/', createOrderHandler)                           // POST /orders
  app.get('/:orderId', getOrderHandler)                       // GET  /orders/:orderId
  app.patch('/:orderId/status', updateOrderStatusHandler)     // PATCH /orders/:orderId/status
}
