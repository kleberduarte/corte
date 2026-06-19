/**
 * Fila persistente de pedidos que falharam ao sincronizar com a API.
 * Cada entrada guarda o payload completo para ser reenviado no próximo retry.
 */

import { api, ApiError } from '../lib/api'
import { notifyBoardUpdate } from '../lib/boardSync'
import type { Order } from './cartStore'

const QUEUE_KEY = 'corte:sync_queue'

export type QueueEntry = {
  localId: string       // ID local do pedido (crypto.randomUUID)
  storeSlug: string
  payload: Record<string, unknown>
  localOrder: Omit<Order, 'createdAt'> & { createdAt: string }
  queuedAt: string
}

export function loadQueue(): QueueEntry[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY)
    return raw ? (JSON.parse(raw) as QueueEntry[]) : []
  } catch {
    return []
  }
}

function saveQueue(queue: QueueEntry[]) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
}

export function enqueue(entry: QueueEntry) {
  const queue = loadQueue()
  // Evita duplicata caso o mesmo localId já esteja na fila
  if (queue.some((e) => e.localId === entry.localId)) return
  queue.push(entry)
  saveQueue(queue)
}

export function dequeue(localId: string) {
  const queue = loadQueue().filter((e) => e.localId !== localId)
  saveQueue(queue)
}

type ApiOrder = { id: string; pickupCode: string }

/**
 * Tenta sincronizar todas as entradas da fila com a API.
 * Retorna os pedidos que foram confirmados (com o ID e pickupCode da API).
 */
export async function flushQueue(): Promise<Array<{ localId: string; apiOrder: ApiOrder }>> {
  const queue = loadQueue()
  if (queue.length === 0) return []

  const confirmed: Array<{ localId: string; apiOrder: ApiOrder }> = []

  for (const entry of queue) {
    try {
      const apiOrder = await api.post<ApiOrder>(
        `/totem/${entry.storeSlug}/orders`,
        entry.payload,
      )
      dequeue(entry.localId)
      confirmed.push({ localId: entry.localId, apiOrder })
      notifyBoardUpdate()
    } catch (err) {
      // Erros de validação (4xx) nunca vão se resolver com retry — descarta da fila
      if (err instanceof ApiError && err.status >= 400 && err.status < 500) {
        dequeue(entry.localId)
      }
      // Erros de rede/servidor (5xx, timeout) mantêm na fila para o próximo retry
    }
  }

  return confirmed
}
