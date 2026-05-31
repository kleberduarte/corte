import { z } from 'zod'

export const adminLoginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
})

export const createStoreSchema = z.object({
  name:    z.string().min(2),
  chain:   z.enum(['PAO_DE_ACUCAR', 'EXTRA', 'VIOLETA', 'CARREFOUR', 'ATACADAO', 'ASSAI', 'SUPERMERCADOS_MATEUS', 'BIG', 'PREZUNIC', 'MUNDIAL', 'SONDA', 'CONDOR', 'SUPER_MUFFATO', 'ZAFFARI', 'BOURBON', 'COOP', 'HIROTA', 'REDE_SMART', 'CORTE_SUPERMERCADO', 'OUTROS']),
  slug:    z.string().min(2).regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens'),
  timezone: z.string().default('America/Sao_Paulo'),
  config: z.object({
    primaryColor:      z.string().default('#C0272D'),
    primaryDark:       z.string().default('#7A1015'),
    accentColor:       z.string().default('#F5EDDB'),
    logoUrl:           z.string().url().optional().nullable(),
    fontFamily:        z.string().optional().nullable(),
    morningOpen:       z.string().default('08:00'),
    morningClose:      z.string().default('12:00'),
    afternoonOpen:     z.string().default('14:00'),
    afternoonClose:    z.string().default('22:00'),
    slotIntervalMin:   z.number().int().default(30),
    minLeadTimeMin:    z.number().int().default(30),
    maxOrdersPerSlot:  z.number().int().default(5),
    inactivityTimeout: z.number().int().default(90),
  }),
})

export const updateStoreSchema = createStoreSchema.partial().omit({ slug: true })

export const toggleStoreSchema = z.object({
  active: z.boolean(),
})

export const createOperatorSchema = z.object({
  name:     z.string().min(2),
  email:    z.string().email(),
  password: z.string().min(6),
  role:     z.enum(['OPERATOR', 'MANAGER']).default('OPERATOR'),
  storeId:  z.string().min(1),
})

export const resetPasswordSchema = z.object({
  password: z.string().min(6),
})

export type AdminLoginInput       = z.infer<typeof adminLoginSchema>
export type CreateStoreInput      = z.infer<typeof createStoreSchema>
export type UpdateStoreInput      = z.infer<typeof updateStoreSchema>
export type CreateOperatorInput   = z.infer<typeof createOperatorSchema>
export type ResetPasswordInput    = z.infer<typeof resetPasswordSchema>
