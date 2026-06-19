import { z } from 'zod'

const SAFE_PRINTER_NAME = /^[\w\s\-\.]+$/

export const printReceiptSchema = z.object({
  pickupCode:    z.string(),
  slotTime:      z.string(),
  customerPhone: z.string().optional(),
  qrDataUrl:     z.string()
    .max(100_000, 'qrDataUrl excede tamanho máximo permitido')
    .regex(/^data:image\/(png|jpeg|gif|webp);base64,[A-Za-z0-9+/=]+$/, 'qrDataUrl deve ser um data URL de imagem válido')
    .optional(),
  printerName:   z.string().regex(SAFE_PRINTER_NAME, 'Nome de impressora inválido').optional(),
  items: z.array(z.object({
    productName:    z.string(),
    cutType:        z.string(),
    weightKg:       z.number(),
    estimatedPrice: z.number(),
  })),
})

export type PrintReceiptInput = z.infer<typeof printReceiptSchema>
