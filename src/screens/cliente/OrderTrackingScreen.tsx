import { useEffect, useState } from 'react'
import { useStore } from '../../data/config'
import { api } from '../../lib/api'

type Props = {
  orderId: string
}

type TrackingOrder = {
  id: string
  orderNumber: number
  pickupCode: string
  status: 'PENDING' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED'
  scheduledAt: string | null
  pickupMode: 'SCHEDULED' | 'IMMEDIATE'
  items: { productName: string; cutType: string | null; quantity: number; totalPrice: number }[]
}

const STEPS = [
  { status: 'PENDING',   label: 'Aguardando corte',      hint: 'Seu pedido entrou na fila do açougue.' },
  { status: 'PREPARING', label: 'Em preparo',             hint: 'O açougueiro está preparando seu corte.' },
  { status: 'READY',     label: 'Pronto para retirada',   hint: 'Dirija-se ao balcão com seu código.' },
  { status: 'DELIVERED', label: 'Retirado',               hint: 'Pedido concluído. Obrigado!' },
]

const STATUS_INDEX: Record<string, number> = {
  PENDING: 0, PREPARING: 1, READY: 2, DELIVERED: 3, CANCELLED: 3,
}

function pickupLabel(order: TrackingOrder) {
  if (order.pickupMode === 'IMMEDIATE') return 'Escolher e Aguardar'
  if (!order.scheduledAt) return 'Balcão'
  return `Hoje · ${new Date(order.scheduledAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
}

export default function OrderTrackingScreen({ orderId }: Props) {
  const store = useStore()
  const [order, setOrder] = useState<TrackingOrder | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const clock = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(clock)
  }, [])

  useEffect(() => {
    async function fetch() {
      try {
        const data = await api.get<TrackingOrder>(`/totem/${store.id}/orders/${orderId.trim()}`)
        setOrder(data)
        setNotFound(false)
      } catch {
        setNotFound(true)
      }
    }
    fetch()
    const interval = setInterval(fetch, 5000)
    return () => clearInterval(interval)
  }, [store.id, orderId])

  const activeIndex = order ? (STATUS_INDEX[order.status] ?? 0) : -1

  if (notFound || (!order && !notFound)) {
    return (
      <div className="tracking-shell">
        <header className="tracking-header">
          <div className="tracking-logo">🔪</div>
          <div>
            <div className="tracking-brand">CORTE</div>
            <div className="tracking-store">{store.name}</div>
          </div>
        </header>
        <main className="tracking-main">
          <div className="tracking-empty">
            <div className="tracking-empty-icon">{notFound ? '?' : '⏳'}</div>
            <h1>{notFound ? 'Pedido não encontrado' : 'Carregando...'}</h1>
            <p>{notFound ? 'Verifique se o código está correto.' : 'Buscando seu pedido...'}</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="tracking-shell">
      <header className="tracking-header">
        <div className="tracking-logo">🔪</div>
        <div>
          <div className="tracking-brand">CORTE</div>
          <div className="tracking-store">{store.name}</div>
        </div>
        <div className="tracking-clock">
          <div>{now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
          <div>{now.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })}</div>
        </div>
      </header>

      <main className="tracking-main">
        <section className="tracking-hero">
          <div className="tracking-hero-label">Acompanhe seu pedido</div>
          <div className="tracking-code">{order!.pickupCode}</div>
          <div className="tracking-summary">
            {order!.items.length === 0
              ? 'Senha de balcão'
              : order!.items.length === 1
                ? `${order!.items[0].productName} · ${order!.items[0].cutType ?? ''} · ~${order!.items[0].quantity}kg`
                : `${order!.items.length} itens no pedido`}
          </div>
          <div className="tracking-meta">Retirada: {pickupLabel(order!)}</div>
        </section>

        <section className={`tracking-status-banner status-${order!.status}`}>
          <div className="tracking-status-title">{STEPS[activeIndex]?.label}</div>
          <div className="tracking-status-hint">{STEPS[activeIndex]?.hint}</div>
        </section>

        <section className="tracking-pipeline">
          <div className="tracking-pipeline-title">Andamento</div>
          <div className="tracking-steps">
            {STEPS.map((step, index) => {
              const done = index < activeIndex
              const active = index === activeIndex
              const pending = index > activeIndex
              return (
                <div key={step.status} className={`tracking-step ${done ? 'done' : ''} ${active ? 'active' : ''} ${pending ? 'pending' : ''}`}>
                  <div className="tracking-step-marker">
                    <div className="tracking-step-dot">{done ? '✓' : index + 1}</div>
                    {index < STEPS.length - 1 && <div className="tracking-step-line" />}
                  </div>
                  <div className="tracking-step-body">
                    <div className="tracking-step-label">{step.label}</div>
                    {active && <div className="tracking-step-caption">{step.hint}</div>}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {order!.items.length > 0 && (
          <section className="tracking-items">
            <div className="tracking-pipeline-title">Itens</div>
            {order!.items.map((item, idx) => (
              <div key={idx} className="tracking-item">
                <div className="tracking-item-name">{item.productName}</div>
                <div className="tracking-item-detail">
                  {item.cutType} · ~{item.quantity}kg · R$ {item.totalPrice.toFixed(2).replace('.', ',')}
                </div>
              </div>
            ))}
          </section>
        )}

        <p className="tracking-footer">Atualização automática a cada 5 segundos</p>
      </main>

      <style>{`
        .tracking-shell { min-height:100vh; min-height:100dvh; background:var(--bg); color:var(--t1); }
        .tracking-header { display:flex; align-items:center; gap:12px; padding:16px 20px; background:var(--s1); border-bottom:1px solid var(--border); }
        .tracking-logo { width:40px; height:40px; border-radius:12px; background:linear-gradient(145deg,var(--primary-dark),var(--primary)); display:flex; align-items:center; justify-content:center; font-size:20px; }
        .tracking-brand { font-family:var(--font-serif); font-size:18px; font-weight:700; color:var(--accent); letter-spacing:2px; }
        .tracking-store { font-size:12px; color:var(--t3); }
        .tracking-clock { margin-left:auto; text-align:right; font-size:13px; font-weight:600; color:var(--t2); }
        .tracking-clock div:last-child { font-size:10px; color:var(--t3); font-weight:500; }
        .tracking-main { max-width:480px; margin:0 auto; padding:24px 20px 40px; }
        .tracking-hero { text-align:center; margin-bottom:24px; }
        .tracking-hero-label { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:1.2px; color:var(--t3); margin-bottom:10px; }
        .tracking-code { font-family:var(--font-serif); font-size:52px; font-weight:700; color:var(--accent); letter-spacing:8px; line-height:1; margin-bottom:12px; }
        .tracking-summary { font-size:15px; color:var(--t2); margin-bottom:6px; }
        .tracking-meta { font-size:13px; color:var(--t3); }
        .tracking-status-banner { border-radius:var(--r); padding:16px 18px; margin-bottom:24px; border:1px solid var(--border2); background:var(--s2); }
        .tracking-status-banner.status-PENDING { border-color:rgba(255,255,255,.08); }
        .tracking-status-banner.status-PREPARING { border-color:rgba(255,149,0,.35); background:rgba(255,149,0,.08); }
        .tracking-status-banner.status-READY { border-color:rgba(52,199,89,.35); background:rgba(52,199,89,.08); }
        .tracking-status-banner.status-DELIVERED,.tracking-status-banner.status-CANCELLED { border-color:rgba(255,255,255,.08); opacity:.85; }
        .tracking-status-title { font-size:18px; font-weight:700; color:var(--t1); margin-bottom:4px; }
        .tracking-status-hint { font-size:13px; color:var(--t2); line-height:1.45; }
        .tracking-pipeline-title { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:1.2px; color:var(--t3); margin-bottom:14px; }
        .tracking-steps { display:flex; flex-direction:column; gap:0; }
        .tracking-step { display:flex; gap:14px; }
        .tracking-step-marker { display:flex; flex-direction:column; align-items:center; width:28px; flex-shrink:0; }
        .tracking-step-dot { width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; background:var(--s2); border:2px solid var(--border2); color:var(--t3); }
        .tracking-step.done .tracking-step-dot { background:rgba(52,199,89,.15); border-color:var(--green); color:var(--green); }
        .tracking-step.active .tracking-step-dot { background:linear-gradient(145deg,var(--primary-dark),var(--primary)); border-color:var(--primary); color:#fff; box-shadow:0 0 0 4px rgba(192,39,45,.2); }
        .tracking-step-line { width:2px; flex:1; min-height:24px; background:var(--border2); margin:4px 0; }
        .tracking-step.done .tracking-step-line { background:var(--green); }
        .tracking-step-body { padding:2px 0 22px; }
        .tracking-step-label { font-size:15px; font-weight:600; color:var(--t2); }
        .tracking-step.active .tracking-step-label { color:var(--t1); }
        .tracking-step.pending .tracking-step-label { color:var(--t3); }
        .tracking-step-caption { font-size:12px; color:var(--t3); margin-top:4px; line-height:1.4; }
        .tracking-items { margin-top:8px; padding-top:20px; border-top:1px solid var(--border); }
        .tracking-item { padding:12px 0; border-bottom:1px solid var(--border); }
        .tracking-item:last-child { border-bottom:none; }
        .tracking-item-name { font-size:14px; font-weight:600; color:var(--t1); margin-bottom:4px; }
        .tracking-item-detail { font-size:12px; color:var(--t3); }
        .tracking-footer { margin-top:28px; text-align:center; font-size:11px; color:var(--t3); }
        .tracking-empty { text-align:center; padding:48px 12px; }
        .tracking-empty-icon { width:64px; height:64px; border-radius:50%; margin:0 auto 16px; background:var(--s2); border:1px solid var(--border2); display:flex; align-items:center; justify-content:center; font-size:28px; color:var(--t3); }
        .tracking-empty h1 { font-family:var(--font-serif); font-size:22px; margin-bottom:8px; color:var(--accent); }
        .tracking-empty p { font-size:14px; color:var(--t2); line-height:1.5; }
      `}</style>
    </div>
  )
}
