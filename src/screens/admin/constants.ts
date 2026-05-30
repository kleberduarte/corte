export const CHAIN_OPTIONS = [
  { value: '', label: 'Todas as redes' },
  { value: 'CORTE_SUPERMERCADO', label: 'Corte Supermercado' },
  { value: 'PAO_DE_ACUCAR', label: 'Pão de Açúcar' },
  { value: 'EXTRA', label: 'Extra' },
  { value: 'VIOLETA', label: 'Violeta' },
  { value: 'CARREFOUR', label: 'Carrefour' },
  { value: 'OUTROS', label: 'Outros' },
] as const

export const CHAIN_LABELS: Record<string, string> = {
  PAO_DE_ACUCAR: 'Pão de Açúcar',
  EXTRA: 'Extra',
  VIOLETA: 'Violeta',
  CARREFOUR: 'Carrefour',
  CORTE_SUPERMERCADO: 'Corte',
  OUTROS: 'Outros',
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Aguardando',
  PREPARING: 'Em preparo',
  READY: 'Pronto',
  DELIVERED: 'Entregue',
  CANCELLED: 'Cancelado',
}

export function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}
