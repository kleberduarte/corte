// Seed da loja Corte — espelha o catálogo do frontend (products.ts)
// Remove outras lojas de dev e recria operador/admin. Execute: npm run db:seed

import { PrismaClient, Chain, Category, Unit } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const DEV_STORE_SLUG = 'corte'

/** Remove lojas que não sejam a Corte (pedidos, operadores e configs em cascata). */
async function cleanupDevStores() {
  const removed = await prisma.store.deleteMany({
    where: { slug: { not: DEV_STORE_SLUG } },
  })
  if (removed.count > 0) {
    console.log(`✓ Removidas ${removed.count} loja(s) de desenvolvimento (mantida: ${DEV_STORE_SLUG})`)
  }
}

async function seedAdmin() {
  const passwordHash = await bcrypt.hash('corte@admin123', 10)
  await prisma.admin.upsert({
    where: { email: 'admin@corte.com.br' },
    update: { passwordHash, active: true },
    create: {
      name: 'Admin',
      email: 'admin@corte.com.br',
      passwordHash,
    },
  })
  console.log('✓ Admin criado: admin@corte.com.br / corte@admin123')
}

// Produtos espelhados do frontend src/data/products.ts
// O id aqui é o mesmo usado no frontend — garante que orders do totem referenciem o produto correto
const PRODUCTS: { id: string; name: string; category: Category; unit: Unit; price: number }[] = [
  // Bovino
  { id: 'picanha-angus',   name: 'Picanha Angus',    category: Category.BOVINO,  unit: Unit.KG,      price: 89.90 },
  { id: 'file-mignon',     name: 'Filé Mignon',       category: Category.BOVINO,  unit: Unit.KG,      price: 119.90 },
  { id: 'costela-bovina',  name: 'Costela Bovina',    category: Category.BOVINO,  unit: Unit.KG,      price: 42.90 },
  { id: 'contrafile',      name: 'Contrafilé',         category: Category.BOVINO,  unit: Unit.KG,      price: 54.90 },
  { id: 'alcatra',         name: 'Alcatra',            category: Category.BOVINO,  unit: Unit.KG,      price: 48.90 },
  // Aves
  { id: 'frango-inteiro',  name: 'Frango Inteiro',    category: Category.FRANGO,  unit: Unit.UNIDADE, price: 18.90 },
  { id: 'sobrecoxa',       name: 'Sobrecoxa sem Osso',category: Category.FRANGO,  unit: Unit.KG,      price: 22.90 },
  { id: 'peito-frango',    name: 'Peito de Frango',   category: Category.FRANGO,  unit: Unit.KG,      price: 24.90 },
  { id: 'asa-frango',      name: 'Asa de Frango',     category: Category.FRANGO,  unit: Unit.KG,      price: 16.90 },
  { id: 'tulipa-frango',   name: 'Tulipa de Frango',  category: Category.FRANGO,  unit: Unit.KG,      price: 19.90 },
  { id: 'coracao-frango',  name: 'Coração de Frango', category: Category.FRANGO,  unit: Unit.KG,      price: 14.90 },
  // Suíno
  { id: 'costelinha-suina',name: 'Costelinha Suína',  category: Category.SUINO,   unit: Unit.KG,      price: 34.90 },
  { id: 'panceta',         name: 'Panceta',            category: Category.SUINO,   unit: Unit.KG,      price: 32.90 },
  { id: 'bacon-suino',     name: 'Bacon',              category: Category.SUINO,   unit: Unit.KG,      price: 38.90 },
  { id: 'torresmo',        name: 'Torresmo',           category: Category.SUINO,   unit: Unit.KG,      price: 24.90 },
  // Linguiças
  { id: 'linguica-aurora', name: 'Linguiça Aurora',   category: Category.LINGUICA,unit: Unit.KG,      price: 27.90 },
  { id: 'linguica-perdigao',name:'Linguiça Perdigão', category: Category.LINGUICA,unit: Unit.KG,      price: 26.90 },
  { id: 'linguica-sadia',  name: 'Linguiça Sadia',    category: Category.LINGUICA,unit: Unit.KG,      price: 25.90 },
  // Peixe
  { id: 'salmao-posta',    name: 'Salmão em Posta',   category: Category.PEIXE,   unit: Unit.KG,      price: 79.90 },
  // Frutos do mar
  { id: 'camarao-vg',      name: 'Camarão VG',        category: Category.FRUTOS_DO_MAR, unit: Unit.KG, price: 94.90 },
  // Especial
  { id: 'wagyu-ribeye',    name: 'Wagyu Ribeye A5',   category: Category.ESPECIAL, unit: Unit.KG,     price: 390.00 },
]

async function main() {
  console.log('Seeding...')
  await cleanupDevStores()
  await seedAdmin()

  // Loja Corte — alinhada ao stores.json
  const store = await prisma.store.upsert({
    where: { slug: DEV_STORE_SLUG },
    update: { name: 'Corte', active: true },
    create: {
      name: 'Corte',
      chain: Chain.CORTE_SUPERMERCADO,
      slug: DEV_STORE_SLUG,
      config: {
        create: {
          morningOpen: '08:00',
          morningClose: '12:00',
          afternoonOpen: '14:00',
          afternoonClose: '22:00',
          slotIntervalMin: 30,
          maxOrdersPerSlot: 5,
          primaryColor: '#C0272D',
          primaryDark: '#7A1015',
          accentColor: '#F5EDDB',
        },
      },
    },
  })

  const operatorPasswordHash = await bcrypt.hash('corte@operador123', 10)
  await prisma.operator.upsert({
    where: { storeId_email: { storeId: store.id, email: 'operador@corte.com.br' } },
    update: {
      name: 'Operador',
      passwordHash: operatorPasswordHash,
      active: true,
      role: 'OPERATOR',
    },
    create: {
      storeId: store.id,
      name: 'Operador',
      email: 'operador@corte.com.br',
      passwordHash: operatorPasswordHash,
      role: 'OPERATOR',
    },
  })

  // Catálogo global + preços da loja Corte
  for (const p of PRODUCTS) {
    const product = await prisma.product.upsert({
      where: { id: p.id },
      update: { name: p.name, category: p.category },
      create: { id: p.id, name: p.name, category: p.category, unit: p.unit },
    })

    await prisma.storeProduct.upsert({
      where: { storeId_productId: { storeId: store.id, productId: product.id } },
      update: { price: p.price },
      create: { storeId: store.id, productId: product.id, price: p.price, available: true },
    })
  }

  console.log(`✓ ${PRODUCTS.length} produtos criados/atualizados`)
  console.log(`✓ Loja: ${store.slug}`)
  console.log(`✓ Operador: operador@corte.com.br / corte@operador123`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
