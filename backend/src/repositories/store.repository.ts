import { prisma } from '../config/database'

export async function findStoreBySlug(slug: string) {
  return prisma.store.findUnique({
    where: { slug },
    include: { config: true },
  })
}

export async function findOperatorByEmail(storeId: string, email: string) {
  return prisma.operator.findUnique({
    where: { storeId_email: { storeId, email } },
  })
}

export async function findStoreIntegration(storeId: string) {
  return prisma.storeIntegration.findUnique({ where: { storeId } })
}
