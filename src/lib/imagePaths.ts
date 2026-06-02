const ASSETS_BASE = '/assets'
const PRODUCTS_BASE = `${ASSETS_BASE}/produtos`
const TENANTS_BASE = `${ASSETS_BASE}/tenants`

export type ProductAssetCategory = 'aves' | 'suinos' | 'linguicas' | 'peixes' | 'bovinos' | 'frios'

/** Caminho de imagem local de produto no frontend. */
export function productImagePath(category: ProductAssetCategory, filename: string): string {
  return `${PRODUCTS_BASE}/${category}/${filename}`
}

/** Caminho de logo por tenant no frontend. */
export function tenantLogoPath(slug: string, filename = 'logo.png'): string {
  return `${TENANTS_BASE}/${slug}/${filename}`
}
