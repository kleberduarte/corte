/**
 * Garante um admin no banco (produção: tabela admins vazia após migrate).
 * Rode manualmente: node prisma/bootstrap-admin.cjs
 * Ou deixe ADMIN_BOOTSTRAP_ON_START=true no Railway.
 */
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const onStart = process.env.ADMIN_BOOTSTRAP_ON_START === 'true'
  const force = process.env.ADMIN_BOOTSTRAP_FORCE === 'true'
  const email = (process.env.ADMIN_BOOTSTRAP_EMAIL || 'admin@corte.com.br').toLowerCase().trim()
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD || 'corte@admin123'
  const name = process.env.ADMIN_BOOTSTRAP_NAME || 'Admin'
  const rounds = parseInt(process.env.BCRYPT_ROUNDS || '12', 10)

  const count = await prisma.admin.count()
  if (!onStart && !force && count > 0) {
    console.log('[bootstrap-admin] Admin(s) já existem — nada a fazer (use ADMIN_BOOTSTRAP_FORCE=true para resetar senha)')
    return
  }
  if (onStart && count > 0 && !force) {
    return
  }

  const passwordHash = await bcrypt.hash(password, rounds)
  await prisma.admin.upsert({
    where: { email },
    update: { name, passwordHash, active: true },
    create: { name, email, passwordHash, active: true },
  })

  console.log(`[bootstrap-admin] OK — ${email} (senha conforme ADMIN_BOOTSTRAP_PASSWORD ou padrão do seed)`)
}

main()
  .catch((e) => {
    console.error('[bootstrap-admin] Falhou:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
