import { prisma } from '../config/database'

export async function findProductsByStore(storeId: string) {
  return prisma.storeProduct.findMany({
    where: { storeId, available: true },
    include: { product: true },
    orderBy: { product: { name: 'asc' } },
  })
}

export async function findStoreProductById(storeId: string, productId: string) {
  return prisma.storeProduct.findUnique({
    where: { storeId_productId: { storeId, productId } },
    include: { product: true },
  })
}

export async function upsertStoreProduct(
  storeId: string,
  productId: string,
  data: { price: number; available: boolean },
) {
  return prisma.storeProduct.upsert({
    where: { storeId_productId: { storeId, productId } },
    update: data,
    create: { storeId, productId, ...data },
  })
}
