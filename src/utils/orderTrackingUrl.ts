/** URL pública para o cliente acompanhar o andamento do pedido (código de retirada, ex. V-3855). */
export function getOrderTrackingUrl(pickupCode: string): string {
  const url = new URL(window.location.href)
  url.search = ''
  url.hash = ''
  url.searchParams.set('view', 'pedido')
  url.searchParams.set('id', pickupCode)
  return url.toString()
}
