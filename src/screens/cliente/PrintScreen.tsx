import { useEffect, useRef, useState } from 'react'
import type { Order } from '../../store/cartStore'
import { useStore } from '../../data/config'
import { getOrderTrackingUrl } from '../../utils/orderTrackingUrl'
import { generateQrDataUrl, generateQrObjectUrl } from '../../utils/qrCode'

type Props = {
  order: Order
  onDone: () => void
}

function pickupLabel(slotTime: string) {
  if (slotTime === 'Imediata') return 'Escolher e Aguardar'
  if (slotTime === 'Balcão') return 'Atendimento no balcão'
  return `Hoje · ${slotTime}`
}

const COUNTER_LINE = 'Atendimento presencial no balcão'

const PRINT_DIV_ID = '__corte_receipt__'
const PRINT_STYLE_ID = '__corte_receipt_style__'

function ensurePrintStyle() {
  if (document.getElementById(PRINT_STYLE_ID)) return
  const style = document.createElement('style')
  style.id = PRINT_STYLE_ID
  style.textContent = `
    #${PRINT_DIV_ID} { display: none; }
    @media print {
      body > *:not(#${PRINT_DIV_ID}) { display: none !important; }
      #${PRINT_DIV_ID} {
        display: block !important;
        font-family: 'Courier New', monospace;
        font-size: 12px;
        line-height: 1.5;
        color: #000;
        background: #fff;
        width: 80mm;
        padding: 4mm 4mm 12mm;
      }
      #${PRINT_DIV_ID} .rp-center  { text-align: center; }
      #${PRINT_DIV_ID} .rp-bold    { font-weight: bold; }
      #${PRINT_DIV_ID} .rp-large   { font-size: 18px; font-weight: bold; letter-spacing: 4px; }
      #${PRINT_DIV_ID} .rp-small   { font-size: 10px; }
      #${PRINT_DIV_ID} .rp-xsmall  { font-size: 9px; color: #444; }
      #${PRINT_DIV_ID} .rp-dashed  { border-top: 1px dashed #000; margin: 6px 0; }
      #${PRINT_DIV_ID} .rp-section { margin: 4px 0; }
      #${PRINT_DIV_ID} .rp-label   { font-weight: bold; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 2px; }
      #${PRINT_DIV_ID} .rp-codebox { border: 1px solid #000; padding: 6px; margin: 8px 0; text-align: center; }
      #${PRINT_DIV_ID} .rp-qrbox  { text-align: center; margin: 8px 0; }
      #${PRINT_DIV_ID} .rp-qrbox img {
        display: block !important;
        width: 96px;
        height: 96px;
        margin: 0 auto;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      @page { margin: 0; size: 80mm auto; }
    }
  `
  document.head.appendChild(style)
}

function buildReceiptInnerHtml(order: Order, storeName: string, qrDataUrl: string): string {
  const dateStr = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const timeStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  const itemsHtml = order.items.length === 0
    ? `<div class="rp-section"><div><b>Pedido:</b> ${COUNTER_LINE}</div></div>`
    : order.items.map((item, idx) => `
      <div class="rp-section">
        ${order.items.length > 1 ? `<div class="rp-label">Item ${idx + 1}</div>` : ''}
        <div><b>Corte:</b> ${item.product.name}</div>
        <div><b>Tipo:</b> ${item.cutType.name}</div>
        <div><b>Peso:</b> ~${item.weightKg}kg</div>
        <div><b>Valor est.:</b> R$ ${item.estimatedPrice.toFixed(2).replace('.', ',')}</div>
      </div>
      ${idx < order.items.length - 1 ? '<div class="rp-dashed"></div>' : ''}
    `).join('')

  return `
    <div class="rp-center rp-bold" style="font-size:14px">CORTE · Açougue Inteligente</div>
    <div class="rp-center rp-small">${storeName}</div>
    <div class="rp-dashed"></div>
    <div class="rp-center rp-bold" style="font-size:13px">${order.items.length === 0 ? 'SENHA DE BALCÃO' : order.slotTime === 'Imediata' ? 'PEDIDO IMEDIATO' : 'PEDIDO AGENDADO'}</div>
    <div class="rp-dashed"></div>
    ${itemsHtml}
    <div class="rp-dashed"></div>
    <div><b>Retirada:</b> ${pickupLabel(order.slotTime)}</div>
    ${order.customerPhone ? `<div><b>WhatsApp:</b> ${order.customerPhone}</div>` : ''}
    <div class="rp-dashed"></div>
    <div class="rp-center rp-small">Código de retirada</div>
    <div class="rp-codebox rp-large">${order.pickupCode}</div>
    <div class="rp-dashed"></div>
    <div class="rp-center rp-small">Acompanhe seu pedido</div>
    <div class="rp-qrbox"><img src="${qrDataUrl}" alt="QR Code"/></div>
    <div class="rp-center rp-xsmall">Escaneie para ver o andamento</div>
    <div class="rp-dashed"></div>
    <div class="rp-center rp-small">Apresente este comprovante no balcão</div>
    <div class="rp-center rp-xsmall">${dateStr} · ${timeStr}</div>
  `
}

