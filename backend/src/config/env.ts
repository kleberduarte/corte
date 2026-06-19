import path from 'path'
import { config as loadEnv } from 'dotenv'
import { z } from 'zod'

// Carrega backend/.env (Node não lê .env sozinho)
loadEnv({ path: path.resolve(__dirname, '../../.env'), quiet: true })

const envSchema = z.object({
  NODE_ENV:     z.enum(['development', 'production', 'test']).default('development'),
  PORT:         z.coerce.number().default(3333),
  DATABASE_URL: z.string().url('DATABASE_URL inválida'),
  JWT_SECRET:   z.string().min(32, 'JWT_SECRET deve ter no mínimo 32 caracteres'),
  JWT_EXPIRES_IN: z.string().default('8h'),
  BCRYPT_ROUNDS:  z.coerce.number().default(12),
  CORS_ORIGINS:   z.string().default('http://localhost:5173,http://localhost:4173,http://127.0.0.1:4173'),
  // Nível de log — em produção use "warn" para reduzir volume; "info" em dev
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  // Limite máximo de conexões que este processo pode abrir no banco.
  // Em multi-instância: DATABASE_CONNECTION_LIMIT × nInstâncias ≤ max_connections do Postgres (padrão 100)
  // Railway free tier: 25 conexões → 5 instâncias × 5 conexões
  DATABASE_CONNECTION_LIMIT: z.coerce.number().default(5),
  // Nome da impressora padrão para recibos — deve conter apenas caracteres seguros
  PRINTER_NAME: z.string().regex(/^[\w\s\-\.]+$/, 'PRINTER_NAME contém caracteres inválidos').optional(),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('Variáveis de ambiente inválidas:')
  console.error(parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const env = parsed.data
