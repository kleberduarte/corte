// Seed da loja Corte — catálogo em banco (backend/src/data/catalog.seed.ts)
// Execute: npm run db:seed

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { Chain } from '@prisma/client'
import { seedCatalogForStore } from '../src/services/catalog-seed.service'

const prisma = new PrismaClient()

const DEV_STORE_SLUG = 'corte'

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

async function main() {
  console.log('Seeding...')
  await cleanupDevStores()
  await seedAdmin()

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

  const count = await seedCatalogForStore(prisma, store.id)
  console.log(`✓ ${count} produtos criados/atualizados no catálogo`)
  console.log('✓ Loja:', store.slug)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
