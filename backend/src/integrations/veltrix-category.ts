import { Category, Unit } from '@prisma/client'

const DEFAULT_CUT = [
  { id: 'inteiro', name: 'Peça Inteira', desc: 'Como sai da peça' },
  { id: 'bife_alto', name: 'Bife Alto', desc: '2–3 cm espessura' },
  { id: 'bife_fino', name: 'Bife Fino', desc: '0,5–1 cm espessura' },
  { id: 'iscas', name: 'Iscas / Tiras', desc: 'Para chapa ou wok' },
]

const FRIO_CUT = [
  { id: 'fatia', name: 'Fatias', desc: 'Espessura na hora' },
  { id: 'granel', name: 'A granel', desc: 'Peso exato' },
  { id: 'pedaco', name: 'Pedaço', desc: 'Peça inteira ou bloco' },
]

const LINGUICA_CUT = [
  { id: 'gomo', name: 'Gomo', desc: 'Porções individuais' },
  { id: 'granel', name: 'A granel', desc: 'Peso exato' },
]

/** Mapeia texto livre de categoria do Veltrix para enum do CORTE. */
export function mapVeltrixCategory(categoria?: string | null): Category {
  const c = (categoria ?? '').toLowerCase()
  if (/bovin|carne|picanha|angus|acougue|açougue/.test(c)) return Category.BOVINO
  if (/frango|ave|galinha|peru/.test(c)) return c.includes('peru') && !c.includes('frango') ? Category.FRIOS : Category.FRANGO
  if (/suín|suin|porco|bacon|panceta/.test(c)) return Category.SUINO
  if (/lingui/.test(c)) return Category.LINGUICA
  if (/peix|salm|atum|pesc/.test(c)) return Category.PEIXE
  if (/camar|fruto.?mar|marisco/.test(c)) return Category.FRUTOS_DO_MAR
  if (/frio|queijo|presunto|salame|latic/.test(c)) return Category.FRIOS
  if (/wagyu|especial|premium|import/.test(c)) return Category.ESPECIAL
  return Category.OUTROS
}

export function defaultCutTypesForCategory(category: Category): typeof DEFAULT_CUT {
  switch (category) {
    case Category.FRIOS:
      return FRIO_CUT
    case Category.LINGUICA:
      return LINGUICA_CUT
    default:
      return DEFAULT_CUT
  }
}

export function mapVeltrixUnit(tipo?: string): Unit {
  if (tipo === 'UNIDADE') return Unit.UNIDADE
  return Unit.KG
}

export function veltrixProductId(veltrixId: number): string {
  return `veltrix-${veltrixId}`
}

export function veltrixExternalCode(veltrixId: number): string {
  return String(veltrixId)
}
