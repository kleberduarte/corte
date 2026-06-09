import { Category } from '@prisma/client'

/** Slug usado no totem (products.ts legado). */
export type CategorySlug =
  | 'bovino'
  | 'aves'
  | 'suino'
  | 'linguicas'
  | 'peixe'
  | 'frios'
  | 'especial'
  | 'outros'

const TO_DB: Record<CategorySlug, Category> = {
  bovino: Category.BOVINO,
  aves: Category.FRANGO,
  suino: Category.SUINO,
  linguicas: Category.LINGUICA,
  peixe: Category.PEIXE,
  frios: Category.FRIOS,
  especial: Category.ESPECIAL,
  outros: Category.OUTROS,
}

const FROM_DB: Record<Category, CategorySlug> = {
  [Category.BOVINO]: 'bovino',
  [Category.FRANGO]: 'aves',
  [Category.SUINO]: 'suino',
  [Category.LINGUICA]: 'linguicas',
  [Category.PEIXE]: 'peixe',
  [Category.FRUTOS_DO_MAR]: 'peixe',
  [Category.FRIOS]: 'frios',
  [Category.ESPECIAL]: 'especial',
  [Category.OUTROS]: 'outros',
}

export function categorySlugToDb(slug: CategorySlug): Category {
  return TO_DB[slug]
}

export function categoryDbToSlug(category: Category): CategorySlug {
  return FROM_DB[category]
}

export const CATALOG_NAV_CATEGORIES = [
  { id: 'todos', label: '🔪 Todos', filter: null as string | null },
  { id: 'bovino', label: '🐄 Bovino', filter: 'bovino' },
  { id: 'aves', label: '🐔 Aves', filter: 'aves' },
  { id: 'suino', label: '🐷 Suíno', filter: 'suino' },
  { id: 'linguicas', label: '🌭 Linguiças', filter: 'linguicas' },
  { id: 'peixe', label: '🐟 Peixes e Frutos do Mar', filter: 'peixe' },
  { id: 'frios', label: '🧀 Frios', filter: 'frios' },
  { id: 'especial', label: '⭐ Especiais', filter: 'especial' },
] as const
