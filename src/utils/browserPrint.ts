/** Impressão térmica pelo Chrome — funciona com o app na internet, sem instalar nada no totem. */

export type ReceiptPrintData = {
  storeName: string
  pickupCode: string
  slotTime: string
  customerPhone?: string
  qrDataUrl: string
  items: {
    productName: string
    cutType: string
    weightKg: number
    estimatedPrice: number
  }[]
}

function pickupLabel(slotTime: string) {
  if (slotTime === 'Imediata') return 'Escolher e Aguardar'
  if (slotTime === 'Balcão') return 'Atendimento no balcão'
  return `Hoje · ${slotTime}`
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function buildReceiptHtml(data: ReceiptPrintData): string {
  const now = new Date()
  const dateStr = now.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  const title = data.items.length === 0 ? 'SENHA DE BALCÃO'
    : data.slotTime === 'Imediata' ? 'PEDIDO IMEDIATO' : 'PEDIDO AGENDADO'

  const itemsHtml = data.items.length === 0
    ? '<div><b>Pedido:</b> Atendimento presencial no balcão</div>'
    : data.items.map((item, idx) => `
        ${data.items.length > 1 ? `<div><b>ITEM ${idx + 1}</b></div>` : ''}
        <div><b>Corte:</b> ${escapeHtml(item.productName)}</div>
        <div><b>Tipo:</b> ${escapeHtml(item.cutType)}</div>
        <div><b>Peso:</b> ~${item.weightKg}kg</div>
        <div><b>Valor est.:</b> R$ ${item.estimatedPrice.toFixed(2).replace('.', ',')}</div>
      `).join('')

  const phoneLine = data.customerPhone
    ? `<div><b>WhatsApp:</b> ${escapeHtml(data.customerPhone)}</div>`
    : ''

  const qrBlock = data.qrDataUrl
    ? `<div class="center small">Acompanhe seu pedido</div>
       <div class="center"><img src="${data.qrDataUrl}" width="72" height="72" alt="" /></div>
       <div class="center tiny">Escaneie para ver o andamento</div>`
    : ''

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Comprovante</title>
<style>
  @page { size: 80mm auto; margin: 3mm; }
  @media print {
    html, body { width: 80mm; margin: 0; padding: 0; }
  }
  html, body { margin: 0; padding: 0; }
  body {
    font-family: "Courier New", Courier, monospace;
    font-size: 11px;
    line-height: 1.4;
    color: #000;
    width: 72mm;
  }
  .center { text-align: center; }
  .title { font-size: 13px; font-weight: bold; text-align: center; margin: 6px 0; }
  .code { font-size: 20px; font-weight: bold; text-align: center; letter-spacing: 3px; margin: 8px 0; }
  .dash { border-top: 1px dashed #666; margin: 8px 0; }
  .small { font-size: 10px; }
  .tiny { font-size: 9px; color: #444; }
</style></head><body>
  <div class="center" style="font-weight:bold">CORTE · Açougue Inteligente</div>
  <div class="center small">${escapeHtml(data.storeName)}</div>
  <div class="dash"></div>
  <div class="title">${title}</div>
  <div class="dash"></div>
  ${itemsHtml}
  <div class="dash"></div>
  <div><b>Retirada:</b> ${escapeHtml(pickupLabel(data.slotTime))}</div>
  ${phoneLine}
  <div class="dash"></div>
  <div class="center small">Código de retirada</div>
  <div class="code">${escapeHtml(data.pickupCode)}</div>
  <div class="dash"></div>
  ${qrBlock}
  <div class="dash"></div>
  <div class="center small">Apresente este comprovante no balcão</div>
  <div class="center tiny">${dateStr} · ${timeStr}</div>
</body></html>`
}

function waitForImages(doc: Document): Promise<void> {
  const images = Array.from(doc.images)
  if (images.length === 0) return Promise.resolve()
  return Promise.all(
    images.map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            img.onload = () => resolve()
            img.onerror = () => resolve()
          }),
    ),
  ).then(() => undefined)
}

/** Imprime na impressora padrão do Windows. Com --kiosk-printing no Chrome, não abre diálogo. */
export function printReceiptBrowser(data: ReceiptPrintData): Promise<boolean> {
  return new Promise((resolve) => {
    const iframe = document.createElement('iframe')
    iframe.setAttribute('aria-hidden', 'true')
    iframe.style.cssText = 'position:fixed;left:-9999px;top:0;width:1px;height:1px;border:0'
    document.body.appendChild(iframe)

    const win = iframe.contentWindow
    const doc = iframe.contentDocument
    if (!win || !doc) {
      iframe.remove()
      resolve(false)
      return
    }

    doc.open()
    doc.write(buildReceiptHtml(data))
    doc.close()

    const cleanup = () => setTimeout(() => iframe.remove(), 800)

    const doPrint = async () => {
      try {
        await waitForImages(doc)
        win.focus()
        win.print()
        cleanup()
        resolve(true)
      } catch {
        cleanup()
        resolve(false)
      }
    }

    if (doc.readyState === 'complete') {
      void doPrint()
    } else {
      iframe.onload = () => { void doPrint() }
    }
  })
}
