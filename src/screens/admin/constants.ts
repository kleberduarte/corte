export const CHAIN_OPTIONS = [
  { value: '', label: 'Todas as redes' },
  { value: 'CORTE_SUPERMERCADO',   label: 'Corte Supermercado' },
  { value: 'PAO_DE_ACUCAR',        label: 'Pão de Açúcar' },
  { value: 'EXTRA',                label: 'Extra' },
  { value: 'CARREFOUR',            label: 'Carrefour' },
  { value: 'ATACADAO',             label: 'Atacadão' },
  { value: 'ASSAI',                label: 'Assaí Atacadista' },
  { value: 'SUPERMERCADOS_MATEUS', label: 'Supermercados Mateus' },
  { value: 'VIOLETA',              label: 'Violeta' },
  { value: 'BIG',                  label: 'BIG' },
  { value: 'PREZUNIC',             label: 'Prezunic' },
  { value: 'MUNDIAL',              label: 'Mundial' },
  { value: 'SONDA',                label: 'Sonda' },
  { value: 'CONDOR',               label: 'Condor' },
  { value: 'SUPER_MUFFATO',        label: 'Super Muffato' },
  { value: 'ZAFFARI',              label: 'Zaffari' },
  { value: 'BOURBON',              label: 'Bourbon' },
  { value: 'COOP',                 label: 'Coop' },
  { value: 'HIROTA',               label: 'Hirota' },
  { value: 'REDE_SMART',           label: 'Rede Smart' },
  { value: 'OUTROS',               label: 'Outros' },
] as const

export const CHAIN_LABELS: Record<string, string> = {
  PAO_DE_ACUCAR:        'Pão de Açúcar',
  EXTRA:                'Extra',
  CARREFOUR:            'Carrefour',
  ATACADAO:             'Atacadão',
  ASSAI:                'Assaí Atacadista',
  SUPERMERCADOS_MATEUS: 'Supermercados Mateus',
  VIOLETA:              'Violeta',
  BIG:                  'BIG',
  PREZUNIC:             'Prezunic',
  MUNDIAL:              'Mundial',
  SONDA:                'Sonda',
  CONDOR:               'Condor',
  SUPER_MUFFATO:        'Super Muffato',
  ZAFFARI:              'Zaffari',
  BOURBON:              'Bourbon',
  COOP:                 'Coop',
  HIROTA:               'Hirota',
  REDE_SMART:           'Rede Smart',
  CORTE_SUPERMERCADO:   'Corte Supermercado',
  OUTROS:               'Outros',
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
