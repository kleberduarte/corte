import { FastifyReply, FastifyRequest } from 'fastify'
import { JwtPayload } from './auth.middleware'
import { ForbiddenError } from '../errors/AppError'

// Garante que o operador só acessa dados da sua própria loja.
// Use em todas as rotas que recebem :storeId na URL.
export async function enforceTenant(req: FastifyRequest<{ Params: { storeId?: string } }>, reply: FastifyReply) {
  const payload = req.user as JwtPayload
  const storeIdFromUrl = req.params.storeId

  if (storeIdFromUrl && storeIdFromUrl !== payload.storeId) {
    const err = new ForbiddenError('Acesso negado: loja não pertence ao seu token')
    reply.status(err.statusCode).send({ error: err.code, message: err.message })
  }
}

// Helper para extrair storeId do token de forma segura em controllers/services
export function getStoreId(req: FastifyRequest): string {
  return (req.user as JwtPayload).storeId
}

export function getOperatorId(req: FastifyRequest): string {
  return (req.user as JwtPayload).sub
}
