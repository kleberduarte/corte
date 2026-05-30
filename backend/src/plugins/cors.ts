import cors from '@fastify/cors'
import { FastifyInstance } from 'fastify'
import { env } from '../config/env'

export async function corsPlugin(app: FastifyInstance) {
  const origins = env.CORS_ORIGINS.split(',').map((o) => o.trim())

  await app.register(cors, {
    origin: origins,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
}
