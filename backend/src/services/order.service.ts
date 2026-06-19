import {
  createOrder,
  findOrderById,
  findOrdersByStore,
  getNextOrderNumber,
  updateOrderStatus,
} from '../repositories/order.repository'
import { findStoreProductsByIds } from '../repositories/product.repository'
import { NotFoundError, AppError } from '../errors/AppError'
import { OrderStatus } from '@prisma/client'
import { CreateOrderInput, UpdateOrderStatusInput } from '../schemas/order.schema'
import { prisma } from '../config/database'

function generatePickupCode(): string {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const l = letters[Math.floor(Math.random() * letters.length)]
  const n = Array.from({ length: 4 }, () => Math.floor(Math.random() * 10)).join('')
  return `${l}-${n}`
}

export async function listOrders(
  storeId: string,
  filters?: { status?: OrderStatus; date?: Date; limit?: number; offset?: number },
) {
  return findOrdersByStore(storeId, filters)
}

export async function getOrder(storeId: string, orderId: string) {
  const order = await findOrderById(storeId, orderId)
  if (!order) throw new NotFoundError('Pedido')
  return order
}

export async function placeOrder(storeId: string, input: CreateOrderInput) {
  // Busca de produtos fora da transação (read-only, sem necessidade de lock)
  let itemsWithPrices: {
    productId: string; productName: string; cutType: string | undefined
    quantity: number; unitPrice: number; totalPrice: number
  }[] = []

  if (input.items.length > 0) {
    const productIds = input.items.map((i) => i.productId)
    const storeProductMap = await findStoreProductsByIds(storeId, productIds)

    itemsWithPrices = input.items.map((item) => {
      const storeProduct = storeProductMap.get(item.productId)
      if (!storeProduct) {
        throw new AppError(`Produto ${item.productId} não disponível nesta loja`, 422)
      }
      if (!storeProduct.available) {
        throw new AppError(`Produto "${storeProduct.product.name}" está indisponível`, 422)
      }
      const unitPrice = Number(storeProduct.price)
      return {
        productId: item.productId,
        productName: storeProduct.product.name,
        cutType: item.cutType,
        quantity: item.quantity,
        unitPrice,
        totalPrice: unitPrice * item.quantity,
      }
    })
  }

  const totalAmount = itemsWithPrices.reduce((sum, item) => sum + item.totalPrice, 0)
  const pickupCode = generatePickupCode()

  // getNextOrderNumber + createOrder na mesma transação: FOR UPDATE é efetivo
  return prisma.$transaction(async (tx) => {
    const orderNumber = await getNextOrderNumber(storeId, tx)
    return createOrder(storeId, {
      orderNumber,
      pickupCode,
      customerPhone: input.customerPhone,
      pickupMode: input.pickupMode,
      scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
      notes: input.notes,
      priority: input.priority ?? false,
      totalAmount,
      items: { create: itemsWithPrices },
    }, tx)
  })
}

export async function changeOrderStatus(
  storeId: string,
  orderId: string,
  input: UpdateOrderStatusInput,
) {
  // Verifica existência e pertencimento ao tenant antes de atualizar
  const exists = await findOrderById(storeId, orderId)
  if (!exists) throw new NotFoundError('Pedido')

  // Retorna o registro atualizado diretamente do banco (updatedAt real)
  return updateOrderStatus(orderId, input.status)
}
