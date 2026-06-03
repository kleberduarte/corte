import { Category, Unit } from '@prisma/client'
import type { CategorySlug } from '../lib/category-map'
import { categorySlugToDb } from '../lib/category-map'

export type CutTypeSeed = { id: string; name: string; desc: string }

const DEFAULT_CUT: CutTypeSeed[] = [
  { id: 'inteiro', name: 'Peça Inteira', desc: 'Como sai da peça' },
  { id: 'bife_alto', name: 'Bife Alto', desc: '2–3 cm espessura' },
  { id: 'bife_fino', name: 'Bife Fino', desc: '0,5–1 cm espessura' },
  { id: 'iscas', name: 'Iscas / Tiras', desc: 'Para chapa ou wok' },
]

const FRIO_CUT: CutTypeSeed[] = [
  { id: 'fatia', name: 'Fatias', desc: 'Espessura na hora' },
  { id: 'granel', name: 'A granel', desc: 'Peso exato' },
  { id: 'pedaco', name: 'Pedaço', desc: 'Peça inteira ou bloco' },
]

export type CatalogProductSeed = {
  id: string
  name: string
  category: CategorySlug
  unit: Unit
  description: string
  imageUrl: string
  price: number
  badge?: string
  rating: number
  reviews: number
  cutTypes: CutTypeSeed[]
  tags: string[]
  sortOrder: number
  /** Código para integração ERP (PLU); padrão CORTE-{id} */
  sku?: string
  ean?: string
}

function img(folder: string, file: string) {
  return `/assets/produtos/${folder}/${file}`
}

