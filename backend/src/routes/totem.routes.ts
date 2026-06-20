// Rotas públicas consumidas pelo totem (sem autenticação JWT).
// O totem identifica a loja pelo slug — não há login pois é um dispositivo físico da própria loja.

import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { createOrderSchema } from '../schemas/order.schema'
import { printReceiptSchema } from '../schemas/print.schema'
import { placeOrder } from '../services/order.service'
import { printReceipt } from '../services/print.service'
import { getStoreConfig, getStoreCatalog, getBoardData, getOrderByCode, resolveActiveStore } from '../services/totem.service'
import { env } from '../config/env'
import { authenticate } from '../middlewares/auth.middleware'

const storeSlugSchema = z.object({ storeSlug: z.string().min(1) })

export async function totemRoutes(app: FastifyInstance) {
  // GET /totem/:storeSlug/config — configuração completa da loja (tema, horários)
  app.get<{ Params: { storeSlug: string } }>(
    '/:storeSlug/config',
    { config: { rateLimit: { max: 60, timeWindow: '1 minute' } } },
    async (req, reply) => reply.send(await getStoreConfig(req.params.storeSlug)),
  )

  // GET /totem/:storeSlug/catalog — catálogo completo (produtos, categorias, preços da loja)
  app.get<{ Params: { storeSlug: string } }>(
    '/:storeSlug/catalog',
    { config: { rateLimit: { max: 60, timeWindow: '1 minute' } } },
    async (req, reply) => reply.send(await getStoreCatalog(req.params.storeSlug)),
  )

  // GET /totem/:storeSlug/products — alias legado → mesmo payload que /catalog
  app.get<{ Params: { storeSlug: string } }>(
    '/:storeSlug/products',
    { config: { rateLimit: { max: 60, timeWindow: '1 minute' } } },
    async (req, reply) => reply.send(await getStoreCatalog(req.params.storeSlug)),
  )

  // GET /totem/:storeSlug/board — painel público de pedidos (aguardando / preparando / pronto)
  app.get<{ Params: { storeSlug: string } }>(
    '/:storeSlug/board',
    { config: { rateLimit: { max: 120, timeWindow: '1 minute' } } },
    async (req, reply) => reply.send(await getBoardData(req.params.storeSlug)),
  )

  // GET /totem/:storeSlug/orders/:code — rastreamento público por ID ou pickupCode
  app.get<{ Params: { storeSlug: string; code: string } }>(
    '/:storeSlug/orders/:code',
    { config: { rateLimit: { max: 60, timeWindow: '1 minute' } } },
    async (req, reply) => reply.send(await getOrderByCode(req.params.storeSlug, req.params.code)),
  )

  // POST /totem/:storeSlug/orders — cria pedido vindo do totem (rate limit restritivo anti-abuso)
  app.post<{ Params: { storeSlug: string } }>(
    '/:storeSlug/orders',
    { config: { rateLimit: { max: 20, timeWindow: '1 minute' } } },
    async (req, reply) => {
      const { storeSlug } = storeSlugSchema.parse(req.params)
      const store = await resolveActiveStore(storeSlug)
      const input = createOrderSchema.parse(req.body)
      return reply.status(201).send(await placeOrder(store.id, input))
    },
  )

  // POST /totem/:storeSlug/print — impressão silenciosa pelo backend
  // Requer JWT de operador para evitar abuso (DoS de impressora, UNC path injection)
  app.post<{ Params: { storeSlug: string } }>(
    '/:storeSlug/print',
    {
      config: { rateLimit: { max: 20, timeWindow: '1 minute' } },
      onRequest: [authenticate],
    },
    async (req, reply) => {
      const store = await resolveActiveStore(req.params.storeSlug)
      const body = printReceiptSchema.parse(req.body)
      await printReceipt(
        { storeName: store.name, ...body },
        body.printerName ?? env.PRINTER_NAME,
      )
      return reply.status(204).send()
    },
  )
}
