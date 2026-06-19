import { z } from 'zod'

export const createOrderSchema = z.object({
  customerPhone: z.string().regex(/^\+?[\d\s\-\(\)]{8,20}$/, 'Telefone inválido').optional(),
  pickupMode: z.enum(['SCHEDULED', 'IMMEDIATE']),
  scheduledAt: z.string().datetime({ offset: true, message: 'scheduledAt deve ser uma data ISO 8601 válida (ex: 2025-01-15T14:30:00-03:00)' }).optional(),
  notes: z.string().max(500).optional(),
  priority: z.boolean().optional(),
  items: z.array(
    z.object({
      productId: z.string().min(1, 'ID de produto obrigatório'),
      cutType: z.string().max(100).optional(),
      quantity: z.number().positive('Quantidade deve ser maior que zero'),
    }),
  ).default([]),
})
  .refine(
    (data) => data.pickupMode === 'IMMEDIATE' || !!data.scheduledAt,
    { message: 'scheduledAt é obrigatório para pedidos agendados', path: ['scheduledAt'] },
  )

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED']),
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>
