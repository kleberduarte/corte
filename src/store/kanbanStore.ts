import { create } from 'zustand'
import type { Order } from './cartStore'
import { normalizeOrder } from './cartStore'

const LS_KEY = 'corte:orders'

function loadOrders(): Order[] {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Order[]
    return parsed.map((o) => {
      const order = normalizeOrder(o as Order & { product?: Order['items'][0]['product'] })
      return { ...order, createdAt: new Date(order.createdAt) }
    })
  } catch {
    return []
  }
}

function saveOrders(orders: Order[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(orders))
}

type KanbanStore = {
  orders: Order[]
  addOrder: (order: Order) => void
  moveOrder: (id: string, status: Order['status']) => void
  resetOrders: () => void
  syncFromStorage: () => void
}

export const useKanbanStore = create<KanbanStore>((set) => ({
  orders: loadOrders(),

  addOrder: (order) =>
    set((s) => {
      const orders = [order, ...s.orders]
      saveOrders(orders)
      return { orders }
    }),

  moveOrder: (id, status) =>
    set((s) => {
      const orders = s.orders.map((o) => (o.id === id ? { ...o, status } : o))
      saveOrders(orders)
      return { orders }
    }),

  resetOrders: () => {
    saveOrders([])
    set({ orders: [] })
  },

  syncFromStorage: () => set({ orders: loadOrders() }),
}))

// Sincroniza entre abas via evento storage
window.addEventListener('storage', (e) => {
  if (e.key === LS_KEY) {
    useKanbanStore.getState().syncFromStorage()
  }
})
