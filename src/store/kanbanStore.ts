import { create } from 'zustand'
import type { Order } from './cartStore'
import { normalizeOrder } from './cartStore'
import { api, ApiError } from '../lib/api'
import { isOperatorLoggedIn } from '../lib/auth'
import { notifyBoardUpdate, subscribeBoardUpdate } from '../lib/boardSync'
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
      const embedded = i.product as Record<string, unknown> | undefined
      return {
        product: {
          id: i.productId as string,
          name: i.productName as string,
          imageUrl: (embedded?.imageUrl as string) ?? '',
          category: (embedded?.category as string) ?? '',
          description: (embedded?.description as string) ?? '',
          pricePerKg: Number(embedded?.pricePerKg ?? 0),
          rating: Number(embedded?.rating ?? 0),
          reviews: Number(embedded?.reviews ?? 0),
          cutTypes: (embedded?.cutTypes as Order['items'][0]['product']['cutTypes']) ?? [],
          tags: (embedded?.tags as string[]) ?? [],
        } as Order['items'][0]['product'],
        cutType: { name: (i.cutType as string) ?? '', id: '', desc: '' } as Order['items'][0]['cutType'],
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

function todayDateParam(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function isToday(date: Date) {
  const now = new Date()
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  )
}

function isActiveOrder(order: Order) {
  return order.status !== 'retirado'
}

type KanbanStore = {
  orders: Order[]
  loading: boolean
  error: string | null
  sessionExpired: boolean
  addOrder: (order: Order) => void
  moveOrder: (id: string, status: Order['status']) => Promise<boolean>
  resetOrders: () => void
  fetchOrders: () => Promise<void>
  startPolling: (intervalMs?: number) => () => void
  clearSessionExpired: () => void
}

export const useKanbanStore = create<KanbanStore>((set, get) => ({
  orders: loadLocalOrders().filter((o) => isToday(o.createdAt) && isActiveOrder(o)),
  loading: false,
  error: null,
  sessionExpired: false,

  clearSessionExpired: () => set({ sessionExpired: false }),

  addOrder: (order) =>
    set((s) => {
      const orders = [order, ...s.orders]
      saveLocalOrders(orders)
      notifyBoardUpdate()
      return { orders }
    }),

  moveOrder: async (id, status) => {
    // Captura o status anterior para poder reverter se a API falhar
    const previous = get().orders.find((o) => o.id === id)?.status

    // Atualiza localmente de imediato (optimistic update)
    set((s) => {
      const orders = s.orders.map((o) => (o.id === id ? { ...o, status } : o))
      saveLocalOrders(orders)
      notifyBoardUpdate()
      return { orders }
    })

    // Sincroniza com a API em background — retorna true em caso de sucesso
    if (isOperatorLoggedIn()) {
      try {
        await api.patch(`/orders/${id}/status`, { status: STATUS_MAP_REVERSE[status] })
        notifyBoardUpdate()
        return true
      } catch {
        // Reverte o estado local ao status anterior para manter consistência com o banco
        if (previous !== undefined) {
          set((s) => {
            const orders = s.orders.map((o) => (o.id === id ? { ...o, status: previous } : o))
            saveLocalOrders(orders)
            notifyBoardUpdate()
            return { orders }
          })
        }
        return false
      }
    }
    return true
  },

  resetOrders: () => {
    saveLocalOrders([])
    set({ orders: [] })
  },

  fetchOrders: async () => {
    if (!isOperatorLoggedIn()) return

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

    set({ loading: true, error: null, sessionExpired: false })
    try {
      const data = await api.get<Record<string, unknown>[]>(`/orders?date=${todayDateParam()}`)
      if (!Array.isArray(data)) throw new Error('Resposta inválida da API')

      const apiOrders = data
        .map(apiOrderToLocal)
        .filter((o) => isToday(o.createdAt) && isActiveOrder(o))
      const apiIds = new Set(apiOrders.map((o) => o.id))

      // Mantém pedidos locais que ainda estão na fila de retry (não sincronizados)
      const pendingLocalIds = new Set(loadQueue().map((e) => e.localId))
      const pendingOrders = get().orders.filter(
        (o) => pendingLocalIds.has(o.id) && !apiIds.has(o.id) && isActiveOrder(o),
      )

      const merged = [...pendingOrders, ...apiOrders]
      saveLocalOrders(merged)
      set({ orders: merged, loading: false, error: null })
      notifyBoardUpdate()
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        set({
          loading: false,
          error: 'Sessão expirada — faça login novamente',
          sessionExpired: true,
          orders: [],
        })
        return
      }
      set({ loading: false, error: 'Não foi possível carregar pedidos da API' })
      const fallback = loadLocalOrders().filter((o) => isToday(o.createdAt) && isActiveOrder(o))
      set({ orders: get().orders.length ? get().orders : fallback })
    }
  },

  startPolling: (intervalMs = 10_000) => {
    const { fetchOrders } = get()
    fetchOrders()
    const timer = setInterval(fetchOrders, intervalMs)
    const unsubBoard = subscribeBoardUpdate(() => void fetchOrders())
    return () => {
      clearInterval(timer)
      unsubBoard()
    }
  },
}))

// Sincroniza entre abas via evento storage (mantido para compatibilidade offline)
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === LS_KEY) {
      const orders = loadLocalOrders().filter((o) => isToday(o.createdAt) && isActiveOrder(o))
      useKanbanStore.setState({ orders })
    }
  })
}
