import { create } from 'zustand'
import type { Product, CutType } from '../data/products'
import { api } from '../lib/api'

export type CartItem = {
  product: Product
  cutType: CutType
  weightKg: number
  estimatedPrice: number
}

export type Order = {
  id: string
  items: CartItem[]
  pickupCode: string
  slotTime: string
  customerPhone: string
  priority?: boolean
  status: 'aguardando' | 'em_preparo' | 'pronto' | 'retirado'
  createdAt: Date
}

// Resposta da API ao criar pedido
type ApiOrder = {
  id: string
  pickupCode: string
  orderNumber: number
  status: string
}

type CartStore = {
  items: CartItem[]
  currentOrder: Order | null
  setItems: (items: CartItem[]) => void
  setPrimaryItem: (item: CartItem) => void
  addItem: (item: CartItem) => void
  hasProduct: (productId: string) => boolean
  updateAllWeights: (weightKg: number) => void
  clearItems: () => void
  confirmOrder: (storeSlug: string, slotTime: string, customerPhone: string) => Promise<Order>
  createCounterTicket: (storeSlug: string, slotTime: string, options?: { priority?: boolean }) => Promise<Order>
  updateOrderStatus: (status: Order['status']) => void
  reset: () => void
}

function generateCode() {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const nums = '0123456789'
  const l = letters[Math.floor(Math.random() * letters.length)]
  const n = Array.from({ length: 4 }, () => nums[Math.floor(Math.random() * nums.length)]).join('')
  return `${l}-${n}`
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  currentOrder: null,

  setItems: (items) => set({ items }),

  setPrimaryItem: (item) => set({ items: [item] }),

  addItem: (item) =>
    set((s) => {
      if (s.items.some((i) => i.product.id === item.product.id)) return s
      return { items: [...s.items, item] }
    }),

  hasProduct: (productId) => get().items.some((i) => i.product.id === productId),

  updateAllWeights: (weightKg) =>
    set((s) => ({
      items: s.items.map((i) => ({
        ...i,
        weightKg,
        estimatedPrice: i.product.pricePerKg * weightKg,
      })),
    })),

  clearItems: () => set({ items: [] }),

  confirmOrder: async (storeSlug, slotTime, customerPhone) => {
    const { items } = get()
    if (items.length === 0) throw new Error('No items in cart')

    let pickupCode = generateCode()
    let orderId: string = crypto.randomUUID()

    try {
      const apiOrder = await api.post<ApiOrder>(`/totem/${storeSlug}/orders`, {
        pickupMode: slotTime === 'Imediata' ? 'IMMEDIATE' : 'SCHEDULED',
        scheduledAt: slotTime !== 'Imediata' && slotTime !== 'Balcão'
          ? new Date(`${new Date().toISOString().split('T')[0]}T${slotTime}:00`).toISOString()
          : undefined,
        customerPhone: customerPhone || undefined,
        items: items.map((i) => ({
          productId: i.product.id,
          cutType: i.cutType.name,
          quantity: i.weightKg,
        })),
      })
      pickupCode = apiOrder.pickupCode
      orderId = apiOrder.id
    } catch {
      // Fallback offline: continua com dados locais se a API estiver indisponível
      console.warn('[cartStore] API indisponível — pedido criado localmente')
    }

    const order: Order = {
      id: orderId,
      items: [...items],
      pickupCode,
      slotTime,
      customerPhone,
      status: 'aguardando',
      createdAt: new Date(),
    }
    set({ currentOrder: order })
    return order
  },

  createCounterTicket: async (storeSlug, slotTime, options) => {
    const priority = options?.priority ?? false
    let pickupCode = generateCode()
    let orderId: string = crypto.randomUUID()

    try {
      const apiOrder = await api.post<ApiOrder>(`/totem/${storeSlug}/orders`, {
        pickupMode: 'IMMEDIATE',
        items: [],
        priority,
        notes: priority ? 'Atendimento preferencial' : undefined,
      })
      pickupCode = apiOrder.pickupCode
      orderId = apiOrder.id
    } catch {
      console.warn('[cartStore] API indisponível — senha de balcão criada localmente')
    }

    const order: Order = {
      id: orderId,
      items: [],
      pickupCode,
      slotTime,
      customerPhone: '',
      priority,
      status: 'aguardando',
      createdAt: new Date(),
    }
    set({ items: [], currentOrder: order })
    return order
  },

  updateOrderStatus: (status) =>
    set((s) => (s.currentOrder ? { currentOrder: { ...s.currentOrder, status } } : s)),

  reset: () => set({ items: [], currentOrder: null }),
}))

/** Compatibilidade com pedidos salvos no formato antigo (item único). */
export function normalizeOrder(raw: Order & Partial<CartItem>): Order {
  if (raw.items?.length) return raw
  const legacy = raw as Order & CartItem
  if (!legacy.product) return raw
  return {
    id: legacy.id,
    pickupCode: legacy.pickupCode,
    slotTime: legacy.slotTime,
    customerPhone: legacy.customerPhone,
    priority: legacy.priority,
    status: legacy.status,
    createdAt: legacy.createdAt,
    items: [{
      product: legacy.product,
      cutType: legacy.cutType,
      weightKg: legacy.weightKg,
      estimatedPrice: legacy.estimatedPrice ?? legacy.product.pricePerKg * legacy.weightKg,
    }],
  }
}
