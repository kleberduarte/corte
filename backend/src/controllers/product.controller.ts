import { FastifyReply, FastifyRequest } from 'fastify'
import { getStoreId } from '../middlewares/tenant.middleware'
import { findProductsByStore, upsertStoreProduct } from '../repositories/product.repository'
import { upsertStoreProductSchema } from '../schemas/product.schema'
import { syncStorePrices } from '../services/pricing.service'

export async function listProductsHandler(req: FastifyRequest, reply: FastifyReply) {
  const storeId = getStoreId(req)
  const products = await findProductsByStore(storeId)
  return reply.send(products)
}

export async function upsertProductPriceHandler(
  req: FastifyRequest<{ Params: { productId: string } }>,
  reply: FastifyReply,
) {
  const storeId = getStoreId(req)
  const input = upsertStoreProductSchema.parse(req.body)
  const product = await upsertStoreProduct(storeId, req.params.productId, input)
  return reply.send(product)
}

export async function syncPricesHandler(req: FastifyRequest, reply: FastifyReply) {
  const storeId = getStoreId(req)
  const result = await syncStorePrices(storeId)
  return reply.send(result)
}
