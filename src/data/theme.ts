import type { StoreConfig } from './config'

export type Theme = {
  primaryColor: string
  primaryDark:  string
  accentColor:  string
  logoUrl?:     string | null
  fontFamily?:  string | null
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement
  root.style.setProperty('--primary',      theme.primaryColor)
  root.style.setProperty('--primary-dark', theme.primaryDark)
  root.style.setProperty('--accent',       theme.accentColor)
  root.style.setProperty('--primary-glow', hexToRgba(theme.primaryColor, 0.35))
  root.dataset.logoUrl = theme.logoUrl ?? ''
  if (theme.fontFamily) {
    root.style.setProperty('--font-sans', theme.fontFamily)
  }
}

export function applyStoreTheme(store: StoreConfig) {
  applyTheme(store.theme)
}

function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}
