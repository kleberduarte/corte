/**
 * Limpeza do banco antes da implantação para clientes.
 *
 * Remove pedidos de teste, lojas de desenvolvimento (corte, st-marche-*) e lojas inativas.
 * Mantém o catálogo global de produtos e as lojas ativas de produção.
 *
 * Uso:
 *   npm run db:predeploy-cleanup -- --confirm
 *   npm run db:predeploy-cleanup -- --confirm --keep-stores=st-marche-alphaville
 *   npm run db:predeploy-cleanup -- --confirm --remove-all-stores
 */

import { PrismaClient } from '@prisma/client'
import { seedCatalogForStore } from '../src/services/catalog-seed.service'

const prisma = new PrismaClient()

const DEV_STORE_SLUG = 'corte'
const DEV_STORE_PREFIXES = ['st-marche-']

function isDevStore(slug: string) {
  if (slug === DEV_STORE_SLUG) return true
  return DEV_STORE_PREFIXES.some((prefix) => slug.startsWith(prefix))
}

function parseArgs() {
  const args = process.argv.slice(2)
  const confirmed = args.includes('--confirm')
  const removeAllStores = args.includes('--remove-all-stores')
  const keepStoresArg = args.find((a) => a.startsWith('--keep-stores='))
  const keepStores = keepStoresArg
    ? keepStoresArg.split('=')[1]!.split(',').map((s) => s.trim()).filter(Boolean)
    : null

  return { confirmed, removeAllStores, keepStores }
}

async function purgeOrders() {
  const items = await prisma.orderItem.deleteMany()
  const orders = await prisma.order.deleteMany()
  console.log(`✓ Pedidos removidos: ${orders.count} (${items.count} itens)`)
}

async function removeDevAndInactiveStores(keepStores: string[] | null, removeAllStores: boolean) {
  if (removeAllStores) {
    const removed = await prisma.store.deleteMany()
    console.log(`✓ Todas as lojas removidas: ${removed.count}`)
    return
  }

  const keep = new Set(keepStores ?? [])
  const stores = await prisma.store.findMany({ select: { id: true, slug: true, active: true } })

  const toRemove = stores.filter((store) => {
    if (keep.has(store.slug)) return false
    if (isDevStore(store.slug)) return true
    if (!store.active) return true
    return false
  })

  if (toRemove.length === 0) {
    console.log('✓ Nenhuma loja extra para remover')
    return
  }

  for (const store of toRemove) {
    await prisma.store.delete({ where: { id: store.id } })
    console.log(`✓ Loja removida: ${store.slug}`)
  }
}

async function reseedCatalogForActiveStores() {
  const stores = await prisma.store.findMany({ where: { active: true }, select: { id: true, slug: true } })

  for (const store of stores) {
    const count = await seedCatalogForStore(prisma, store.id)
    console.log(`✓ Catálogo vinculado à loja ${store.slug}: ${count} produto(s)`)
  }
}

async function summarize() {
  const [stores, orders, products, admins, operators] = await Promise.all([
    prisma.store.findMany({ select: { slug: true, name: true, active: true } }),
    prisma.order.count(),
    prisma.product.count(),
    prisma.admin.count(),
    prisma.operator.count(),
  ])

  console.log('\n--- Estado final ---')
  console.log(`Pedidos: ${orders}`)
  console.log(`Produtos (catálogo global): ${products}`)
  console.log(`Admins: ${admins} | Operadores: ${operators}`)
  console.log('Lojas restantes:')
  for (const store of stores) {
    console.log(`  • ${store.slug} — ${store.name}${store.active ? '' : ' (inativa)'}`)
  }
}

async function main() {
  const { confirmed, removeAllStores, keepStores } = parseArgs()

  if (!confirmed) {
    console.error('Operação destrutiva. Confirme com: npm run db:predeploy-cleanup -- --confirm')
    process.exit(1)
  }

  console.log('Limpando ambiente para implantação...\n')
  await purgeOrders()
  await removeDevAndInactiveStores(keepStores, removeAllStores)
  await reseedCatalogForActiveStores()
  await summarize()
  console.log('\nPróximos passos:')
  console.log('  1. Defina ADMIN_BOOTSTRAP_PASSWORD e ADMIN_BOOTSTRAP_FORCE=true no deploy')
  console.log('  2. Cadastre operadores reais pelo painel admin')
  console.log('  3. Limpe localStorage nos totens (corte:orders, corte:operator, corte:admin)')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
