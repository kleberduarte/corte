import type { Order } from '../store/cartStore'
import { getOrderTrackingUrl } from './orderTrackingUrl'
import { generateQrDataUrl } from './qrCode'
import { printReceiptBrowser } from './browserPrint'

/** Impressão no totem via navegador — sem serviço extra no PC. */
export async function printReceiptSilent(order: Order, storeName: string): Promise<boolean> {
  const qrDataUrl = await generateQrDataUrl(getOrderTrackingUrl(order.pickupCode), 120)
  const payload = {
    storeName,
    pickupCode: order.pickupCode,
    slotTime: order.slotTime,
    customerPhone: order.customerPhone || undefined,
    qrDataUrl,
    items: order.items.map((item) => ({
      productName: item.product.name,
      cutType: item.cutType.name,
      weightKg: item.weightKg,
      estimatedPrice: item.estimatedPrice,
    })),
  }

  const ok = await printReceiptBrowser(payload)
  if (!ok) console.warn('[print] Não foi possível abrir a impressão no navegador')
  return ok
}
