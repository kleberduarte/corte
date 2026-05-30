import { z } from 'zod'

export const upsertStoreProductSchema = z.object({
  price: z.number().positive('Preço deve ser maior que zero'),
  available: z.boolean().default(true),
})

export type UpsertStoreProductInput = z.infer<typeof upsertStoreProductSchema>
