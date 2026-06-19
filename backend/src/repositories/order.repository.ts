import { OrderStatus, Prisma, PrismaClient } from '@prisma/client'
import { prisma } from '../config/database'

type Tx = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>

// REGRA DE OURO: nenhuma query neste arquivo pode omitir o filtro storeId.
// Isso garante isolamento de dados entre lojas em nível de código.
// O RLS do PostgreSQL é a segunda camada de proteção (ver prisma/rls.sql).

export async function findOrdersByStore(
  storeId: string,
  filters?: { status?: OrderStatus; date?: Date; limit?: number; offset?: number },
) {
  return prisma.order.findMany({
    where: {
      storeId,
      ...(filters?.status && { status: filters.status }),
      ...(filters?.date && (() => {
        const d = filters.date!
        const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0)
        const end   = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999)
        return { createdAt: { gte: start, lte: end } }
      })()),
    },
    include: { items: { include: { product: true } } },
    orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    take: filters?.limit ?? 100,
    skip: filters?.offset ?? 0,
  })
}

export async function findOrderById(storeId: string, orderId: string) {
  return prisma.order.findFirst({
    where: { id: orderId, storeId },
    include: { items: { include: { product: true } } },
  })
}

export async function findOrderByPickupCode(storeId: string, pickupCode: string) {
  return prisma.order.findFirst({
    where: { storeId, pickupCode: { equals: pickupCode, mode: 'insensitive' } },
    include: { items: { include: { product: true } } },
  })
}

export async function createOrder(
  storeId: string,
  data: Omit<Prisma.OrderUncheckedCreateInput, 'storeId'> & { items: { create: Prisma.OrderItemCreateManyOrderInput[] } },
  tx: Tx = prisma,
) {
  const { items, ...orderData } = data
  const created = await tx.order.create({
    data: {
      ...orderData,
      storeId,
      items: { create: items.create },
    },
    include: { items: true },
  })
  boardCache.delete(storeId)
  return created
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { status },
    include: { items: { include: { product: true } } },
  })
  boardCache.delete(updated.storeId)
  return updated
}

export type BoardOrder = { pickupCode: string; orderNumber: number }
export type BoardData = { waiting: BoardOrder[]; preparing: BoardOrder[]; ready: BoardOrder[] }

const boardCache = new Map<string, { data: BoardData; expiresAt: number }>()
const BOARD_CACHE_TTL_MS = 4_000

export async function findBoardOrders(storeId: string): Promise<BoardData> {
  const cached = boardCache.get(storeId)
  if (cached && cached.expiresAt > Date.now()) return cached.data
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
  const end   = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)

  const orders = await prisma.order.findMany({
    where: {
      storeId,
      createdAt: { gte: start, lte: end },
      status: { in: ['PENDING', 'PREPARING', 'READY'] },
    },
    select: { pickupCode: true, orderNumber: true, status: true, updatedAt: true },
    orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
  })

  const toDto = (o: typeof orders[number]): BoardOrder =>
    ({ pickupCode: o.pickupCode, orderNumber: o.orderNumber })

  const result: BoardData = {
    waiting:  orders.filter((o) => o.status === 'PENDING').slice(0, 5).map(toDto),
    preparing: orders.filter((o) => o.status === 'PREPARING').slice(0, 5).map(toDto),
    ready: orders
      .filter((o) => o.status === 'READY')
      .sort((a, b) => a.updatedAt.getTime() - b.updatedAt.getTime())
      .slice(-5)
      .map(toDto),
  }

  boardCache.set(storeId, { data: result, expiresAt: Date.now() + BOARD_CACHE_TTL_MS })
  return result
}

export async function getNextOrderNumber(storeId: string, tx: Tx): Promise<number> {
  // FOR UPDATE não pode ser combinado com agregados no PostgreSQL.
  // A CTE bloqueia todas as linhas da loja antes de calcular o MAX,
  // serializando inserções concorrentes corretamente dentro da transação.
  const result = await tx.$queryRaw<[{ next: bigint }]>`
    WITH locked AS (
      SELECT "orderNumber" FROM orders WHERE "storeId" = ${storeId} FOR UPDATE
    )
    SELECT COALESCE(MAX("orderNumber"), 0) + 1 AS next FROM locked
  `
  return Number(result[0].next)
}
