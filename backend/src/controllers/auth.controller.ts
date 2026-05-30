import { FastifyReply, FastifyRequest } from 'fastify'
import { loginSchema } from '../schemas/auth.schema'
import { loginOperator } from '../services/auth.service'

export async function loginHandler(req: FastifyRequest, reply: FastifyReply) {
  const input = loginSchema.parse(req.body)
  const result = await loginOperator(req.server, input)
  return reply.status(200).send(result)
}
