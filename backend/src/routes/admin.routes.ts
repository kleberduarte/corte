import { FastifyInstance } from 'fastify'
import { authenticateAdmin } from '../middlewares/admin.middleware'
import {
  adminLoginSchema, createStoreSchema, updateStoreSchema,
  toggleStoreSchema, createOperatorSchema, resetPasswordSchema,
} from '../schemas/admin.schema'
import {
  loginAdmin, listStores, getStore, createStore, updateStore, toggleStore,
  listOperators, createOperator, resetOperatorPassword, toggleOperator,
} from '../services/admin.service'

export async function adminRoutes(app: FastifyInstance) {

  // POST /admin/login — sem autenticação
  app.post('/login', {
    config: { rateLimit: { max: 10, timeWindow: '1 minute' } },
  }, async (req, reply) => {
    const input = adminLoginSchema.parse(req.body)
    const result = await loginAdmin(app, input)
    return reply.send(result)
  })

  // Todas as rotas abaixo exigem token admin
  app.addHook('onRequest', async (req, reply) => {
    if (req.url?.endsWith('/login')) return
    await authenticateAdmin(req, reply)
  })

  // ─── Lojas ──────────────────────────────────────────────────────────────────

  // GET  /admin/stores
  app.get('/stores', async (req: any, reply) => {
    const chain = (req.query as any).chain
    return reply.send(await listStores(chain))
  })

  // GET  /admin/stores/:storeId
  app.get<{ Params: { storeId: string } }>('/stores/:storeId', async (req, reply) => {
    return reply.send(await getStore(req.params.storeId))
  })

  // POST /admin/stores
  app.post('/stores', async (req, reply) => {
    const input = createStoreSchema.parse(req.body)
    return reply.status(201).send(await createStore(input))
  })

  // PUT  /admin/stores/:storeId
  app.put<{ Params: { storeId: string } }>('/stores/:storeId', async (req, reply) => {
    const input = updateStoreSchema.parse(req.body)
    return reply.send(await updateStore(req.params.storeId, input))
  })

  // PATCH /admin/stores/:storeId/toggle
  app.patch<{ Params: { storeId: string } }>('/stores/:storeId/toggle', async (req, reply) => {
    const { active } = toggleStoreSchema.parse(req.body)
    return reply.send(await toggleStore(req.params.storeId, active))
  })

  // ─── Operadores ─────────────────────────────────────────────────────────────

  // GET  /admin/stores/:storeId/operators
  app.get<{ Params: { storeId: string } }>('/stores/:storeId/operators', async (req, reply) => {
    return reply.send(await listOperators(req.params.storeId))
  })

  // POST /admin/operators
  app.post('/operators', async (req, reply) => {
    const input = createOperatorSchema.parse(req.body)
    return reply.status(201).send(await createOperator(input))
  })

  // PATCH /admin/operators/:operatorId/password
  app.patch<{ Params: { operatorId: string } }>('/operators/:operatorId/password', async (req, reply) => {
    const input = resetPasswordSchema.parse(req.body)
    await resetOperatorPassword(req.params.operatorId, input)
    return reply.send({ ok: true })
  })

  // PATCH /admin/operators/:operatorId/toggle
  app.patch<{ Params: { operatorId: string } }>('/operators/:operatorId/toggle', async (req, reply) => {
    const { active } = toggleStoreSchema.parse(req.body)
    return reply.send(await toggleOperator(req.params.operatorId, active))
  })
}
