import { getPublicOrigin } from '../lib/publicUrl'

/** URL pública para o cliente acompanhar o andamento do pedido (código de retirada, ex. V-3855). */
export function getOrderTrackingUrl(pickupCode: string, storeSlug: string): string {
  const origin = getPublicOrigin() || window.location.origin
  const url = new URL(origin)
  url.search = ''
  url.hash = ''
  url.searchParams.set('store', storeSlug)
  url.searchParams.set('view', 'pedido')
  url.searchParams.set('id', pickupCode)
  return url.toString()
}
