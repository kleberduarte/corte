import { PrismaClient } from '@prisma/client'
import { env } from './env'

// Singleton do Prisma — evita múltiplas conexões em desenvolvimento com hot-reload
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
  })

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Retorna um cliente Prisma com o storeId da sessão definido para o RLS.
// Use este client em TODOS os repositories que acessam dados por loja.
// O PostgreSQL vai rejeitar automaticamente qualquer linha de outra loja.
export function prismaForStore(storeId: string) {
  return prisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ args, query }) {
          return prisma.$transaction(async (tx) => {
            await tx.$executeRaw`SELECT set_config('app.current_store_id', ${storeId}, true)`
            return query(args)
          })
        },
      },
    },
  })
}
