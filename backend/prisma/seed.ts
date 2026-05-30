// Seed de desenvolvimento — espelha exatamente o catálogo do frontend (products.ts)
// Execute com: npm run db:seed

import { PrismaClient, Chain, Category, Unit } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

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

  // Loja de desenvolvimento — Violeta
  const store = await prisma.store.upsert({
    where: { slug: 'violeta-teste' },
    update: {},
    create: {
      name: 'Violeta Teste',
      chain: Chain.VIOLETA,
      slug: 'violeta-teste',
      config: {
        create: {
          openingTime: '08:00',
          closingTime: '22:00',
          slotIntervalMin: 15,
          maxOrdersPerSlot: 5,
          primaryColor: '#6B21A8',
        },
      },
    },
  })

  // Operador admin
  await prisma.operator.upsert({
    where: { storeId_email: { storeId: store.id, email: 'admin@violeta.com' } },
    update: {},
    create: {
      storeId: store.id,
      name: 'Admin',
      email: 'admin@violeta.com',
      passwordHash: await bcrypt.hash('admin123', 10),
      role: 'MANAGER',
    },
  })

  // Produtos globais + preços para a loja de teste
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
  console.log(`✓ Login: admin@violeta.com / admin123`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
