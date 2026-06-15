/**
 * Garante que a tabela Product está populada e todas as lojas ativas
 * têm o catálogo vinculado via StoreProduct.
 * Rode manualmente: node prisma/bootstrap-catalog.cjs --force
 * Ou deixe CATALOG_BOOTSTRAP_ON_START=true no Railway.
 *
 * Operação completamente idempotente (upsert em tudo).
 */
const { PrismaClient, PriceSource, Category, Unit } = require('@prisma/client')

const prisma = new PrismaClient()

const DEFAULT_CUT = [
  { id: 'inteiro',   name: 'Peça Inteira',    desc: 'Como sai da peça' },
  { id: 'bife_alto', name: 'Bife Alto',        desc: '2–3 cm espessura' },
  { id: 'bife_fino', name: 'Bife Fino',        desc: '0,5–1 cm espessura' },
  { id: 'iscas',     name: 'Iscas / Tiras',    desc: 'Para chapa ou wok' },
]

const FRIO_CUT = [
  { id: 'fatia',  name: 'Fatias',    desc: 'Espessura na hora' },
  { id: 'granel', name: 'A granel',  desc: 'Peso exato' },
  { id: 'pedaco', name: 'Pedaço',    desc: 'Peça inteira ou bloco' },
]

const CATALOG_PRODUCTS = [
  { id: 'picanha-angus',        name: 'Picanha Angus',         category: Category.BOVINO,      unit: Unit.KG,      price: 89.9,  sortOrder: 10,  cutTypes: DEFAULT_CUT, tags: ['🌿 Natural','⏱ 21 dias seco','🐄 Angus','🥇 Certificado'], badge: 'Premium', rating: 4.9, reviews: 142, description: 'Peça inteira de Picanha Angus certificada, maturada a seco por 21 dias.', imageUrl: '/assets/produtos/bovinos/picanha-angus.jpg' },
  { id: 'file-mignon',          name: 'Filé Mignon',           category: Category.BOVINO,      unit: Unit.KG,      price: 119.9, sortOrder: 20,  cutTypes: DEFAULT_CUT, tags: ['🥩 Nobre','🍽️ Alta gastronomia'], badge: 'Nobre', rating: 4.9, reviews: 98, description: 'O corte mais macio. Ideal para medalhões e bifes altos.', imageUrl: '/assets/produtos/bovinos/file-mignon.jpg' },
  { id: 'costela-bovina',       name: 'Costela Bovina',        category: Category.BOVINO,      unit: Unit.KG,      price: 42.9,  sortOrder: 30,  cutTypes: [{ id: 'ripa', name: 'Ripa', desc: 'Costela em tira longa' }, { id: 'janela', name: 'Janela', desc: 'Peça quadrada' }, { id: 'individual', name: 'Individual', desc: 'Ossos separados' }], tags: ['🔥 Brasa','⏱ Assado longo'], badge: null, rating: 4.4, reviews: 67, description: 'Ripa ou janela. Peça especial para assados longos na brasa.', imageUrl: '/assets/produtos/bovinos/costela-bovina.jpg' },
  { id: 'contrafile',           name: 'Contrafilé',            category: Category.BOVINO,      unit: Unit.KG,      price: 54.9,  sortOrder: 40,  cutTypes: DEFAULT_CUT, tags: ['🔥 Versátil','🐄 Bovino'], badge: 'Popular', rating: 4.3, reviews: 201, description: 'Versátil. Bife alto, churrasqueira ou frigideira.', imageUrl: '/assets/produtos/bovinos/contrafile.jpg' },
  { id: 'alcatra',              name: 'Alcatra',               category: Category.BOVINO,      unit: Unit.KG,      price: 48.9,  sortOrder: 50,  cutTypes: DEFAULT_CUT, tags: ['🥩 Clássico','💪 Proteína'], badge: null, rating: 4.4, reviews: 88, description: 'Corte clássico e equilibrado. Baixa gordura, textura firme.', imageUrl: '/assets/produtos/bovinos/alcatra.jpg' },
  { id: 'frango-inteiro',       name: 'Frango Inteiro',        category: Category.FRANGO,      unit: Unit.UNIDADE, price: 18.9,  sortOrder: 60,  cutTypes: [{ id: 'inteiro', name: 'Inteiro', desc: 'Frango completo' }, { id: 'metade', name: 'Metade', desc: 'Dividido ao meio' }, { id: 'ao_molho', name: 'A passarinho', desc: 'Pedaços pequenos' }], tags: ['🐔 Granja'], badge: 'Granja', rating: 4.9, reviews: 310, description: 'Frango inteiro. Corte na hora no balcão.', imageUrl: '/assets/produtos/aves/frango-inteiro.jpg' },
  { id: 'sobrecoxa',            name: 'Sobrecoxa sem Osso',    category: Category.FRANGO,      unit: Unit.KG,      price: 22.9,  sortOrder: 70,  cutTypes: [{ id: 'sem_osso', name: 'Sem osso', desc: 'Desossada na hora' }, { id: 'com_osso', name: 'Com osso', desc: 'Peça inteira' }], tags: ['🐔 Frango'], badge: null, rating: 4.4, reviews: 74, description: 'Sobrecoxa desossada na hora.', imageUrl: '/assets/produtos/aves/sobrecoxa.jpg' },
  { id: 'peito-frango',         name: 'Peito de Frango',       category: Category.FRANGO,      unit: Unit.KG,      price: 24.9,  sortOrder: 80,  cutTypes: [{ id: 'inteiro', name: 'Inteiro', desc: 'Peito completo' }, { id: 'file', name: 'Filé', desc: 'Borboleta aberto' }, { id: 'cubo', name: 'Cubos', desc: 'Para espetinho' }], tags: ['🐔 Leve','💪 Proteína'], badge: 'Leve', rating: 4.9, reviews: 186, description: 'Peito sem osso e sem pele.', imageUrl: '/assets/produtos/aves/peito-de-frango.jpg' },
  { id: 'asa-frango',           name: 'Asa de Frango',         category: Category.FRANGO,      unit: Unit.KG,      price: 16.9,  sortOrder: 90,  cutTypes: [{ id: 'inteiro', name: 'Inteira', desc: 'Asa completa' }, { id: 'tulipa', name: 'Tulipa', desc: 'Ponta cortada' }], tags: ['🐔 Frango','🔥 Brasa'], badge: null, rating: 4.9, reviews: 203, description: 'Asas — tempero da casa opcional.', imageUrl: '/assets/produtos/aves/azinha.jpg' },
  { id: 'tulipa-frango',        name: 'Tulipa de Frango',      category: Category.FRANGO,      unit: Unit.KG,      price: 19.9,  sortOrder: 100, cutTypes: [{ id: 'tulipa', name: 'Tulipa', desc: 'Corte padrão' }], tags: ['🐔 Frango','🔥 Churrasco'], badge: 'Festa', rating: 4.7, reviews: 118, description: 'Asa cortada em tulipa — carne exposta, fácil de segurar.', imageUrl: '/assets/produtos/aves/tulipa.jpg' },
  { id: 'coracao-frango',       name: 'Coração de Frango',     category: Category.FRANGO,      unit: Unit.KG,      price: 14.9,  sortOrder: 110, cutTypes: [{ id: 'granel', name: 'A granel', desc: 'Peso exato' }, { id: 'espeto', name: 'No espeto', desc: 'Montado na hora' }], tags: ['🐔 Frango','🔥 Espetinho'], badge: 'Espetinho', rating: 4.6, reviews: 91, description: 'Coração limpo e fresco.', imageUrl: '/assets/produtos/aves/coracao.jpg' },
  { id: 'costelinha-suina',     name: 'Costelinha Suína',      category: Category.SUINO,       unit: Unit.KG,      price: 34.9,  sortOrder: 120, cutTypes: [{ id: 'rack', name: 'Rack', desc: 'Peça inteira' }, { id: 'individual', name: 'Individual', desc: 'Ossos separados' }], tags: ['🐷 Suíno','🔥 Defumada'], badge: 'Defumada', rating: 4.9, reviews: 156, description: 'Ribs estilo americano.', imageUrl: '/assets/produtos/suinos/costelinha.jpg' },
  { id: 'panceta',              name: 'Panceta',               category: Category.SUINO,       unit: Unit.KG,      price: 32.9,  sortOrder: 130, cutTypes: [{ id: 'inteiro', name: 'Peça inteira', desc: 'Como sai da peça' }, { id: 'fatia', name: 'Fatias', desc: 'Espessura na hora' }, { id: 'cubo', name: 'Cubos', desc: 'Para refogado' }], tags: ['🐷 Suíno','🔥 Brasa'], badge: 'Fresca', rating: 4.8, reviews: 124, description: 'Panceta suína fresca.', imageUrl: '/assets/produtos/suinos/panceta.jpg' },
  { id: 'bacon-suino',          name: 'Bacon',                 category: Category.SUINO,       unit: Unit.KG,      price: 38.9,  sortOrder: 140, cutTypes: [{ id: 'fatia', name: 'Fatias', desc: 'Espessura na hora' }, { id: 'granel', name: 'A granel', desc: 'Peso exato' }], tags: ['🐷 Suíno','🔥 Churrasco'], badge: null, rating: 4.7, reviews: 98, description: 'Bacon suíno em fatias.', imageUrl: '/assets/produtos/suinos/bacon.jpg' },
  { id: 'torresmo',             name: 'Torresmo',              category: Category.SUINO,       unit: Unit.KG,      price: 24.9,  sortOrder: 150, cutTypes: [{ id: 'cubo', name: 'Cubos', desc: 'Pedaços prontos' }, { id: 'granel', name: 'A granel', desc: 'Peso exato' }], tags: ['🐷 Suíno','✨ Crocante'], badge: null, rating: 4.6, reviews: 87, description: 'Torresmo de barriga em cubos.', imageUrl: '/assets/produtos/suinos/torresmo.jpg' },
  { id: 'linguica-aurora',      name: 'Linguiça Aurora',       category: Category.LINGUICA,    unit: Unit.KG,      price: 27.9,  sortOrder: 160, cutTypes: [{ id: 'gomo', name: 'Gomo', desc: 'Porções individuais' }, { id: 'granel', name: 'A granel', desc: 'Peso exato' }], tags: ['🌭 Linguiça','🔥 Churrasco'], badge: 'Toscana', rating: 4.8, reviews: 214, description: 'Linguiça toscana Aurora.', imageUrl: '/assets/produtos/linguicas/aurora.jpg' },
  { id: 'linguica-perdigao',    name: 'Linguiça Perdigão',     category: Category.LINGUICA,    unit: Unit.KG,      price: 26.9,  sortOrder: 170, cutTypes: [{ id: 'gomo', name: 'Gomo', desc: 'Porções individuais' }, { id: 'granel', name: 'A granel', desc: 'Peso exato' }], tags: ['🌭 Linguiça','🔥 Brasa'], badge: 'Calabresa', rating: 4.7, reviews: 178, description: 'Linguiça calabresa Perdigão.', imageUrl: '/assets/produtos/linguicas/perdigao.jpg' },
  { id: 'linguica-sadia',       name: 'Linguiça Sadia',        category: Category.LINGUICA,    unit: Unit.KG,      price: 25.9,  sortOrder: 180, cutTypes: [{ id: 'gomo', name: 'Gomo', desc: 'Porções individuais' }, { id: 'granel', name: 'A granel', desc: 'Peso exato' }], tags: ['🌭 Linguiça','🏠 Família'], badge: null, rating: 4.6, reviews: 142, description: 'Linguiça Sadia.', imageUrl: '/assets/produtos/linguicas/sadia.jpg' },
  { id: 'salmao-posta',         name: 'Salmão em Posta',       category: Category.PEIXE,       unit: Unit.KG,      price: 79.9,  sortOrder: 190, cutTypes: [{ id: 'posta', name: 'Posta', desc: '3–4 cm espessura' }, { id: 'file', name: 'Filé', desc: 'Sem espinha' }, { id: 'sashimi', name: 'Sashimi', desc: '0,5 cm, fatias finas' }], tags: ['🐟 Atlântico','❄️ Fresco'], badge: 'Noruega', rating: 4.9, reviews: 124, description: 'Atlântico fresco. Cortado na espessura que você quiser.', imageUrl: '/assets/produtos/peixes/salmao-posta.jpg' },
  { id: 'camarao-vg',           name: 'Camarão VG',            category: Category.FRUTOS_DO_MAR, unit: Unit.KG,    price: 94.9,  sortOrder: 200, cutTypes: [{ id: 'limpo', name: 'Limpo', desc: 'Descascado e sem veia' }, { id: 'casca', name: 'Com casca', desc: 'Inteiro com casca' }], tags: ['🦐 Frutos do mar','❄️ Fresco'], badge: 'VG limpo', rating: 4.9, reviews: 53, description: 'Descascado e limpo na hora. Fresco, nunca congelado.', imageUrl: '/assets/produtos/peixes/camarao-vg.jpg', sku: 'CORTE-camarao-vg' },
  { id: 'presunto-coimbra',     name: 'Presunto Coimbra',      category: Category.FRIOS,       unit: Unit.KG,      price: 89.9,  sortOrder: 210, cutTypes: FRIO_CUT, tags: ['🥓 Presunto','✨ Fatiado na hora'], badge: 'Fatiado', rating: 4.8, reviews: 167, description: 'Presunto fatiado na hora.', imageUrl: '/assets/produtos/frios/presunto.jpg' },
  { id: 'mussarela',            name: 'Muçarela',              category: Category.FRIOS,       unit: Unit.KG,      price: 42.9,  sortOrder: 220, cutTypes: FRIO_CUT, tags: ['🧀 Queijo','🏠 Dia a dia'], badge: 'Fresco', rating: 4.7, reviews: 203, description: 'Queijo muçarela fresco.', imageUrl: '/assets/produtos/frios/mussarela.jpg' },
  { id: 'peito-de-peru',        name: 'Peito de Peru',         category: Category.FRIOS,       unit: Unit.KG,      price: 38.9,  sortOrder: 230, cutTypes: FRIO_CUT, tags: ['🦃 Peru','💪 Leve'], badge: null, rating: 4.6, reviews: 128, description: 'Peito de peru magro, fatiado no balcão.', imageUrl: '/assets/produtos/frios/peito-de-peru.jpg' },
  { id: 'salame-tipo-italiano', name: 'Salame Tipo Italiano',  category: Category.FRIOS,       unit: Unit.KG,      price: 54.9,  sortOrder: 240, cutTypes: FRIO_CUT, tags: ['🥓 Salame','🍷 Tábua'], badge: 'Italiano', rating: 4.7, reviews: 94, description: 'Salame selecionado.', imageUrl: '/assets/produtos/frios/salame.jpg' },
  { id: 'queijo-prato',         name: 'Queijo Prato',          category: Category.FRIOS,       unit: Unit.KG,      price: 36.9,  sortOrder: 250, cutTypes: FRIO_CUT, tags: ['🧀 Queijo','🏠 Família'], badge: null, rating: 4.5, reviews: 156, description: 'Queijo prato tradicional.', imageUrl: '/assets/produtos/frios/queijo-prato.jpg' },
  { id: 'wagyu-ribeye',         name: 'Wagyu Ribeye A5',       category: Category.ESPECIAL,    unit: Unit.KG,      price: 390,   sortOrder: 260, cutTypes: [{ id: 'bife', name: 'Bife', desc: '2 cm espessura' }, { id: 'inteiro', name: 'Peça', desc: 'Peça inteira' }], tags: ['🥇 Premium','🇯🇵 Importado','⭐ A5'], badge: 'Wagyu A5', rating: 5, reviews: 18, description: 'Importado do Japão. Marmoreio intenso.', imageUrl: '/assets/produtos/bovinos/wagyu-ribeye.jpg' },
]

