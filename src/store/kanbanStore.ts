import { create } from 'zustand'
import type { Order } from './cartStore'
import { normalizeOrder } from './cartStore'
import { api } from '../lib/api'
import { getOperatorToken } from '../lib/auth'
import { flushQueue, loadQueue } from './syncQueue'

const LS_KEY = 'corte:orders'

// Mapeamento entre status da API e status local (compatibilidade com o Kanban)
const STATUS_MAP: Record<string, Order['status']> = {
  PENDING:   'aguardando',
  PREPARING: 'em_preparo',
  READY:     'pronto',
  DELIVERED: 'retirado',
  CANCELLED: 'retirado',
}

const STATUS_MAP_REVERSE: Record<Order['status'], string> = {
  aguardando: 'PENDING',
  em_preparo: 'PREPARING',
  pronto:     'READY',
  retirado:   'DELIVERED',
}

function apiOrderToLocal(o: Record<string, unknown>): Order {
  const priority = Boolean(o.priority)
  return {
    id: o.id as string,
    pickupCode: (o.pickupCode ?? o.orderNumber) as string,
    slotTime: priority
      ? 'Preferencial'
      : o.scheduledAt
        ? new Date(o.scheduledAt as string).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        : o.pickupMode === 'IMMEDIATE' ? 'Imediata' : 'Balcão',
    customerPhone: (o.customerPhone as string) ?? '',
    priority,
    status: STATUS_MAP[o.status as string] ?? 'aguardando',
    createdAt: new Date(o.createdAt as string),
    items: ((o.items as unknown[]) ?? []).map((item) => {
      const i = item as Record<string, unknown>
      return {
        product: { id: i.productId as string, name: i.productName as string } as Order['items'][0]['product'],
        cutType: { name: (i.cutType as string) ?? '' } as Order['items'][0]['cutType'],
        weightKg: Number(i.quantity),
        estimatedPrice: Number(i.totalPrice),
      }
    }),
  }
}

function loadLocalOrders(): Order[] {
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

function saveLocalOrders(orders: Order[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(orders))
}

type KanbanStore = {
  orders: Order[]
  loading: boolean
  error: string | null
  addOrder: (order: Order) => void
  moveOrder: (id: string, status: Order['status']) => void
  resetOrders: () => void
  fetchOrders: () => Promise<void>
  startPolling: (intervalMs?: number) => () => void
}

export const useKanbanStore = create<KanbanStore>((set, get) => ({
  orders: loadLocalOrders(),
  loading: false,
  error: null,

  addOrder: (order) =>
    set((s) => {
      const orders = [order, ...s.orders]
      saveLocalOrders(orders)
      return { orders }
    }),

  moveOrder: async (id, status) => {
    // Atualiza localmente de imediato (optimistic update)
    set((s) => {
      const orders = s.orders.map((o) => (o.id === id ? { ...o, status } : o))
      saveLocalOrders(orders)
      return { orders }
    })

    // Sincroniza com a API em background
    const token = getOperatorToken()
    if (token) {
      try {
        await api.patch(`/orders/${id}/status`, { status: STATUS_MAP_REVERSE[status] }, token)
      } catch {
        console.warn('[kanbanStore] Falha ao sincronizar status com a API')
      }
    }
  },

  resetOrders: () => {
    saveLocalOrders([])
    set({ orders: [] })
  },

  fetchOrders: async () => {
    const token = getOperatorToken()
    if (!token) return

    // Tenta sincronizar pedidos que falharam anteriormente
    const confirmed = await flushQueue()
    if (confirmed.length > 0) {
      set((s) => {
        const orders = s.orders.map((o) => {
          const match = confirmed.find((c) => c.localId === o.id)
          if (!match) return o
          return { ...o, id: match.apiOrder.id, pickupCode: match.apiOrder.pickupCode }
        })
        saveLocalOrders(orders)
        return { orders }
      })
    }

    set({ loading: true, error: null })
    try {
      const data = await api.get<Record<string, unknown>[]>('/orders', token)
      const apiOrders = data.map(apiOrderToLocal)
      const apiIds = new Set(apiOrders.map((o) => o.id))

      // Mantém pedidos locais que ainda estão na fila de retry (não sincronizados)
      const pendingLocalIds = new Set(loadQueue().map((e) => e.localId))
      const pendingOrders = get().orders.filter(
        (o) => pendingLocalIds.has(o.id) && !apiIds.has(o.id)
      )

      const merged = [...pendingOrders, ...apiOrders]
      saveLocalOrders(merged)
      set({ orders: merged, loading: false })
    } catch {
      set({ loading: false, error: 'Não foi possível carregar pedidos da API' })
      set({ orders: get().orders.length ? get().orders : loadLocalOrders() })
    }
  },

  startPolling: (intervalMs = 10_000) => {
    const { fetchOrders } = get()
    fetchOrders()
    const timer = setInterval(fetchOrders, intervalMs)
    return () => clearInterval(timer)
  },
}))

// Sincroniza entre abas via evento storage (mantido para compatibilidade offline)
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === LS_KEY) {
      useKanbanStore.setState({ orders: loadLocalOrders() })
    }
  })
}
