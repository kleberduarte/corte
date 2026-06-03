import { PriceSource } from '@prisma/client'
import { prisma } from '../config/database'
import {
  absolutizeVeltrixImageUrl,
  resolveVeltrixCredentials,
  veltrixFetchProducts,
  veltrixLogin,
} from '../integrations/veltrix.client'
import type { VeltrixProduct } from '../integrations/veltrix.types'
import {
  defaultCutTypesForCategory,
  mapVeltrixCategory,
  mapVeltrixUnit,
  veltrixExternalCode,
  veltrixProductId,
} from '../integrations/veltrix-category'
import { upsertStoreProduct } from '../repositories/product.repository'
import { AppError } from '../errors/AppError'

function toNumber(value: number | string | null | undefined, fallback = 0): number {
  if (value == null) return fallback
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : fallback
}

function effectivePrice(p: VeltrixProduct): number {
  if (p.precoEfetivo != null) return toNumber(p.precoEfetivo)
  if (p.emPromocao && p.precoPromocional != null) return toNumber(p.precoPromocional)
  return toNumber(p.price)
}

function buildSku(p: VeltrixProduct): string {
  const code = p.codigoProduto?.trim()
  if (code) return code
  return `VELTRIX-${p.id}`
}

/**
 * Importa catálogo completo do Veltrix para a loja CORTE.
 * Conta de serviço no Veltrix: preferir role TOTEM ou VENDEDOR (GET /products liberado).
 */
export async function syncCatalogFromVeltrix(
  storeId: string,
  apiBaseUrl: string,
  apiKey: string,
  integrationMeta: unknown,
): Promise<{ imported: number; deactivated: number }> {
  const { baseUrl, email, password } = resolveVeltrixCredentials(apiBaseUrl, apiKey, integrationMeta)
  const token = await veltrixLogin(baseUrl, email, password)
  const remote = await veltrixFetchProducts(baseUrl, token)

  const seenIds = new Set<string>()

  for (const p of remote) {
    if (p.active === false) continue

    const productId = veltrixProductId(p.id)
    seenIds.add(productId)
    const category = mapVeltrixCategory(p.categoria)
    const price = effectivePrice(p)
    const available = (p.stock ?? 0) > 0

    await prisma.product.upsert({
      where: { id: productId },
      update: {
        name: p.name,
        category,
        unit: mapVeltrixUnit(p.tipo),
        description: p.descricao?.trim() || p.name,
        imageUrl: absolutizeVeltrixImageUrl(baseUrl, p.imagemUrl),
        sku: buildSku(p),
        ean: p.gtinEan?.trim() || null,
        active: true,
        cutTypes: defaultCutTypesForCategory(category),
        tags: p.categoria ? [p.categoria] : [],
      },
      create: {
        id: productId,
        name: p.name,
        category,
        unit: mapVeltrixUnit(p.tipo),
        description: p.descricao?.trim() || p.name,
        imageUrl: absolutizeVeltrixImageUrl(baseUrl, p.imagemUrl),
        sku: buildSku(p),
        ean: p.gtinEan?.trim() || null,
        active: true,
        cutTypes: defaultCutTypesForCategory(category),
        tags: p.categoria ? [p.categoria] : [],
        reviewCount: 0,
      },
    })

    await upsertStoreProduct(storeId, productId, {
      price,
      available,
      externalProductCode: veltrixExternalCode(p.id),
      priceSource: PriceSource.INTEGRATION,
    })
  }

  const deactivated = await prisma.product.updateMany({
    where: {
      id: { startsWith: 'veltrix-', notIn: [...seenIds] },
      storeProducts: { some: { storeId } },
    },
    data: { active: false },
  })

  if (remote.length === 0) {
    throw new AppError('Veltrix retornou zero produtos ativos para esta empresa', 404)
  }

  return { imported: seenIds.size, deactivated: deactivated.count }
}
