/**
 * Servidor de impressão local do totem — porta 3334
 * Roda APENAS no Windows do totem. Recebe os dados do pedido,
 * gera o PDF com pdfkit e imprime silenciosamente via SumatraPDF.
 */
import http from 'http'
import { spawn } from 'child_process'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const require = createRequire(import.meta.url)
const PDFDocument = require('pdfkit')
const { writeFileSync, unlinkSync } = require('fs')
const { tmpdir } = require('os')

const PORT = 3334
const PRINTER_NAME = process.env.PRINTER_NAME

// Localiza o SumatraPDF embutido no pdf-to-printer
const pkgDir = dirname(require.resolve('pdf-to-printer/package.json'))
const SUMATRA = join(pkgDir, 'vendor', 'SumatraPDF.exe')

// ── Impressão silenciosa via SumatraPDF ───────────────────────────────────────

function printSilent(pdfPath) {
  return new Promise((resolve, reject) => {
    const args = PRINTER_NAME
      ? ['-print-to', PRINTER_NAME, '-silent', '-exit-when-done', pdfPath]
      : ['-print-to-default', '-silent', '-exit-when-done', pdfPath]

    const proc = spawn(SUMATRA, args, { windowsHide: true, stdio: 'ignore' })
    proc.on('close', code => code === 0 ? resolve() : reject(new Error(`SumatraPDF saiu com código ${code}`)))
    proc.on('error', reject)
  })
}

// ── Geração do PDF ────────────────────────────────────────────────────────────

function pickupLabel(slotTime) {
  if (slotTime === 'Imediata') return 'Escolher e Aguardar'
  if (slotTime === 'Balcão') return 'Atendimento no balcão'
  return `Hoje · ${slotTime}`
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

        await printSilent(pdfPath)
        console.log(`[print-server] impresso: ${data.pickupCode}`)

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
  console.log(`[print-server] SumatraPDF: ${SUMATRA}`)
  console.log(`[print-server] impressora: ${PRINTER_NAME || '(padrão do Windows)'}`)
})