async function upsertProducts() {
  let count = 0
  for (const p of CATALOG_PRODUCTS) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: {
        name: p.name, category: p.category, unit: p.unit,
        description: p.description, imageUrl: p.imageUrl,
        badge: p.badge ?? null, rating: p.rating, reviewCount: p.reviews,
        tags: p.tags, cutTypes: p.cutTypes, sortOrder: p.sortOrder,
        sku: p.sku ?? `CORTE-${p.id}`, active: true,
      },
      create: {
        id: p.id, name: p.name, category: p.category, unit: p.unit,
        description: p.description, imageUrl: p.imageUrl,
        badge: p.badge ?? null, rating: p.rating, reviewCount: p.reviews,
        tags: p.tags, cutTypes: p.cutTypes, sortOrder: p.sortOrder,
        sku: p.sku ?? `CORTE-${p.id}`,
      },
    })
    count++
  }
  return count
}

async function seedStoreProducts(storeId) {
  let count = 0
  for (const p of CATALOG_PRODUCTS) {
    await prisma.storeProduct.upsert({
      where: { storeId_productId: { storeId, productId: p.id } },
      update: { available: true },
      create: {
        storeId, productId: p.id, price: p.price, available: true,
        externalProductCode: p.sku ?? `CORTE-${p.id}`,
        priceSource: PriceSource.MANUAL,
      },
    })
    count++
  }
  return count
}