async function waitForImage(img: HTMLImageElement): Promise<void> {
  if (typeof img.decode === 'function') {
    try {
      await img.decode()
      return
    } catch { /* fallback abaixo */ }
  }
  if (img.complete && img.naturalWidth > 0) return
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve()
    img.onerror = () => reject(new Error('Falha ao carregar QR Code para impressão'))
  })
}

async function printReceipt(order: Order, storeName: string, qrSrc: string) {
  ensurePrintStyle()

  let div = document.getElementById(PRINT_DIV_ID)
  if (!div) {
    div = document.createElement('div')
    div.id = PRINT_DIV_ID
    document.body.appendChild(div)
  }

  div.innerHTML = buildReceiptInnerHtml(order, storeName, qrSrc)
  const img = div.querySelector<HTMLImageElement>('.rp-qrbox img')
  if (img) await waitForImage(img)

  await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))

  await new Promise<void>((resolve) => {
    let finished = false
    const cleanup = () => {
      if (finished) return
      finished = true
      window.removeEventListener('afterprint', cleanup)
      div!.innerHTML = ''
      if (qrSrc.startsWith('blob:')) URL.revokeObjectURL(qrSrc)
      resolve()
    }
    window.addEventListener('afterprint', cleanup)
    window.print()
    setTimeout(cleanup, 2000)
  })
}

