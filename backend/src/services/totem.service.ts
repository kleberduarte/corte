import { findStoreBySlug } from '../repositories/store.repository'
import { findBoardOrders, findOrderById, findOrderByPickupCode } from '../repositories/order.repository'
import { getTotemCatalog } from './catalog.service'
import { NotFoundError } from '../errors/AppError'

export async function resolveActiveStore(storeSlug: string) {
  const store = await findStoreBySlug(storeSlug)
  if (!store || !store.active) throw new NotFoundError('Loja')
  return store
}

export async function getStoreConfig(storeSlug: string) {
  const store = await resolveActiveStore(storeSlug)
  const cfg = store.config

  return {
    id:     store.slug,
    name:   store.name,
    active: store.active,
    chain:  store.chain,
    theme: {
      primaryColor: cfg?.primaryColor ?? '#C0272D',
      primaryDark:  cfg?.primaryDark  ?? '#7A1015',
      accentColor:  cfg?.accentColor  ?? '#F5EDDB',
      logoUrl:      cfg?.logoUrl      ?? null,
      fontFamily:   cfg?.fontFamily   ?? null,
    },
    hours: {
      morning:   { open: cfg?.morningOpen   ?? '08:00', close: cfg?.morningClose   ?? '12:00' },
      afternoon: { open: cfg?.afternoonOpen ?? '14:00', close: cfg?.afternoonClose ?? '22:00' },
    },
    slotIntervalMin:   cfg?.slotIntervalMin   ?? 30,
    minLeadTimeMin:    cfg?.minLeadTimeMin    ?? 30,
    inactivityTimeout: cfg?.inactivityTimeout ?? 90,
  }
}

export async function getStoreCatalog(storeSlug: string) {
  const store = await resolveActiveStore(storeSlug)
  return getTotemCatalog(store.id, store.slug)
}

export async function getBoardData(storeSlug: string) {
  const store = await resolveActiveStore(storeSlug)
  return findBoardOrders(store.id)
}

export async function getOrderByCode(storeSlug: string, code: string) {
  const store = await resolveActiveStore(storeSlug)

  const order =
    (await findOrderById(store.id, code)) ??
    (await findOrderByPickupCode(store.id, code))

  if (!order) throw new NotFoundError('Pedido')

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    pickupCode: order.pickupCode,
    status: order.status,
    scheduledAt: order.scheduledAt,
    pickupMode: order.pickupMode,
    priority: order.priority,
    items: order.items.map((i) => ({
      productName: i.productName,
      cutType: i.cutType,
      quantity: Number(i.quantity),
      totalPrice: Number(i.totalPrice),
    })),
  }
}
