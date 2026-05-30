/** URL pública para o cliente acompanhar o andamento do pedido. */
export function getOrderTrackingUrl(orderId: string): string {
  const url = new URL(window.location.href)
  url.search = ''
  url.hash = ''
  url.searchParams.set('view', 'pedido')
  url.searchParams.set('id', orderId)
  return url.toString()
}
