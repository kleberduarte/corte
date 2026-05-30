import { OrderStatus, Prisma } from '@prisma/client'
import { prisma } from '../config/database'

// REGRA DE OURO: nenhuma query neste arquivo pode omitir o filtro storeId.
// Isso garante isolamento de dados entre lojas em nível de código.
// O RLS do PostgreSQL é a segunda camada de proteção (ver prisma/rls.sql).

export async function findOrdersByStore(
  storeId: string,
  filters?: { status?: OrderStatus; date?: Date },
) {
  return prisma.order.findMany({
    where: {
      storeId,
      ...(filters?.status && { status: filters.status }),
      ...(filters?.date && {
        scheduledAt: {
          gte: new Date(filters.date.setHours(0, 0, 0, 0)),
          lte: new Date(filters.date.setHours(23, 59, 59, 999)),
        },
      }),
    },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' },
  })
}

export async function findOrderById(storeId: string, orderId: string) {
  return prisma.order.findFirst({
    where: { id: orderId, storeId },
    include: { items: { include: { product: true } } },
  })
}

export async function createOrder(
  storeId: string,
  data: Omit<Prisma.OrderUncheckedCreateInput, 'storeId'> & { items: { create: Prisma.OrderItemCreateManyOrderInput[] } },
) {
  const { items, ...orderData } = data
  return prisma.order.create({
    data: {
      ...orderData,
      storeId,
      items: { create: items.create },
    },
    include: { items: true },
  })
}

export async function updateOrderStatus(storeId: string, orderId: string, status: OrderStatus) {
  return prisma.order.updateMany({
    where: { id: orderId, storeId },
    data: { status },
  })
}

export async function getNextOrderNumber(storeId: string): Promise<number> {
  const last = await prisma.order.findFirst({
    where: { storeId },
    orderBy: { orderNumber: 'desc' },
    select: { orderNumber: true },
  })
  return (last?.orderNumber ?? 0) + 1
}
