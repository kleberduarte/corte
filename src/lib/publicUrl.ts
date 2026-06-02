import { tenantLogoPath } from './imagePaths'
export { tenantLogoPath } from './imagePaths'

/** Origem pública do frontend (HTTPS em produção). */
export function getPublicOrigin(): string {
  const fromEnv = import.meta.env.VITE_PUBLIC_URL?.replace(/\/$/, '')
  if (fromEnv) return fromEnv
  if (typeof window !== 'undefined') return window.location.origin
  return ''
}

/** URL HTTPS pública da logo — use no cadastro da loja. */
export function tenantLogoUrl(slug: string, filename = 'logo.png'): string {
  const origin = getPublicOrigin()
  const path = tenantLogoPath(slug, filename)
  return origin ? `${origin}${path}` : path
}
