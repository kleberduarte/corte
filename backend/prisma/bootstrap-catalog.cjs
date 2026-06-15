/**
 * Garante que todas as lojas ativas tenham o catálogo de produtos vinculado.
 * Rode manualmente: node prisma/bootstrap-catalog.cjs
 * Ou deixe CATALOG_BOOTSTRAP_ON_START=true no Railway.
 *
 * Lojas que já possuem produtos não são afetadas (upsert idempotente).
 */
const { PrismaClient, PriceSource } = require('@prisma/client')

const prisma = new PrismaClient()

// Catálogo mestre em CommonJS (espelho do catalog.seed.ts)
const CATALOG_PRODUCTS = [
  { id: 'picanha-angus',     price: 89.9  },
  { id: 'file-mignon',       price: 119.9 },
  { id: 'costela-bovina',    price: 42.9  },
  { id: 'contrafile',        price: 54.9  },
  { id: 'alcatra',           price: 48.9  },
  { id: 'frango-inteiro',    price: 18.9  },
  { id: 'sobrecoxa',         price: 22.9  },
  { id: 'peito-frango',      price: 24.9  },
  { id: 'asa-frango',        price: 16.9  },
  { id: 'tulipa-frango',     price: 19.9  },
  { id: 'coracao-frango',    price: 14.9  },
  { id: 'costelinha-suina',  price: 34.9  },
  { id: 'panceta',           price: 32.9  },
  { id: 'bacon-suino',       price: 38.9  },
  { id: 'torresmo',          price: 24.9  },
  { id: 'linguica-aurora',   price: 27.9  },
  { id: 'linguica-perdigao', price: 26.9  },
  { id: 'linguica-sadia',    price: 25.9  },
  { id: 'salmao-posta',      price: 79.9  },
  { id: 'camarao-vg',        price: 94.9  },
  { id: 'presunto-coimbra',  price: 89.9  },
  { id: 'mussarela',         price: 42.9  },
  { id: 'peito-de-peru',     price: 38.9  },
  { id: 'salame-tipo-italiano', price: 54.9 },
  { id: 'queijo-prato',      price: 36.9  },
  { id: 'wagyu-ribeye',      price: 390   },
]

async function seedCatalogForStore(storeId) {
  let count = 0
  for (const p of CATALOG_PRODUCTS) {
    const product = await prisma.product.findUnique({ where: { id: p.id } })
    if (!product) continue // produto não existe no banco ainda

    await prisma.storeProduct.upsert({
      where: { storeId_productId: { storeId, productId: p.id } },
      update: { available: true },
      create: {
        storeId,
        productId: p.id,
        price: p.price,
        available: true,
        externalProductCode: `CORTE-${p.id}`,
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

  const stores = await prisma.store.findMany({ where: { active: true } })
  console.log(`[bootstrap-catalog] Verificando ${stores.length} loja(s)...`)

  for (const store of stores) {
    const existing = await prisma.storeProduct.count({ where: { storeId: store.id } })
    if (existing > 0) {
      console.log(`[bootstrap-catalog] ${store.slug} — já tem ${existing} produto(s), pulando`)
      continue
    }
    const count = await seedCatalogForStore(store.id)
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
