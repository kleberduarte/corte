// Job de sincronização automática de catálogo.
//
// Cada loja define seu próprio syncInterval (em minutos) na tabela StoreIntegration.
// Este job roda a cada CHECK_INTERVAL_MS e verifica quais lojas precisam ser sincronizadas
// com base no lastSyncAt da loja. Não usa cron externo — apenas um setInterval simples,
// compatível com qualquer plataforma (Railway, Render, Fly.io, EC2).
//
// Para escalar horizontalmente sem sincronizações duplicadas, use um lock distribuído
// (ex: pg_advisory_lock) ou migre para BullMQ + Redis quando tiver múltiplas réplicas.

import { prisma } from '../config/database'
import { syncStoreCatalog } from '../services/catalog-sync.service'
import type { FastifyBaseLogger } from 'fastify'

const CHECK_INTERVAL_MS = 60_000 // verifica a cada 1 minuto quais lojas estão vencidas

export function startCatalogSyncJob(log: FastifyBaseLogger): () => void {
  log.info('[catalog-sync-job] Iniciado')

  const timer = setInterval(async () => {
    try {
      await runSyncPass(log)
    } catch (err) {
      log.error({ err }, '[catalog-sync-job] Erro inesperado no ciclo de sync')
    }
  }, CHECK_INTERVAL_MS)

  // Retorna função de parada para graceful shutdown
  return () => {
    clearInterval(timer)
    log.info('[catalog-sync-job] Encerrado')
  }
}

async function runSyncPass(log: FastifyBaseLogger) {
  const integrations = await prisma.storeIntegration.findMany({
    where: { syncEnabled: true },
    select: { storeId: true, syncInterval: true, lastSyncAt: true },
  })

  const now = Date.now()

  for (const integration of integrations) {
    const intervalMs = integration.syncInterval * 60_000
    const lastSync   = integration.lastSyncAt?.getTime() ?? 0
    const isOverdue  = now - lastSync >= intervalMs

    if (!isOverdue) continue

    try {
      const result = await syncStoreCatalog(integration.storeId)
      log.info({ storeId: integration.storeId, result }, '[catalog-sync-job] Sync concluído')
    } catch (err) {
      // Não relança — falha de uma loja não deve parar o loop das outras
      log.warn({ storeId: integration.storeId, err }, '[catalog-sync-job] Sync falhou')
    }
  }
}
