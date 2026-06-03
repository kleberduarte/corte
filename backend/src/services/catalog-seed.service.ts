import { PriceSource, PrismaClient } from '@prisma/client'
import {
  CATALOG_PRODUCTS,
  externalCodeForStore,
  productSku,
  resolveDbCategory,
} from '../data/catalog.seed'

/** Popula/atualiza catálogo global e vínculos de preço por loja. */
export async function seedCatalogForStore(prisma: PrismaClient, storeId: string) {
  for (const p of CATALOG_PRODUCTS) {
    const sku = p.sku ?? productSku(p.id)
    const product = await prisma.product.upsert({
      where: { id: p.id },
      update: {
        name: p.name,
        category: resolveDbCategory(p),
        unit: p.unit,
        description: p.description,
        imageUrl: p.imageUrl,
        badge: p.badge ?? null,
        rating: p.rating,
        reviewCount: p.reviews,
        tags: p.tags,
        cutTypes: p.cutTypes,
        sortOrder: p.sortOrder,
        sku,
        ean: p.ean ?? null,
        active: true,
      },
      create: {
        id: p.id,
        name: p.name,
        category: resolveDbCategory(p),
        unit: p.unit,
        description: p.description,
        imageUrl: p.imageUrl,
        badge: p.badge ?? null,
        rating: p.rating,
        reviewCount: p.reviews,
        tags: p.tags,
        cutTypes: p.cutTypes,
        sortOrder: p.sortOrder,
        sku,
        ean: p.ean ?? null,
      },
    })

    await prisma.storeProduct.upsert({
      where: { storeId_productId: { storeId, productId: product.id } },
      update: {
        price: p.price,
        available: true,
        externalProductCode: externalCodeForStore(p.id),
      },
      create: {
        storeId,
        productId: product.id,
        price: p.price,
        available: true,
        externalProductCode: externalCodeForStore(p.id),
        priceSource: PriceSource.MANUAL,
      },
    })
  }

  return CATALOG_PRODUCTS.length
}
