import { FastifyReply, FastifyRequest } from 'fastify'
import { UnauthorizedError } from '../errors/AppError'

export async function authenticateAdmin(req: FastifyRequest, reply: FastifyReply) {
  try {
    await req.jwtVerify<{ sub: string; role: string }>()
    const payload = req.user as { role: string }
    if (payload.role !== 'ADMIN') {
      throw new Error('not admin')
    }
  } catch {
    const err = new UnauthorizedError('Acesso restrito ao painel administrativo')
    reply.status(err.statusCode).send({ error: err.code, message: err.message })
  }
}