/** Catálogo mestre — fonte do seed e referência para importação ERP. */
export const CATALOG_PRODUCTS: CatalogProductSeed[] = [
  { id: 'picanha-angus', name: 'Picanha Angus', category: 'bovino', unit: Unit.KG, description: 'Peça inteira de Picanha Angus certificada, maturada a seco por 21 dias para máxima maciez e sabor concentrado. Capa de gordura intacta para churrasco perfeito.', imageUrl: img('bovinos', 'picanha-angus.jpg'), price: 89.9, badge: 'Premium', rating: 4.9, reviews: 142, cutTypes: DEFAULT_CUT, tags: ['🌿 Natural', '⏱ 21 dias seco', '🐄 Angus', '🥇 Certificado'], sortOrder: 10 },
  { id: 'file-mignon', name: 'Filé Mignon', category: 'bovino', unit: Unit.KG, description: 'O corte mais macio. Ideal para medalhões e bifes altos.', imageUrl: img('bovinos', 'file-mignon.jpg'), price: 119.9, badge: 'Nobre', rating: 4.9, reviews: 98, cutTypes: DEFAULT_CUT, tags: ['🥩 Nobre', '🍽️ Alta gastronomia'], sortOrder: 20 },
  { id: 'costela-bovina', name: 'Costela Bovina', category: 'bovino', unit: Unit.KG, description: 'Ripa ou janela. Peça especial para assados longos na brasa.', imageUrl: img('bovinos', 'costela-bovina.jpg'), price: 42.9, rating: 4.4, reviews: 67, cutTypes: [{ id: 'ripa', name: 'Ripa', desc: 'Costela em tira longa' }, { id: 'janela', name: 'Janela', desc: 'Peça quadrada' }, { id: 'individual', name: 'Individual', desc: 'Ossos separados' }], tags: ['🔥 Brasa', '⏱ Assado longo'], sortOrder: 30 },
  { id: 'contrafile', name: 'Contrafilé', category: 'bovino', unit: Unit.KG, description: 'Versátil. Bife alto, churrasqueira ou frigideira. Ótimo marmoreio.', imageUrl: img('bovinos', 'contrafile.jpg'), price: 54.9, badge: 'Popular', rating: 4.3, reviews: 201, cutTypes: DEFAULT_CUT, tags: ['🔥 Versátil', '🐄 Bovino'], sortOrder: 40 },
  { id: 'alcatra', name: 'Alcatra', category: 'bovino', unit: Unit.KG, description: 'Corte clássico e equilibrado. Baixa gordura, textura firme.', imageUrl: img('bovinos', 'alcatra.jpg'), price: 48.9, rating: 4.4, reviews: 88, cutTypes: DEFAULT_CUT, tags: ['🥩 Clássico', '💪 Proteína'], sortOrder: 50 },
  { id: 'frango-inteiro', name: 'Frango Inteiro', category: 'aves', unit: Unit.UNIDADE, description: 'Frango inteiro. Corte na hora no balcão.', imageUrl: img('aves', 'frango-inteiro.jpg'), price: 18.9, badge: 'Granja', rating: 4.9, reviews: 310, cutTypes: [{ id: 'inteiro', name: 'Inteiro', desc: 'Frango completo' }, { id: 'metade', name: 'Metade', desc: 'Dividido ao meio' }, { id: 'ao_molho', name: 'A passarinho', desc: 'Pedaços pequenos' }], tags: ['🐔 Granja'], sortOrder: 60 },
  { id: 'sobrecoxa', name: 'Sobrecoxa sem Osso', category: 'aves', unit: Unit.KG, description: 'Sobrecoxa desossada na hora.', imageUrl: img('aves', 'sobrecoxa.jpg'), price: 22.9, rating: 4.4, reviews: 74, cutTypes: [{ id: 'sem_osso', name: 'Sem osso', desc: 'Desossada na hora' }, { id: 'com_osso', name: 'Com osso', desc: 'Peça inteira' }], tags: ['🐔 Frango'], sortOrder: 70 },
  { id: 'peito-frango', name: 'Peito de Frango', category: 'aves', unit: Unit.KG, description: 'Peito sem osso e sem pele.', imageUrl: img('aves', 'peito-de-frango.jpg'), price: 24.9, badge: 'Leve', rating: 4.9, reviews: 186, cutTypes: [{ id: 'inteiro', name: 'Inteiro', desc: 'Peito completo' }, { id: 'file', name: 'Filé', desc: 'Borboleta aberto' }, { id: 'cubo', name: 'Cubos', desc: 'Para espetinho' }], tags: ['🐔 Leve', '💪 Proteína'], sortOrder: 80 },
  { id: 'asa-frango', name: 'Asa de Frango', category: 'aves', unit: Unit.KG, description: 'Asas — tempero da casa opcional.', imageUrl: img('aves', 'azinha.jpg'), price: 16.9, rating: 4.9, reviews: 203, cutTypes: [{ id: 'inteiro', name: 'Inteira', desc: 'Asa completa' }, { id: 'tulipa', name: 'Tulipa', desc: 'Ponta cortada' }], tags: ['🐔 Frango', '🔥 Brasa'], sortOrder: 90 },
  { id: 'tulipa-frango', name: 'Tulipa de Frango', category: 'aves', unit: Unit.KG, description: 'Asa cortada em tulipa — carne exposta, fácil de segurar. Ideal para churrasco e festas.', imageUrl: img('aves', 'tulipa.jpg'), price: 19.9, badge: 'Festa', rating: 4.7, reviews: 118, cutTypes: [{ id: 'tulipa', name: 'Tulipa', desc: 'Corte padrão' }], tags: ['🐔 Frango', '🔥 Churrasco'], sortOrder: 100 },
  { id: 'coracao-frango', name: 'Coração de Frango', category: 'aves', unit: Unit.KG, description: 'Coração limpo e fresco. Clássico de churrasco, espetinho ou frigideira.', imageUrl: img('aves', 'coracao.jpg'), price: 14.9, badge: 'Espetinho', rating: 4.6, reviews: 91, cutTypes: [{ id: 'granel', name: 'A granel', desc: 'Peso exato' }, { id: 'espeto', name: 'No espeto', desc: 'Montado na hora' }], tags: ['🐔 Frango', '🔥 Espetinho'], sortOrder: 110 },
  { id: 'costelinha-suina', name: 'Costelinha Suína', category: 'suino', unit: Unit.KG, description: 'Ribs estilo americano. Corte em rack ou individual.', imageUrl: img('suinos', 'costelinha.jpg'), price: 34.9, badge: 'Defumada', rating: 4.9, reviews: 156, cutTypes: [{ id: 'rack', name: 'Rack', desc: 'Peça inteira' }, { id: 'individual', name: 'Individual', desc: 'Ossos separados' }], tags: ['🐷 Suíno', '🔥 Defumada'], sortOrder: 120 },
  { id: 'panceta', name: 'Panceta', category: 'suino', unit: Unit.KG, description: 'Panceta suína fresca. Fatias ou peça inteira na hora.', imageUrl: img('suinos', 'panceta.jpg'), price: 32.9, badge: 'Fresca', rating: 4.8, reviews: 124, cutTypes: [{ id: 'inteiro', name: 'Peça inteira', desc: 'Como sai da peça' }, { id: 'fatia', name: 'Fatias', desc: 'Espessura na hora' }, { id: 'cubo', name: 'Cubos', desc: 'Para refogado' }], tags: ['🐷 Suíno', '🔥 Brasa'], sortOrder: 130 },
  { id: 'bacon-suino', name: 'Bacon', category: 'suino', unit: Unit.KG, description: 'Bacon suíno em fatias. Ideal para café da manhã e churrasco.', imageUrl: img('suinos', 'bacon.jpg'), price: 38.9, rating: 4.7, reviews: 98, cutTypes: [{ id: 'fatia', name: 'Fatias', desc: 'Espessura na hora' }, { id: 'granel', name: 'A granel', desc: 'Peso exato' }], tags: ['🐷 Suíno', '🔥 Churrasco'], sortOrder: 140 },
  { id: 'torresmo', name: 'Torresmo', category: 'suino', unit: Unit.KG, description: 'Torresmo de barriga em cubos. Crocante na hora ou para fritar em casa.', imageUrl: img('suinos', 'torresmo.jpg'), price: 24.9, rating: 4.6, reviews: 87, cutTypes: [{ id: 'cubo', name: 'Cubos', desc: 'Pedaços prontos' }, { id: 'granel', name: 'A granel', desc: 'Peso exato' }], tags: ['🐷 Suíno', '✨ Crocante'], sortOrder: 150 },
  { id: 'linguica-aurora', name: 'Linguiça Aurora', category: 'linguicas', unit: Unit.KG, description: 'Linguiça toscana Aurora. Seleção do açougue para churrasco e grelha.', imageUrl: img('linguicas', 'aurora.jpg'), price: 27.9, badge: 'Toscana', rating: 4.8, reviews: 214, cutTypes: [{ id: 'gomo', name: 'Gomo', desc: 'Porções individuais' }, { id: 'granel', name: 'A granel', desc: 'Peso exato' }], tags: ['🌭 Linguiça', '🔥 Churrasco'], sortOrder: 160 },
  { id: 'linguica-perdigao', name: 'Linguiça Perdigão', category: 'linguicas', unit: Unit.KG, description: 'Linguiça calabresa Perdigão. Sabor marcante na brasa.', imageUrl: img('linguicas', 'perdigao.jpg'), price: 26.9, badge: 'Calabresa', rating: 4.7, reviews: 178, cutTypes: [{ id: 'gomo', name: 'Gomo', desc: 'Porções individuais' }, { id: 'granel', name: 'A granel', desc: 'Peso exato' }], tags: ['🌭 Linguiça', '🔥 Brasa'], sortOrder: 170 },
  { id: 'linguica-sadia', name: 'Linguiça Sadia', category: 'linguicas', unit: Unit.KG, description: 'Linguiça Sadia, qualidade de mercado com frescor do balcão.', imageUrl: img('linguicas', 'sadia.jpg'), price: 25.9, rating: 4.6, reviews: 142, cutTypes: [{ id: 'gomo', name: 'Gomo', desc: 'Porções individuais' }, { id: 'granel', name: 'A granel', desc: 'Peso exato' }], tags: ['🌭 Linguiça', '🏠 Família'], sortOrder: 180 },
  { id: 'salmao-posta', name: 'Salmão em Posta', category: 'peixe', unit: Unit.KG, description: 'Atlântico fresco. Cortado na espessura que você quiser.', imageUrl: img('peixes', 'salmao-posta.jpg'), price: 79.9, badge: 'Noruega', rating: 4.9, reviews: 124, cutTypes: [{ id: 'posta', name: 'Posta', desc: '3–4 cm espessura' }, { id: 'file', name: 'Filé', desc: 'Sem espinha' }, { id: 'sashimi', name: 'Sashimi', desc: '0,5 cm, fatias finas' }], tags: ['🐟 Atlântico', '❄️ Fresco'], sortOrder: 190 },
  { id: 'camarao-vg', name: 'Camarão VG', category: 'peixe', unit: Unit.KG, description: 'Descascado e limpo na hora. Fresco, nunca congelado.', imageUrl: img('peixes', 'camarao-vg.jpg'), price: 94.9, badge: 'VG limpo', rating: 4.9, reviews: 53, cutTypes: [{ id: 'limpo', name: 'Limpo', desc: 'Descascado e sem veia' }, { id: 'casca', name: 'Com casca', desc: 'Inteiro com casca' }], tags: ['🦐 Frutos do mar', '❄️ Fresco'], sortOrder: 200, sku: 'CORTE-camarao-vg' },
  { id: 'presunto-coimbra', name: 'Presunto Coimbra', category: 'frios', unit: Unit.KG, description: 'Presunto fatiado na hora. Ideal para tábua, sanduíche e lanches.', imageUrl: img('frios', 'presunto.jpg'), price: 89.9, badge: 'Fatiado', rating: 4.8, reviews: 167, cutTypes: FRIO_CUT, tags: ['🥓 Presunto', '✨ Fatiado na hora'], sortOrder: 210 },
  { id: 'mussarela', name: 'Muçarela', category: 'frios', unit: Unit.KG, description: 'Queijo muçarela fresco. Fatias ou pedaço na espessura que preferir.', imageUrl: img('frios', 'mussarela.jpg'), price: 42.9, badge: 'Fresco', rating: 4.7, reviews: 203, cutTypes: FRIO_CUT, tags: ['🧀 Queijo', '🏠 Dia a dia'], sortOrder: 220 },
  { id: 'peito-de-peru', name: 'Peito de Peru', category: 'frios', unit: Unit.KG, description: 'Peito de peru magro, fatiado no balcão. Leve e versátil.', imageUrl: img('frios', 'peito-de-peru.jpg'), price: 38.9, rating: 4.6, reviews: 128, cutTypes: FRIO_CUT, tags: ['🦃 Peru', '💪 Leve'], sortOrder: 230 },
  { id: 'salame-tipo-italiano', name: 'Salame Tipo Italiano', category: 'frios', unit: Unit.KG, description: 'Salame selecionado. Fatias finas ou pedaço para tábua de frios.', imageUrl: img('frios', 'salame.jpg'), price: 54.9, badge: 'Italiano', rating: 4.7, reviews: 94, cutTypes: FRIO_CUT, tags: ['🥓 Salame', '🍷 Tábua'], sortOrder: 240 },
  { id: 'queijo-prato', name: 'Queijo Prato', category: 'frios', unit: Unit.KG, description: 'Queijo prato tradicional. Fatias regulares para o dia a dia.', imageUrl: img('frios', 'queijo-prato.jpg'), price: 36.9, rating: 4.5, reviews: 156, cutTypes: FRIO_CUT, tags: ['🧀 Queijo', '🏠 Família'], sortOrder: 250 },
  { id: 'wagyu-ribeye', name: 'Wagyu Ribeye A5', category: 'especial', unit: Unit.KG, description: 'Importado do Japão. Marmoreio intenso. Encomenda especial.', imageUrl: img('bovinos', 'wagyu-ribeye.jpg'), price: 390, badge: 'Wagyu A5', rating: 5, reviews: 18, cutTypes: [{ id: 'bife', name: 'Bife', desc: '2 cm espessura' }, { id: 'inteiro', name: 'Peça', desc: 'Peça inteira' }], tags: ['🥇 Premium', '🇯🇵 Importado', '⭐ A5'], sortOrder: 260 },
]

export function productSku(id: string): string {
  return `CORTE-${id}`
}

export function externalCodeForStore(productId: string): string {
  return productSku(productId)
}

export function dbCategory(slug: CategorySlug): Category {
  return categorySlugToDb(slug)
}

/** Camarão usa categoria FRUTOS_DO_MAR no enum legado do banco. */
export function resolveDbCategory(p: CatalogProductSeed): Category {
  if (p.id === 'camarao-vg') return Category.FRUTOS_DO_MAR
  return dbCategory(p.category)
}
