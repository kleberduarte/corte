import { FastifyReply, FastifyRequest } from 'fastify'
import { UnauthorizedError } from '../errors/AppError'

export type JwtPayload = {
  sub: string       // operatorId
  storeId: string   // tenant — todas as queries usam esse valor
  role: string
}

// Verifica JWT e injeta operador no request
export async function authenticate(req: FastifyRequest, reply: FastifyReply) {
  try {
    await req.jwtVerify<JwtPayload>()
  } catch {
    const err = new UnauthorizedError('Token inválido ou expirado')
    reply.status(err.statusCode).send({ error: err.code, message: err.message })
  }
}

// Acesso restrito a MANAGER
export async function requireManager(req: FastifyRequest, reply: FastifyReply) {
  const payload = req.user as JwtPayload
  if (payload.role !== 'MANAGER') {
    const err = new UnauthorizedError('Apenas gerentes podem executar esta ação')
    reply.status(err.statusCode).send({ error: err.code, message: err.message })
  }
}
