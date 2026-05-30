import { useEffect, useMemo, useState } from 'react'
import { useKanbanStore } from '../../store/kanbanStore'
import type { Order } from '../../store/cartStore'
import { useStore } from '../../data/config'

type Props = {
  orderId: string
}

const STEPS: { status: Order['status']; label: string; hint: string }[] = [
  { status: 'aguardando', label: 'Aguardando corte', hint: 'Seu pedido entrou na fila do açougue.' },
  { status: 'em_preparo', label: 'Em preparo', hint: 'O açougueiro está preparando seu corte.' },
  { status: 'pronto', label: 'Pronto para retirada', hint: 'Dirija-se ao balcão com seu código.' },
  { status: 'retirado', label: 'Retirado', hint: 'Pedido concluído. Obrigado!' },
]

const STATUS_INDEX: Record<Order['status'], number> = {
  aguardando: 0,
  em_preparo: 1,
  pronto: 2,
  retirado: 3,
}

function pickupLabel(slotTime: string) {
  if (slotTime === 'Imediata') return 'Retirada imediata'
  if (slotTime === 'Balcão') return 'Atendimento no balcão'
  return `Hoje · ${slotTime}`
}

function formatItems(order: Order) {
  if (order.items.length === 0) return 'Senha de balcão'
  if (order.items.length === 1) {
    const item = order.items[0]
    return `${item.product.name} · ${item.cutType.name} · ~${item.weightKg}kg`
  }
  return `${order.items.length} itens no pedido`
}

