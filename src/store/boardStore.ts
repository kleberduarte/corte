import { create } from 'zustand'
import { api } from '../lib/api'
import { notifyBoardUpdate, subscribeBoardUpdate } from '../lib/boardSync'
import { normalizeOrder } from './cartStore'
import type { Order } from './cartStore'
import { flushQueue, loadQueue } from './syncQueue'

export type BoardOrder = {
  pickupCode: string
  orderNumber: number
}

export type BoardData = {
  waiting: BoardOrder[]
  preparing: BoardOrder[]
  ready: BoardOrder[]
}

const LS_ORDERS_KEY = 'corte:orders'
const POLL_MS = 3_000
const MAX_PER_COLUMN = 5

function isToday(date: Date) {
  const now = new Date()
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  )
}

function loadLocalOrders(): Order[] {
  try {
    const raw = localStorage.getItem(LS_ORDERS_KEY)
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

function localOrdersToBoard(orders: Order[]): BoardData {
  const today = orders.filter((o) => isToday(o.createdAt))

  const waiting = today
    .filter((o) => o.status === 'aguardando')
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    .slice(-MAX_PER_COLUMN)
    .map((o) => ({ pickupCode: o.pickupCode, orderNumber: 0 }))

  const preparing = today
    .filter((o) => o.status === 'em_preparo')
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    .slice(-MAX_PER_COLUMN)
    .map((o) => ({ pickupCode: o.pickupCode, orderNumber: 0 }))

  const ready = today
    .filter((o) => o.status === 'pronto')
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    .slice(-MAX_PER_COLUMN)
    .map((o) => ({ pickupCode: o.pickupCode, orderNumber: 0 }))

  return { waiting, preparing, ready }
}

function pickBoardOrder(
  code: string,
  api: BoardData,
  local: BoardData,
): BoardOrder | undefined {
  return (
    api.ready.find((o) => o.pickupCode === code) ??
    api.preparing.find((o) => o.pickupCode === code) ??
    api.waiting.find((o) => o.pickupCode === code) ??
    local.ready.find((o) => o.pickupCode === code) ??
    local.preparing.find((o) => o.pickupCode === code) ??
    local.waiting.find((o) => o.pickupCode === code)
  )
}

function inAnyApiColumn(code: string, api: BoardData) {
  return (
    api.waiting.some((o) => o.pickupCode === code) ||
    api.preparing.some((o) => o.pickupCode === code) ||
    api.ready.some((o) => o.pickupCode === code)
  )
}

function saveLocalOrders(orders: Order[]) {
  localStorage.setItem(LS_ORDERS_KEY, JSON.stringify(orders))
}

/** Remove pedidos locais que nunca chegaram à API (fantasmas do modo offline). */
function pruneGhostOrders(localOrders: Order[], api: BoardData, apiOk: boolean): Order[] {
  if (!apiOk) return localOrders

  const pendingIds = new Set(loadQueue().map((e) => e.localId))
  const apiCodes = new Set([
    ...api.waiting.map((o) => o.pickupCode),
    ...api.preparing.map((o) => o.pickupCode),
    ...api.ready.map((o) => o.pickupCode),
  ])

  return localOrders.filter((o) => {
    if (pendingIds.has(o.id)) return true
    if (apiCodes.has(o.pickupCode)) return true
    if (o.status === 'pronto') return true
    return false
  })
}

function mergeBoard(
  api: BoardData,
  local: BoardData,
  localOrders: Order[],
  apiOk: boolean,
): BoardData {
  const localByCode = new Map(localOrders.map((o) => [o.pickupCode, o]))
  const pendingPickupCodes = new Set(loadQueue().map((e) => e.localOrder.pickupCode))

  const codes = new Set<string>()
  for (const col of [
    api.waiting,
    api.preparing,
    api.ready,
    local.waiting,
    local.preparing,
    local.ready,
  ]) {
    for (const o of col) codes.add(o.pickupCode)
  }

  const waiting: BoardOrder[] = []
  const preparing: BoardOrder[] = []
  const ready: BoardOrder[] = []

  for (const code of codes) {
    const localOrder = localByCode.get(code)
    const localStatus = localOrder?.status

    if (localStatus === 'retirado') continue

    // Oculta pedidos locais ausentes da API (entregues, cancelados ou fantasmas offline)
    if (
      apiOk &&
      !inAnyApiColumn(code, api) &&
      localOrder &&
      !pendingPickupCodes.has(code) &&
      localStatus !== 'pronto'
    ) {
      continue
    }

    const order = pickBoardOrder(code, api, local)
    if (!order) continue

    const inApiReady = api.ready.some((o) => o.pickupCode === code)
    const localReady = localStatus === 'pronto'

    if (inApiReady || localReady) {
      ready.push(order)
      continue
    }

    const inApiPreparing = api.preparing.some((o) => o.pickupCode === code)
    const localPreparing = localStatus === 'em_preparo'

    if (inApiPreparing || localPreparing) {
      preparing.push(order)
      continue
    }

    const inApiWaiting = api.waiting.some((o) => o.pickupCode === code)
    const localWaiting = localStatus === 'aguardando'

    if (inApiWaiting || localWaiting) {
      waiting.push(order)
    }
  }

  return {
    waiting: waiting.slice(-MAX_PER_COLUMN),
    preparing: preparing.slice(-MAX_PER_COLUMN),
    ready: ready.slice(-MAX_PER_COLUMN),
  }
}

function normalizeApiBoard(data: Partial<BoardData> & { preparing?: BoardOrder[]; ready?: BoardOrder[] }): BoardData {
  // Compatibilidade com resposta antiga que misturava PENDING em preparing
  if (data.waiting) {
    return {
      waiting: data.waiting ?? [],
      preparing: data.preparing ?? [],
      ready: data.ready ?? [],
    }
  }

  return {
    waiting: [],
    preparing: data.preparing ?? [],
    ready: data.ready ?? [],
  }
}

type BoardStore = {
  board: BoardData
  tick: number
  loading: boolean
  fetchBoard: (storeSlug: string) => Promise<void>
  startPolling: (storeSlug: string) => () => void
}

export const useBoardStore = create<BoardStore>((set, get) => ({
  board: { waiting: [], preparing: [], ready: [] },
  tick: 0,
  loading: false,

  fetchBoard: async (storeSlug) => {
    let apiData: BoardData = { waiting: [], preparing: [], ready: [] }
    let apiOk = false

    // Reenvia pedidos que falharam enquanto a API estava fora
    const confirmed = await flushQueue()
    let localOrders = loadLocalOrders()
    if (confirmed.length > 0) {
      localOrders = localOrders.map((o) => {
        const match = confirmed.find((c) => c.localId === o.id)
        if (!match) return o
        return { ...o, id: match.apiOrder.id, pickupCode: match.apiOrder.pickupCode }
      })
    }

    try {
      const raw = await api.get<Partial<BoardData> & { preparing?: BoardOrder[]; ready?: BoardOrder[] }>(
        `/totem/${storeSlug}/board`,
      )
      apiData = normalizeApiBoard(raw)
      apiOk = true
    } catch {
      /* usa fallback local */
    }

    if (apiOk) {
      const pruned = pruneGhostOrders(localOrders, apiData, apiOk)
      if (pruned.length !== localOrders.length) {
        localOrders = pruned
        saveLocalOrders(pruned)
        notifyBoardUpdate()
      }
    } else if (confirmed.length > 0) {
      saveLocalOrders(localOrders)
    }

    const localData = localOrdersToBoard(localOrders)
    const board = mergeBoard(apiData, localData, localOrders, apiOk)

    set((s) => ({
      board,
      tick: s.tick + 1,
      loading: false,
    }))
  },

  startPolling: (storeSlug) => {
    const { fetchBoard } = get()

    const refresh = () => {
      void fetchBoard(storeSlug)
    }

    refresh()

    const pollTimer = setInterval(refresh, POLL_MS)
    const unsubBoard = subscribeBoardUpdate(refresh)

    const onStorage = (e: StorageEvent) => {
      if (e.key === LS_ORDERS_KEY) refresh()
    }
    window.addEventListener('storage', onStorage)

    return () => {
      clearInterval(pollTimer)
      unsubBoard()
      window.removeEventListener('storage', onStorage)
    }
  },
}))

export { POLL_MS as BOARD_POLL_MS }
