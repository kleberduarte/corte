/**
 * Servidor de impressão local do totem — porta 3334
 * Roda APENAS no Windows do totem. Recebe os dados do pedido,
 * gera o PDF com pdfkit e imprime na impressora padrão via pdf-to-printer.
 * Não usa banco de dados, não usa JWT — só imprime.
 */
import http from 'http'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const PDFDocument = require('pdfkit')
const { print: printPdf } = require('pdf-to-printer')
const { writeFileSync, unlinkSync } = require('fs')
const { tmpdir } = require('os')
const { join } = require('path')

const PORT = 3334
const PRINTER_NAME = process.env.PRINTER_NAME // opcional — usa padrão se vazio

// ── Geração do PDF ────────────────────────────────────────────────────────────

function pickupLabel(slotTime) {
  if (slotTime === 'Imediata') return 'Escolher e Aguardar'
  if (slotTime === 'Balcão') return 'Atendimento no balcão'
  return `Hoje · ${slotTime}`
}

function buildPdf(data) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: [226.77, 841.89], margin: 11.34 }) // 80mm
    const chunks = []
    doc.on('data', c => chunks.push(c))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const W = 226.77 - 22.68
    const x = 11.34
    let y = 11.34

    const txt = (str, { bold = false, size = 8, align = 'left' } = {}) => {
      doc.font(bold ? 'Courier-Bold' : 'Courier').fontSize(size)
        .text(str, x, y, { width: W, align })
      y = doc.y + 2
    }

    const dashed = () => {
      doc.moveTo(x, y).lineTo(x + W, y).dash(2, { space: 2 }).stroke().undash()
      y += 6
    }

    txt('CORTE · Açougue Inteligente', { bold: true, size: 9, align: 'center' })
    txt(data.storeName, { size: 7, align: 'center' })
    dashed()

    const title = data.items.length === 0 ? 'SENHA DE BALCÃO'
      : data.slotTime === 'Imediata' ? 'PEDIDO IMEDIATO' : 'PEDIDO AGENDADO'
    txt(title, { bold: true, size: 9, align: 'center' })
    dashed()

    if (data.items.length === 0) {
      txt('Pedido: Atendimento presencial no balcão')
    } else {
      data.items.forEach((item, idx) => {
        if (data.items.length > 1) txt(`ITEM ${idx + 1}`, { bold: true, size: 7 })
        txt(`Corte: ${item.productName}`)
        txt(`Tipo: ${item.cutType}`)
        txt(`Peso: ~${item.weightKg}kg`)
        txt(`Valor est.: R$ ${Number(item.estimatedPrice).toFixed(2).replace('.', ',')}`)
        if (idx < data.items.length - 1) dashed()
      })
    }

    dashed()
    txt(`Retirada: ${pickupLabel(data.slotTime)}`)
    if (data.customerPhone) txt(`WhatsApp: ${data.customerPhone}`)
    dashed()

    txt('Código de retirada', { size: 7, align: 'center' })
    y += 2
    doc.font('Courier-Bold').fontSize(18)
      .text(data.pickupCode, x, y, { width: W, align: 'center', characterSpacing: 4 })
    y = doc.y + 4
    dashed()

    // QR Code (data URL base64 enviado pelo frontend)
    if (data.qrDataUrl) {
      try {
        const base64 = data.qrDataUrl.replace(/^data:image\/\w+;base64,/, '')
        const imgBuf = Buffer.from(base64, 'base64')
        txt('Acompanhe seu pedido', { size: 7, align: 'center' })
        const qrSize = 72
        doc.image(imgBuf, x + (W - qrSize) / 2, y, { width: qrSize, height: qrSize })
        y += qrSize + 4
        txt('Escaneie para ver o andamento', { size: 7, align: 'center' })
        dashed()
      } catch (e) {
        console.error('[print-server] erro ao inserir QR code:', e.message)
      }
    }

    txt('Apresente este comprovante no balcão', { size: 7, align: 'center' })
    const now = new Date()
    const dateStr = now.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    txt(`${dateStr} · ${timeStr}`, { size: 7, align: 'center' })

    doc.end()
  })
}

// ── Servidor HTTP ─────────────────────────────────────────────────────────────

const server = http.createServer(async (req, res) => {
  // CORS — permite chamada do frontend (qualquer origem local ou Vercel)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return }

  if (req.method === 'POST' && req.url === '/print') {
    let body = ''
    req.on('data', chunk => body += chunk)
    req.on('end', async () => {
      try {
        const data = JSON.parse(body)
        const pdfBuffer = await buildPdf(data)
        const tmpPath = join(tmpdir(), `corte-receipt-${Date.now()}.pdf`)
        writeFileSync(tmpPath, pdfBuffer)
        try {
          await printPdf(tmpPath, PRINTER_NAME ? { printer: PRINTER_NAME } : {})
          console.log(`[print-server] impresso: ${data.pickupCode}`)
        } finally {
          try { unlinkSync(tmpPath) } catch { /* já removido */ }
        }
        res.writeHead(204); res.end()
      } catch (err) {
        console.error('[print-server] erro:', err.message)
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: err.message }))
      }
    })
    return
  }

  res.writeHead(404); res.end()
})

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[print-server] ouvindo em http://localhost:${PORT}`)
  console.log(`[print-server] impressora: ${PRINTER_NAME || '(padrão do Windows)'}`)
})
