import { create } from 'zustand'
import type { Product, CutType } from '../data/products'

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
  status: 'aguardando' | 'em_preparo' | 'pronto' | 'retirado'
  createdAt: Date
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
  confirmOrder: (slotTime: string, customerPhone: string) => Order
  createCounterTicket: (slotTime: string) => Order
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

  confirmOrder: (slotTime, customerPhone) => {
    const { items } = get()
    if (items.length === 0) throw new Error('No items in cart')
    const order: Order = {
      id: crypto.randomUUID(),
      items: [...items],
      pickupCode: generateCode(),
      slotTime,
      customerPhone,
      status: 'aguardando',
      createdAt: new Date(),
    }
    set({ currentOrder: order })
    return order
  },

  createCounterTicket: (slotTime) => {
    const order: Order = {
      id: crypto.randomUUID(),
      items: [],
      pickupCode: generateCode(),
      slotTime,
      customerPhone: '',
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
