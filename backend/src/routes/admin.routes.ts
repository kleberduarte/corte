import { FastifyInstance } from 'fastify'
import { authenticateAdmin } from '../middlewares/admin.middleware'
import { env } from '../config/env'

const ADMIN_COOKIE = 'corte_admin_token'
const COOKIE_OPTS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/admin',
  maxAge: 60 * 60 * 8,
}
import {
  adminLoginSchema, createStoreSchema, updateStoreSchema,
  toggleStoreSchema, createOperatorSchema, resetPasswordSchema,
} from '../schemas/admin.schema'
import { loginAdmin, getAdminMe, getAdminStats } from '../services/admin-auth.service'
import { listStores, getStore, createStore, updateStore, toggleStore, syncStoreCatalog } from '../services/store.service'
import { listOperators, createOperator, resetOperatorPassword, toggleOperator } from '../services/operator.service'

export async function adminRoutes(app: FastifyInstance) {

  // POST /admin/login — sem autenticação
  app.post('/login', {
    config: { rateLimit: { max: 10, timeWindow: '1 minute' } },
  }, async (req, reply) => {
    const input = adminLoginSchema.parse(req.body)
    const result = await loginAdmin(app, input)
    reply.setCookie(ADMIN_COOKIE, result.token, COOKIE_OPTS)
    return reply.send({ admin: result.admin })
  })

  // POST /admin/logout
  app.post('/logout', async (_req, reply) => {
    reply.clearCookie(ADMIN_COOKIE, { path: '/admin' })
    return reply.status(204).send()
  })

  // Todas as rotas abaixo exigem token admin
  const PUBLIC_ROUTES = new Set(['/login', '/logout'])
  app.addHook('onRequest', async (req, reply) => {
    if (PUBLIC_ROUTES.has((req.routeOptions as any)?.url)) return
    await authenticateAdmin(req, reply)
  })

  // GET /admin/me — valida sessão e retorna dados do admin
  app.get('/me', async (req, reply) => {
    const adminId = (req.user as { sub: string }).sub
    return reply.send(await getAdminMe(adminId))
  })

  // GET /admin/stats — métricas globais da plataforma
  app.get('/stats', async (_req, reply) => {
    return reply.send(await getAdminStats())
  })

  // ─── Lojas ──────────────────────────────────────────────────────────────────

  // GET  /admin/stores
  app.get('/stores', async (req, reply) => {
    const { chain } = req.query as { chain?: string }
    const VALID_CHAINS = ['PAO_DE_ACUCAR','EXTRA','VIOLETA','CARREFOUR','ATACADAO','ASSAI','SUPERMERCADOS_MATEUS','BIG','PREZUNIC','MUNDIAL','SONDA','CONDOR','SUPER_MUFFATO','ZAFFARI','BOURBON','COOP','HIROTA','REDE_SMART','ST_MARCHE','CORTE_SUPERMERCADO','OUTROS'] as const
    const safeChain = chain && (VALID_CHAINS as readonly string[]).includes(chain) ? chain : undefined
    return reply.send(await listStores(safeChain))
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

  // POST /admin/stores/:storeId/sync-catalog — sincroniza catálogo mestre para a loja
  app.post<{ Params: { storeId: string } }>('/stores/:storeId/sync-catalog', async (req, reply) => {
    return reply.send(await syncStoreCatalog(req.params.storeId))
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
