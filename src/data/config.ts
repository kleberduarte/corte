import { createContext, useContext } from 'react'

export type StoreHours = {
  open: string
  close: string
}

// ─── Redes ────────────────────────────────────────────────────────────────────
// Ficam no código: raramente mudam, uma por rede de supermercado.

export type NetworkConfig = {
  id: string
  themeKey: string
  defaultHours: {
    morning: StoreHours
    afternoon: StoreHours
  }
  slotIntervalMin: number
  minLeadTimeMin: number
}

export const NETWORKS: Record<string, NetworkConfig> = {
  'pao-de-acucar': {
    id: 'pao-de-acucar',
    themeKey: 'pao-de-acucar',
    defaultHours: {
      morning:   { open: '07:00', close: '12:00' },
      afternoon: { open: '14:00', close: '22:00' },
    },
    slotIntervalMin: 30,
    minLeadTimeMin: 30,
  },
  'extra': {
    id: 'extra',
    themeKey: 'extra',
    defaultHours: {
      morning:   { open: '07:00', close: '12:00' },
      afternoon: { open: '13:00', close: '22:00' },
    },
    slotIntervalMin: 30,
    minLeadTimeMin: 30,
  },
  'violeta': {
    id: 'violeta',
    themeKey: 'violeta',
    defaultHours: {
      morning:   { open: '07:00', close: '12:00' },
      afternoon: { open: '13:00', close: '22:00' },
    },
    slotIntervalMin: 30,
    minLeadTimeMin: 30,
  },
  'carrefour': {
    id: 'carrefour',
    themeKey: 'carrefour',
    defaultHours: {
      morning:   { open: '07:00', close: '12:00' },
      afternoon: { open: '13:00', close: '23:00' },
    },
    slotIntervalMin: 30,
    minLeadTimeMin: 30,
  },
}

// ─── Tipo do JSON (stores.json / API) ─────────────────────────────────────────
// Só o que é diferente do padrão da rede precisa ser declarado.

type StoreRecord = {
  id: string
  networkId: string
  name: string
  hours?: {
    morning?: Partial<StoreHours>
    afternoon?: Partial<StoreHours>
  }
  slotIntervalMin?: number
  minLeadTimeMin?: number
  mockFullSlotIndexes?: number[]
}

// ─── Tipo resolvido (usado pelo app) ─────────────────────────────────────────

export type StoreConfig = {
  id: string
  name: string
  themeKey: string
  hours: {
    morning: StoreHours
    afternoon: StoreHours
  }
  slotIntervalMin: number
  minLeadTimeMin: number
  mockFullSlotIndexes: number[]
}

function resolveStore(record: StoreRecord): StoreConfig {
  const net = NETWORKS[record.networkId]
  if (!net) throw new Error(`Rede desconhecida: ${record.networkId}`)
  return {
    id: record.id,
    name: record.name,
    themeKey: net.themeKey,
    hours: {
      morning: {
        open:  record.hours?.morning?.open  ?? net.defaultHours.morning.open,
        close: record.hours?.morning?.close ?? net.defaultHours.morning.close,
      },
      afternoon: {
        open:  record.hours?.afternoon?.open  ?? net.defaultHours.afternoon.open,
        close: record.hours?.afternoon?.close ?? net.defaultHours.afternoon.close,
      },
    },
    slotIntervalMin:     record.slotIntervalMin  ?? net.slotIntervalMin,
    minLeadTimeMin:      record.minLeadTimeMin   ?? net.minLeadTimeMin,
    mockFullSlotIndexes: record.mockFullSlotIndexes ?? [],
  }
}

// ─── Fonte de dados ───────────────────────────────────────────────────────────
// Trocar esta URL por uma API REST quando necessário — o resto do app não muda.

const STORES_URL = '/stores.json'

export async function fetchActiveStore(): Promise<StoreConfig> {
  const storeId = new URLSearchParams(window.location.search).get('store')
  const res = await fetch(STORES_URL)
  if (!res.ok) throw new Error('Falha ao carregar lista de lojas')
  const list: StoreRecord[] = await res.json()
  const found = storeId ? list.find((s) => s.id === storeId) : null
  return resolveStore(found ?? list[0])
}

// ─── Contexto React ───────────────────────────────────────────────────────────
// Qualquer componente acessa a loja ativa com useStore() — sem prop drilling.

export const StoreContext = createContext<StoreConfig | null>(null)

export function useStore(): StoreConfig {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore deve ser usado dentro de <StoreContext.Provider>')
  return ctx
}
