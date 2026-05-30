import bcrypt from 'bcryptjs'
import { FastifyInstance } from 'fastify'
import { prisma } from '../config/database'
import { env } from '../config/env'
import { AdminLoginInput, CreateStoreInput, UpdateStoreInput, CreateOperatorInput, ResetPasswordInput } from '../schemas/admin.schema'
import { NotFoundError, UnauthorizedError, ConflictError } from '../errors/AppError'

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function loginAdmin(app: FastifyInstance, input: AdminLoginInput) {
  const admin = await prisma.admin.findUnique({ where: { email: input.email } })
  if (!admin || !admin.active) throw new UnauthorizedError('Credenciais inválidas')

  const ok = await bcrypt.compare(input.password, admin.passwordHash)
  if (!ok) throw new UnauthorizedError('Credenciais inválidas')

  const token = app.jwt.sign({ sub: admin.id, role: 'ADMIN' })
  return { token, admin: { id: admin.id, name: admin.name, email: admin.email } }
}

// ─── Lojas ────────────────────────────────────────────────────────────────────

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
    include: { config: true, operators: { select: { id: true, name: true, email: true, role: true, active: true } } },
  })
  if (!store) throw new NotFoundError('Loja')
  return store
}

export async function createStore(input: CreateStoreInput) {
  const exists = await prisma.store.findUnique({ where: { slug: input.slug } })
  if (exists) throw new ConflictError(`Slug "${input.slug}" já está em uso`)

  return prisma.store.create({
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
}

export async function updateStore(storeId: string, input: UpdateStoreInput) {
  const store = await prisma.store.findUnique({ where: { id: storeId } })
  if (!store) throw new NotFoundError('Loja')

  const { config, ...storeData } = input

  return prisma.store.update({
    where: { id: storeId },
    data: {
      ...storeData,
      ...(config && { config: { update: config } }),
    },
    include: { config: true },
  })
}

export async function toggleStore(storeId: string, active: boolean) {
  const store = await prisma.store.findUnique({ where: { id: storeId } })
  if (!store) throw new NotFoundError('Loja')
  return prisma.store.update({ where: { id: storeId }, data: { active } })
}

// ─── Operadores ───────────────────────────────────────────────────────────────

export async function listOperators(storeId: string) {
  const store = await prisma.store.findUnique({ where: { id: storeId } })
  if (!store) throw new NotFoundError('Loja')
  return prisma.operator.findMany({
    where: { storeId },
    select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
    orderBy: { name: 'asc' },
  })
}

export async function createOperator(input: CreateOperatorInput) {
  const store = await prisma.store.findUnique({ where: { id: input.storeId } })
  if (!store) throw new NotFoundError('Loja')

  const exists = await prisma.operator.findUnique({
    where: { storeId_email: { storeId: input.storeId, email: input.email } },
  })
  if (exists) throw new ConflictError('E-mail já cadastrado nesta loja')

  const passwordHash = await bcrypt.hash(input.password, env.BCRYPT_ROUNDS)
  return prisma.operator.create({
    data: { storeId: input.storeId, name: input.name, email: input.email, passwordHash, role: input.role },
    select: { id: true, name: true, email: true, role: true, active: true },
  })
}

export async function resetOperatorPassword(operatorId: string, input: ResetPasswordInput) {
  const op = await prisma.operator.findUnique({ where: { id: operatorId } })
  if (!op) throw new NotFoundError('Operador')
  const passwordHash = await bcrypt.hash(input.password, env.BCRYPT_ROUNDS)
  return prisma.operator.update({ where: { id: operatorId }, data: { passwordHash } })
}

export async function toggleOperator(operatorId: string, active: boolean) {
  const op = await prisma.operator.findUnique({ where: { id: operatorId } })
  if (!op) throw new NotFoundError('Operador')
  return prisma.operator.update({ where: { id: operatorId }, data: { active } })
}