export default function PrintScreen({ order, onDone }: Props) {
  const store = useStore()
  const [stage, setStage] = useState<'printing' | 'done'>('printing')
  const [countdown, setCountdown] = useState(8)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const printedRef = useRef(false)

  useEffect(() => {
    setQrDataUrl(null)
    generateQrDataUrl(getOrderTrackingUrl(order.pickupCode), 140).then(setQrDataUrl)
  }, [order.pickupCode])

  useEffect(() => {
    const t = setTimeout(() => setStage('done'), 3200)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (stage !== 'done' || printedRef.current) return
    printedRef.current = true
    let cancelled = false

    void (async () => {
      const qrForPrint = await generateQrObjectUrl(getOrderTrackingUrl(order.pickupCode), 120)
      if (cancelled) {
        URL.revokeObjectURL(qrForPrint)
        return
      }
      await printReceipt(order, store.name, qrForPrint)
    })()

    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { onDone(); return 0 }
        return c - 1
      })
    }, 1000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [stage, order, store.name, onDone])

  const dateStr = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const timeStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  if (stage === 'done') {
    return (
      <div className="screen" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 28px', textAlign: 'center' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(52,199,89,.15)', border: '2px solid var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, marginBottom: 18, animation: 'popIn .55s cubic-bezier(.175,.885,.32,1.275) both' }}>
          ✓
        </div>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 700, color: 'var(--accent)', marginBottom: 8 }}>
          Pedido finalizado!
        </div>
        <div style={{ fontSize: 14, color: 'var(--t2)', lineHeight: 1.55, marginBottom: 24, maxWidth: 300 }}>
          {order.items.length === 0
            ? 'Comprovante impresso com sucesso. Apresente a senha no balcão do açougue.'
            : order.customerPhone
              ? 'Informações enviadas para o WhatsApp. Comprovante impresso com sucesso.'
              : order.slotTime === 'Imediata'
                ? 'Comprovante impresso com sucesso. Dirija-se ao balcão do açougue.'
                : 'Comprovante impresso com sucesso. Dirija-se ao açougue no horário agendado.'}
        </div>
        <div style={{ background: 'var(--s2)', border: '1px solid var(--border2)', borderRadius: 'var(--r)', padding: '14px 20px', marginBottom: 20, width: '100%' }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, color: 'var(--t3)', marginBottom: 8 }}>
            Código de retirada
          </div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 48, fontWeight: 700, color: 'var(--accent)', letterSpacing: 8 }}>
            {order.pickupCode}
          </div>
        </div>
        {qrDataUrl && (
          <div style={{ background: 'var(--s2)', border: '1px solid var(--border2)', borderRadius: 'var(--r)', padding: '16px 20px', marginBottom: 28, width: '100%' }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, color: 'var(--t3)', marginBottom: 12 }}>
              Acompanhe seu pedido
            </div>
            <div style={{ background: '#fff', borderRadius: 12, width: 140, height: 140, margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 8 }}>
              <img src={qrDataUrl} alt="QR Code para acompanhar pedido" width={124} height={124} style={{ display: 'block' }} />
            </div>
            <div style={{ fontSize: 12, color: 'var(--t3)' }}>Escaneie para ver o andamento em tempo real</div>
          </div>
        )}
        <button className="btn-primary" onClick={onDone} style={{ maxWidth: 320 }}>
          Voltar ao início ({countdown}s)
        </button>
        <style>{`@keyframes popIn { from { transform: scale(.2); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
      </div>
    )
  }

  return (
    <div className="screen" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 28px' }}>
      <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--t2)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 22, height: 22, border: '3px solid var(--border2)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
        Imprimindo pedido...
      </div>

      <div style={{ width: '100%', maxWidth: 320, background: '#1a1a1c', borderRadius: 16, padding: 16, border: '1px solid var(--border2)', boxShadow: '0 20px 50px rgba(0,0,0,.4)' }}>
        <div style={{ background: '#2a2a2e', borderRadius: '10px 10px 4px 4px', height: 14, marginBottom: 8, overflow: 'hidden', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent, #3a3a3e, transparent)', animation: 'slotShine 1.2s ease-in-out infinite' }} />
        </div>
        <div style={{ background: '#FAFAF8', color: '#1A1A1A', fontFamily: "'Courier New', monospace", fontSize: 11.5, lineHeight: 1.45, padding: '18px 14px', borderRadius: 4, animation: 'receiptReveal 2.5s ease forwards' }}>
          <div style={{ textAlign: 'center', fontWeight: 700 }}>CORTE · Açougue Inteligente</div>
          <div style={{ textAlign: 'center', fontSize: 10, marginBottom: 4 }}>{store.name}</div>
          <div style={{ borderTop: '1px dashed #999', margin: '8px 0' }} />
          <div style={{ textAlign: 'center', fontWeight: 700, fontSize: 15, margin: '6px 0' }}>
            {order.items.length === 0 ? 'SENHA DE BALCÃO' : order.slotTime === 'Imediata' ? 'PEDIDO IMEDIATO' : 'PEDIDO AGENDADO'}
          </div>
          <div style={{ borderTop: '1px dashed #999', margin: '8px 0' }} />
          {order.items.length === 0 ? (
            <div><strong>Pedido:</strong> {COUNTER_LINE}</div>
          ) : order.items.map((item, idx) => (
            <div key={item.product.id} style={{ marginBottom: idx < order.items.length - 1 ? 6 : 0 }}>
              <div><strong>{order.items.length > 1 ? `Item ${idx + 1}:` : 'Corte:'}</strong> {item.product.name}</div>
              <div><strong>Tipo:</strong> {item.cutType.name}</div>
              <div><strong>Peso:</strong> ~{item.weightKg}kg</div>
            </div>
          ))}
          <div><strong>Retirada:</strong> {pickupLabel(order.slotTime)}</div>
          <div style={{ borderTop: '1px dashed #999', margin: '10px 0' }} />
          <div style={{ textAlign: 'center', fontWeight: 700, fontSize: 18, letterSpacing: 3, margin: '8px 0' }}>
            {order.pickupCode}
          </div>
          <div style={{ borderTop: '1px dashed #999', margin: '10px 0' }} />
          {qrDataUrl ? (
            <>
              <div style={{ textAlign: 'center', fontSize: 10, marginBottom: 6 }}>Acompanhe seu pedido</div>
              <div style={{ textAlign: 'center', marginBottom: 6 }}>
                <img src={qrDataUrl} alt="" width={72} height={72} style={{ display: 'inline-block' }} />
              </div>
              <div style={{ textAlign: 'center', fontSize: 9, color: '#666' }}>Escaneie para ver o andamento</div>
            </>
          ) : (
            <div style={{ textAlign: 'center', fontSize: 10, color: '#666' }}>Gerando QR Code...</div>
          )}
          <div style={{ borderTop: '1px dashed #999', margin: '10px 0' }} />
          <div style={{ textAlign: 'center', fontSize: 10 }}>Apresente este comprovante</div>
          <div style={{ textAlign: 'center', fontSize: 10 }}>no balcão do açougue</div>
          <div style={{ textAlign: 'center', fontSize: 9, marginTop: 8, color: '#666' }}>{dateStr} {timeStr}</div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slotShine { 0%,100% { transform: translateX(-100%); } 50% { transform: translateX(100%); } }
        @keyframes receiptReveal { from { max-height: 0; opacity: 0; } to { max-height: 600px; opacity: 1; } }
      `}</style>
    </div>
  )
}
