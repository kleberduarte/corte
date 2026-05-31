import PDFDocument from 'pdfkit'
import { print as printPdf } from 'pdf-to-printer'
import { writeFileSync, unlinkSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'

export type ReceiptData = {
  storeName: string
  pickupCode: string
  slotTime: string
  customerPhone?: string
  items: {
    productName: string
    cutType: string
    weightKg: number
    estimatedPrice: number
  }[]
}

function pickupLabel(slotTime: string): string {
  if (slotTime === 'Imediata') return 'Escolher e Aguardar'
  if (slotTime === 'Balcão') return 'Atendimento no balcão'
  return `Hoje · ${slotTime}`
}

function buildPdf(data: ReceiptData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: [226.77, 841.89], margin: 11.34 }) // 80mm
    const chunks: Buffer[] = []
    doc.on('data', (c: Buffer) => chunks.push(c))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const W = 226.77 - 22.68 // largura útil
    const x = 11.34
    let y = 11.34

    const text = (str: string, opts: { bold?: boolean; size?: number; align?: 'left' | 'center' } = {}) => {
      doc.font(opts.bold ? 'Courier-Bold' : 'Courier').fontSize(opts.size ?? 8)
        .text(str, x, y, { width: W, align: opts.align ?? 'left' })
      y = doc.y + 2
    }

    const dashed = () => {
      doc.moveTo(x, y).lineTo(x + W, y).dash(2, { space: 2 }).stroke().undash()
      y += 6
    }

    text('CORTE · Açougue Inteligente', { bold: true, size: 9, align: 'center' })
    text(data.storeName, { size: 7, align: 'center' })
    dashed()

    const title = data.items.length === 0 ? 'SENHA DE BALCÃO'
      : data.slotTime === 'Imediata' ? 'PEDIDO IMEDIATO' : 'PEDIDO AGENDADO'
    text(title, { bold: true, size: 9, align: 'center' })
    dashed()

    if (data.items.length === 0) {
      text('Pedido: Atendimento presencial no balcão')
    } else {
      data.items.forEach((item, idx) => {
        if (data.items.length > 1) text(`ITEM ${idx + 1}`, { bold: true, size: 7 })
        text(`Corte: ${item.productName}`)
        text(`Tipo: ${item.cutType}`)
        text(`Peso: ~${item.weightKg}kg`)
        text(`Valor est.: R$ ${item.estimatedPrice.toFixed(2).replace('.', ',')}`)
        if (idx < data.items.length - 1) dashed()
      })
    }

    dashed()
    text(`Retirada: ${pickupLabel(data.slotTime)}`)
    if (data.customerPhone) text(`WhatsApp: ${data.customerPhone}`)
    dashed()

    text('Código de retirada', { size: 7, align: 'center' })
    y += 2
    doc.font('Courier-Bold').fontSize(18)
      .text(data.pickupCode, x, y, { width: W, align: 'center', characterSpacing: 4 })
    y = doc.y + 4
    dashed()

    text('Apresente este comprovante no balcão', { size: 7, align: 'center' })
    const now = new Date()
    const dateStr = now.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    text(`${dateStr} · ${timeStr}`, { size: 7, align: 'center' })

    doc.end()
  })
}

export async function printReceipt(data: ReceiptData, printerName?: string): Promise<void> {
  const pdfBuffer = await buildPdf(data)
  const tmpPath = join(tmpdir(), `corte-receipt-${Date.now()}.pdf`)
  writeFileSync(tmpPath, pdfBuffer)
  try {
    await printPdf(tmpPath, printerName ? { printer: printerName } : {})
  } finally {
    try { unlinkSync(tmpPath) } catch { /* já removido */ }
  }
}
