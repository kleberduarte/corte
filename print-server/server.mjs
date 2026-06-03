/**
 * Servidor de impressão local do totem — porta 3334
 * Roda APENAS no Windows do totem. Recebe os dados do pedido,
 * gera o PDF com pdfkit e imprime silenciosamente via SumatraPDF.
 */
import http from 'http'
import { createRequire } from 'module'
import { join, dirname } from 'path'
import { readFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = join(__dirname, '.env')
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let val = trimmed.slice(eq + 1).trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = val
  }
}

const require = createRequire(import.meta.url)
const PDFDocument = require('pdfkit')
const { print: printPdf } = require('pdf-to-printer')
const { writeFileSync, unlinkSync, mkdirSync, copyFileSync } = require('fs')
const { tmpdir } = require('os')

const PORT = 3334
const PRINTER_NAME = process.env.PRINTER_NAME
const SAVE_PDF_DIR = process.env.SAVE_PDF_DIR

// ── Impressão silenciosa via pdf-to-printer (SumatraPDF embutido) ─────────────

async function deliverPdf(pdfPath, pickupCode) {
  if (SAVE_PDF_DIR) {
    mkdirSync(SAVE_PDF_DIR, { recursive: true })
    const safeCode = String(pickupCode).replace(/[^\w-]/g, '')
    const dest = join(SAVE_PDF_DIR, `receipt-${safeCode}-${Date.now()}.pdf`)
    copyFileSync(pdfPath, dest)
    console.log(`[print-server] PDF salvo (modo dev): ${dest}`)
    return
  }

  try {
    await printPdf(pdfPath, PRINTER_NAME ? { printer: PRINTER_NAME } : {})
    console.log(`[print-server] impresso: ${pickupCode}`)
  } catch (err) {
    const hint = PRINTER_NAME
      ? `Falha ao imprimir em "${PRINTER_NAME}"`
      : 'Nenhuma impressora padrão no Windows — defina PRINTER_NAME ou uma impressora padrão'
    throw new Error(`${hint}: ${err.message}`)
  }
}

// ── Geração do PDF ────────────────────────────────────────────────────────────

function pickupLabel(slotTime) {
  if (slotTime === 'Preferencial') return 'Atendimento preferencial'
  if (slotTime === 'Imediata') return 'Escolher e Aguardar'
  if (slotTime === 'Balcão') return 'Atendimento no balcão'
  return `Hoje · ${slotTime}`
}

function receiptTitle(data) {
  if (data.slotTime === 'Preferencial') return 'SENHA PREFERENCIAL'
  if (data.items.length === 0) return 'SENHA DE BALCÃO'
  if (data.slotTime === 'Imediata') return 'PEDIDO IMEDIATO'
  return 'PEDIDO AGENDADO'
}

function buildPdf(data, qrTmpPath) {
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

    txt(receiptTitle(data), { bold: true, size: 9, align: 'center' })
    dashed()

    if (data.items.length === 0) {
      txt(data.slotTime === 'Preferencial'
        ? 'Pedido: Atendimento preferencial no balcão (fila prioritária)'
        : 'Pedido: Atendimento presencial no balcão')
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

    // QR Code — usa arquivo PNG temporário (pdfkit requer caminho de arquivo)
    if (qrTmpPath) {
      txt('Acompanhe seu pedido', { size: 7, align: 'center' })
      const qrSize = 72
      doc.image(qrTmpPath, x + (W - qrSize) / 2, y, { width: qrSize, height: qrSize })
      y += qrSize + 4
      txt('Escaneie para ver o andamento', { size: 7, align: 'center' })
      dashed()
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
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return }

  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ ok: true, printer: PRINTER_NAME || 'default' }))
    return
  }

  if (req.method === 'POST' && req.url === '/print') {
    let body = ''
    req.on('data', chunk => body += chunk)
    req.on('end', async () => {
      const tmpFiles = []
      try {
        const data = JSON.parse(body)

        // Salva QR code em arquivo temporário para o pdfkit conseguir ler
        let qrTmpPath = null
        if (data.qrDataUrl) {
          const base64 = data.qrDataUrl.replace(/^data:image\/\w+;base64,/, '')
          qrTmpPath = join(tmpdir(), `corte-qr-${Date.now()}.png`)
          writeFileSync(qrTmpPath, Buffer.from(base64, 'base64'))
          tmpFiles.push(qrTmpPath)
        }

        const pdfBuffer = await buildPdf(data, qrTmpPath)
        const pdfPath = join(tmpdir(), `corte-receipt-${Date.now()}.pdf`)
        writeFileSync(pdfPath, pdfBuffer)
        tmpFiles.push(pdfPath)

        await deliverPdf(pdfPath, data.pickupCode)

        res.writeHead(204); res.end()
      } catch (err) {
        console.error('[print-server] erro:', err.message)
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: err.message }))
      } finally {
        tmpFiles.forEach(f => { try { unlinkSync(f) } catch { } })
      }
    })
    return
  }

  res.writeHead(404); res.end()
})

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[print-server] ouvindo em http://localhost:${PORT}`)
  if (SAVE_PDF_DIR) {
    console.log(`[print-server] modo dev: PDFs em ${SAVE_PDF_DIR}`)
  } else {
    console.log(`[print-server] impressora: ${PRINTER_NAME || '(padrão do Windows)'}`)
  }
})
