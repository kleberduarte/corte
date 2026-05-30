import { useEffect, useState } from 'react'
import type { Order } from '../../store/cartStore'
import { useStore } from '../../data/config'

type Props = {
  order: Order
  onDone: () => void
}

function pickupLabel(slotTime: string) {
  if (slotTime === 'Imediata') return 'Retirada imediata'
  if (slotTime === 'Balcão') return 'Atendimento no balcão'
  return `Hoje · ${slotTime}`
}

const COUNTER_LINE = 'Atendimento presencial no balcão'

// Conteúdo do recibo como HTML puro — enviado para window.print()
function buildReceiptHtml(order: Order, storeName: string): string {
  const dateStr = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const timeStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  const itemsHtml = order.items.length === 0
    ? `<div class="section"><div><b>Pedido:</b> ${COUNTER_LINE}</div></div>`
    : order.items.map((item, idx) => `
    <div class="section">
      ${order.items.length > 1 ? `<div class="label">Item ${idx + 1}</div>` : ''}
      <div><b>Corte:</b> ${item.product.name}</div>
      <div><b>Tipo:</b> ${item.cutType.name}</div>
      <div><b>Peso:</b> ~${item.weightKg}kg</div>
      <div><b>Valor est.:</b> R$ ${item.estimatedPrice.toFixed(2).replace('.', ',')}</div>
    </div>
    ${idx < order.items.length - 1 ? '<div class="dashed"></div>' : ''}
  `).join('')

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Comprovante CORTE</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Courier New', monospace;
      font-size: 12px;
      line-height: 1.5;
      color: #000;
      background: #fff;
      width: 80mm;
      padding: 4mm 4mm 12mm;
    }
    .center  { text-align: center; }
    .bold    { font-weight: bold; }
    .large   { font-size: 18px; font-weight: bold; letter-spacing: 4px; }
    .small   { font-size: 10px; }
    .xsmall  { font-size: 9px; color: #444; }
    .dashed  { border-top: 1px dashed #000; margin: 6px 0; }
    .section { margin: 4px 0; }
    .label   { font-weight: bold; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 2px; }
    .code-box { border: 1px solid #000; padding: 6px; margin: 8px 0; text-align: center; }
    @media print {
      body { width: 80mm; }
      @page { margin: 0; size: 80mm auto; }
    }
  </style>
</head>
<body>
  <div class="center bold" style="font-size:14px">CORTE · Açougue Inteligente</div>
  <div class="center small">${storeName}</div>
  <div class="dashed"></div>
  <div class="center bold" style="font-size:13px">${order.items.length === 0 ? 'SENHA DE BALCÃO' : order.slotTime === 'Imediata' ? 'PEDIDO IMEDIATO' : 'PEDIDO AGENDADO'}</div>
  <div class="dashed"></div>

  ${itemsHtml}

  <div class="dashed"></div>
  <div><b>Retirada:</b> ${pickupLabel(order.slotTime)}</div>
  ${order.customerPhone ? `<div><b>WhatsApp:</b> ${order.customerPhone}</div>` : ''}
  <div class="dashed"></div>

  <div class="center small">Código de retirada</div>
  <div class="code-box large">${order.pickupCode}</div>

  <div class="dashed"></div>
  <div class="center small">Apresente este comprovante no balcão</div>
  <div class="center xsmall">${dateStr} · ${timeStr}</div>
</body>
</html>`
}

function printReceipt(order: Order, storeName: string) {
  const win = window.open('', '_blank', 'width=400,height=600')
  if (!win) return
  win.document.write(buildReceiptHtml(order, storeName))
  win.document.close()
  win.focus()
  // Aguarda assets carregarem antes de imprimir
  win.onload = () => {
    win.print()
    win.close()
  }
}

export default function PrintScreen({ order, onDone }: Props) {
  const store = useStore()
  const [stage, setStage] = useState<'printing' | 'done'>('printing')
  const [countdown, setCountdown] = useState(8)

  useEffect(() => {
    const t = setTimeout(() => setStage('done'), 3200)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (stage !== 'done') return
    // Dispara impressão real ao mostrar tela de confirmação
    printReceipt(order, store.name)

    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { onDone(); return 0 }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(interval)
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
        <div style={{ fontSize: 14, color: 'var(--t2)', lineHeight: 1.55, marginBottom: 32, maxWidth: 300 }}>
          {order.items.length === 0
            ? 'Comprovante impresso com sucesso. Apresente a senha no balcão do açougue.'
            : order.customerPhone
              ? 'Informações enviadas para o WhatsApp. Comprovante impresso com sucesso.'
              : order.slotTime === 'Imediata'
                ? 'Comprovante impresso com sucesso. Dirija-se ao balcão do açougue.'
                : 'Comprovante impresso com sucesso. Dirija-se ao açougue no horário agendado.'}
        </div>
        <div style={{ background: 'var(--s2)', border: '1px solid var(--border2)', borderRadius: 'var(--r)', padding: '14px 20px', marginBottom: 28, width: '100%' }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, color: 'var(--t3)', marginBottom: 8 }}>
            Código de retirada
          </div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 48, fontWeight: 700, color: 'var(--accent)', letterSpacing: 8 }}>
            {order.pickupCode}
          </div>
        </div>
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
