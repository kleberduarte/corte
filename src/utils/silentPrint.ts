import type { Order } from '../store/cartStore'
import { getOrderTrackingUrl } from './orderTrackingUrl'
import { generateQrDataUrl } from './qrCode'

const PRINT_SERVER_URL = 'http://127.0.0.1:3334'
const PRINT_API_BASE =
  (import.meta.env.VITE_PRINT_API_URL as string | undefined)
  ?? (import.meta.env.VITE_API_URL as string | undefined)

type ReceiptPayload = {
  storeName: string
  pickupCode: string
  slotTime: string
  customerPhone?: string
  qrDataUrl: string
  items: {
    productName: string
    cutType: string
    weightKg: number
    estimatedPrice: number
  }[]
}

function orderToPayload(order: Order, storeName: string, qrDataUrl: string): ReceiptPayload {
  return {
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
}

async function postPrint(url: string, payload: ReceiptPayload): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.ok || res.status === 204) return true
    const err = await res.json().catch(() => null) as { error?: string } | null
    console.error(`[print] ${url} → ${res.status}`, err?.error ?? res.statusText)
    return false
  } catch (err) {
    console.error(`[print] ${url} → falha de rede`, err)
    return false
  }
}

/** Impressão silenciosa no totem — sem diálogo do navegador. Retorna true se algum destino respondeu com sucesso. */
export async function printReceiptSilent(order: Order, storeName: string, storeSlug: string): Promise<boolean> {
  const qrDataUrl = await generateQrDataUrl(getOrderTrackingUrl(order.pickupCode), 120)
  const payload = orderToPayload(order, storeName, qrDataUrl)

  if (await postPrint(`${PRINT_SERVER_URL}/print`, payload)) return true

  if (PRINT_API_BASE) {
    const base = PRINT_API_BASE.replace(/\/$/, '')
    if (await postPrint(`${base}/totem/${encodeURIComponent(storeSlug)}/print`, payload)) return true
  }

  console.warn('[print] Impressão não concluída — verifique o print-server (porta 3334) e a impressora')
  return false
}
