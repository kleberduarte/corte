import { useEffect, useRef, useState } from 'react'
import type { Order } from '../../store/cartStore'
import { useStore } from '../../data/config'
import { getOrderTrackingUrl } from '../../utils/orderTrackingUrl'
import QrScanPrompt from '../../components/QrScanPrompt'
import { generateQrDataUrl } from '../../utils/qrCode'

/** Servidor de impressão local do totem (print-server/server.mjs, porta 3334).
 *  Imprime silenciosamente via SumatraPDF — sem diálogo nenhum no navegador. */
const PRINT_SERVER_URL = import.meta.env.VITE_PRINT_SERVER_URL ?? 'http://localhost:3334'

const QR_DISPLAY_SIZE = 384
/** Tempo na tela do QR antes de voltar ao início automaticamente */
const QR_SCAN_DISPLAY_SECONDS = 20

type Props = {
  order: Order
  onDone: () => void
}

function pickupLabel(slotTime: string) {
  if (slotTime === 'Preferencial') return 'Atendimento preferencial'
  if (slotTime === 'Imediata') return 'Escolher e Aguardar'
  if (slotTime === 'Balcão') return 'Atendimento no balcão'
  return `Hoje · ${slotTime}`
}

function receiptTitle(order: Order) {
  if (order.priority || order.slotTime === 'Preferencial') return 'SENHA PREFERENCIAL'
  if (order.items.length === 0) return 'SENHA DE BALCÃO'
  if (order.slotTime === 'Imediata') return 'PEDIDO IMEDIATO'
  return 'PEDIDO AGENDADO'
}

function doneMessage(order: Order) {
  if (order.priority || order.slotTime === 'Preferencial') {
    return 'Comprovante impresso. Atendimento preferencial no balcão.'
  }
  if (order.items.length === 0) {
    return 'Comprovante impresso. Apresente a senha no balcão.'
  }
  if (order.customerPhone) {
    return 'WhatsApp enviado e comprovante impresso.'
  }
  if (order.slotTime === 'Imediata') {
    return 'Comprovante impresso. Dirija-se ao balcão e aguarde.'
  }
  return 'Comprovante impresso. Retire no horário agendado.'
}

function nextSteps(order: Order): string[] {
  const steps = ['Retire o comprovante na impressora']
  if (order.priority || order.slotTime === 'Preferencial') {
    steps.push('Apresente a senha no balcão (fila prioritária)')
  } else if (order.items.length === 0) {
    steps.push('Apresente a senha no balcão para ser atendido')
  } else if (order.slotTime === 'Imediata') {
    steps.push('Dirija-se ao balcão e aguarde a preparação')
  } else {
    steps.push(`Retire às ${order.slotTime} com o código abaixo`)
  }
  if (order.customerPhone) {
    steps.push('Acompanhe o andamento pelo WhatsApp ou QR Code')
  } else {
    steps.push('Escaneie o QR Code para acompanhar em tempo real')
  }
  return steps
}

const COUNTER_LINE = 'Atendimento presencial no balcão'
const PREFERENTIAL_LINE = 'Atendimento preferencial no balcão (fila prioritária)'

