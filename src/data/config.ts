import { createContext, useContext } from 'react'

export type StoreHours = {
  open: string
  close: string
}

export type StoreConfig = {
  id: string
  name: string
  theme: {
    primaryColor: string
    primaryDark:  string
    accentColor:  string
    logoUrl:      string | null
    fontFamily:   string | null
  }
  hours: {
    morning:   StoreHours
    afternoon: StoreHours
  }
  slotIntervalMin:   number
  minLeadTimeMin:    number
  inactivityTimeout: number
  mockFullSlotIndexes: number[]
}

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3333'

const FALLBACK_STORE: StoreConfig = {
  id:   'corte',
  name: 'Corte',
  theme: {
    primaryColor: '#C0272D',
    primaryDark:  '#7A1015',
    accentColor:  '#F5EDDB',
    logoUrl:      null,
    fontFamily:   null,
  },
  hours: {
    morning:   { open: '08:00', close: '12:00' },
    afternoon: { open: '14:00', close: '22:00' },
  },
  slotIntervalMin:   30,
  minLeadTimeMin:    30,
  inactivityTimeout: 90,
  mockFullSlotIndexes: [],
}

export async function fetchActiveStore(): Promise<StoreConfig> {
  // Slug da loja vem da URL (?store=corte) ou usa o padrão do stores.json
  const storeSlug = await resolveStoreSlug()

  try {
    const res = await fetch(`${API_BASE}/totem/${storeSlug}/config`)
    if (!res.ok) throw new Error('Config não encontrada')
    const data = await res.json()
    return { ...data, mockFullSlotIndexes: [] }
  } catch {
    // Fallback: retorna config padrão sem quebrar o app
    console.warn('[config] API indisponível — usando config padrão')
    return { ...FALLBACK_STORE, id: storeSlug }
  }
}

async function resolveStoreSlug(): Promise<string> {
  // 1. ?store= na URL
  const fromUrl = new URLSearchParams(window.location.search).get('store')
  if (fromUrl) return fromUrl

  // 2. stores.json local (mantido como fallback de desenvolvimento)
  try {
    const res = await fetch('/stores.json')
    if (res.ok) {
      const list: { id: string }[] = await res.json()
      if (list.length > 0) return list[0].id
    }
  } catch { /* ignora */ }

  return 'corte'
}

// ─── Contexto React ───────────────────────────────────────────────────────────

export const StoreContext = createContext<StoreConfig | null>(null)

export function useStore(): StoreConfig {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore deve ser usado dentro de <StoreContext.Provider>')
  return ctx
}
