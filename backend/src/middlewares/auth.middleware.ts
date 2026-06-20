import { FastifyReply, FastifyRequest } from 'fastify'
import { UnauthorizedError } from '../errors/AppError'

export type JwtPayload = {
  sub: string       // operatorId
  storeId: string   // tenant — todas as queries usam esse valor
  role: string
}

export async function authenticate(req: FastifyRequest, reply: FastifyReply) {
  try {
    const token = req.cookies['corte_token']
    if (!token) throw new Error('no token')
    req.user = req.server.jwt.verify<JwtPayload>(token)
  } catch {
    const err = new UnauthorizedError('Token inválido ou expirado')
    return reply.status(err.statusCode).send({ error: err.code, message: err.message })
  }
}

export async function requireManager(req: FastifyRequest, reply: FastifyReply) {
  const payload = req.user as JwtPayload
  if (payload.role !== 'MANAGER') {
    const err = new UnauthorizedError('Apenas gerentes podem executar esta ação')
    return reply.status(err.statusCode).send({ error: err.code, message: err.message })
  }
}
