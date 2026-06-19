import bcrypt from 'bcryptjs'
import { FastifyInstance } from 'fastify'
import { prisma } from '../config/database'
import { AdminLoginInput } from '../schemas/admin.schema'
import { NotFoundError, UnauthorizedError } from '../errors/AppError'

export async function loginAdmin(app: FastifyInstance, input: AdminLoginInput) {
  const email = input.email.trim().toLowerCase()
  const admin = await prisma.admin.findUnique({ where: { email } })
  if (!admin || !admin.active) throw new UnauthorizedError('Credenciais inválidas')

  const ok = await bcrypt.compare(input.password, admin.passwordHash)
  if (!ok) throw new UnauthorizedError('Credenciais inválidas')

  const token = app.jwt.sign({ sub: admin.id, role: 'ADMIN' })
  return { token, admin: { id: admin.id, name: admin.name, email: admin.email } }
}

export async function getAdminMe(adminId: string) {
  const admin = await prisma.admin.findUnique({
    where: { id: adminId },
    select: { id: true, name: true, email: true, active: true },
  })
  if (!admin || !admin.active) throw new UnauthorizedError('Sessão inválida')
  return { id: admin.id, name: admin.name, email: admin.email }
}

export async function getAdminStats() {
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
  const startOfWeek = new Date(startOfDay)
  startOfWeek.setDate(startOfWeek.getDate() - 6)

  const [
    storesTotal, storesActive,
    operatorsTotal, operatorsActive,
    ordersTotal, ordersToday, ordersWeek,
    ordersByStatus, recentOrders, storesByChain,
  ] = await Promise.all([
    prisma.store.count(),
    prisma.store.count({ where: { active: true } }),
    prisma.operator.count(),
    prisma.operator.count({ where: { active: true } }),
    prisma.order.count(),
    prisma.order.count({ where: { createdAt: { gte: startOfDay } } }),
    prisma.order.count({ where: { createdAt: { gte: startOfWeek } } }),
    prisma.order.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, orderNumber: true, pickupCode: true, status: true,
        totalAmount: true, createdAt: true,
        store: { select: { name: true, slug: true } },
      },
    }),
    prisma.store.groupBy({ by: ['chain'], _count: { _all: true }, where: { active: true } }),
  ])

  return {
    stores: { total: storesTotal, active: storesActive, inactive: storesTotal - storesActive },
    operators: { total: operatorsTotal, active: operatorsActive, inactive: operatorsTotal - operatorsActive },
    orders: { total: ordersTotal, today: ordersToday, last7Days: ordersWeek },
    ordersByStatus: ordersByStatus.map((r) => ({ status: r.status, count: r._count._all })),
    storesByChain: storesByChain.map((r) => ({ chain: r.chain, count: r._count._all })),
    recentOrders: recentOrders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      pickupCode: o.pickupCode,
      status: o.status,
      totalAmount: Number(o.totalAmount),
      createdAt: o.createdAt.toISOString(),
      storeName: o.store.name,
      storeSlug: o.store.slug,
    })),
  }
}
