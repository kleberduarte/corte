export type Theme = {
  primary: string
  primaryDark: string
  accent: string
  storeName: string
  tenantSlug: string
  logoUrl?: string
}

export const THEMES: Record<string, Theme> = {
  'violeta': {
    primary: '#6B3A9E',
    primaryDark: '#4A1472',
    accent: '#F0E8FF',
    storeName: 'Violeta Supermercados',
    tenantSlug: 'violeta',
    logoUrl: '/assets/tenants/violeta/logo.png',
  },
  'pao-de-acucar': {
    primary: '#C0272D',
    primaryDark: '#7A1015',
    accent: '#F5EDDB',
    storeName: 'Pão de Açúcar Moema',
    tenantSlug: 'pao-de-acucar',
  },
  carrefour: {
    primary: '#006F3C',
    primaryDark: '#003D20',
    accent: '#EFF5EE',
    storeName: 'Carrefour Paulista',
    tenantSlug: 'carrefour',
  },
  extra: {
    primary: '#C88A00',
    primaryDark: '#7A5500',
    accent: '#FFFFF0',
    storeName: 'Extra Vila Mariana',
    tenantSlug: 'extra',
  },
}

export const DEFAULT_THEME = THEMES['pao-de-acucar']

export function applyTheme(theme: Theme) {
  const root = document.documentElement
  root.style.setProperty('--primary', theme.primary)
  root.style.setProperty('--primary-dark', theme.primaryDark)
  root.style.setProperty('--accent', theme.accent)
  root.style.setProperty('--primary-glow', hexToRgba(theme.primary, 0.35))
  // logoUrl disponível via atributo data para componentes lerem
  root.dataset.logoUrl = theme.logoUrl ?? ''
  root.dataset.tenantSlug = theme.tenantSlug
}

function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}
