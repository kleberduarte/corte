// =============================================================================
// Pricing Service — Sincronização de Preços por Loja
//
// Cada rede de supermercado (Linx, TOTVS, SAP, etc.) tem sua própria API.
// Este serviço abstrai essas diferenças: o caller sempre chama syncStorePrices()
// e o serviço decide como buscar os dados com base em StoreIntegration.type.
//
// Para adicionar uma nova integração:
//   1. Adicionar o tipo em IntegrationType no schema.prisma
//   2. Criar um adapter em src/services/pricing-adapters/<nome>.ts
//   3. Registrar o adapter no switch abaixo
// =============================================================================

import { findStoreIntegration } from '../repositories/store.repository'
import { upsertStoreProduct } from '../repositories/product.repository'
import { AppError } from '../errors/AppError'

type PriceRecord = {
  externalProductCode: string
  productId: string   // ID interno do produto na tabela products
  price: number
  available: boolean
}

export async function syncStorePrices(storeId: string): Promise<{ synced: number }> {
  const integration = await findStoreIntegration(storeId)

  if (!integration || !integration.syncEnabled) {
    throw new AppError('Integração de preços não configurada ou desativada para esta loja', 400)
  }

  const records = await fetchPricesFromProvider(
    integration.type,
    integration.apiBaseUrl,
    integration.apiKey,
  )

  for (const record of records) {
    await upsertStoreProduct(storeId, record.productId, {
      price: record.price,
      available: record.available,
    })
  }

  await updateLastSync(storeId, true)

  return { synced: records.length }
}

// ---------------------------------------------------------------------------
// Adapters por tipo de integração
// ---------------------------------------------------------------------------

async function fetchPricesFromProvider(
  type: string,
  baseUrl: string,
  apiKey: string,
): Promise<PriceRecord[]> {
  switch (type) {
    case 'GENERIC_REST':
      return fetchGenericRest(baseUrl, apiKey)

    case 'LINX':
    case 'TOTVS':
    case 'SAP':
      // TODO: implementar adapters específicos quando a documentação das APIs for fornecida
      throw new AppError(`Adapter para ${type} ainda não implementado`, 501)

    case 'MANUAL':
      // Preços manuais — não há sincronização automática
      return []

    default:
      throw new AppError(`Tipo de integração desconhecido: ${type}`, 400)
  }
}

async function fetchGenericRest(baseUrl: string, apiKey: string): Promise<PriceRecord[]> {
  const response = await fetch(`${baseUrl}/prices`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  })

  if (!response.ok) {
    throw new AppError(`Erro ao buscar preços: ${response.statusText}`, 502)
  }

  return response.json() as Promise<PriceRecord[]>
}

async function updateLastSync(storeId: string, success: boolean) {
  const { prisma } = await import('../config/database')
  await prisma.storeIntegration.update({
    where: { storeId },
    data: { lastSyncAt: new Date(), lastSyncOk: success },
  })
}
