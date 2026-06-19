import bcrypt from 'bcryptjs'
import { prisma } from '../config/database'
import { env } from '../config/env'
import { CreateOperatorInput, ResetPasswordInput } from '../schemas/admin.schema'
import { NotFoundError, ConflictError } from '../errors/AppError'

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
