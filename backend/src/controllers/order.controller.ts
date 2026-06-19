import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { createOrderSchema, updateOrderStatusSchema } from '../schemas/order.schema'
import { changeOrderStatus, getOrder, listOrders, placeOrder } from '../services/order.service'
import { getStoreId } from '../middlewares/tenant.middleware'
import { OrderStatus } from '@prisma/client'

const listOrdersQuerySchema = z.object({
  status: z.enum(['PENDING', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED']).optional(),
  date: z.string().date('date deve estar no formato YYYY-MM-DD').optional(),
  limit: z.coerce.number().int().min(1).max(500).default(100),
  offset: z.coerce.number().int().min(0).default(0),
})

export async function listOrdersHandler(
  req: FastifyRequest<{ Querystring: { status?: string; date?: string; limit?: string; offset?: string } }>,
  reply: FastifyReply,
) {
  const query = listOrdersQuerySchema.parse(req.query)
  const storeId = getStoreId(req)
  const orders = await listOrders(storeId, {
    status: query.status as OrderStatus | undefined,
    date: query.date ? new Date(query.date) : undefined,
    limit: query.limit,
    offset: query.offset,
  })
  return reply.send(orders)
}

export async function getOrderHandler(
  req: FastifyRequest<{ Params: { orderId: string } }>,
  reply: FastifyReply,
) {
  const storeId = getStoreId(req)
  const order = await getOrder(storeId, req.params.orderId)
  return reply.send(order)
}

export async function createOrderHandler(req: FastifyRequest, reply: FastifyReply) {
  const storeId = getStoreId(req)
  const input = createOrderSchema.parse(req.body)
  const order = await placeOrder(storeId, input)
  return reply.status(201).send(order)
}

export async function updateOrderStatusHandler(
  req: FastifyRequest<{ Params: { orderId: string } }>,
  reply: FastifyReply,
) {
  const storeId = getStoreId(req)
  const input = updateOrderStatusSchema.parse(req.body)
  const order = await changeOrderStatus(storeId, req.params.orderId, input)
  return reply.send(order)
}
