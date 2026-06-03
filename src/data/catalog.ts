import { createContext, useContext } from 'react'
import type { CutType, Product, ProductCategory } from './products'
import { PRODUCTS as FALLBACK_PRODUCTS, CATEGORIES as FALLBACK_CATEGORIES } from './products'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3333'

export type CatalogCategory = {
  id: string
  label: string
  filter: string | null
}

export type TotemCatalog = {
  storeId: string
  products: Product[]
  categories: CatalogCategory[]
  integrationReady: boolean
  source: 'api' | 'fallback'
}

type ApiCutType = { id: string; name: string; desc: string }

type ApiProduct = {
  id: string
  name: string
  category: string
  description: string
  pricePerKg: number
  imageUrl: string | null
  badge?: string
  rating: number
  reviews: number
  cutTypes: ApiCutType[]
  tags: string[]
  available: boolean
}

type ApiCatalog = {
  storeId: string
  products: ApiProduct[]
  categories: CatalogCategory[]
  integrationReady?: boolean
}

function mapProduct(p: ApiProduct): Product {
  return {
    id: p.id,
    name: p.name,
    category: p.category as ProductCategory,
    description: p.description,
    pricePerKg: p.pricePerKg,
    imageUrl: p.imageUrl ?? '',
    badge: p.badge,
    rating: p.rating,
    reviews: p.reviews,
    cutTypes: p.cutTypes as CutType[],
    tags: p.tags,
  }
}

async function resolveStoreSlug(): Promise<string> {
  const fromUrl = new URLSearchParams(window.location.search).get('store')
  if (fromUrl) return fromUrl
  try {
    const res = await fetch('/stores.json')
    if (res.ok) {
      const list: { id: string }[] = await res.json()
      if (list.length > 0) return list[0].id
    }
  } catch { /* ignora */ }
  return 'corte'
}

export async function fetchCatalog(storeSlug?: string): Promise<TotemCatalog> {
  const slug = storeSlug ?? await resolveStoreSlug()

  try {
    const res = await fetch(`${API_BASE}/totem/${slug}/catalog`)
    if (!res.ok) throw new Error('Catálogo não encontrado')
    const data = (await res.json()) as ApiCatalog
    const products = data.products
      .filter((p) => p.available)
      .map(mapProduct)

    return {
      storeId: data.storeId,
      products,
      categories: data.categories,
      integrationReady: data.integrationReady ?? true,
      source: 'api',
    }
  } catch {
    console.warn('[catalog] API indisponível — usando catálogo local (products.ts)')
    return {
      storeId: slug,
      products: FALLBACK_PRODUCTS,
      categories: [...FALLBACK_CATEGORIES],
      integrationReady: false,
      source: 'fallback',
    }
  }
}

export const CatalogContext = createContext<TotemCatalog | null>(null)

export function useCatalog(): TotemCatalog {
  const ctx = useContext(CatalogContext)
  if (!ctx) throw new Error('useCatalog deve ser usado dentro de <CatalogContext.Provider>')
  return ctx
}

export function findProduct(catalog: TotemCatalog, productId: string): Product | undefined {
  return catalog.products.find((p) => p.id === productId)
}