export default function OrderTrackingScreen({ orderId }: Props) {
  const store = useStore()
  const { orders, syncFromStorage } = useKanbanStore()
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    syncFromStorage()
    const sync = setInterval(syncFromStorage, 2500)
    const clock = setInterval(() => setNow(new Date()), 1000)
    return () => {
      clearInterval(sync)
      clearInterval(clock)
    }
  }, [syncFromStorage])

  const order = useMemo(() => {
    const needle = orderId.trim()
    const code = needle.toUpperCase()
    return orders.find((o) => o.id === needle || o.pickupCode.toUpperCase() === code) ?? null
  }, [orders, orderId])
  const activeIndex = order ? STATUS_INDEX[order.status] : -1
  const currentStep = order ? STEPS[activeIndex] : null

  if (!order) {
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
            <div className="tracking-empty-icon">?</div>
            <h1>Pedido não encontrado</h1>
            <p>Verifique se o link está correto ou se o pedido ainda não foi registrado.</p>
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
          <div className="tracking-code">{order.pickupCode}</div>
          <div className="tracking-summary">{formatItems(order)}</div>
          <div className="tracking-meta">Retirada: {pickupLabel(order.slotTime)}</div>
        </section>

        {currentStep && (
          <section className={`tracking-status-banner status-${order.status}`}>
            <div className="tracking-status-title">{currentStep.label}</div>
            <div className="tracking-status-hint">{currentStep.hint}</div>
          </section>
        )}

        <section className="tracking-pipeline">
          <div className="tracking-pipeline-title">Andamento</div>
          <div className="tracking-steps">
            {STEPS.map((step, index) => {
              const done = index < activeIndex
              const active = index === activeIndex
              const pending = index > activeIndex
              return (
                <div
                  key={step.status}
                  className={`tracking-step ${done ? 'done' : ''} ${active ? 'active' : ''} ${pending ? 'pending' : ''}`}
                >
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

        {order.items.length > 0 && (
          <section className="tracking-items">
            <div className="tracking-pipeline-title">Itens</div>
            {order.items.map((item, idx) => (
              <div key={`${item.product.id}-${idx}`} className="tracking-item">
                <div className="tracking-item-name">{item.product.name}</div>
                <div className="tracking-item-detail">
                  {item.cutType.name} · ~{item.weightKg}kg · R$ {item.estimatedPrice.toFixed(2).replace('.', ',')}
                </div>
              </div>
            ))}
          </section>
        )}

        <p className="tracking-footer">Atualização automática · dados usados apenas para este pedido</p>
      </main>

      <style>{`
        .tracking-shell {
          min-height: 100vh;
          min-height: 100dvh;
          background: var(--bg);
          color: var(--t1);
        }
        .tracking-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          background: var(--s1);
          border-bottom: 1px solid var(--border);
        }
        .tracking-logo {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: linear-gradient(145deg, var(--primary-dark), var(--primary));
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }
        .tracking-brand {
          font-family: var(--font-serif);
          font-size: 18px;
          font-weight: 700;
          color: var(--accent);
          letter-spacing: 2px;
        }
        .tracking-store {
          font-size: 12px;
          color: var(--t3);
        }
        .tracking-clock {
          margin-left: auto;
          text-align: right;
          font-size: 13px;
          font-weight: 600;
          color: var(--t2);
        }
        .tracking-clock div:last-child {
          font-size: 10px;
          color: var(--t3);
          font-weight: 500;
        }
        .tracking-main {
          max-width: 480px;
          margin: 0 auto;
          padding: 24px 20px 40px;
        }
        .tracking-hero {
          text-align: center;
          margin-bottom: 24px;
        }
        .tracking-hero-label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1.2px;
          color: var(--t3);
          margin-bottom: 10px;
        }
        .tracking-code {
          font-family: var(--font-serif);
          font-size: 52px;
          font-weight: 700;
          color: var(--accent);
          letter-spacing: 8px;
          line-height: 1;
          margin-bottom: 12px;
        }
        .tracking-summary {
          font-size: 15px;
          color: var(--t2);
          margin-bottom: 6px;
        }
        .tracking-meta {
          font-size: 13px;
          color: var(--t3);
        }
        .tracking-status-banner {
          border-radius: var(--r);
          padding: 16px 18px;
          margin-bottom: 24px;
          border: 1px solid var(--border2);
          background: var(--s2);
        }
        .tracking-status-banner.status-aguardando { border-color: rgba(255,255,255,.08); }
        .tracking-status-banner.status-em_preparo { border-color: rgba(255,149,0,.35); background: rgba(255,149,0,.08); }
        .tracking-status-banner.status-pronto { border-color: rgba(52,199,89,.35); background: rgba(52,199,89,.08); }
        .tracking-status-banner.status-retirado { border-color: rgba(255,255,255,.08); opacity: .85; }
        .tracking-status-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--t1);
          margin-bottom: 4px;
        }
        .tracking-status-hint {
          font-size: 13px;
          color: var(--t2);
          line-height: 1.45;
        }
        .tracking-pipeline-title {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1.2px;
          color: var(--t3);
          margin-bottom: 14px;
        }
        .tracking-steps {
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .tracking-step {
          display: flex;
          gap: 14px;
        }
        .tracking-step-marker {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 28px;
          flex-shrink: 0;
        }
        .tracking-step-dot {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          background: var(--s2);
          border: 2px solid var(--border2);
          color: var(--t3);
        }
        .tracking-step.done .tracking-step-dot {
          background: rgba(52,199,89,.15);
          border-color: var(--green);
          color: var(--green);
        }
        .tracking-step.active .tracking-step-dot {
          background: linear-gradient(145deg, var(--primary-dark), var(--primary));
          border-color: var(--primary);
          color: #fff;
          box-shadow: 0 0 0 4px rgba(192,39,45,.2);
        }
        .tracking-step-line {
          width: 2px;
          flex: 1;
          min-height: 24px;
          background: var(--border2);
          margin: 4px 0;
        }
        .tracking-step.done .tracking-step-line { background: var(--green); }
        .tracking-step-body {
          padding: 2px 0 22px;
        }
        .tracking-step-label {
          font-size: 15px;
          font-weight: 600;
          color: var(--t2);
        }
        .tracking-step.active .tracking-step-label { color: var(--t1); }
        .tracking-step.pending .tracking-step-label { color: var(--t3); }
        .tracking-step-caption {
          font-size: 12px;
          color: var(--t3);
          margin-top: 4px;
          line-height: 1.4;
        }
        .tracking-items {
          margin-top: 8px;
          padding-top: 20px;
          border-top: 1px solid var(--border);
        }
        .tracking-item {
          padding: 12px 0;
          border-bottom: 1px solid var(--border);
        }
        .tracking-item:last-child { border-bottom: none; }
        .tracking-item-name {
          font-size: 14px;
          font-weight: 600;
          color: var(--t1);
          margin-bottom: 4px;
        }
        .tracking-item-detail {
          font-size: 12px;
          color: var(--t3);
        }
        .tracking-footer {
          margin-top: 28px;
          text-align: center;
          font-size: 11px;
          color: var(--t3);
        }
        .tracking-empty {
          text-align: center;
          padding: 48px 12px;
        }
        .tracking-empty-icon {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          margin: 0 auto 16px;
          background: var(--s2);
          border: 1px solid var(--border2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          color: var(--t3);
        }
        .tracking-empty h1 {
          font-family: var(--font-serif);
          font-size: 22px;
          margin-bottom: 8px;
          color: var(--accent);
        }
        .tracking-empty p {
          font-size: 14px;
          color: var(--t2);
          line-height: 1.5;
        }
      `}</style>
    </div>
  )
}
