import { FastifyInstance } from 'fastify'
import { prisma } from '../config/database'

// Dois endpoints diferentes com propósitos distintos:
//
// /health  → liveness probe: o processo está vivo?
//            Responde sempre. Railway reinicia se isso falhar.
//
// /ready   → readiness probe: o serviço está pronto para receber tráfego?
//            Testa a conexão com o banco. Railway para de enviar requests se isso falhar.
//            Use este endpoint no load balancer / health check da plataforma.

export async function healthRoutes(app: FastifyInstance) {
  app.get('/health', { logLevel: 'silent' }, async (_req, reply) => {
    return reply.send({ status: 'ok', timestamp: new Date().toISOString() })
  })

  app.get('/ready', { logLevel: 'silent' }, async (_req, reply) => {
    try {
      await prisma.$queryRaw`SELECT 1`
      return reply.send({
        status: 'ready',
        timestamp: new Date().toISOString(),
        checks: { database: 'ok' },
      })
    } catch (err) {
      app.log.error({ err }, 'Readiness check falhou')
      return reply.status(503).send({
        status: 'unavailable',
        timestamp: new Date().toISOString(),
        checks: { database: 'error' },
      })
    }
  })
}
