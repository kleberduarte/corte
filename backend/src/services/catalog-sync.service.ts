// =============================================================================
// Catalog Sync — importação de produtos/preços (ERP / Veltrix / REST genérico)
// =============================================================================

import { PriceSource } from '@prisma/client'
import { findStoreIntegration } from '../repositories/store.repository'
import {
  findStoreProductByExternalCode,
  findStoreProductById,
  upsertStoreProduct,
} from '../repositories/product.repository'
import { AppError } from '../errors/AppError'
import { syncCatalogFromVeltrix } from './veltrix-catalog.service'
import {
  resolveVeltrixCredentials,
  veltrixFetchProducts,
  veltrixLogin,
} from '../integrations/veltrix.client'
import { veltrixExternalCode } from '../integrations/veltrix-category'

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
    const result = await syncCatalogFromVeltrix(
      storeId,
      integration.apiBaseUrl,
      integration.apiKey,
      integration.integrationMeta,
    )
    await updateLastSync(storeId, true)
    return { source: 'VELTRIX', ...result }
  }

  const records = await fetchCatalogPricesFromProvider(
    integration.type,
    integration.apiBaseUrl,
    integration.apiKey,
    integration.integrationMeta,
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

/** @deprecated Use syncStoreCatalog — mantido para rota /sync-catalog */
export async function syncStoreCatalogPrices(storeId: string) {
  return syncStoreCatalog(storeId)
}

async function fetchCatalogPricesFromProvider(
  type: string,
  baseUrl: string,
  apiKey: string,
  integrationMeta: unknown,
): Promise<CatalogPriceRecord[]> {
  switch (type) {
    case 'VELTRIX': {
      const { baseUrl: url, email, password } = resolveVeltrixCredentials(baseUrl, apiKey, integrationMeta)
      const token = await veltrixLogin(url, email, password)
      const products = await veltrixFetchProducts(url, token)
      return products
        .filter((p) => p.active !== false)
        .map((p) => ({
          externalProductCode: veltrixExternalCode(p.id),
          productId: `veltrix-${p.id}`,
          price: Number(p.precoEfetivo ?? p.price),
          available: (p.stock ?? 0) > 0,
        }))
    }
    case 'GENERIC_REST': {
      const response = await fetch(`${baseUrl.replace(/\/$/, '')}/catalog/prices`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      })
      if (!response.ok) {
        throw new AppError(`Erro ao buscar catálogo/preços: ${response.statusText}`, 502)
      }
      return response.json() as Promise<CatalogPriceRecord[]>
    }
    case 'LINX':
    case 'TOTVS':
    case 'SAP':
      throw new AppError(`Sincronização de catálogo para ${type} ainda não implementada`, 501)
    case 'MANUAL':
      return []
    default:
      throw new AppError(`Tipo de integração desconhecido: ${type}`, 400)
  }
}

async function updateLastSync(storeId: string, success: boolean) {
  const { prisma } = await import('../config/database')
  await prisma.storeIntegration.update({
    where: { storeId },
    data: { lastSyncAt: new Date(), lastSyncOk: success },
  })
}
