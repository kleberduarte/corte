import { FastifyInstance } from 'fastify'
import { authenticateAdmin } from '../middlewares/admin.middleware'
import { env } from '../config/env'
import {
  adminLoginSchema, createStoreSchema, updateStoreSchema,
  toggleStoreSchema, createOperatorSchema, resetPasswordSchema,
} from '../schemas/admin.schema'
import { loginAdmin, getAdminMe, getAdminStats } from '../services/admin-auth.service'
import { listStores, getStore, createStore, updateStore, toggleStore, syncStoreCatalog } from '../services/store.service'
import { listOperators, createOperator, resetOperatorPassword, toggleOperator } from '../services/operator.service'

const ADMIN_COOKIE = 'corte_admin_token'
const COOKIE_OPTS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  // Mesma regra do login de operador: cross-site em produção (Vercel + Railway).
  sameSite: (env.NODE_ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax',
  path: '/admin',
  maxAge: 60 * 60 * 8,
}

export async function adminRoutes(app: FastifyInstance) {
  // Rotas públicas — fora do escopo autenticado
  app.post('/login', {
    config: { rateLimit: { max: 10, timeWindow: '1 minute' } },
  }, async (req, reply) => {
    const input = adminLoginSchema.parse(req.body)
    const result = await loginAdmin(app, input)
    reply.setCookie(ADMIN_COOKIE, result.token, COOKIE_OPTS)
    return reply.send({ admin: result.admin })
  })

  app.post('/logout', async (_req, reply) => {
    reply.clearCookie(ADMIN_COOKIE, COOKIE_OPTS)
    return reply.status(204).send()
  })

  // Rotas protegidas — hook de auth só neste sub-plugin (evita bloquear /login no onRequest)
  await app.register(async (protectedApp) => {
    protectedApp.addHook('onRequest', authenticateAdmin)

    protectedApp.get('/me', async (req, reply) => {
      const adminId = (req.user as { sub: string }).sub
      return reply.send(await getAdminMe(adminId))
    })

    protectedApp.get('/stats', async (_req, reply) => {
      return reply.send(await getAdminStats())
    })

    // ─── Lojas ────────────────────────────────────────────────────────────────

    protectedApp.get('/stores', async (req, reply) => {
      const { chain } = req.query as { chain?: string }
      const VALID_CHAINS = ['PAO_DE_ACUCAR','EXTRA','VIOLETA','CARREFOUR','ATACADAO','ASSAI','SUPERMERCADOS_MATEUS','BIG','PREZUNIC','MUNDIAL','SONDA','CONDOR','SUPER_MUFFATO','ZAFFARI','BOURBON','COOP','HIROTA','REDE_SMART','ST_MARCHE','CORTE_SUPERMERCADO','OUTROS'] as const
      const safeChain = chain && (VALID_CHAINS as readonly string[]).includes(chain) ? chain : undefined
      return reply.send(await listStores(safeChain))
    })

    protectedApp.get<{ Params: { storeId: string } }>('/stores/:storeId', async (req, reply) => {
      return reply.send(await getStore(req.params.storeId))
    })

    protectedApp.post('/stores', async (req, reply) => {
      const input = createStoreSchema.parse(req.body)
      return reply.status(201).send(await createStore(input))
    })

    protectedApp.put<{ Params: { storeId: string } }>('/stores/:storeId', async (req, reply) => {
      const input = updateStoreSchema.parse(req.body)
      return reply.send(await updateStore(req.params.storeId, input))
    })

    protectedApp.patch<{ Params: { storeId: string } }>('/stores/:storeId/toggle', async (req, reply) => {
      const { active } = toggleStoreSchema.parse(req.body)
      return reply.send(await toggleStore(req.params.storeId, active))
    })

    protectedApp.post<{ Params: { storeId: string } }>('/stores/:storeId/sync-catalog', async (req, reply) => {
      return reply.send(await syncStoreCatalog(req.params.storeId))
    })

    // ─── Operadores ───────────────────────────────────────────────────────────

    protectedApp.get<{ Params: { storeId: string } }>('/stores/:storeId/operators', async (req, reply) => {
      return reply.send(await listOperators(req.params.storeId))
    })

    protectedApp.post('/operators', async (req, reply) => {
      const input = createOperatorSchema.parse(req.body)
      return reply.status(201).send(await createOperator(input))
    })

    protectedApp.patch<{ Params: { operatorId: string } }>('/operators/:operatorId/password', async (req, reply) => {
      const input = resetPasswordSchema.parse(req.body)
      await resetOperatorPassword(req.params.operatorId, input)
      return reply.send({ ok: true })
    })

    protectedApp.patch<{ Params: { operatorId: string } }>('/operators/:operatorId/toggle', async (req, reply) => {
      const { active } = toggleStoreSchema.parse(req.body)
      return reply.send(await toggleOperator(req.params.operatorId, active))
    })
  })
}
