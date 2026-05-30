import bcrypt from 'bcryptjs'
import { FastifyInstance } from 'fastify'
import { LoginInput } from '../schemas/auth.schema'
import { findOperatorByEmail, findStoreBySlug } from '../repositories/store.repository'
import { NotFoundError, UnauthorizedError } from '../errors/AppError'

export async function loginOperator(app: FastifyInstance, input: LoginInput) {
  const store = await findStoreBySlug(input.storeSlug)
  if (!store || !store.active) {
    throw new NotFoundError('Loja')
  }

  const operator = await findOperatorByEmail(store.id, input.email)
  if (!operator || !operator.active) {
    // Mensagem genérica — não revela se o e-mail existe
    throw new UnauthorizedError('Credenciais inválidas')
  }

  const passwordMatch = await bcrypt.compare(input.password, operator.passwordHash)
  if (!passwordMatch) {
    throw new UnauthorizedError('Credenciais inválidas')
  }

  const token = app.jwt.sign({
    sub: operator.id,
    storeId: store.id,
    role: operator.role,
  })

  return {
    token,
    operator: {
      id: operator.id,
      name: operator.name,
      role: operator.role,
      storeId: store.id,
      storeName: store.name,
    },
  }
}