async function main() {
  const onStart = process.env.CATALOG_BOOTSTRAP_ON_START === 'true'
  if (!onStart && process.argv[2] !== '--force') {
    console.log('[bootstrap-catalog] Defina CATALOG_BOOTSTRAP_ON_START=true ou passe --force')
    return
  }

  // 1. Garante que todos os produtos existem na tabela Product
  const productCount = await upsertProducts()
  console.log(`[bootstrap-catalog] ${productCount} produto(s) sincronizados na tabela Product`)

  // 2. Vincula catálogo a todas as lojas ativas que ainda não têm produtos
  const stores = await prisma.store.findMany({ where: { active: true } })
  console.log(`[bootstrap-catalog] Verificando ${stores.length} loja(s)...`)

  for (const store of stores) {
    const existing = await prisma.storeProduct.count({ where: { storeId: store.id } })
    if (existing >= CATALOG_PRODUCTS.length) {
      console.log(`[bootstrap-catalog] ${store.slug} — catálogo completo (${existing} produtos), pulando`)
      continue
    }
    const count = await seedStoreProducts(store.id)
    console.log(`[bootstrap-catalog] ${store.slug} — ${count} produto(s) vinculados`)
  }

  console.log('[bootstrap-catalog] Concluído.')
}

main()
  .catch((e) => {
    console.error('[bootstrap-catalog] Falhou:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
