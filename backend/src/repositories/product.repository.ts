import { PriceSource, Prisma } from '@prisma/client'
import { prisma } from '../config/database'

export async function findProductsByStore(storeId: string) {
  return findCatalogByStore(storeId)
}

/** Catálogo ativo da loja — ordenado para vitrine do totem. */
export async function findCatalogByStore(storeId: string) {
  return prisma.storeProduct.findMany({
    where: { storeId, available: true, product: { active: true } },
    include: { product: true },
    orderBy: [{ product: { sortOrder: 'asc' } }, { product: { name: 'asc' } }],
  })
}

export async function findStoreProductById(storeId: string, productId: string) {
  return prisma.storeProduct.findUnique({
    where: { storeId_productId: { storeId, productId } },
    include: { product: true },
  })
}

export async function findStoreProductByExternalCode(storeId: string, externalProductCode: string) {
  return prisma.storeProduct.findUnique({
    where: { storeId_externalProductCode: { storeId, externalProductCode } },
    include: { product: true },
  })
}

type UpsertStoreProductData = {
  price: number
  available: boolean
  externalProductCode?: string
  priceSource?: PriceSource
}

export async function upsertStoreProduct(
  storeId: string,
  productId: string,
  data: UpsertStoreProductData,
) {
  const update: Prisma.StoreProductUpdateInput = {
    price: data.price,
    available: data.available,
  }
  if (data.externalProductCode !== undefined) update.externalProductCode = data.externalProductCode
  if (data.priceSource !== undefined) update.priceSource = data.priceSource

  return prisma.storeProduct.upsert({
    where: { storeId_productId: { storeId, productId } },
    update,
    create: {
      storeId,
      productId,
      price: data.price,
      available: data.available,
      externalProductCode: data.externalProductCode,
      priceSource: data.priceSource ?? PriceSource.MANUAL,
    },
  })
}
