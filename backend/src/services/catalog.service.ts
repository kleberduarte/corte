import { Prisma } from '@prisma/client'
import { CATALOG_NAV_CATEGORIES, categoryDbToSlug } from '../lib/category-map'
import { findCatalogByStore } from '../repositories/product.repository'

export type CutTypeDto = { id: string; name: string; desc: string }

export type TotemProductDto = {
  id: string
  name: string
  category: string
  description: string
  pricePerKg: number
  imageUrl: string | null
  badge?: string
  rating: number
  reviews: number
  cutTypes: CutTypeDto[]
  tags: string[]
  available: boolean
  unit: string
  sku: string | null
  ean: string | null
  externalProductCode: string | null
  priceSource: string
}

export type TotemCatalogDto = {
  storeId: string
  products: TotemProductDto[]
  categories: typeof CATALOG_NAV_CATEGORIES
  integrationReady: boolean
}

function parseCutTypes(raw: Prisma.JsonValue): CutTypeDto[] {
  if (!Array.isArray(raw)) return []
  return raw.filter((x): x is CutTypeDto =>
    typeof x === 'object' && x !== null && 'id' in x && 'name' in x && 'desc' in x,
  )
}

function parseTags(raw: Prisma.JsonValue): string[] {
  if (!Array.isArray(raw)) return []
  return raw.filter((t): t is string => typeof t === 'string')
}

export async function getTotemCatalog(storeId: string, storeSlug: string): Promise<TotemCatalogDto> {
  const rows = await findCatalogByStore(storeId)

  const products: TotemProductDto[] = rows.map((row) => ({
    id: row.product.id,
    name: row.product.name,
    category: categoryDbToSlug(row.product.category),
    description: row.product.description ?? '',
    pricePerKg: Number(row.price),
    imageUrl: row.product.imageUrl,
    badge: row.product.badge ?? undefined,
    rating: row.product.rating ? Number(row.product.rating) : 0,
    reviews: row.product.reviewCount,
    cutTypes: parseCutTypes(row.product.cutTypes),
    tags: parseTags(row.product.tags),
    available: row.available,
    unit: row.product.unit,
    sku: row.product.sku,
    ean: row.product.ean,
    externalProductCode: row.externalProductCode,
    priceSource: row.priceSource,
  }))

  return {
    storeId: storeSlug,
    products,
    categories: CATALOG_NAV_CATEGORIES,
    integrationReady: true,
  }
}
