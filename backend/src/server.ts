import { buildApp } from './app'
import { env } from './config/env'
import { prisma } from './config/database'
import { startCatalogSyncJob } from './jobs/catalog-sync.job'

async function main() {
  const app = await buildApp()

  try {
    await prisma.$connect()
    app.log.info('Banco de dados conectado')

    await app.listen({ port: env.PORT, host: '0.0.0.0' })
    app.log.info(`Servidor rodando na porta ${env.PORT}`)
  } catch (err) {
    app.log.error(err, 'Falha ao iniciar servidor')
    await prisma.$disconnect()
    process.exit(1)
  }

  // Inicia jobs em background — retorna função de parada para graceful shutdown
  const stopCatalogSync = startCatalogSyncJob(app.log)

  // Graceful shutdown:
  // 1. Para de aceitar novas conexões (app.close)
  // 2. Drena requests em andamento
  // 3. Para os jobs
  // 4. Fecha conexão com banco
  // Sem essa ordem, requests em andamento recebem "Connection closed" do Prisma no meio do processamento.
  const shutdown = async (signal: string) => {
    app.log.info(`Sinal ${signal} recebido — iniciando graceful shutdown`)
    try {
      await app.close()
      stopCatalogSync()
      await prisma.$disconnect()
      app.log.info('Shutdown concluído')
      process.exit(0)
    } catch (err) {
      app.log.error(err, 'Erro durante shutdown')
      process.exit(1)
    }
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT',  () => shutdown('SIGINT'))
}

main()
