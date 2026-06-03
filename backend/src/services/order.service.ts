import { CreateOrderInput, UpdateOrderStatusInput } from '../schemas/order.schema'

function generatePickupCode(): string {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const l = letters[Math.floor(Math.random() * letters.length)]
  const n = Array.from({ length: 4 }, () => Math.floor(Math.random() * 10)).join('')
  return `${l}-${n}`
}
import {
  createOrder,
  findOrderById,
  findOrdersByStore,
  getNextOrderNumber,
  updateOrderStatus,
} from '../repositories/order.repository'
import { findStoreProductById } from '../repositories/product.repository'
import { NotFoundError, AppError } from '../errors/AppError'
import { OrderStatus } from '@prisma/client'

export async function listOrders(storeId: string, filters?: { status?: OrderStatus; date?: Date }) {
  return findOrdersByStore(storeId, filters)
}

export async function getOrder(storeId: string, orderId: string) {
  const order = await findOrderById(storeId, orderId)
  if (!order) throw new NotFoundError('Pedido')
  return order
}

export async function placeOrder(storeId: string, input: CreateOrderInput) {
  // Pedido de balcão — sem itens pré-definidos
  if (input.items.length === 0) {
    const orderNumber = await getNextOrderNumber(storeId)
    const pickupCode = generatePickupCode()
    return createOrder(storeId, {
      orderNumber,
      pickupCode,
      customerPhone: input.customerPhone,
      pickupMode: input.pickupMode,
      scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
      notes: input.notes,
      priority: input.priority ?? false,
      totalAmount: 0,
      items: { create: [] },
    })
  }

  // Busca preços atuais de cada produto para snapshot no momento do pedido
  const itemsWithPrices = await Promise.all(
    input.items.map(async (item) => {
      const storeProduct = await findStoreProductById(storeId, item.productId)
      if (!storeProduct) {
        throw new AppError(`Produto ${item.productId} não disponível nesta loja`, 422)
      }
      if (!storeProduct.available) {
        throw new AppError(`Produto "${storeProduct.product.name}" está indisponível`, 422)
      }

      const unitPrice = Number(storeProduct.price)
      const totalPrice = unitPrice * item.quantity

      return {
        productId: item.productId,
        productName: storeProduct.product.name,
        cutType: item.cutType,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
      }
    }),
  )

  const totalAmount = itemsWithPrices.reduce((sum, item) => sum + item.totalPrice, 0)
  const orderNumber = await getNextOrderNumber(storeId)
  const pickupCode = generatePickupCode()

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
  })
}

export async function changeOrderStatus(
  storeId: string,
  orderId: string,
  input: UpdateOrderStatusInput,
) {
  const order = await findOrderById(storeId, orderId)
  if (!order) throw new NotFoundError('Pedido')

  await updateOrderStatus(storeId, orderId, input.status)
  return { ...order, status: input.status }
}
