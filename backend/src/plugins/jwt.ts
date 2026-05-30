import fastifyJwt from '@fastify/jwt'
import { FastifyInstance } from 'fastify'
import { env } from '../config/env'

export async function jwtPlugin(app: FastifyInstance) {
  await app.register(fastifyJwt, {
    secret: env.JWT_SECRET,
    sign: { expiresIn: env.JWT_EXPIRES_IN },
  })
}