async function printReceipt(order: Order, storeName: string, qrDataUrl: string) {
  const payload = {
    storeName,
    pickupCode: order.pickupCode,
    slotTime: order.slotTime,
    priority: order.priority || undefined,
    customerPhone: order.customerPhone || undefined,
    qrDataUrl,
    items: order.items.length === 0
      ? []
      : order.items.map((item) => ({
          productName: item.product.name,
          cutType: item.cutType.name,
          weightKg: item.weightKg,
          estimatedPrice: item.estimatedPrice,
        })),
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)
  try {
    const res = await fetch(`${PRINT_SERVER_URL}/print`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
    if (!res.ok) throw new Error(`print-server respondeu ${res.status}`)
  } catch (err) {
    // Não abrimos o diálogo nativo como fallback: no totem em produção o
    // print-server local está sempre ativo. Só registramos o erro.
    console.error('[print] falha ao imprimir silenciosamente:', err)
  } finally {
    clearTimeout(timeout)
  }
}

export default function PrintScreen({ order, onDone }: Props) {
  const store = useStore()
  const [stage, setStage] = useState<'printing' | 'done'>('printing')
  const [countdown, setCountdown] = useState(QR_SCAN_DISPLAY_SECONDS)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const printedRef = useRef(false)

  useEffect(() => {
    setQrDataUrl(null)
    generateQrDataUrl(getOrderTrackingUrl(order.pickupCode, store.id), QR_DISPLAY_SIZE).then(setQrDataUrl)
  }, [order.pickupCode, store.id])

  useEffect(() => {
    const t = setTimeout(() => setStage('done'), 3200)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (stage !== 'done' || printedRef.current) return
    printedRef.current = true
    let cancelled = false

    void (async () => {
      const qrForPrint = await generateQrDataUrl(getOrderTrackingUrl(order.pickupCode, store.id), 120)
      if (cancelled) return
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

  const countdownProgress = ((QR_SCAN_DISPLAY_SECONDS - countdown) / QR_SCAN_DISPLAY_SECONDS) * 100
  const steps = nextSteps(order)

  if (stage === 'done') {
    return (
      <div className="screen print-done-screen">
        <div className="print-done-glow" aria-hidden />

        <main className="print-done-body">
          <article className="print-done-card">
            <header className="print-done-header">
              <div className="print-done-icon" aria-hidden>
                ✓
              </div>
              <div className="print-done-header-text">
                <h1 className="print-done-title">Pedido finalizado!</h1>
                <p className="print-done-msg">{doneMessage(order)}</p>
              </div>
            </header>

            <section className="print-done-code-hero" aria-label="Código de retirada">
              <span className="print-done-code-label">Código de retirada</span>
              <span className="print-done-code">{order.pickupCode}</span>
              <span className="print-done-pickup-badge">{pickupLabel(order.slotTime)}</span>
            </section>

            <ol className="print-done-steps">
              {steps.map((step, i) => (
                <li key={step} className="print-done-step" style={{ animationDelay: `${0.15 + i * 0.1}s` }}>
                  <span className="print-done-step-num" aria-hidden>{i + 1}</span>
                  <span className="print-done-step-text">{step}</span>
                </li>
              ))}
            </ol>

            {qrDataUrl && (
              <section className="print-done-qr-section" aria-label="Acompanhar pedido">
                <div className="print-done-qr-divider">
                  <span>ou acompanhe pelo celular</span>
                </div>
                <QrScanPrompt dataUrl={qrDataUrl} showAction={false} />
              </section>
            )}
          </article>
        </main>

        <footer className="print-done-footer">
          <button type="button" className="btn-primary print-done-btn" onClick={onDone}>
            <span className="print-done-btn-label">Voltar ao início</span>
            <span className="print-done-btn-timer" aria-live="polite">{countdown}s</span>
            <span
              className="print-done-btn-progress"
              style={{ transform: `scaleX(${countdownProgress / 100})` }}
              aria-hidden
            />
          </button>
        </footer>
      </div>
    )
  }

  return (
    <div className="screen" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 28px' }}>
      <div className="print-stage-msg" style={{ fontSize: 20, fontWeight: 600, color: 'var(--t2)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div className="print-stage-spinner" style={{ width: 22, height: 22, border: '3px solid var(--border2)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
        Imprimindo pedido...
      </div>

      <div className="print-receipt-preview" style={{ width: '100%', maxWidth: 320, background: '#1a1a1c', borderRadius: 16, padding: 16, border: '1px solid var(--border2)', boxShadow: '0 20px 50px rgba(0,0,0,.4)' }}>
        <div style={{ background: '#2a2a2e', borderRadius: '10px 10px 4px 4px', height: 14, marginBottom: 8, overflow: 'hidden', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent, #3a3a3e, transparent)', animation: 'slotShine 1.2s ease-in-out infinite' }} />
        </div>
        <div style={{ background: '#FAFAF8', color: '#1A1A1A', fontFamily: "'Courier New', monospace", fontSize: 15, lineHeight: 1.45, padding: '18px 14px', borderRadius: 4, animation: 'receiptReveal 2.5s ease forwards' }}>
          <div style={{ textAlign: 'center', fontWeight: 700 }}>CORTE · Açougue Inteligente</div>
          <div style={{ textAlign: 'center', fontSize: 13, marginBottom: 4 }}>{store.name}</div>
          <div style={{ borderTop: '1px dashed #999', margin: '8px 0' }} />
          <div style={{ textAlign: 'center', fontWeight: 700, fontSize: 19, margin: '6px 0' }}>
            {receiptTitle(order)}
          </div>
          <div style={{ borderTop: '1px dashed #999', margin: '8px 0' }} />
          {order.items.length === 0 ? (
            <div><strong>Pedido:</strong> {order.priority || order.slotTime === 'Preferencial' ? PREFERENTIAL_LINE : COUNTER_LINE}</div>
          ) : order.items.map((item, idx) => (
            <div key={item.product.id} style={{ marginBottom: idx < order.items.length - 1 ? 6 : 0 }}>
              <div><strong>{order.items.length > 1 ? `Item ${idx + 1}:` : 'Corte:'}</strong> {item.product.name}</div>
              <div><strong>Tipo:</strong> {item.cutType.name}</div>
              <div><strong>Peso:</strong> ~{item.weightKg}kg</div>
            </div>
          ))}
          <div><strong>Retirada:</strong> {pickupLabel(order.slotTime)}</div>
          <div style={{ borderTop: '1px dashed #999', margin: '10px 0' }} />
          <div style={{ textAlign: 'center', fontWeight: 700, fontSize: 23, letterSpacing: 3, margin: '8px 0' }}>
            {order.pickupCode}
          </div>
          <div style={{ borderTop: '1px dashed #999', margin: '10px 0' }} />
          {qrDataUrl ? (
            <>
              <div style={{ textAlign: 'center', fontSize: 13, marginBottom: 6 }}>Acompanhe seu pedido</div>
              <div style={{ textAlign: 'center', marginBottom: 6 }}>
                <img src={qrDataUrl} alt="" width={72} height={72} style={{ display: 'inline-block' }} />
              </div>
              <div style={{ textAlign: 'center', fontSize: 12, color: '#666' }}>Escaneie para ver o andamento</div>
            </>
          ) : (
            <div style={{ textAlign: 'center', fontSize: 13, color: '#666' }}>Gerando QR Code...</div>
          )}
          <div style={{ borderTop: '1px dashed #999', margin: '10px 0' }} />
          <div style={{ textAlign: 'center', fontSize: 13 }}>Apresente este comprovante</div>
          <div style={{ textAlign: 'center', fontSize: 13 }}>no balcão do açougue</div>
          <div style={{ textAlign: 'center', fontSize: 12, marginTop: 8, color: '#666' }}>{dateStr} {timeStr}</div>
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
