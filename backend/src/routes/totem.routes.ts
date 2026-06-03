// Rotas públicas consumidas pelo totem (sem autenticação JWT).
// O totem identifica a loja pelo slug — não há login pois é um dispositivo físico da própria loja.
// Rate limit mais restritivo para evitar criação em massa.

import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { createOrderSchema } from '../schemas/order.schema'
import { placeOrder } from '../services/order.service'
import { printReceipt } from '../services/print.service'
import { findStoreBySlug } from '../repositories/store.repository'
import { findProductsByStore } from '../repositories/product.repository'
import { NotFoundError } from '../errors/AppError'

export async function totemRoutes(app: FastifyInstance) {
  // GET /totem/:storeSlug/config — configuração completa da loja (tema, horários)
  app.get<{ Params: { storeSlug: string } }>(
    '/:storeSlug/config',
    {
      config: { rateLimit: { max: 60, timeWindow: '1 minute' } },
    },
    async (req, reply) => {
      const store = await findStoreBySlug(req.params.storeSlug)
      if (!store || !store.active) throw new NotFoundError('Loja')

      const cfg = store.config
      return reply.send({
        id:     store.slug,
        name:   store.name,
        active: store.active,
        chain:  store.chain,
        theme: {
          primaryColor: cfg?.primaryColor  ?? '#C0272D',
          primaryDark:  cfg?.primaryDark   ?? '#7A1015',
          accentColor:  cfg?.accentColor   ?? '#F5EDDB',
          logoUrl:      cfg?.logoUrl       ?? null,
          fontFamily:   cfg?.fontFamily    ?? null,
        },
        hours: {
          morning:   { open: cfg?.morningOpen   ?? '08:00', close: cfg?.morningClose   ?? '12:00' },
          afternoon: { open: cfg?.afternoonOpen ?? '14:00', close: cfg?.afternoonClose ?? '22:00' },
        },
        slotIntervalMin:   cfg?.slotIntervalMin   ?? 30,
        minLeadTimeMin:    cfg?.minLeadTimeMin     ?? 30,
        inactivityTimeout: cfg?.inactivityTimeout  ?? 90,
      })
    },
  )

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
        priority: order.priority,
        items: order.items.map((i) => ({
          productName: i.productName,
          cutType: i.cutType,
          quantity: Number(i.quantity),
          totalPrice: Number(i.totalPrice),
        })),
      })
    },
  )

  // POST /totem/:storeSlug/print — impressão silenciosa pelo backend (sem diálogo no totem)
  const printSchema = z.object({
    pickupCode: z.string(),
    slotTime: z.string(),
    customerPhone: z.string().optional(),
    qrDataUrl: z.string().optional(),
    printerName: z.string().optional(),
    items: z.array(z.object({
      productName: z.string(),
      cutType: z.string(),
      weightKg: z.number(),
      estimatedPrice: z.number(),
    })),
  })

  app.post<{ Params: { storeSlug: string } }>(
    '/:storeSlug/print',
    { config: { rateLimit: { max: 20, timeWindow: '1 minute' } } },
    async (req, reply) => {
      const store = await findStoreBySlug(req.params.storeSlug)
      if (!store || !store.active) throw new NotFoundError('Loja')

      const body = printSchema.parse(req.body)

      await printReceipt(
        { storeName: store.name, ...body },
        body.printerName ?? process.env.PRINTER_NAME,
      )

      return reply.status(204).send()
    },
  )
}
