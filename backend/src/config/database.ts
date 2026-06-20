import { PrismaClient } from '@prisma/client'
import { env } from './env'

// Singleton do Prisma — evita múltiplas conexões em desenvolvimento com hot-reload.
// connection_limit: garante que este processo não consuma mais que N conexões do pool do Postgres.
// Sem isso, N instâncias do serviço × pool padrão do Prisma (10) pode estourar o max_connections.
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function buildDatabaseUrl(): string {
  const url = new URL(env.DATABASE_URL)
  url.searchParams.set('connection_limit', String(env.DATABASE_CONNECTION_LIMIT))
  url.searchParams.set('pool_timeout', '10')
  return url.toString()
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: buildDatabaseUrl(),
    log: env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
  })

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Retorna um cliente Prisma com o storeId da sessão definido para o RLS.
// Use este client em repositories que acessam dados por loja quando RLS estiver ativo.
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
