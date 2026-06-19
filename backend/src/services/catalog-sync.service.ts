// =============================================================================
// Catalog Sync — importação de produtos/preços (ERP / Veltrix / REST genérico)
// =============================================================================

import { PriceSource } from '@prisma/client'
import { prisma } from '../config/database'
import { findStoreIntegration } from '../repositories/store.repository'
import {
  findStoreProductByExternalCode,
  findStoreProductById,
  upsertStoreProduct,
} from '../repositories/product.repository'
import { AppError } from '../errors/AppError'
import { syncCatalogFromVeltrix } from './veltrix-catalog.service'
import { veltrixCircuitBreaker, genericRestCircuitBreaker } from '../lib/circuit-breaker'

export type CatalogPriceRecord = {
  externalProductCode: string
  productId?: string
  price: number
  available: boolean
}

export type CatalogSyncResult =
  | { source: 'VELTRIX'; imported: number; deactivated: number }
  | { source: 'GENERIC_REST'; synced: number }

export async function syncStoreCatalog(storeId: string): Promise<CatalogSyncResult> {
  const integration = await findStoreIntegration(storeId)

  if (!integration || !integration.syncEnabled) {
    throw new AppError('Integração não configurada ou desativada para esta loja', 400)
  }

  if (integration.type === 'VELTRIX') {
    const result = await veltrixCircuitBreaker.call(() =>
      syncCatalogFromVeltrix(
        storeId,
        integration.apiBaseUrl,
        integration.apiKey,
        integration.integrationMeta,
      ),
    )
    await updateLastSync(storeId, true)
    return { source: 'VELTRIX', ...result }
  }

  if (integration.type !== 'GENERIC_REST') {
    throw new AppError(`Sincronização de catálogo para ${integration.type} ainda não implementada`, 501)
  }

  const records = await genericRestCircuitBreaker.call(() =>
    fetchGenericRestCatalog(integration.apiBaseUrl, integration.apiKey),
  )

  let synced = 0
  for (const record of records) {
    const storeProduct =
      (record.productId
        ? await findStoreProductById(storeId, record.productId)
        : null) ??
      (await findStoreProductByExternalCode(storeId, record.externalProductCode))

    if (!storeProduct) continue

    await upsertStoreProduct(storeId, storeProduct.productId, {
      price: record.price,
      available: record.available,
      priceSource: PriceSource.INTEGRATION,
      externalProductCode: record.externalProductCode,
    })
    synced += 1
  }

  await updateLastSync(storeId, synced > 0)
  return { source: 'GENERIC_REST', synced }
}

async function fetchGenericRestCatalog(baseUrl: string, apiKey: string): Promise<CatalogPriceRecord[]> {
  const response = await fetch(`${baseUrl.replace(/\/$/, '')}/catalog/prices`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  })
  if (!response.ok) {
    throw new AppError(`Erro ao buscar catálogo/preços: ${response.statusText}`, 502)
  }
  return response.json() as Promise<CatalogPriceRecord[]>
}

async function updateLastSync(storeId: string, success: boolean) {
  await prisma.storeIntegration.update({
    where: { storeId },
    data: { lastSyncAt: new Date(), lastSyncOk: success },
  })
}
