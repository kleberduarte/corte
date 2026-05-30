// Rotas públicas consumidas pelo totem (sem autenticação JWT).
// O totem identifica a loja pelo slug — não há login pois é um dispositivo físico da própria loja.
// Rate limit mais restritivo para evitar criação em massa.

import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { createOrderSchema } from '../schemas/order.schema'
import { placeOrder } from '../services/order.service'
import { findStoreBySlug } from '../repositories/store.repository'
import { findProductsByStore } from '../repositories/product.repository'
import { NotFoundError } from '../errors/AppError'

export async function totemRoutes(app: FastifyInstance) {
  // GET /totem/:storeSlug/products — catálogo com preços da loja
  app.get<{ Params: { storeSlug: string } }>(
    '/:storeSlug/products',
    {
      config: { rateLimit: { max: 60, timeWindow: '1 minute' } },
    },
    async (req, reply) => {
      const store = await findStoreBySlug(req.params.storeSlug)
      if (!store || !store.active) throw new NotFoundError('Loja')

      const products = await findProductsByStore(store.id)
      return reply.send(products)
    },
  )

  // POST /totem/:storeSlug/orders — cria pedido vindo do totem
  app.post<{ Params: { storeSlug: string } }>(
    '/:storeSlug/orders',
    {
      config: { rateLimit: { max: 20, timeWindow: '1 minute' } },
    },
    async (req, reply) => {
      const storeSlugSchema = z.object({ storeSlug: z.string().min(1) })
      const { storeSlug } = storeSlugSchema.parse(req.params)

      const store = await findStoreBySlug(storeSlug)
      if (!store || !store.active) throw new NotFoundError('Loja')

      const input = createOrderSchema.parse(req.body)
      const order = await placeOrder(store.id, input)
      return reply.status(201).send(order)
    },
  )

  // GET /totem/:storeSlug/orders/:code — rastreamento público por ID ou pickupCode
  app.get<{ Params: { storeSlug: string; code: string } }>(
    '/:storeSlug/orders/:code',
    {
      config: { rateLimit: { max: 60, timeWindow: '1 minute' } },
    },
    async (req, reply) => {
      const store = await findStoreBySlug(req.params.storeSlug)
      if (!store || !store.active) throw new NotFoundError('Loja')

      const { findOrderById, findOrderByPickupCode } = await import('../repositories/order.repository')

      // Tenta por ID primeiro, depois por pickupCode
      const order =
        (await findOrderById(store.id, req.params.code)) ??
        (await findOrderByPickupCode(store.id, req.params.code))

      if (!order) throw new NotFoundError('Pedido')

      return reply.send({
        id: order.id,
        orderNumber: order.orderNumber,
        pickupCode: order.pickupCode,
        status: order.status,
        scheduledAt: order.scheduledAt,
        pickupMode: order.pickupMode,
        items: order.items.map((i) => ({
          productName: i.productName,
          cutType: i.cutType,
          quantity: Number(i.quantity),
          totalPrice: Number(i.totalPrice),
        })),
      })
    },
  )
}
