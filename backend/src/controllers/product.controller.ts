import { FastifyReply, FastifyRequest } from 'fastify'
import { getStoreId } from '../middlewares/tenant.middleware'
import { upsertStoreProduct } from '../repositories/product.repository'
import { upsertStoreProductSchema } from '../schemas/product.schema'
import { getTotemCatalog } from '../services/catalog.service'
import { syncStoreCatalog } from '../services/catalog-sync.service'
import { syncStorePrices } from '../services/pricing.service'

export async function listProductsHandler(req: FastifyRequest, reply: FastifyReply) {
  const storeId = getStoreId(req)
  const storeSlug = (req as FastifyRequest & { storeSlug?: string }).storeSlug ?? storeId
  const catalog = await getTotemCatalog(storeId, storeSlug)
  return reply.send(catalog)
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

export async function syncCatalogHandler(req: FastifyRequest, reply: FastifyReply) {
  const storeId = getStoreId(req)
  const result = await syncStoreCatalog(storeId)
  return reply.send(result)
}
