import { buildApp } from './app'
import { env } from './config/env'
import { prisma } from './config/database'

async function main() {
  const app = await buildApp()

  try {
    await prisma.$connect()
    app.log.info('Banco de dados conectado')

    await app.listen({ port: env.PORT, host: '0.0.0.0' })
    app.log.info(`Servidor rodando na porta ${env.PORT}`)
  } catch (err) {
    app.log.error(err)
    await prisma.$disconnect()
    process.exit(1)
  }
}

// Graceful shutdown — importante para o Railway encerrar corretamente
const shutdown = async () => {
  await prisma.$disconnect()
  process.exit(0)
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)

main()
