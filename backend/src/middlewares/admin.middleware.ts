import { FastifyReply, FastifyRequest } from 'fastify'
import { UnauthorizedError } from '../errors/AppError'
import { prisma } from '../config/database'

export async function authenticateAdmin(req: FastifyRequest, reply: FastifyReply) {
  try {
    const token = req.cookies['corte_admin_token']
    if (!token) throw new Error('no token')
    const payload = req.server.jwt.verify<{ sub: string; role: string }>(token)
    if (payload.role !== 'ADMIN') throw new Error('not admin')

    // Garante que o admin ainda existe e está ativo (revoga sessão ao desativar conta)
    const admin = await prisma.admin.findUnique({
      where: { id: payload.sub },
      select: { active: true },
    })
    if (!admin || !admin.active) throw new Error('admin inactive')

    req.user = payload
  } catch {
    const err = new UnauthorizedError('Acesso restrito ao painel administrativo')
    return reply.status(err.statusCode).send({ error: err.code, message: err.message })
  }
}
