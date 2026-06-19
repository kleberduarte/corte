import { prisma } from '../config/database'
import { CreateStoreInput, UpdateStoreInput } from '../schemas/admin.schema'
import { NotFoundError, ConflictError } from '../errors/AppError'
import { seedCatalogForStore } from './catalog-seed.service'

export async function listStores(chain?: string) {
  return prisma.store.findMany({
    where: chain ? { chain: chain as any } : undefined,
    include: { config: true, _count: { select: { operators: true, orders: true } } },
    orderBy: [{ chain: 'asc' }, { name: 'asc' }],
  })
}

export async function getStore(storeId: string) {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    include: {
      config: true,
      operators: { select: { id: true, name: true, email: true, role: true, active: true } },
    },
  })
  if (!store) throw new NotFoundError('Loja')
  return store
}

export async function createStore(input: CreateStoreInput) {
  const exists = await prisma.store.findUnique({ where: { slug: input.slug } })
  if (exists) throw new ConflictError(`Slug "${input.slug}" já está em uso`)

  const store = await prisma.store.create({
    data: {
      id:       input.slug,
      name:     input.name,
      chain:    input.chain,
      slug:     input.slug,
      timezone: input.timezone,
      config: { create: input.config },
    },
    include: { config: true },
  })

  await seedCatalogForStore(prisma, store.id)
  return store
}

export async function updateStore(storeId: string, input: UpdateStoreInput) {
  const store = await prisma.store.findUnique({ where: { id: storeId } })
  if (!store) throw new NotFoundError('Loja')

  const { config, ...storeData } = input
  return prisma.store.update({
    where: { id: storeId },
    data: { ...storeData, ...(config && { config: { update: config } }) },
    include: { config: true },
  })
}

export async function toggleStore(storeId: string, active: boolean) {
  const store = await prisma.store.findUnique({ where: { id: storeId } })
  if (!store) throw new NotFoundError('Loja')
  return prisma.store.update({ where: { id: storeId }, data: { active } })
}

export async function syncStoreCatalog(storeId: string) {
  const store = await prisma.store.findUnique({ where: { id: storeId } })
  if (!store) throw new NotFoundError('Loja')
  const count = await seedCatalogForStore(prisma, storeId)
  return { count }
}
