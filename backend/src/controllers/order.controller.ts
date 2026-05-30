import { FastifyReply, FastifyRequest } from 'fastify'
import { createOrderSchema, updateOrderStatusSchema } from '../schemas/order.schema'
import { changeOrderStatus, getOrder, listOrders, placeOrder } from '../services/order.service'
import { getStoreId } from '../middlewares/tenant.middleware'
import { OrderStatus } from '@prisma/client'

export async function listOrdersHandler(
  req: FastifyRequest<{ Querystring: { status?: string; date?: string } }>,
  reply: FastifyReply,
) {
  const storeId = getStoreId(req)
  const orders = await listOrders(storeId, {
    status: req.query.status as OrderStatus | undefined,
    date: req.query.date ? new Date(req.query.date) : undefined,
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
